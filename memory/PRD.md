# Growth Equity Fund Tracker — PRD

## Original Problem Statement
Build a company tracking dashboard called "Growth Equity Fund Tracker" with:
- A professional, light-themed UI
- Horizontally scrollable data table with frozen left columns
- Interactive headers for Quarter/Month selection
- Growth toggles and numeric filters
- Inline dropdown filters for Sector, Category, Revenue Range
- Min/max numeric range filters for all numeric columns
- "+ Add Company" modal (Company Name + Website only)
- 30 companies with provided sectors and categories
- A second alternate tracker at `/alt-tracker` with different companies, sectors (healthcare, e-commerce, tech, real estate), and categories — hardcoded, not editable

## Architecture
- **Frontend-only React app** — no backend APIs
- React + Tailwind CSS + Shadcn/UI
- React Router v7 for routing (`/` and `/alt-tracker`)
- All data hardcoded in JS files
- TanStack-style custom table implementation

## File Structure
```
/app/frontend/src/
  App.js                    — BrowserRouter with / and /alt-tracker routes
  index.js                  — React entry point
  index.css                 — Global styles & CSS variables
  data/
    companies.js            — Main tracker data (30 FinTech companies)
    companiesAlt.js         — Alt tracker data (30 multi-sector companies + interactionData)
  components/
    TrackerTable.js         — Main tracker table component
    TrackerTableAlt.js      — Alt tracker with interaction columns + AI chat bar
    DashboardHeader.js      — Header component
    AddCompanyModal.js      — Add company modal (main tracker only)
    ui/                     — Shadcn UI components
```

## What's Been Implemented

### Main Tracker (`/`) — COMPLETE
- 30 FinTech companies with full data
- Frozen columns (Company Name, Website, Sector, Category)
- Interactive quarter/month selectors
- Growth toggles (1M, 3M, 6M, YoY)
- Min/max numeric filters for all metric columns
- Sector, Category, Revenue Range dropdown filters
- "+ Add Company" modal (Name + Website)

### Alternate Tracker (`/alt-tracker`) — COMPLETE
- 30 companies across 6 sectors: Healthcare & MedTech, E-commerce & Retail, EdTech & Learning, Real Estate & PropTech, SaaS & Enterprise, Consumer & D2C
- Read-only mode (no Add Company button)
- All existing table features (filters, selectors, growth toggles)
- **Interaction Tracking column group** (NEW):
  - Google Calendar, Gmail, Outlook logos in header with "Connected" badge
  - Last Interaction Date (with relative "X days ago")
  - Interaction Type (Email/Meeting/Call badges with icons)
  - Key Discussion Points (bullet lists)
  - Next Steps (bullet lists)
- **AI Chat Bar** (NEW):
  - Floating bar at bottom of page
  - Rotating example queries with colored sector/category badges
  - Input field with focus behavior
  - Send button with gradient styling
  - 10 example queries cycling every 4 seconds

## Backlog
- P2: Refactor TrackerTable.js and TrackerTableAlt.js into a single reusable component
- P3: Connect AI chat bar to actual LLM for portfolio intelligence queries

## Testing Status
- All features verified via testing agent (iteration_1.json — 100% pass rate)
- Main tracker and alt tracker both functional
