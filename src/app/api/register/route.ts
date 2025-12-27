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

    // Try without userId - let Appwrite auto-generate
    console.log('Attempting to create user without userId parameter...');

    try {
      const user = await account.create(email, password, name || undefined);
      console.log('Success! User created without userId:', user.$id);
    } catch (noUserIdError: any) {
      console.log('Failed without userId:', noUserIdError.message);

      // Fallback: try with a very simple userId
      console.log('Trying with simple userId...');
      const userId = 'u' + Math.floor(Math.random() * 10000);
      console.log('Using fallback userId:', userId);

      const user = await account.create(userId, email, password, name || undefined);
      console.log('Success with fallback userId!');

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
