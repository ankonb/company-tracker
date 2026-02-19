# Growth Equity Fund Tracker - PRD

## Original Problem Statement
Build a company tracking dashboard called "Growth Equity Fund Tracker" - a professional, light-themed UI with a horizontally scrollable data table built with TanStack Table v8.

## Core Requirements

### Table Structure
- **Frozen Columns (Left Section)**: Company Name, Website, Sector, Category (sticky on horizontal scroll)
- **Annual Data**: Revenue Range column
- **Company Offerings**: Multi-line summary of products/services
- **Quarterly Data**: Group header dropdown (Q1-Q4 FY25) with 5 sub-columns (News Highlights, Customer Wins, Partnerships, CXO Changes, New Products)
- **Monthly Data**: Group header dropdown for month selection with 4 sub-columns (LinkedIn Followers, Headcount, Job Openings, Web Traffic)

### Filtering
- Dropdown filters for Sector and Category
- Dropdown filter for Revenue Range
- Min/Max range filters for all numeric columns (both raw value and growth %)

### Data
- 30 companies with realistic FinTech sector data
- Sectors: Banking Tech & BaaS, Capital Markets Infra, Enterprise FinOps, India Stack, Insurance & InsurTech, Lending
- Categories (Subsectors): eKYC APIs, Treasury & ALM Systems, Testing & Certification, Workflow & Test Automation, Exchanges, Depositories, WM Softwares, Crypto Exchanges, Algo/Quant Platforms, Market Data Providers, Payroll & Expense Mgmt, ERP/GST Integration, Accounts Receivable, Accounts Payable, Treasury Management, Reconciliation Solutions, Background Verification, Account Aggregators, Consent Managers, eSign/eStamp Providers, eKYC APIs, DigiLocker Integrators, OCEN Lenders, Digital Insurers, PoSP/Agent Platforms, Embedded Insurance, Health/Wellness Tech, Digital Distribution, BNPL, Auto & Two-wheeler Loans

### Modal
- Add Company modal with only Company Name and Website fields

## Tech Stack
- **Frontend**: React
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS with HSL-based CSS variables
- **Data Table**: TanStack Table v8
- **State Management**: Local React state (no backend)

## What's Been Implemented (December 2025)

### ✅ Completed Features
1. **Dashboard Layout**
   - Light-themed professional design
   - Horizontally scrollable table with frozen columns
   - Company count display (30 companies)

2. **Table Structure**
   - Frozen columns: Company Name, Website, Sector, Category
   - Column groups with headers
   - Quarterly data selector (Q1-Q4 FY25)
   - Monthly data selector (Jan-Apr 2025)
   - Growth toggles (1M, 3M, 6M, YoY) for each metric

3. **Filtering System**
   - Sector dropdown filter
   - Category dropdown filter (filters by subsector)
   - Revenue Range dropdown filter
   - Min/Max range filters for all numeric columns
   - Clear all filters button

4. **Data**
   - 30 realistic FinTech companies
   - Quarterly data (News, Customer Wins, Partnerships, CXO Changes, Products)
   - Monthly data (LinkedIn Followers, Headcount, Jobs, Web Traffic)
   - Growth percentages for all periods (1M, 3M, 6M, YoY)

5. **Add Company Modal**
   - Simplified to only Company Name and Website fields
   - Validation for required fields

## File Structure
```
/app/frontend/src/
├── App.js                    # Main app component
├── index.css                 # Global styles & design tokens
├── data/
│   └── companies.js          # 30 companies + quarterly/monthly/growth data
├── pages/
│   └── (uses App.js)
└── components/
    ├── DashboardHeader.js    # Header with title and stats
    ├── TrackerTable.js       # Main table component
    ├── AddCompanyModal.js    # Simplified add company form
    └── ui/                   # Shadcn UI components
```

## Key Data Models
```javascript
// Company object
{
  id: string,
  name: string,
  website: string,
  sector: string,        // "Banking Tech & BaaS", "Capital Markets Infra", etc.
  subsector: string,     // "eKYC APIs", "Treasury & ALM Systems", etc.
  revenueRange: string,  // "< $1M", "$1M–$10M", "$10M–$50M", etc.
  offeringsSummary: string
}

// Monthly data per company
{
  linkedinFollowers: number,
  linkedinHeadcount: number,
  linkedinJobs: number,
  webTraffic: number
}

// Growth data per period (1M, 3M, 6M, YoY)
{
  linkedinFollowers: number (percentage),
  linkedinHeadcount: number (percentage),
  linkedinJobs: number (percentage),
  webTraffic: number (percentage)
}
```

## Backlog / Future Enhancements
- Backend integration for persistent data storage
- Export to CSV/Excel functionality
- Company detail view/modal
- Charts and visualizations for trends
- User authentication
- Data import from external sources (LinkedIn API, etc.)

## Notes
- This is a frontend-only prototype
- All data is managed in local state
- No backend/database connection
