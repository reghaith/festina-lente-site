import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('=== Login Attempt ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);

    // First, check if we can get the current session (if any)
    try {
      const currentSession = await account.get();
      console.log('Found existing session for user:', currentSession.$id);
      // Delete existing session to start fresh
      await account.deleteSession('current');
      console.log('Deleted existing session');
    } catch (sessionError) {
      console.log('No existing session found');
    }

    console.log('Creating new session...');
    await account.createEmailPasswordSession(email, password);
    console.log('Session created successfully');

    const user = await account.get();
    console.log('User data retrieved:', { id: user.$id, email: user.email, name: user.name });

    // Create or update user document in database (now that user is authenticated)
    try {
      console.log('Creating/updating user document in database...');
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          email: user.email,
          name: user.name || null,
        }
      );
      console.log('User document created/updated successfully');
    } catch (dbError: any) {
      // If document already exists, that's OK - just log it
      if (dbError.code === 409) {
        console.log('User document already exists, updating...');
        try {
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            {
              email: user.email,
              name: user.name || null,
            }
          );
          console.log('User document updated successfully');
        } catch (updateError) {
          console.log('Could not update user document:', updateError.message);
          // Don't fail login if database update fails
        }
      } else {
        console.log('Could not create user document:', dbError.message);
        // Don't fail login if database creation fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('=== Login Error ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error type:', error.type);

    if (error.code === 401) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (error.code === 400) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
