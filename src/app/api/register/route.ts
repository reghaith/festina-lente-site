import { account } from '@/lib/appwrite';
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

    console.log('Creating Appwrite user with SDK...');

    // Use Appwrite SDK without specifying userId
    const user = await account.create(email, password, name);
    console.log('User created successfully:', user.$id);

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
      return NextResponse.json({
        error: 'User with this email already exists',
        code: 409,
        redirectTo: '/email-exists'
      }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
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

    // Try without userId - let Appwrite generate it automatically
    console.log('Creating user without specifying userId...');

    const requestBody = {
      email,
      password,
      name: name || undefined,
    };
    console.log('Request body:', JSON.stringify(requestBody));

    const createResponse = await fetch(`https://cloud.appwrite.io/v1/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('REST API error:', errorData);

      // Handle specific error codes
      if (createResponse.status === 409) {
        return NextResponse.json({
          error: 'User with this email already exists',
          code: 409,
          redirectTo: '/email-exists'
        }, { status: 409 });
      }

      throw new Error(errorData.message || 'Failed to create user');
    }

    const user = await createResponse.json();
    console.log('User created via REST API:', user.$id);

    console.log('Appwrite user created successfully:', user.$id);

    // Note: Database document creation moved to login process
    // to avoid authorization issues during registration

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
