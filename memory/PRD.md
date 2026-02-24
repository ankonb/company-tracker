# Growth Equity Fund Tracker — PRD

## Original Problem Statement
Build a company tracking dashboard called "Growth Equity Fund Tracker" with a professional light-themed UI, horizontally scrollable data table, frozen columns, interactive headers, filters, and a second alternate tracker at `/alt-tracker`.

## Architecture
- **Frontend-only React app** — no backend, all data hardcoded in JS
- React + Tailwind CSS + Shadcn/UI + React Router v7
- Routes: `/` (main tracker), `/alt-tracker` (Company Tracker)

## File Structure
```
/app/frontend/src/
  App.js, index.js, index.css
  data/companies.js, data/companiesAlt.js
  components/TrackerTable.js, TrackerTableAlt.js, AddCompanyModal.js, DashboardHeader.js, ui/
```

## What's Implemented

### Main Tracker (`/`) — COMPLETE
- 30 FinTech companies, frozen columns, quarter/month selectors, growth toggles, filters, Add Company modal

### Alt "Company Tracker" (`/alt-tracker`) — COMPLETE
- **Pascal AI logo** (two overlapping rectangles: dark teal outline + green square) in top-left
- **Title:** "Company Tracker"
- **White Add Company button** (clean border, no red gradient)
- 30 companies, 6 sectors, colored category badges
- **Annual Data** (FY22-FY25 year selector): Revenue (₹ Cr), Gross Margin (%), EBITDA (₹ Cr) with YoY growth boxes + min/max filters
- **Quarterly Data** (Q1-Q4 FY25): News, Wins, Partnerships, CXO, Products
- **Monthly Data**: LinkedIn Followers/Headcount/Jobs, Web Traffic with growth toggles + filters
- **Interaction Tracking** (Google Calendar/Gmail/Outlook logos): Last Interaction with date filter, Last Interaction Type with multi-select filter, Key Discussion Points, Next Steps
- **AI Chat Bar**: 
  - `#` prefix for sector/category badges, `@` prefix for column name badges
  - Tutorial slide in rotation showing # and @ usage
  - Green rounded send button with white up arrow
  - "AI-powered company intelligence" footer

## Backlog
- P2: Merge TrackerTable.js and TrackerTableAlt.js into single reusable component
- P3: Connect AI chat bar to actual LLM

## Testing
- iteration_1.json: 10/10 passed
- iteration_2.json: 16/16 passed  
- iteration_3.json: 8/8 passed (UI refinements)
