import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    console.log('=== Appwrite SDK Test ===');
    console.log('Test Email:', testEmail);

    // Test 1: Try to create a test user using SDK
    console.log('Step 1: Creating test user with SDK...');
    let createResult;
    let createError;

    try {
      createResult = await account.create(testEmail, testPassword, 'Test User');
      console.log('User created successfully:', createResult.$id);
    } catch (error: any) {
      createError = error;
      console.log('User creation failed:', error.message);
    }

    // Test 2: Try to login with the test user
    console.log('Step 2: Testing login...');
    let loginResult;
    let loginError;

    try {
      await account.createEmailPasswordSession(testEmail, testPassword);
      const user = await account.get();
      loginResult = { user: user.$id, email: user.email };
      console.log('Login successful:', user.$id);
    } catch (error: any) {
      loginError = error;
      console.log('Login failed:', error.message);
    }

    return NextResponse.json({
      test_email: testEmail,
      create: {
        success: !!createResult,
        result: createResult,
        error: createError?.message
      },
      login: {
        success: !!loginResult,
        result: loginResult,
        error: loginError?.message
      }
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
