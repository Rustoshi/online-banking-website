import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, handleError } from '@/lib/apiResponse';
import { authenticateAdmin } from '@/lib/auth';
import { User, Transaction } from '@/models';
import { TransactionType, TransactionStatus } from '@/types';

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
    const { type, amount, scope, sender, receiverName, receiverBank, receiverAccount, description, date, notifyUser } = body;

    if (!type || !amount || amount <= 0) {
      return errorResponse('Invalid type or amount', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    // Store balance before transaction
    const balanceBefore = user.balance;

    // Update balance
    if (type === 'credit') {
      user.balance += amount;
    } else if (type === 'debit') {
      if (user.balance < amount) {
        return errorResponse('Insufficient balance', 400);
      }
      user.balance -= amount;
    } else {
      return errorResponse('Invalid transaction type', 400);
    }

    // Balance after transaction
    const balanceAfter = user.balance;

    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: type === 'credit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
      amount,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
      description: description || `Admin ${type} - ${scope || 'Manual'}`,
      reference: `ADM${Date.now()}`,
      metadata: {
        scope,
        sender: sender || '',
        receiverName: receiverName || '',
        receiverBank: receiverBank || '',
        receiverAccount: receiverAccount || '',
        adminId: admin._id,
        backdated: date || null,
      },
      createdAt: date ? new Date(date) : new Date(),
    });

    // TODO: Send email notification if notifyUser is true

    return successResponse(
      { 
        newBalance: user.balance,
        transaction: transaction.toObject(),
      },
      `Account ${type}ed successfully`
    );
  } catch (error) {
    return handleError(error);
  }
}
