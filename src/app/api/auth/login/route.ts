import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('=== Login Attempt ===');
    console.log('Email:', email);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured properly' },
        { status: 500 }
      );
    }

    // For Supabase, we can verify the user exists
    // The actual authentication happens client-side
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error checking users:', error);
      throw error;
    }

    // Find the user by email
    const user = data.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
      }
    });
  } catch (error: any) {
    console.error('=== Login Error ===');
    console.error('Error message:', error.message);

    if (error.message?.includes('Invalid login credentials') || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
