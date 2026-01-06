import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, handleError } from '@/lib/apiResponse';
import { authenticateAdmin } from '@/lib/auth';
import { User, Transaction } from '@/models';

// POST /api/admin/users/[id]/generate-transaction - Generate a transaction for user
export async function POST(
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

    const {
      type,
      amount,
      status,
      senderName,
      senderAccount,
      senderBank,
      receiverName,
      receiverAccount,
      receiverBank,
      bankAddress,
      description,
      date,
      notifyUser,
    } = body;

    // Validate required fields
    if (!type || !amount) {
      return errorResponse('Transaction type and amount are required', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: type.toLowerCase(),
      amount: parseFloat(amount),
      status: status || 'completed',
      description: description || `${type} transaction`,
      senderName: senderName || user.name,
      senderAccount: senderAccount || user.accountNumber,
      senderBank: senderBank || '',
      receiverName: receiverName || '',
      receiverAccount: receiverAccount || '',
      receiverBank: receiverBank || '',
      bankAddress: bankAddress || '',
      createdAt: date ? new Date(date) : new Date(),
    });

    // Optionally update user balance based on transaction type
    if (status === 'completed') {
      if (type.toLowerCase() === 'credit' || type.toLowerCase() === 'deposit') {
        user.balance += parseFloat(amount);
        await user.save();
      } else if (type.toLowerCase() === 'debit' || type.toLowerCase() === 'withdrawal') {
        user.balance -= parseFloat(amount);
        if (user.balance < 0) user.balance = 0;
        await user.save();
      }
    }

    // TODO: Send notification to user if notifyUser is true
    if (notifyUser) {
      // Notification logic would go here
      console.log(`Notification would be sent to user ${user.email}`);
    }

    return successResponse(
      { transaction },
      'Transaction generated successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}
