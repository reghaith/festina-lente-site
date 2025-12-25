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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await getPrisma().user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user', // Assign default role
      },
    });

    // Automatically create a UserPoints entry for the new user
    await getPrisma().userPoints.create({
      data: {
        userId: newUser.id,
        pointsBalance: 0,
      },
    });

    return NextResponse.json({ message: 'User registered successfully.', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Something went wrong during registration.' }, { status: 500 });
  }
}
