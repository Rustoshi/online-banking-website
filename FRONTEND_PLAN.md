# Admin Frontend Development Plan

## Design System
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Components**: Custom components (no UI library)
- **Font**: Inter (Google Fonts)

## Color Palette
```css
/* Primary */
--primary: #4F46E5 (Indigo)
--primary-hover: #4338CA

/* Semantic */
--success: #22C55E
--warning: #F59E0B
--error: #EF4444

/* Light Mode */
--bg: #F8FAFC
--surface: #FFFFFF
--border: #E5E7EB
--text-primary: #0F172A
--text-secondary: #475569

/* Dark Mode */
--bg-dark: #0F172A
--surface-dark: #020617
--border-dark: #1E293B
--text-primary-dark: #E5E7EB
--text-secondary-dark: #94A3B8
```

## Admin Pages (Priority Order)

### Phase 1: Core Layout & Auth
1. [x] Design tokens & Tailwind config
2. [ ] Admin Layout (Sidebar + Topbar)
3. [ ] Login Page
4. [ ] Forgot Password Page

### Phase 2: Dashboard & Users
5. [ ] Dashboard (KPIs, Charts, Recent Activity)
6. [ ] Manage Users (List, Search, Filter)
7. [ ] User Details (View, Edit, Actions)
8. [ ] Create User

### Phase 3: Financial Management
9. [ ] Deposits (List, Approve/Reject)
10. [ ] Withdrawals (List, Process)
11. [ ] Transfers (List, Process)
12. [ ] Transactions History

### Phase 4: Products & Services
13. [ ] Investment Plans (CRUD)
14. [ ] User Plans (Active Investments)
15. [ ] Virtual Cards (List, Actions)
16. [ ] Loans (List, Process)
17. [ ] KYC Applications (List, Review)

### Phase 5: Trading Features
18. [ ] Crypto Assets (Manage)
19. [ ] Signal Providers (CRUD)
20. [ ] Trading Signals (Post, Manage)
21. [ ] Copy Trading Accounts

### Phase 6: CRM
22. [ ] Tasks (List, Create, Manage)
23. [ ] Leads (List, Convert)
24. [ ] Calendar View

### Phase 7: Content & Settings
25. [ ] CMS - FAQs
26. [ ] CMS - Testimonials
27. [ ] CMS - Pages (Privacy, Terms)
28. [ ] App Settings
29. [ ] Payment Settings
30. [ ] Referral Settings
31. [ ] Appearance Settings
32. [ ] IP Blocking

### Phase 8: Communication
33. [ ] Email - Send to User
34. [ ] Email - Broadcast
35. [ ] Notifications

### Phase 9: Administration
36. [ ] Manage Admins
37. [ ] Admin Profile
38. [ ] Activity Logs

## Component Library
- Button (Primary, Secondary, Danger, Ghost)
- Input (Text, Password, Number, Search)
- Select
- Checkbox / Toggle
- Modal / Dialog
- Table (Sortable, Paginated)
- Card
- Badge / Status
- Avatar
- Dropdown Menu
- Tabs
- Breadcrumb
- Pagination
- Toast / Notification
- Loading Spinner
- Empty State
- Stats Card
- Chart (Line, Bar, Pie)

## File Structure
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx (Dashboard)
│       ├── login/
│       ├── users/
│       ├── deposits/
│       ├── withdrawals/
│       ├── transfers/
│       ├── plans/
│       ├── cards/
│       ├── loans/
│       ├── kyc/
│       ├── crypto/
│       ├── signals/
│       ├── copy-trading/
│       ├── crm/
│       ├── cms/
│       ├── settings/
│       ├── email/
│       └── profile/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   └── admin/
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       ├── StatsCard.tsx
│       └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useFetch.ts
│   └── useToast.ts
├── lib/
│   └── api.ts
└── styles/
    └── globals.css
```
