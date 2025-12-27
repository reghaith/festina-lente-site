// pages/api/test-register.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPrisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await getPrisma().user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await getPrisma().user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
      },
    });

    await getPrisma().userPoints.create({
      data: {
        userId: newUser.id,
        pointsBalance: 0,
      },
    });

    return NextResponse.json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        email,
        name,
        role: 'user'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}