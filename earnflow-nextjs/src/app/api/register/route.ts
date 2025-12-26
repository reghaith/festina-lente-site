// Enhanced registration route with better error handling
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPrisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const startTime = Date.now();
  console.log(`Registration attempt started at: ${startTime.toISOString()}`);
  
  try {
    const { name, email, password } = await request.json();
    console.log('Registration data received:', { name, email, password: '***' });

    if (!name || !email || !password) {
      return NextResponse.json({ 
        message: 'All fields are required.',
        error: 'MISSING_FIELDS',
        details: { 
          provided: { name, email, password },
          required: ['name', 'email', 'password'],
          format: 'object' 
        }
      }, 
      { status: 400 });
    }

    // Check for existing user
    const existingUser = await getPrisma().user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ 
        message: 'User with this email already exists.',
        error: 'USER_EXISTS',
        details: { 
          email: email,
          timestamp: new Date().toISOString()
        }
      }, 
      { status: 409 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({
        message: 'Password must be at least 8 characters long.',
        error: 'WEAK_PASSWORD',
        details: { 
          provided: { password },
          requirements: { minLength: 8 },
          format: 'string'
        }
      }, 
      { status: 400 });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Creating new user with email:', email);
    
    try {
      const newUser = await getPrisma().user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'user', // Assign default role
        },
      });
      
      // Create UserPoints entry
      try {
        await getPrisma().userPoints.create({
          data: {
            userId: newUser.id,
            pointsBalance: 0,
          },
        });
        console.log('UserPoints created for user:', newUser.id);
      } catch (userPointsError) {
        console.error('Failed to create UserPoints for user:', newUser.id, userPointsError);
        console.error('UserPoints error:', userPointsError.message);
      }

      const endTime = Date.now();
      console.log(`Registration completed in ${endTime - startTime}ms`);
      
      return NextResponse.json({
        message: 'User registered successfully.',
        user: {
          id: newUser.id,
          email,
          name,
          role: 'user'
        },
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime
      },
      }, { status: 201 });
  } catch (registrationError) {
    const errorTime = Date.now();
    console.error('Registration failed after:', errorTime - startTime, 'ms');
    console.error('Registration error:', registrationError.message);
    
    // Log detailed error
    console.error('Registration error details:', {
      error: registrationError.message,
      stack: registrationError.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      message: 'Registration failed. Please try again.',
      error: 'REGISTRATION_ERROR',
      details: {
        error: registrationError.message,
        timestamp: new Date().toISOString()
        processingTime: errorTime - startTime,
        'ms': errorTime - startTime
      }
      },
      status: 500
    });
  }
}