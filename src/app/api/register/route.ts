import { db, auth } from '@/lib/database';
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

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        error: 'User with this email already exists',
        code: 409,
        redirectTo: '/email-exists'
      }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await auth.hashPassword(password);
    const user = await db.createUser(email, passwordHash, name || '');

    console.log('User created successfully:', user.id);

    // Generate JWT token
    const token = await auth.generateToken(user.id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);

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

    console.log('Creating Supabase user...');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured properly' },
        { status: 500 }
      );
    }

    // Create user with Supabase Auth Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for demo
      user_metadata: {
        name: name || ''
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);

      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json({
          error: 'User with this email already exists',
          code: 409,
          redirectTo: '/email-exists'
        }, { status: 409 });
      }

      throw error;
    }

    console.log('User created successfully:', data.user.id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
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
