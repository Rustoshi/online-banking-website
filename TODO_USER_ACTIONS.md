# User Actions Implementation TODO

## Overview
Implementing all user action items from the admin user details page dropdown menu.

## Actions to Implement

### 1. ✅ Credit Account (Already implemented)
### 2. ✅ Debit Account (Already implemented)
### 3. ✅ Edit User (Already implemented)
### 4. ✅ Send Email (Already implemented)
### 5. ✅ Block/Unblock User (Already implemented)
### 6. ✅ Delete User (Already implemented)

### 7. ✅ Verify Email
- [x] Check PHP implementation - Sets email_verified_at to current timestamp
- [x] Create API endpoint - `/api/admin/users/[id]/verify-email`
- [x] Implement UI action - Button in dropdown, calls API directly
- [ ] Test endpoint

### 8. ✅ Reset Password
- [x] Check PHP implementation - Resets to default 'user01236'
- [x] Create API endpoint - `/api/admin/users/[id]/reset-password`
- [x] Implement UI action - Button in dropdown, shows alert with new password
- [ ] Test endpoint

### 9. ✅ Generate Transaction
- [x] Check PHP implementation - Creates transaction record with all fields
- [x] Create API endpoint - `/api/admin/users/[id]/generate-transaction`
- [x] Implement UI modal with all transaction fields
- [ ] Test endpoint

### 10. ✅ Change Profile Picture
- [x] Check PHP implementation - Uploads file, updates profile_photo_path
- [x] Create API endpoint - `/api/admin/users/[id]/profile-photo`
- [x] Implement UI modal with file upload
- [ ] Test endpoint

### 11. ✅ Toggle Dormant Status
- [x] Check PHP implementation - Sets account_status to inactive/active
- [x] Create API endpoint - `/api/admin/users/[id]/dormant`
- [x] Implement UI action - Button in dropdown
- [ ] Test endpoint

### 12. ✅ Clear Account (Reset Balance)
- [x] Check PHP implementation - Deletes transactions, resets all balances to 0
- [x] Create API endpoint - `/api/admin/users/[id]/clear`
- [x] Implement UI confirmation dialog
- [ ] Test endpoint

### 13. ✅ Set Usage Limits
- [x] Check PHP implementation - Updates dailyTotal, weeklyTotal, monthlyTotal
- [x] Create API endpoint - `/api/admin/users/[id]/usage-limits`
- [x] Implement UI modal
- [ ] Test endpoint

### 14. ✅ Banking Authorization Codes
- [x] Check PHP implementation - Updates code1, code2, code3 with status
- [x] Create API endpoint - `/api/admin/users/[id]/banking-codes`
- [x] Implement UI modal
- [ ] Test endpoint

### 15. ✅ Login As User
- [x] Check PHP implementation - Auth::loginUsingId, redirects to dashboard
- [x] Create API endpoint - `/api/admin/users/[id]/login-as`
- [x] Implement UI action - Opens user dashboard in new tab
- [ ] Test endpoint

### 16. ✅ Login Activity
- [x] Check PHP implementation - Shows Activity records for user
- [x] Create API endpoint - `/api/admin/users/[id]/login-activity`
- [x] Implement UI page - `/admin/users/[id]/activity`
- [ ] Test endpoint

## API Endpoints Created
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users/[id]/verify-email` | POST | Verify user email |
| `/api/admin/users/[id]/reset-password` | POST | Reset password to default |
| `/api/admin/users/[id]/generate-transaction` | POST | Create transaction |
| `/api/admin/users/[id]/profile-photo` | POST | Upload profile photo |
| `/api/admin/users/[id]/dormant` | POST/DELETE | Toggle dormant status |
| `/api/admin/users/[id]/clear` | POST | Clear account balances |
| `/api/admin/users/[id]/usage-limits` | PUT | Update usage limits |
| `/api/admin/users/[id]/banking-codes` | PUT | Update banking codes |
| `/api/admin/users/[id]/login-as` | POST | Login as user |
| `/api/admin/users/[id]/login-activity` | GET/DELETE | Get/Clear login activity |

## Progress Tracking
- Started: 2026-01-02
- Completed: 2026-01-02
- Status: All API endpoints and UI implemented, pending testing
