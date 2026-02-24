# Growth Equity Fund Tracker — PRD

## Original Problem Statement
Build a company tracking dashboard called "Growth Equity Fund Tracker" with:
- Professional, light-themed UI with horizontally scrollable data table
- Frozen left columns (Company Name, Website, Sector, Category)
- Interactive headers for Quarter/Month/Year selection
- Growth toggles, numeric filters, inline dropdown filters
- "+ Add Company" modal (Company Name + Website only)
- 30 companies with provided sectors and categories
- Second alternate tracker at `/alt-tracker` with different companies/sectors

## Architecture
- **Frontend-only React app** — no backend APIs, all data hardcoded in JS
- React + Tailwind CSS + Shadcn/UI + React Router v7
- Routes: `/` (main tracker), `/alt-tracker` (company tracker)

## File Structure
```
/app/frontend/src/
  App.js                    — BrowserRouter with / and /alt-tracker routes
  index.js, index.css       — Entry point and global styles
  data/
    companies.js            — Main tracker data (30 FinTech companies)
    companiesAlt.js         — Alt tracker data (30 multi-sector companies + interactionData + annualFinancialData)
  components/
    TrackerTable.js         — Main tracker table component
    TrackerTableAlt.js      — Alt "Company Tracker" with financial columns, interaction tracking, AI chat bar
    DashboardHeader.js      — Header component
    AddCompanyModal.js      — Add company modal (both trackers)
    ui/                     — Shadcn UI components
```

## What's Been Implemented

### Main Tracker (`/`) — COMPLETE
- 30 FinTech companies, frozen columns, interactive quarter/month selectors
- Growth toggles (1M, 3M, 6M, YoY), min/max numeric filters
- Sector, Category, Revenue Range dropdown filters
- "+ Add Company" modal

### Alt Tracker (`/alt-tracker`) — COMPLETE
- **Title:** "Company Tracker" (not Portfolio Tracker)
- 30 companies across 6 sectors: Healthcare & MedTech, E-commerce & Retail, EdTech & Learning, Real Estate & PropTech, SaaS & Enterprise, Consumer & D2C
- **Add Company button** present
- **Colored category badges** matching sector colors
- **Annual Data** column group with **year selector** (FY22-FY25):
  - Revenue (₹ Crores) with bold values + YoY growth % in green/red boxes
  - Gross Margin (%) with growth boxes
  - EBITDA (₹ Crores) with growth boxes
  - Min/max filters for both value and growth on all three metrics
- **Interaction Tracking** column group with Google Calendar/Gmail/Outlook logos:
  - Last Interaction date with From/To date filter
  - Last Interaction Type with multi-select filter (Email/Meeting/Call)
  - Key Discussion Points (bullet lists)
  - Next Steps (bullet lists)
- **AI Chat Bar** with rotating example queries featuring:
  - Colored sector/category badges (pink, orange, purple, green, etc.)
  - Gray column-header badges (Customer Wins, Headcount, Revenue, etc.)
  - "AI-powered company intelligence" footer text

## Backlog
- P2: Refactor TrackerTable.js and TrackerTableAlt.js into single reusable component
- P3: Connect AI chat bar to actual LLM for portfolio intelligence queries

## Testing Status
- iteration_1.json: 10/10 passed (initial interaction columns + chat bar)
- iteration_2.json: 16/16 passed (all major updates verified)
