import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, username } = body;

    const result: { emailAvailable?: boolean; usernameAvailable?: boolean } = {};

    // Check email availability
    if (email) {
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim() 
      }).select('_id').lean();
      result.emailAvailable = !existingEmail;
    }

    // Check username availability
    if (username) {
      const existingUsername = await User.findOne({ 
        username: username.toLowerCase().trim() 
      }).select('_id').lean();
      result.usernameAvailable = !existingUsername;
    }

    return successResponse(result);
  } catch (error) {
    console.error('Check availability error:', error);
    return errorResponse('Failed to check availability', 500);
  }
}
