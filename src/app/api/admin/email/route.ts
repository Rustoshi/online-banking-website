import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { EmailService } from '@/services/emailService';
import { User } from '@/models';
import { successResponse, unauthorizedResponse, errorResponse, handleError } from '@/lib/apiResponse';
import { authenticateAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { admin, error } = await authenticateAdmin(request);
    if (error || !admin) {
      return unauthorizedResponse(error || 'Unauthorized');
    }

    const body = await request.json();
    const { action, userId, userIds, subject, message } = body;

    if (!subject || !message) {
      return errorResponse('Subject and message are required', 400);
    }

    if (action === 'single') {
      if (!userId) {
        return errorResponse('User ID is required', 400);
      }
      await EmailService.sendToUser(userId, subject, message, admin._id.toString());
      return successResponse(null, 'Email sent successfully');
    }

    if (action === 'multiple') {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return errorResponse('User IDs are required', 400);
      }
      const count = await EmailService.sendToUsers(userIds, subject, message, admin._id.toString());
      return successResponse({ count }, `Email sent to ${count} users`);
    }

    if (action === 'all') {
      const count = await EmailService.sendToAllUsers(subject, message, admin._id.toString());
      return successResponse({ count }, `Email sent to ${count} users`);
    }

    if (action === 'filter') {
      // Send to users matching filter criteria
      const { status, kycStatus, country } = body;
      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      if (kycStatus) query.kycStatus = kycStatus;
      if (country) query.country = country;

      const users = await User.find(query, '_id');
      const ids = users.map(u => u._id.toString());
      
      if (ids.length === 0) {
        return errorResponse('No users match the filter criteria', 400);
      }

      const count = await EmailService.sendToUsers(ids, subject, message, admin._id.toString());
      return successResponse({ count }, `Email sent to ${count} users`);
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleError(error);
  }
}
