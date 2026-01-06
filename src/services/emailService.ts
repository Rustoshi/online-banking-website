import crypto from 'crypto';
import { User, Admin, PasswordReset, Activity } from '@/models';
import { ActivityActorType, IUser } from '@/types';
import {
  sendEmail,
  sendBatchEmails,
  getWelcomeEmailTemplate,
  getWelcomeEmailSubject,
  getPasswordResetEmailTemplate,
  getPasswordResetEmailSubject,
  getPasswordResetSuccessEmailTemplate,
  getPasswordResetSuccessEmailSubject,
  getKycSubmissionEmailTemplate,
  getKycSubmissionEmailSubject,
  getKycApprovalEmailTemplate,
  getKycApprovalEmailSubject,
  getKycRejectionEmailTemplate,
  getKycRejectionEmailSubject,
  getDepositEmailTemplate,
  getDepositEmailSubject,
  getWithdrawalEmailTemplate,
  getWithdrawalEmailSubject,
  getCreditAlertEmailTemplate,
  getCreditAlertEmailSubject,
  getDebitAlertEmailTemplate,
  getDebitAlertEmailSubject,
  getBaseTemplate,
  EmailTemplateProps,
} from '@/lib/email';

// Site settings helper
async function getSiteSettings(): Promise<{ siteName: string; siteEmail: string; siteUrl: string }> {
  try {
    const { default: Settings } = await import('@/models/Settings');
    // Use find to get all settings and convert to object
    const settings = await Settings.find({});
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = String(s.value);
    });
    return {
      siteName: settingsObj.siteName || process.env.SITE_NAME || 'Online Banking',
      siteEmail: settingsObj.siteEmail || process.env.EMAIL_FROM || 'support@example.com',
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };
  } catch {
    return {
      siteName: process.env.SITE_NAME || 'Online Banking',
      siteEmail: process.env.EMAIL_FROM || 'support@example.com',
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };
  }
}

// Get base email props
async function getEmailProps(): Promise<EmailTemplateProps> {
  const settings = await getSiteSettings();
  return {
    companyName: settings.siteName,
    companyEmail: settings.siteEmail,
  };
}

export class EmailService {
  /**
   * Generate verification token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(user: IUser): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getWelcomeEmailTemplate({
      ...emailProps,
      userName: user.name,
      userEmail: user.email,
      accountNumber: user.accountNumber || 'Pending',
      loginUrl: `${settings.siteUrl}/login`,
    });

    await sendEmail({
      to: user.email,
      subject: getWelcomeEmailSubject(settings.siteName),
      html,
    });
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(userId: string): Promise<{ token: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const token = this.generateToken();
    const settings = await getSiteSettings();
    
    // For now, log the token - in production, send verification email
    console.log(`[EMAIL] Verification email to ${user.email} with token: ${token}`);
    
    return { token };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    await Activity.create({
      actor: user._id,
      actorType: ActivityActorType.USER,
      action: 'verify_email',
      resource: 'user',
      resourceId: user._id,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Delete any existing reset tokens
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await PasswordReset.create({
      email: email.toLowerCase(),
      token,
      expiresAt,
    });

    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();
    const resetUrl = `${settings.siteUrl}/reset-password?token=${token}`;

    const html = getPasswordResetEmailTemplate({
      ...emailProps,
      userName: user.name,
      resetUrl,
      expiresIn: '1 hour',
      ipAddress,
      userAgent,
    });

    await sendEmail({
      to: user.email,
      subject: getPasswordResetEmailSubject(settings.siteName),
      html,
    });
  }

  /**
   * Send password reset success email
   */
  static async sendPasswordResetSuccessEmail(user: IUser): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getPasswordResetSuccessEmailTemplate({
      ...emailProps,
      userName: user.name,
      loginUrl: `${settings.siteUrl}/login`,
    });

    await sendEmail({
      to: user.email,
      subject: getPasswordResetSuccessEmailSubject(settings.siteName),
      html,
    });
  }

  /**
   * Verify password reset token
   */
  static async verifyResetToken(token: string): Promise<string | null> {
    const reset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    return reset?.email || null;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await User.findOne({ email: reset.email });
    if (!user) {
      throw new Error('User not found');
    }

    // Import hash function
    const { hashPassword } = await import('@/lib/utils');
    user.password = await hashPassword(newPassword);
    await user.save();

    // Delete the reset token
    await PasswordReset.deleteOne({ _id: reset._id });

    await Activity.create({
      actor: user._id,
      actorType: ActivityActorType.USER,
      action: 'reset_password',
      resource: 'user',
      resourceId: user._id,
    });
  }

  /**
   * Send email to single user
   */
  static async sendToUser(
    userId: string,
    subject: string,
    message: string,
    adminId: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In production, send actual email
    console.log(`[EMAIL] To: ${user.email}, Subject: ${subject}, Message: ${message}`);

    await Activity.create({
      actor: adminId,
      actorType: ActivityActorType.ADMIN,
      action: 'send_email',
      resource: 'user',
      resourceId: user._id,
      details: { subject },
    });
  }

  /**
   * Send email to multiple users
   */
  static async sendToUsers(
    userIds: string[],
    subject: string,
    message: string,
    adminId: string
  ): Promise<number> {
    const users = await User.find({ _id: { $in: userIds } });
    
    for (const user of users) {
      // In production, send actual email (consider using queue)
      console.log(`[EMAIL] To: ${user.email}, Subject: ${subject}`);
    }

    await Activity.create({
      actor: adminId,
      actorType: ActivityActorType.ADMIN,
      action: 'send_bulk_email',
      resource: 'user',
      details: { subject, recipientCount: users.length },
    });

    return users.length;
  }

  /**
   * Send email to all users
   */
  static async sendToAllUsers(
    subject: string,
    message: string,
    adminId: string
  ): Promise<number> {
    const users = await User.find({}, 'email');
    
    for (const user of users) {
      // In production, use email queue
      console.log(`[EMAIL] To: ${user.email}, Subject: ${subject}`);
    }

    await Activity.create({
      actor: adminId,
      actorType: ActivityActorType.ADMIN,
      action: 'send_email_all',
      resource: 'user',
      details: { subject, recipientCount: users.length },
    });

    return users.length;
  }

  /**
   * Admin password reset
   */
  static async sendAdminPasswordResetEmail(email: string): Promise<void> {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return;
    }

    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await PasswordReset.create({
      email: email.toLowerCase(),
      token,
      expiresAt,
    });

    console.log(`[EMAIL] Admin password reset to ${email} with token: ${token}`);
  }

  /**
   * Reset admin password
   */
  static async resetAdminPassword(token: string, newPassword: string): Promise<void> {
    const reset = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      throw new Error('Invalid or expired reset token');
    }

    const admin = await Admin.findOne({ email: reset.email });
    if (!admin) {
      throw new Error('Admin not found');
    }

    const { hashPassword } = await import('@/lib/utils');
    admin.password = await hashPassword(newPassword);
    await admin.save();

    await PasswordReset.deleteOne({ _id: reset._id });
  }

  // ==================== KYC EMAILS ====================

  /**
   * Send KYC submission confirmation email
   */
  static async sendKycSubmissionEmail(user: IUser, documentType: string): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getKycSubmissionEmailTemplate({
      ...emailProps,
      userName: user.name,
      documentType,
      submittedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    await sendEmail({
      to: user.email,
      subject: getKycSubmissionEmailSubject(settings.siteName),
      html,
    });
  }

  /**
   * Send KYC approval email
   */
  static async sendKycApprovalEmail(user: IUser): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getKycApprovalEmailTemplate({
      ...emailProps,
      userName: user.name,
      approvedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dashboardUrl: `${settings.siteUrl}/dashboard`,
    });

    await sendEmail({
      to: user.email,
      subject: getKycApprovalEmailSubject(settings.siteName),
      html,
    });
  }

  /**
   * Send KYC rejection email
   */
  static async sendKycRejectionEmail(user: IUser, rejectionReason: string): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getKycRejectionEmailTemplate({
      ...emailProps,
      userName: user.name,
      rejectionReason,
      rejectedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      resubmitUrl: `${settings.siteUrl}/dashboard/kyc`,
    });

    await sendEmail({
      to: user.email,
      subject: getKycRejectionEmailSubject(settings.siteName),
      html,
    });
  }

  // ==================== TRANSACTION EMAILS ====================

  /**
   * Send deposit email (pending, approved, or rejected)
   */
  static async sendDepositEmail(
    user: IUser,
    data: {
      amount: number;
      reference: string;
      paymentMethod: string;
      status: 'pending' | 'approved' | 'rejected';
      newBalance?: number;
      adminNote?: string;
    }
  ): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getDepositEmailTemplate({
      ...emailProps,
      userName: user.name,
      amount: data.amount.toFixed(2),
      reference: data.reference,
      paymentMethod: data.paymentMethod,
      status: data.status,
      newBalance: data.newBalance?.toFixed(2),
      transactionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      adminNote: data.adminNote,
      dashboardUrl: `${settings.siteUrl}/dashboard/transactions`,
    });

    await sendEmail({
      to: user.email,
      subject: getDepositEmailSubject(settings.siteName, data.status, `$${data.amount.toFixed(2)}`),
      html,
    });
  }

  /**
   * Send withdrawal email (pending, approved, or rejected)
   */
  static async sendWithdrawalEmail(
    user: IUser,
    data: {
      amount: number;
      fee: number;
      netAmount: number;
      reference: string;
      paymentMethod: string;
      paymentDetails?: string;
      status: 'pending' | 'approved' | 'rejected';
      newBalance?: number;
      adminNote?: string;
    }
  ): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getWithdrawalEmailTemplate({
      ...emailProps,
      userName: user.name,
      amount: data.amount.toFixed(2),
      fee: data.fee.toFixed(2),
      netAmount: data.netAmount.toFixed(2),
      reference: data.reference,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      status: data.status,
      newBalance: data.newBalance?.toFixed(2),
      transactionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      adminNote: data.adminNote,
      dashboardUrl: `${settings.siteUrl}/dashboard/transactions`,
    });

    await sendEmail({
      to: user.email,
      subject: getWithdrawalEmailSubject(settings.siteName, data.status, `$${data.amount.toFixed(2)}`),
      html,
    });
  }

  /**
   * Send credit alert email (admin credited user)
   */
  static async sendCreditAlertEmail(
    user: IUser,
    data: {
      amount: number;
      description: string;
      newBalance: number;
    }
  ): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getCreditAlertEmailTemplate({
      ...emailProps,
      userName: user.name,
      amount: data.amount.toFixed(2),
      description: data.description,
      newBalance: data.newBalance.toFixed(2),
      transactionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dashboardUrl: `${settings.siteUrl}/dashboard`,
    });

    await sendEmail({
      to: user.email,
      subject: getCreditAlertEmailSubject(settings.siteName, `$${data.amount.toFixed(2)}`),
      html,
    });
  }

  /**
   * Send debit alert email (admin debited user)
   */
  static async sendDebitAlertEmail(
    user: IUser,
    data: {
      amount: number;
      description: string;
      newBalance: number;
    }
  ): Promise<void> {
    const settings = await getSiteSettings();
    const emailProps = await getEmailProps();

    const html = getDebitAlertEmailTemplate({
      ...emailProps,
      userName: user.name,
      amount: data.amount.toFixed(2),
      description: data.description,
      newBalance: data.newBalance.toFixed(2),
      transactionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dashboardUrl: `${settings.siteUrl}/dashboard`,
    });

    await sendEmail({
      to: user.email,
      subject: getDebitAlertEmailSubject(settings.siteName, `$${data.amount.toFixed(2)}`),
      html,
    });
  }
}

export default EmailService;
