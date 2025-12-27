import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

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

    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('Creating Appwrite user via proxy for:', email);

    // Make request to Appwrite from server-side
    const appwriteResponse = await fetch(`https://cloud.appwrite.io/v1/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        userId: `unique()`,
        email,
        password,
        name: name || undefined,
      }),
    });

    const responseData = await appwriteResponse.json();

    if (!appwriteResponse.ok) {
      console.error('Appwrite error:', responseData);
      return NextResponse.json(
        { error: responseData.message || 'Registration failed' },
        { status: appwriteResponse.status }
      );
    }

    console.log('Appwrite user created successfully:', responseData.$id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: responseData.$id,
        email: responseData.email,
        name: responseData.name,
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
