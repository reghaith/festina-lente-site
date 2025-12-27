import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    console.log('=== Direct Appwrite API Test ===');
    console.log('Project ID:', projectId);
    console.log('Test Email:', testEmail);

    if (!projectId) {
      return NextResponse.json({
        error: 'NEXT_PUBLIC_APPWRITE_PROJECT_ID not set',
        env_check: process.env
      }, { status: 500 });
    }

    // Test 1: Try to create a test user
    console.log('Step 1: Creating test user...');
    const createResponse = await fetch(`https://cloud.appwrite.io/v1/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      }),
    });

    const createData = await createResponse.json();
    console.log('Create response:', createResponse.status, createData);

    if (!createResponse.ok && createResponse.status !== 409) {
      return NextResponse.json({
        step: 'create_user',
        success: false,
        status: createResponse.status,
        response: createData,
        project_id: projectId
      });
    }

    // Test 2: Try to login with the test user
    console.log('Step 2: Testing login...');
    const loginResponse = await fetch(`https://cloud.appwrite.io/v1/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginResponse.status, loginData);

    return NextResponse.json({
      step: 'login_test',
      success: loginResponse.ok,
      create_status: createResponse.status,
      login_status: loginResponse.status,
      create_response: createData,
      login_response: loginData,
      test_email: testEmail,
      project_id: projectId
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
