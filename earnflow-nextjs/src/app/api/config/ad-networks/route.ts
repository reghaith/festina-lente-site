import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch configuration from environment variables
  const lootablyUrl = process.env.LOOTABLY_OFFERWALL_URL || '';
  const cpxAppId = process.env.CPX_RESEARCH_APP_ID || '';
  const cpxHash = process.env.CPX_RESEARCH_SECURE_HASH || '';

  return NextResponse.json({
    lootablyUrl,
    cpxAppId,
    cpxHash,
  });
}
