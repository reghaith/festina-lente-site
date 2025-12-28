import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const CPX_API_KEY = 'e12b878968768145c304ff4580e643bc';
const CPX_BASE_URL = 'https://api.cpx-research.com';

export async function POST(request: NextRequest) {
  let surveyId: string = '';

  try {
    const body = await request.json();
    surveyId = body.surveyId;
    const userId = body.userId;

    if (!surveyId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing surveyId or userId'
      }, { status: 400 });
    }

    // Get user info from our database (simplified - in real app, fetch from DB)
    // For now, we'll create a unique identifier for CPX
    const cpxUserId = `earnflow_${userId}`;

    // Generate survey access URL from CPX
    const surveyUrl = `${CPX_BASE_URL}/survey/${surveyId}/start?user_id=${cpxUserId}&api_key=${CPX_API_KEY}`;

    return NextResponse.json({
      success: true,
      surveyUrl,
      surveyId,
      userId: cpxUserId
    });

  } catch (error: any) {
    console.error('CPX Survey Redirect Error:', error.message);

    // Return fallback URL for development
    const fallbackSurveyId = surveyId || 'demo';
    return NextResponse.json({
      success: true,
      surveyUrl: `https://demo.cpx-research.com/survey/${fallbackSurveyId}`,
      surveyId: fallbackSurveyId,
      fallback: true
    });
  }
}