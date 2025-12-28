import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CPX_API_KEY = 'e12b878968768145c304ff4580e643bc';
const CPX_BASE_URL = 'https://api.cpx-research.com';

export async function GET(request: NextRequest) {
  try {
    // Fetch available surveys from CPX Research
    const response = await axios.get(`${CPX_BASE_URL}/surveys`, {
      headers: {
        'Authorization': `Bearer ${CPX_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EarnFlow-App/1.0'
      }
    });

    // Transform CPX survey data to our format
    const surveys = response.data.surveys?.map((survey: any) => ({
      id: survey.id,
      title: survey.name,
      description: survey.description,
      reward: survey.payout_cents / 100, // Convert cents to dollars
      time: `${survey.loi} min`, // Length of interview
      status: survey.status,
      country: survey.country,
      category: survey.category
    })) || [];

    return NextResponse.json({
      success: true,
      surveys: surveys.filter((s: any) => s.status === 'active')
    });

  } catch (error: any) {
    console.error('CPX API Error:', error.response?.data || error.message);

    // Return mock data if API fails (for development)
    const mockSurveys = [
      {
        id: 'cpx_1',
        title: 'Consumer Electronics Survey',
        description: 'Share your thoughts on the latest tech gadgets and consumer electronics',
        reward: 1.25,
        time: '12 min',
        status: 'active',
        country: 'US',
        category: 'Technology'
      },
      {
        id: 'cpx_2',
        title: 'Healthcare Preferences Study',
        description: 'Help us understand healthcare choices and medical service preferences',
        reward: 2.50,
        time: '18 min',
        status: 'active',
        country: 'US',
        category: 'Healthcare'
      },
      {
        id: 'cpx_3',
        title: 'Financial Services Research',
        description: 'Your input on banking and financial service experiences matters',
        reward: 1.75,
        time: '15 min',
        status: 'active',
        country: 'US',
        category: 'Finance'
      }
    ];

    return NextResponse.json({
      success: true,
      surveys: mockSurveys,
      fallback: true // Indicate we're using mock data
    });
  }
}