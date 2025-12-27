import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID } from '@/lib/appwrite';
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

    console.log('=== Registration Attempt ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Password provided:', !!password);
    console.log('Project ID:', projectId);

    // Use a static test userId for debugging
    const userId = 'testuser' + Math.floor(Math.random() * 1000);
    console.log('Using static userId:', userId, 'length:', userId.length);

    // Test if userId matches regex: a-z, A-Z, 0-9, period, hyphen, underscore, no special start
    const userIdRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
    console.log('UserId valid regex:', userIdRegex.test(userId));
    console.log('UserId chars:', userId.split(''));

    console.log('Creating Appwrite user with SDK...');
    console.log('Calling account.create with:', { userId, email, passwordProvided: !!password, name });

    const user = await account.create(userId, email, password, name || undefined);

    console.log('Appwrite user created successfully:', user.$id);

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

    console.log('User document created in database');

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
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
