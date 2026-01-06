# NextJS Online Banking - Complete Rebuild Plan

## Project Overview

Rebuilding Remedygrandbank (Laravel/MySQL) as a modern Next.js 14+ application with MongoDB.

**Original Stack**: Laravel 8, MySQL, Blade, Livewire
**New Stack**: Next.js 14, MongoDB, TypeScript, Tailwind CSS

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema Design](#database-schema-design)
4. [API Endpoints](#api-endpoints)
5. [Feature Modules](#feature-modules)
6. [Development Phases](#development-phases)
7. [Testing Strategy](#testing-strategy)
8. [Security Considerations](#security-considerations)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  Next.js App Router (React Server Components + Client)         │
├─────────────────────────────────────────────────────────────────┤
│                         API Layer                               │
│  Next.js API Routes + Server Actions                            │
├─────────────────────────────────────────────────────────────────┤
│                       Service Layer                             │
│  Business Logic, Validation, External Integrations              │
├─────────────────────────────────────────────────────────────────┤
│                      Data Access Layer                          │
│  Mongoose ODM, Repository Pattern                               │
├─────────────────────────────────────────────────────────────────┤
│                        Database                                 │
│  MongoDB (Atlas or Local)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Full-stack React framework |
| TypeScript | 5.x | Type safety |
| MongoDB | 7.x | Database |
| Mongoose | 8.x | ODM |

### Authentication & Security
| Technology | Purpose |
|------------|---------|
| NextAuth.js v5 | Authentication |
| bcryptjs | Password hashing |
| jose | JWT handling |
| zod | Schema validation |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | Unit testing |
| Supertest | API testing |
| MongoDB Memory Server | Test database |

### UI (Phase 2)
| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Lucide React | Icons |
| React Hook Form | Form handling |

### Integrations
| Technology | Purpose |
|------------|---------|
| Stripe | Payment processing |
| Nodemailer | Email |
| Twilio | SMS |

---

## Database Schema Design

### Collections Overview

1. **users** - Customer accounts
2. **admins** - Admin/staff accounts
3. **transactions** - All financial transactions
4. **deposits** - Deposit requests
5. **withdrawals** - Withdrawal requests
6. **transfers** - Transfer records
7. **cards** - Virtual cards
8. **card_transactions** - Card transaction history
9. **plans** - Investment plans
10. **user_plans** - User subscriptions to plans
11. **kyc** - KYC verification documents
12. **notifications** - User notifications
13. **settings** - Global app settings
14. **payment_methods** - Available payment methods
15. **loans** - Loan applications
16. **activities** - Audit log

### Schema Definitions

#### User Schema
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  name: string,
  username: string (unique),
  phone: string,
  country: string,
  address: string,
  city: string,
  zipCode: string,
  dateOfBirth: Date,
  profilePhoto: string,
  
  // Balances
  balance: number (default: 0),
  bonus: number (default: 0),
  tradingBalance: number (default: 0),
  
  // Account Status
  status: enum ['active', 'blocked', 'dormant'],
  emailVerified: boolean,
  emailVerifiedAt: Date,
  kycStatus: enum ['pending', 'approved', 'rejected', 'not_submitted'],
  
  // Security
  twoFactorEnabled: boolean,
  twoFactorSecret: string,
  pin: string (hashed),
  
  // Settings
  emailNotifications: boolean,
  smsNotifications: boolean,
  theme: enum ['light', 'dark'],
  
  // Banking Details
  accountNumber: string (unique, auto-generated),
  accountType: enum ['savings', 'checking', 'business'],
  
  // Referral
  referralCode: string (unique),
  referredBy: ObjectId (ref: User),
  
  // Limits
  dailyTransferLimit: number,
  dailyWithdrawalLimit: number,
  
  // Authorization Codes (for transfers)
  taxCode: string,
  imfCode: string,
  cotCode: string,
  
  // Metadata
  lastLogin: Date,
  loginIp: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Admin Schema
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  name: string,
  role: enum ['super_admin', 'admin', 'support'],
  permissions: [string],
  status: enum ['active', 'blocked'],
  twoFactorEnabled: boolean,
  twoFactorSecret: string,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Transaction Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  type: enum ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'bonus', 'fee', 'investment', 'loan'],
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  currency: string (default: 'USD'),
  status: enum ['pending', 'completed', 'failed', 'cancelled'],
  description: string,
  reference: string (unique),
  metadata: Mixed,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

#### Deposit Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  amount: number,
  paymentMethod: ObjectId (ref: PaymentMethod),
  status: enum ['pending', 'approved', 'rejected'],
  reference: string (unique),
  proofImage: string,
  adminNote: string,
  processedBy: ObjectId (ref: Admin),
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Withdrawal Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  amount: number,
  fee: number,
  netAmount: number,
  paymentMethod: ObjectId (ref: PaymentMethod),
  paymentDetails: Mixed,
  status: enum ['pending', 'approved', 'rejected', 'processing'],
  reference: string (unique),
  adminNote: string,
  processedBy: ObjectId (ref: Admin),
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Transfer Schema
```typescript
{
  _id: ObjectId,
  sender: ObjectId (ref: User, indexed),
  recipient: ObjectId (ref: User) | null,
  recipientDetails: {
    accountNumber: string,
    accountName: string,
    bankName: string,
    bankCode: string,
    country: string,
    swiftCode: string,
    routingNumber: string
  },
  type: enum ['internal', 'local', 'international'],
  amount: number,
  fee: number,
  totalAmount: number,
  currency: string,
  status: enum ['pending', 'processing', 'completed', 'failed', 'cancelled'],
  reference: string (unique),
  description: string,
  scheduledDate: Date,
  
  // Verification codes required
  requiresTaxCode: boolean,
  requiresImfCode: boolean,
  requiresCotCode: boolean,
  codesVerified: boolean,
  
  processedBy: ObjectId (ref: Admin),
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Card Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  cardNumber: string (encrypted),
  cardNumberLast4: string,
  expiryMonth: string,
  expiryYear: string,
  cvv: string (encrypted),
  cardholderName: string,
  cardType: enum ['visa', 'mastercard'],
  cardDesign: string,
  balance: number (default: 0),
  status: enum ['pending', 'active', 'blocked', 'expired'],
  pin: string (hashed),
  dailyLimit: number,
  monthlyLimit: number,
  billingAddress: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  approvedBy: ObjectId (ref: Admin),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Plan Schema (Investment Plans)
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  minAmount: number,
  maxAmount: number,
  returnPercentage: number,
  durationDays: number,
  status: enum ['active', 'inactive'],
  features: [string],
  createdAt: Date,
  updatedAt: Date
}
```

#### UserPlan Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  plan: ObjectId (ref: Plan),
  amount: number,
  expectedReturn: number,
  status: enum ['active', 'completed', 'cancelled'],
  startDate: Date,
  endDate: Date,
  returnPaid: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### KYC Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, unique),
  documentType: enum ['passport', 'drivers_license', 'national_id'],
  documentNumber: string,
  frontImage: string,
  backImage: string,
  selfieImage: string,
  status: enum ['pending', 'approved', 'rejected'],
  rejectionReason: string,
  reviewedBy: ObjectId (ref: Admin),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  title: string,
  message: string,
  type: enum ['info', 'success', 'warning', 'error'],
  isRead: boolean (default: false),
  link: string,
  createdAt: Date
}
```

#### Settings Schema
```typescript
{
  _id: ObjectId,
  key: string (unique),
  value: Mixed,
  category: enum ['general', 'email', 'payment', 'security', 'limits'],
  updatedAt: Date
}
```

#### PaymentMethod Schema
```typescript
{
  _id: ObjectId,
  name: string,
  type: enum ['bank', 'crypto', 'card', 'mobile_money'],
  details: Mixed,
  instructions: string,
  minAmount: number,
  maxAmount: number,
  fee: number,
  feeType: enum ['fixed', 'percentage'],
  status: enum ['active', 'inactive'],
  createdAt: Date,
  updatedAt: Date
}
```

#### Loan Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  amount: number,
  interestRate: number,
  durationMonths: number,
  monthlyPayment: number,
  totalPayable: number,
  purpose: string,
  status: enum ['pending', 'approved', 'rejected', 'active', 'paid', 'defaulted'],
  approvedBy: ObjectId (ref: Admin),
  approvedAt: Date,
  disbursedAt: Date,
  nextPaymentDate: Date,
  paidAmount: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Activity Schema (Audit Log)
```typescript
{
  _id: ObjectId,
  actor: ObjectId (ref: User | Admin),
  actorType: enum ['user', 'admin'],
  action: string,
  resource: string,
  resourceId: ObjectId,
  details: Mixed,
  ipAddress: string,
  userAgent: string,
  createdAt: Date (indexed, TTL: 90 days)
}
```

---

## API Endpoints

### Authentication APIs

#### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/verify-email | Verify email with token |
| POST | /api/auth/resend-verification | Resend verification email |
| POST | /api/auth/verify-2fa | Verify 2FA code |

#### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/auth/login | Admin login |
| POST | /api/admin/auth/logout | Admin logout |
| POST | /api/admin/auth/verify-2fa | Admin 2FA verification |

### User APIs (Protected)

#### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get user profile |
| PUT | /api/user/profile | Update profile |
| PUT | /api/user/profile/photo | Update profile photo |
| PUT | /api/user/password | Change password |
| PUT | /api/user/pin | Change transaction PIN |
| GET | /api/user/settings | Get user settings |
| PUT | /api/user/settings | Update settings |

#### 2FA
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/user/2fa/enable | Enable 2FA |
| POST | /api/user/2fa/disable | Disable 2FA |
| POST | /api/user/2fa/verify | Verify 2FA setup |

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/dashboard | Dashboard summary |
| GET | /api/user/transactions | Transaction history |
| GET | /api/user/transactions/:id | Transaction details |

#### Deposits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/deposits | List deposits |
| POST | /api/user/deposits | Create deposit request |
| GET | /api/user/deposits/:id | Deposit details |
| GET | /api/user/payment-methods | Available payment methods |

#### Withdrawals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/withdrawals | List withdrawals |
| POST | /api/user/withdrawals | Create withdrawal request |
| GET | /api/user/withdrawals/:id | Withdrawal details |

#### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/user/transfers/internal | Internal transfer |
| POST | /api/user/transfers/local | Local bank transfer |
| POST | /api/user/transfers/international | International transfer |
| POST | /api/user/transfers/verify-codes | Verify authorization codes |
| GET | /api/user/transfers | Transfer history |
| GET | /api/user/transfers/:id | Transfer details |
| GET | /api/user/transfers/validate-account | Validate account number |

#### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/cards | List user cards |
| POST | /api/user/cards/apply | Apply for card |
| GET | /api/user/cards/:id | Card details |
| POST | /api/user/cards/:id/activate | Activate card |
| POST | /api/user/cards/:id/block | Block card |
| POST | /api/user/cards/:id/unblock | Unblock card |
| GET | /api/user/cards/:id/transactions | Card transactions |

#### Investment Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/plans | Available plans |
| POST | /api/user/plans/subscribe | Subscribe to plan |
| GET | /api/user/plans/my-plans | User's active plans |
| GET | /api/user/plans/:id | Plan details |
| POST | /api/user/plans/:id/cancel | Cancel plan |

#### KYC
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/kyc | KYC status |
| POST | /api/user/kyc | Submit KYC |
| PUT | /api/user/kyc | Update KYC |

#### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/loans | List loans |
| POST | /api/user/loans | Apply for loan |
| GET | /api/user/loans/:id | Loan details |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/notifications | List notifications |
| PUT | /api/user/notifications/:id/read | Mark as read |
| PUT | /api/user/notifications/read-all | Mark all as read |
| DELETE | /api/user/notifications/:id | Delete notification |

### Admin APIs (Protected)

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Admin dashboard stats |
| GET | /api/admin/activities | Recent activities |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List users |
| POST | /api/admin/users | Create user |
| GET | /api/admin/users/:id | User details |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| POST | /api/admin/users/:id/block | Block user |
| POST | /api/admin/users/:id/unblock | Unblock user |
| POST | /api/admin/users/:id/topup | Add funds to user |
| POST | /api/admin/users/:id/deduct | Deduct funds |
| POST | /api/admin/users/:id/email | Send email to user |
| POST | /api/admin/users/:id/reset-password | Reset user password |
| PUT | /api/admin/users/:id/limits | Update user limits |
| PUT | /api/admin/users/:id/codes | Update authorization codes |
| GET | /api/admin/users/:id/transactions | User transactions |
| GET | /api/admin/users/:id/login-history | User login history |

#### Deposit Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/deposits | List all deposits |
| GET | /api/admin/deposits/pending | Pending deposits |
| GET | /api/admin/deposits/:id | Deposit details |
| POST | /api/admin/deposits/:id/approve | Approve deposit |
| POST | /api/admin/deposits/:id/reject | Reject deposit |
| DELETE | /api/admin/deposits/:id | Delete deposit |

#### Withdrawal Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/withdrawals | List all withdrawals |
| GET | /api/admin/withdrawals/pending | Pending withdrawals |
| GET | /api/admin/withdrawals/:id | Withdrawal details |
| POST | /api/admin/withdrawals/:id/approve | Approve withdrawal |
| POST | /api/admin/withdrawals/:id/reject | Reject withdrawal |

#### Transfer Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/transfers | List all transfers |
| GET | /api/admin/transfers/pending | Pending transfers |
| GET | /api/admin/transfers/:id | Transfer details |
| POST | /api/admin/transfers/:id/process | Process transfer |
| POST | /api/admin/transfers/:id/cancel | Cancel transfer |

#### Card Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/cards | List all cards |
| GET | /api/admin/cards/pending | Pending applications |
| GET | /api/admin/cards/:id | Card details |
| POST | /api/admin/cards/:id/approve | Approve card |
| POST | /api/admin/cards/:id/reject | Reject card |
| POST | /api/admin/cards/:id/block | Block card |
| POST | /api/admin/cards/:id/unblock | Unblock card |
| POST | /api/admin/cards/:id/topup | Topup card |
| POST | /api/admin/cards/:id/deduct | Deduct from card |

#### Plan Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/plans | List plans |
| POST | /api/admin/plans | Create plan |
| GET | /api/admin/plans/:id | Plan details |
| PUT | /api/admin/plans/:id | Update plan |
| DELETE | /api/admin/plans/:id | Delete plan |
| GET | /api/admin/user-plans | Active user plans |
| POST | /api/admin/user-plans/:id/complete | Complete plan |
| POST | /api/admin/user-plans/:id/cancel | Cancel plan |

#### KYC Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/kyc | List KYC applications |
| GET | /api/admin/kyc/pending | Pending applications |
| GET | /api/admin/kyc/:id | KYC details |
| POST | /api/admin/kyc/:id/approve | Approve KYC |
| POST | /api/admin/kyc/:id/reject | Reject KYC |

#### Loan Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/loans | List loans |
| GET | /api/admin/loans/pending | Pending loans |
| GET | /api/admin/loans/:id | Loan details |
| POST | /api/admin/loans/:id/approve | Approve loan |
| POST | /api/admin/loans/:id/reject | Reject loan |
| POST | /api/admin/loans/:id/disburse | Disburse loan |

#### Payment Method Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/payment-methods | List methods |
| POST | /api/admin/payment-methods | Create method |
| GET | /api/admin/payment-methods/:id | Method details |
| PUT | /api/admin/payment-methods/:id | Update method |
| DELETE | /api/admin/payment-methods/:id | Delete method |

#### Admin Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/admins | List admins |
| POST | /api/admin/admins | Create admin |
| GET | /api/admin/admins/:id | Admin details |
| PUT | /api/admin/admins/:id | Update admin |
| DELETE | /api/admin/admins/:id | Delete admin |
| POST | /api/admin/admins/:id/block | Block admin |
| POST | /api/admin/admins/:id/unblock | Unblock admin |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/settings | Get all settings |
| PUT | /api/admin/settings | Update settings |
| GET | /api/admin/settings/:category | Settings by category |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/reports/transactions | Transaction report |
| GET | /api/admin/reports/users | User report |
| GET | /api/admin/reports/revenue | Revenue report |
| POST | /api/admin/reports/export | Export report |

---

## Feature Modules

### Phase 1: Core Backend (Current)
1. ✅ Project setup
2. ✅ Database connection
3. ✅ User authentication
4. ✅ Admin authentication
5. ✅ User management
6. ✅ Transaction system
7. ✅ Deposit system
8. ✅ Withdrawal system
9. ✅ Transfer system
10. ✅ Card system
11. ✅ Plan system
12. ✅ KYC system
13. ✅ Notification system
14. ✅ Settings system

### Phase 2: Frontend (Next)
1. Authentication pages
2. User dashboard
3. Admin dashboard
4. All user features UI
5. All admin features UI

### Phase 3: Integrations
1. Payment gateways
2. Email service
3. SMS service
4. File uploads

---

## Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project initialization
- [x] TypeScript configuration
- [x] MongoDB connection
- [x] Base models
- [x] Authentication system
- [x] Testing setup

### Phase 2: User Features (Week 2)
- [x] User CRUD
- [x] Profile management
- [x] Transaction history
- [x] Deposits
- [x] Withdrawals
- [x] Transfers

### Phase 3: Advanced Features (Week 3)
- [x] Virtual cards
- [x] Investment plans
- [x] KYC verification
- [x] Loans
- [x] Notifications

### Phase 4: Admin Features (Week 4)
- [x] Admin dashboard
- [x] User management
- [x] Financial management
- [x] Settings management
- [x] Reports

---

## Testing Strategy

### Unit Tests
- Model validation
- Service functions
- Utility functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows

### Test Coverage Goals
- Models: 100%
- Services: 90%
- API Routes: 95%
- Utilities: 100%

---

## Security Considerations

1. **Authentication**
   - JWT with short expiry
   - Refresh token rotation
   - Rate limiting on auth endpoints

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - Admin permission levels

3. **Data Protection**
   - Password hashing (bcrypt)
   - Sensitive data encryption
   - Input sanitization

4. **API Security**
   - CORS configuration
   - Request validation
   - SQL injection prevention (N/A - MongoDB)
   - XSS prevention

5. **Audit**
   - Activity logging
   - Login history
   - Admin action tracking

---

## Environment Variables

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NextJS Online Banking

# Database
MONGODB_URI=mongodb://localhost:27017/nextjs_banking

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=password
EMAIL_FROM=noreply@example.com

# SMS (Twilio)
TWILIO_SID=your-sid
TWILIO_TOKEN=your-token
TWILIO_FROM=+1234567890

# File Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=

# Payment Gateways
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_SECRET_KEY=
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── admin/
│   │   └── webhooks/
│   ├── (auth)/
│   ├── (public)/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations/
├── models/
├── services/
├── repositories/
├── middleware/
├── types/
├── hooks/
└── components/
```

---

## Commands

```bash
# Development
npm run dev

# Testing
npm test
npm run test:watch
npm run test:coverage

# Build
npm run build

# Production
npm start

# Database
npm run db:seed
npm run db:reset
```

---

## Progress Tracking

### Backend API Completion

| Module | Status | Tests |
|--------|--------|-------|
| Auth | ✅ | ✅ |
| User Profile | ✅ | ✅ |
| Transactions | ✅ | ✅ |
| Deposits | ✅ | ✅ |
| Withdrawals | ✅ | ✅ |
| Transfers | ✅ | ✅ |
| Cards | 🔄 | ⏳ |
| Plans | 🔄 | ⏳ |
| KYC | 🔄 | ⏳ |
| Loans | 🔄 | ⏳ |
| Notifications | 🔄 | ⏳ |
| Admin Users | ✅ | ✅ |
| Admin Deposits | ✅ | ⏳ |
| Admin Withdrawals | ✅ | ⏳ |
| Admin Transfers | 🔄 | ⏳ |
| Admin Cards | 🔄 | ⏳ |
| Admin Plans | 🔄 | ⏳ |
| Admin KYC | 🔄 | ⏳ |
| Admin Loans | 🔄 | ⏳ |
| Admin Settings | 🔄 | ⏳ |
| Admin Reports | 🔄 | ⏳ |

Legend: ✅ Complete | 🔄 In Progress | ⏳ Pending

---

*Document Version: 1.0*
*Last Updated: January 2, 2026*
