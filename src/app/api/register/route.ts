import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    console.log('Creating Appwrite user for:', email);

    const user = await account.create(email, password, name || undefined);
    console.log('Appwrite user created:', user.$id);

    // Create user document in database
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        email,
        name: name || null,
      }
    );

    console.log('User registration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === 409) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    if (error.code === 400) {
      return NextResponse.json({
        error: 'Invalid input. Email may be invalid or password must be at least 8 characters.'
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
