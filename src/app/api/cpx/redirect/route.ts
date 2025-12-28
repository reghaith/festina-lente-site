import { NextRequest, NextResponse } from 'next/server';

// CPX Research configuration - secure server-side only
const CPX_APP_ID = process.env.CPX_APP_ID || 'YOUR_APP_ID';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    // Return iframe URL with user ID - API key stays server-side
    const iframeUrl = `https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}&ext_user_id=earnflow_${userId}`;

    return NextResponse.json({
      success: true,
      iframeUrl,
      userId: `earnflow_${userId}`
    });

  } catch (error: any) {
    console.error('CPX Redirect Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate iframe URL'
    }, { status: 500 });
  }
}