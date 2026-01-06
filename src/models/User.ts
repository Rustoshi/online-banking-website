import mongoose, { Schema, Model } from 'mongoose';
import { IUser, UserStatus, KycStatus, AccountType } from '@/types';
import { generateAccountNumber, generateReferralCode, generateUsername } from '@/lib/utils';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    profilePhoto: {
      type: String,
    },

    // Balances
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    bitcoinBalance: {
      type: Number,
      default: 0,
      min: [0, 'Bitcoin balance cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    tradingBalance: {
      type: Number,
      default: 0,
      min: [0, 'Trading balance cannot be negative'],
    },

    // Account Status
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    kycStatus: {
      type: String,
      enum: Object.values(KycStatus),
      default: KycStatus.NOT_SUBMITTED,
    },

    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    pin: {
      type: String,
    },

    // Settings
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },

    // Banking Details
    accountNumber: {
      type: String,
      unique: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: Object.values(AccountType),
      default: AccountType.SAVINGS,
    },

    // Referral
    referralCode: {
      type: String,
      unique: true,
      index: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Limits
    dailyTransferLimit: {
      type: Number,
      default: 10000,
    },
    dailyWithdrawalLimit: {
      type: Number,
      default: 5000,
    },

    // Authorization Codes
    taxCode: {
      type: String,
    },
    imfCode: {
      type: String,
    },
    cotCode: {
      type: String,
    },

    // IRS Filing
    irsFilingId: {
      type: String,
    },

    // Metadata
    lastLogin: {
      type: Date,
    },
    loginIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate account number and referral code
UserSchema.pre('save', async function () {
  if (this.isNew) {
    if (!this.accountNumber) {
      let accountNumber = generateAccountNumber();
      // Ensure uniqueness
      const UserModel = mongoose.model<IUser>('User');
      let exists = await UserModel.findOne({ accountNumber });
      while (exists) {
        accountNumber = generateAccountNumber();
        exists = await UserModel.findOne({ accountNumber });
      }
      this.accountNumber = accountNumber;
    }

    if (!this.referralCode) {
      let referralCode = generateReferralCode(this.name);
      const UserModel = mongoose.model<IUser>('User');
      let exists = await UserModel.findOne({ referralCode });
      while (exists) {
        referralCode = generateReferralCode(this.name);
        exists = await UserModel.findOne({ referralCode });
      }
      this.referralCode = referralCode;
    }

    if (!this.username) {
      let username = generateUsername(this.email);
      const UserModel = mongoose.model<IUser>('User');
      let exists = await UserModel.findOne({ username });
      while (exists) {
        username = generateUsername(this.email);
        exists = await UserModel.findOne({ username });
      }
      this.username = username;
    }
  }
});

// Index for search
UserSchema.index({ name: 'text', email: 'text', username: 'text' });

// Static method to find by account number
UserSchema.statics.findByAccountNumber = function (accountNumber: string) {
  return this.findOne({ accountNumber });
};

// Static method to find by referral code
UserSchema.statics.findByReferralCode = function (referralCode: string) {
  return this.findOne({ referralCode });
};

// Instance method to check if user can make transfer
UserSchema.methods.canTransfer = function (amount: number): boolean {
  return this.balance >= amount && this.status === UserStatus.ACTIVE;
};

// Instance method to check if user can withdraw
UserSchema.methods.canWithdraw = function (amount: number): boolean {
  return (
    this.balance >= amount &&
    this.status === UserStatus.ACTIVE &&
    this.kycStatus === KycStatus.APPROVED
  );
};

// Virtual for full name
UserSchema.virtual('displayName').get(function () {
  return this.name;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
