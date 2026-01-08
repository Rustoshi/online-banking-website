import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, handleError } from '@/lib/apiResponse';
import { authenticateUser } from '@/lib/auth';
import { Transfer } from '@/models';
import { TransferStatus } from '@/types';
import { EmailService } from '@/services/emailService';

// Generate and send OTP for transfer verification
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return unauthorizedResponse(error || 'Unauthorized');
    }

    const body = await request.json();
    const { transferId } = body;

    if (!transferId) {
      return errorResponse('Transfer ID is required', 400);
    }

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return errorResponse('Transfer not found', 404);
    }

    if (transfer.sender.toString() !== user._id.toString()) {
      return errorResponse('Unauthorized', 403);
    }

    if (transfer.status !== TransferStatus.PENDING) {
      return errorResponse('Transfer is not pending verification', 400);
    }

    // Check if IMF and COT are verified
    if (!transfer.metadata?.imfVerified) {
      return errorResponse('Please verify IMF Code first', 400);
    }
    if (!transfer.metadata?.cotVerified) {
      return errorResponse('Please verify COT Code first', 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in transfer metadata
    transfer.metadata = {
      ...transfer.metadata,
      otp,
      otpExpiry,
      otpSentAt: new Date(),
    };
    await transfer.save();

    // Send OTP via email
    try {
      await EmailService.sendTransferOtpEmail(user, {
        otp,
        amount: transfer.amount,
        recipientName: transfer.recipientDetails?.accountName || 'Recipient',
        transferType: transfer.type,
        expiryMinutes: 10,
      });
    } catch (emailError) {
      console.error('[EMAIL] Failed to send OTP email:', emailError);
      // Still return success as OTP is stored, user can request resend
    }

    // Mask email for response
    const email = user.email;
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return successResponse(
      { 
        message: `OTP sent to ${maskedEmail}`,
        expiresIn: 600, // 10 minutes in seconds
      },
      'OTP sent successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}
