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

    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Creating Appwrite user via REST API...');

    // Use same format as debug endpoint that worked
    const userId = 'testuser' + Math.floor(Math.random() * 1000);
    console.log('Using userId:', userId);

    const createResponse = await fetch(`https://cloud.appwrite.io/v1/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        userId,
        email,
        password,
        name: name || undefined,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('REST API error:', errorData);
      throw new Error(errorData.message || 'Failed to create user');
    }

    const user = await createResponse.json();
    console.log('User created via REST API:', user.$id);

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
