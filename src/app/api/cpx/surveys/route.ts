import { NextRequest, NextResponse } from 'next/server';

// CPX Research configuration - API key stays server-side only
const CPX_APP_ID = process.env.CPX_APP_ID || 'YOUR_APP_ID';
const CPX_API_KEY = process.env.CPX_API_KEY || 'e12b878968768145c304ff4580e643bc';

export async function GET(request: NextRequest) {
  // Return iframe configuration instead of API data
  // This keeps the API key secure server-side
  return NextResponse.json({
    success: true,
    iframeUrl: `https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}`,
    message: 'Use iframe embedding for secure CPX integration'
  });
}