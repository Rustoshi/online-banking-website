import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, unauthorizedResponse, notFoundResponse, handleError } from '@/lib/apiResponse';
import { authenticateAdmin } from '@/lib/auth';
import { User, Transaction } from '@/models';
import { sanitizeUser, hashPassword } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { admin, error } = await authenticateAdmin(request);
    if (error || !admin) {
      return unauthorizedResponse(error || 'Unauthorized');
    }

    const { id } = await params;
    const user = await User.findById(id).lean();
    
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Get recent transactions for this user
    const transactions = await Transaction.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // For admin, return user with sensitive fields (except password)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userForAdmin = { ...(user as any) };
    delete userForAdmin.password;
    delete userForAdmin.twoFactorSecret;

    return successResponse(
      { user: userForAdmin, transactions },
      'User retrieved successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { admin, error } = await authenticateAdmin(request);
    if (error || !admin) {
      return unauthorizedResponse(error || 'Unauthorized');
    }

    const { id } = await params;
    const body = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Update allowed fields (must match User model field names)
    const allowedFields = [
      'username', 'name', 'email', 'phone', 'country', 'address', 'city', 'zipCode',
      'dateOfBirth', 'accountType', 'accountNumber', 'pin', 'status',
      'dailyTransferLimit', 'dailyWithdrawalLimit', 'withdrawalFee',
      'cotCode', 'taxCode', 'imfCode', 'createdAt'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Hash PIN if it's being updated
        if (field === 'pin' && body[field]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any)[field] = await hashPassword(body[field]);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any)[field] = body[field];
        }
      }
    }

    await user.save();

    return successResponse(
      sanitizeUser(user.toObject()),
      'User updated successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { admin, error } = await authenticateAdmin(request);
    if (error || !admin) {
      return unauthorizedResponse(error || 'Unauthorized');
    }

    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
