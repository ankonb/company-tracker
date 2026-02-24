# Growth Equity Fund Tracker — PRD

## Original Problem Statement
Build a company tracking dashboard with a professional light-themed UI, horizontally scrollable data table, frozen columns, interactive headers, filters, and a second alternate tracker at `/alt-tracker`.

## Architecture
- **Frontend-only React app** — no backend, all data hardcoded in JS
- React + Tailwind CSS + Shadcn/UI + React Router v7
- Routes: `/` (main tracker), `/alt-tracker` (Company Tracker)

## What's Implemented

### Main Tracker (`/`) — COMPLETE
- 30 FinTech companies, frozen columns, quarter/month selectors, growth toggles, filters, Add Company modal

### Alt "Company Tracker" (`/alt-tracker`) — COMPLETE
- **Pascal AI logo** (actual image) in top-left, white Add Company button
- 30 companies, 6 sectors, colored category badges
- **Annual Data** (FY22-FY25 year selector):
  - Revenue (₹ Cr) with YoY growth % (with arrow)
  - Gross Margin (₹ Cr, computed from revenue×margin%) with actual margin % (no arrow, green/red box)
  - EBITDA (₹ Cr) with EBITDA margin % (no arrow, green/red box)
  - EBITDA margin always < Gross Margin. Negative EBITDA shows red boxes
  - Min/max filters: Value (Cr) + Margin % for GM/EBITDA, Value (Cr) + Growth % for Revenue
- **Quarterly Data**, **Monthly Data** with growth toggles + filters
- **Interaction Tracking** with Google Calendar/Gmail/Outlook logos, date filter, multi-select type filter
- **AI Chat Bar**: # for sectors/categories, @ for columns with autocomplete dropdowns, tutorial slide, green send button

## Backlog
- P2: Merge TrackerTable.js and TrackerTableAlt.js into single reusable component
- P3: Connect AI chat bar to actual LLM

## Testing
- iteration_1: 10/10, iteration_2: 16/16, iteration_3: 8/8 (all passed)
