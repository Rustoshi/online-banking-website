import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuthService } from '@/services/authService';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleZodError, handleError } from '@/lib/apiResponse';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const result = await AuthService.register(validatedData);

    return successResponse(result, 'Registration successful', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    if (error instanceof Error && error.message === 'Email already registered') {
      return errorResponse(error.message, 409);
    }
    return handleError(error);
  }
}
