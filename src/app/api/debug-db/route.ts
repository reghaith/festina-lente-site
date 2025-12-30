import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Test basic database connection
    const testQuery = await db.query('SELECT 1 as test');
    const dbConnected = testQuery.rows.length > 0;

    // Test if daily_claims table exists
    let tableExists = false;
    try {
      await db.query("SELECT 1 FROM daily_claims LIMIT 1");
      tableExists = true;
    } catch (error) {
      tableExists = false;
    }

    // Test if user_exp table exists
    let expTableExists = false;
    try {
      await db.query("SELECT 1 FROM user_exp LIMIT 1");
      expTableExists = true;
    } catch (error) {
      expTableExists = false;
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: dbConnected,
        daily_claims_table: tableExists,
        user_exp_table: expTableExists
      },
      environment: {
        has_database_url: !!process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        connected: false
      },
      environment: {
        has_database_url: !!process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}