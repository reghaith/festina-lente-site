import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await account.create(ID.unique(), email, password, name || undefined);

    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        email,
        name: name || null,
      }
    );

    return NextResponse.json({ success: true, message: 'Registration successful' });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === 409) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
