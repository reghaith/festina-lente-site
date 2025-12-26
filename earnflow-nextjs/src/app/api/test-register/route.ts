// Test registration endpoint with minimal dependencies
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Log the attempt
    console.log('Registration attempt at:', new Date().toISOString());
    
    // Check for missing fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ 
        message: 'All fields are required.',
        error: 'MISSING_FIELDS',
        details: { 
          provided: { name, email, password }
        },
        status: 400
      });
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    console.log('Creating user with email:', body.email);
    
    try {
      const newUser = await getPrisma().user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: 'user',
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
      } catch (userPointsError) {
        console.error('Failed to create UserPoints for user:', newUser.id);
      }
      
      const endTime = Date.now();
      console.log('Registration completed in', endTime - startTime, 'ms');
      
      return NextResponse.json({ 
        message: 'User registered successfully.',
        user: { ... },
        processingTime: endTime - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Registration failed:', error);
      return NextResponse.json({ 
        message: 'Something went wrong during registration.',
        status: 500,
        details: { 
          error: registrationError.message,
          timestamp: new Date().toISOString()
        },
      });
    }
}