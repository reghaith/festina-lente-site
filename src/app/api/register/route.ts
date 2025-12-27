import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID } from '@/lib/appwrite';
import { getPrisma } from '@/lib/prisma';
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

    const userId = ID.unique();
    console.log('Creating Appwrite user with ID:', userId, 'email:', email);

    const user = await account.create(userId, email, password, name || undefined);
    console.log('Appwrite user created:', user.$id);

    console.log('Creating Appwrite database document');
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        email,
        name: name || null,
      }
    );

    console.log('Creating Prisma user');
    await getPrisma().user.create({
      data: {
        id: user.$id,
        email,
        name: name || null,
        password: 'APPWRITE_AUTH',
        role: 'user',
      },
    });

    console.log('Creating Prisma user points');
    await getPrisma().userPoints.create({
      data: {
        userId: user.$id,
        pointsBalance: 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Registration successful' });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === 409) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    if (error.code === 400) {
      return NextResponse.json({ error: 'Invalid input. Email may be invalid or password too short.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
