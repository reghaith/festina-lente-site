import { NextRequest, NextResponse } from 'next/server';

// CPX Research configuration - API key stays server-side only
const CPX_APP_ID = process.env.CPX_APP_ID;
const CPX_API_KEY = process.env.CPX_API_KEY;

export async function GET(request: NextRequest) {
  if (!CPX_APP_ID) {
    return NextResponse.json({
      success: false,
      error: 'CPX_APP_ID environment variable not set'
    }, { status: 500 });
  }

  // Return iframe configuration instead of API data
  // This keeps the API key secure server-side
  return NextResponse.json({
    success: true,
    iframeUrl: `https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}`,
    message: 'Use iframe embedding for secure CPX integration'
  });
}