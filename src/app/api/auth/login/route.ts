import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await account.createEmailPasswordSession(email, password);
    const user = await account.get();

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
