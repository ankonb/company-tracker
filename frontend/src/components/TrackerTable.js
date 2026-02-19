import React, { useState, useMemo } from 'react';
import { ExternalLink, Plus, ChevronDown, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';
import {
  initialCompanies,
  quarterlyData,
  monthlyData,
  growthData,
  QUARTERS,
  MONTHS,
  GROWTH_PERIODS,
  SECTORS,
  CATEGORIES,
} from '../data/companies';
import { AddCompanyModal } from './AddCompanyModal';
import { DashboardHeader } from './DashboardHeader';

// Revenue range ordering for filter
const REVENUE_RANGES = ['< $1M', '$1M–$10M', '$10M–$50M', '$50M–$100M', '$100M–$250M', '$250M+'];

// Utility: format number
const fmtNum = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// Sector badge component
const SectorBadge = ({ sector }) => {
  const cls = {
    Fintech: 'sector-fintech',
    Healthtech: 'sector-healthtech',
    SaaS: 'sector-saas',
    Logistics: 'sector-logistics',
  }[sector] || 'sector-fintech';
  return <span className={`sector-badge ${cls}`}>{sector}</span>;
};

// Category badge
const CategoryBadge = ({ category }) => {
  const cls = {
    Portfolio: 'category-portfolio',
    Watchlist: 'category-watchlist',
    Research: 'category-research',
  }[category] || 'category-portfolio';
  return <span className={`sector-badge ${cls}`}>{category}</span>;
};

// Growth toggle component
const GrowthToggle = ({ active, onChange }) => (
  <div className="growth-toggle">
    {GROWTH_PERIODS.map(p => (
      <button
        key={p}
        className={`growth-toggle-btn ${active === p ? 'active' : ''}`}
        onClick={() => onChange(p)}
        type="button"
      >
        {p}
      </button>
    ))}
  </div>
);

// Metric cell component
const MetricCell = ({ value, growth, positive }) => (
  <div>
    <div className="metric-value">{fmtNum(value)}</div>
    <div className={`metric-growth ${positive ? 'positive' : 'negative'}`}>
      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(growth).toFixed(1)}%
    </div>
  </div>
);

// BulletList cell
const BulletListCell = ({ items }) => (
  <ul className="bullet-list">
    {items.map((item, i) => (
      <li key={i} className="bullet-item">
        <span className="bullet-dot" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// Frozen column left offsets (px)
const FROZEN_OFFSETS = [0, 170, 314, 486, 636];

// Initial numeric filter state shape
const INIT_NUMERIC = {
  linkedinFollowers: { value: '', growth: '' },
  linkedinHeadcount: { value: '', growth: '' },
  linkedinJobs: { value: '', growth: '' },
  webTraffic: { value: '', growth: '' },
};

export const TrackerTable = () => {
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 FY25');
  const [selectedMonth, setSelectedMonth] = useState('Apr 2025');
  const [growthToggles, setGrowthToggles] = useState({
    linkedinFollowers: 'YoY',
    linkedinHeadcount: 'YoY',
    linkedinJobs: 'YoY',
    webTraffic: 'YoY',
  });

  // Column filters
  const [sectorFilter, setSectorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [revenueFilter, setRevenueFilter] = useState('');

  // Monthly numeric + growth % filters
  const [numericFilters, setNumericFilters] = useState(INIT_NUMERIC);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Update a numeric filter field
  const setNumField = (col, field, val) =>
    setNumericFilters(prev => ({ ...prev, [col]: { ...prev[col], [field]: val } }));

  // Check if any filter is active
  const hasActiveFilters =
    sectorFilter || categoryFilter || revenueFilter ||
    Object.values(numericFilters).some(f => f.value !== '' || f.growth !== '');

  // Get the original data index for a company (by id in initialCompanies)
  const getOriginalIdx = (company) =>
    initialCompanies.findIndex(ic => ic.id === company.id);

  // Derived filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // --- Categorical filters ---
      if (sectorFilter && company.sector !== sectorFilter) return false;
      if (categoryFilter && company.category !== categoryFilter) return false;
      if (revenueFilter && company.revenueRange !== revenueFilter) return false;

      // Get correct original index for data lookup
      const origIdx = initialCompanies.findIndex(ic => ic.id === company.id);
      if (origIdx === -1) return true; // new company added by user — pass through

      const mData = monthlyData[selectedMonth]?.[origIdx] || {};

      // --- Monthly raw value filters ---
      const nf = numericFilters;
      if (nf.linkedinFollowers.value !== '' && !isNaN(Number(nf.linkedinFollowers.value))) {
        if ((mData.linkedinFollowers || 0) < Number(nf.linkedinFollowers.value)) return false;
      }
      if (nf.linkedinHeadcount.value !== '' && !isNaN(Number(nf.linkedinHeadcount.value))) {
        if ((mData.linkedinHeadcount || 0) < Number(nf.linkedinHeadcount.value)) return false;
      }
      if (nf.linkedinJobs.value !== '' && !isNaN(Number(nf.linkedinJobs.value))) {
        if ((mData.linkedinJobs || 0) < Number(nf.linkedinJobs.value)) return false;
      }
      if (nf.webTraffic.value !== '' && !isNaN(Number(nf.webTraffic.value))) {
        if ((mData.webTraffic || 0) < Number(nf.webTraffic.value)) return false;
      }

      // --- Monthly growth % filters (uses per-column growth toggle period) ---
      const gFollowers = growthData[growthToggles.linkedinFollowers]?.[origIdx] || {};
      const gHeadcount = growthData[growthToggles.linkedinHeadcount]?.[origIdx] || {};
      const gJobs = growthData[growthToggles.linkedinJobs]?.[origIdx] || {};
      const gTraffic = growthData[growthToggles.webTraffic]?.[origIdx] || {};

      if (nf.linkedinFollowers.growth !== '' && !isNaN(Number(nf.linkedinFollowers.growth))) {
        if ((gFollowers.linkedinFollowers || 0) < Number(nf.linkedinFollowers.growth)) return false;
      }
      if (nf.linkedinHeadcount.growth !== '' && !isNaN(Number(nf.linkedinHeadcount.growth))) {
        if ((gHeadcount.linkedinHeadcount || 0) < Number(nf.linkedinHeadcount.growth)) return false;
      }
      if (nf.linkedinJobs.growth !== '' && !isNaN(Number(nf.linkedinJobs.growth))) {
        if ((gJobs.linkedinJobs || 0) < Number(nf.linkedinJobs.growth)) return false;
      }
      if (nf.webTraffic.growth !== '' && !isNaN(Number(nf.webTraffic.growth))) {
        if ((gTraffic.webTraffic || 0) < Number(nf.webTraffic.growth)) return false;
      }

      return true;
    });
  }, [
    companies, sectorFilter, categoryFilter, revenueFilter,
    numericFilters, selectedMonth, growthToggles,
  ]);

  const handleAddCompany = (newCompany) => {
    setCompanies(prev => [...prev, newCompany]);
  };

  const clearAllFilters = () => {
    setSectorFilter('');
    setCategoryFilter('');
    setRevenueFilter('');
    setNumericFilters(INIT_NUMERIC);
  };

  const qData = quarterlyData[selectedQuarter];

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'hsl(var(--background))' }}
    >
      <DashboardHeader companyCount={companies.length} onRefresh={() => {}} />

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-2.5 flex-shrink-0"
        style={{
          background: 'hsl(var(--card))',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Showing{' '}
            <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {filteredCompanies.length}
            </span>{' '}
            of {companies.length} companies
          </span>
          {hasActiveFilters && (
            <button
              className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1"
              style={{
                background: 'hsl(var(--primary) / 0.08)',
                color: 'hsl(var(--primary))',
                border: '1px solid hsl(var(--primary) / 0.3)',
                cursor: 'pointer',
              }}
              onClick={clearAllFilters}
            >
              <X size={10} />
              Clear all filters
            </button>
          )}
          {/* Active filter pills */}
          {sectorFilter && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'hsl(210 80% 95%)', color: 'hsl(210 80% 35%)', border: '1px solid hsl(210 80% 80%)' }}>
              Sector: {sectorFilter}
            </span>
          )}
          {categoryFilter && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'hsl(150 83% 94%)', color: 'hsl(150 83% 28%)', border: '1px solid hsl(150 83% 75%)' }}>
              Category: {categoryFilter}
            </span>
          )}
          {revenueFilter && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}>
              Revenue: {revenueFilter}
            </span>
          )}
        </div>

        <button
          className="btn-add-company"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus size={13} />
          Add Company
        </button>
      </div>

      {/* Table wrapper */}
      <div className="tracker-table-wrapper flex-1" style={{ margin: '12px 16px' }}>
        <table className="tracker-table">
          {/* ============ THEAD ============ */}
          <thead>
            {/* Row 1: Column Groups */}
            <tr>
              {/* Frozen group header */}
              <th
                colSpan={5}
                className="tracker-th group-header col-frozen"
                style={{ left: 0, zIndex: 31, minWidth: 774 }}
              >
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Company Details</span>
              </th>

              {/* Annual Data */}
              <th
                colSpan={1}
                className="tracker-th group-header"
                style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(210 80% 45%)' }}>Annual Data</span>
              </th>

              {/* Company Offerings */}
              <th
                colSpan={1}
                className="tracker-th group-header"
                style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(280 60% 45%)' }}>Company Offerings</span>
              </th>

              {/* Quarterly Data */}
              <th
                colSpan={5}
                className="tracker-th group-header"
                style={{ minWidth: 830, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(38 80% 40%)' }}>Quarterly Data</span>
                  <select
                    className="period-selector"
                    value={selectedQuarter}
                    onChange={e => setSelectedQuarter(e.target.value)}
                  >
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </th>

              {/* Monthly Data */}
              <th
                colSpan={4}
                className="tracker-th group-header"
                style={{ minWidth: 620, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(150 83% 32%)' }}>Monthly Data</span>
                  <select
                    className="period-selector"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </th>
            </tr>

            {/* Row 2: Column headers */}
            <tr>
              {/* === FROZEN COLUMNS === */}
              {/* Company Name */}
              <th
                className="tracker-th col-frozen"
                style={{ left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}
              >
                Company Name
              </th>

              {/* Website */}
              <th
                className="tracker-th col-frozen"
                style={{ left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}
              >
                Website
              </th>

              {/* Sector with filter */}
              <th
                className="tracker-th col-frozen"
                style={{ left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}
              >
                <div className="flex items-center gap-1">
                  Sector
                  {sectorFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select pr-5"
                    value={sectorFilter}
                    onChange={e => setSectorFilter(e.target.value)}
                    style={{ paddingRight: '20px' }}
                  >
                    <option value="">All sectors</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>

              {/* Sub-sector */}
              <th
                className="tracker-th col-frozen"
                style={{ left: FROZEN_OFFSETS[3], minWidth: 150, width: 150 }}
              >
                Sub-sector
              </th>

              {/* Category with filter */}
              <th
                className="tracker-th col-frozen col-frozen-last"
                style={{ left: FROZEN_OFFSETS[4], minWidth: 128, width: 128 }}
              >
                <div className="flex items-center gap-1">
                  Category
                  {categoryFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select pr-5"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ paddingRight: '20px' }}
                  >
                    <option value="">All</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>

              {/* === ANNUAL DATA: Revenue Range with filter === */}
              <th
                className="tracker-th"
                style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-1">
                  Revenue Range
                  {revenueFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select pr-5"
                    value={revenueFilter}
                    onChange={e => setRevenueFilter(e.target.value)}
                    style={{ paddingRight: '20px' }}
                  >
                    <option value="">All ranges</option>
                    {REVENUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>

              {/* === COMPANY OFFERINGS === */}
              <th
                className="tracker-th"
                style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}
              >
                Offerings Summary
              </th>

              {/* === QUARTERLY SUB-COLUMNS === */}
              <th className="tracker-th" style={{ minWidth: 166, borderLeft: '2px solid hsl(var(--border))' }}>News Highlights</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Customer Wins</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Partnerships</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>CXO Changes</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Products &amp; Launches</th>

              {/* === MONTHLY SUB-COLUMNS === */}
              {/* LinkedIn Followers */}
              <th className="tracker-th" style={{ minWidth: 155, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">
                  LinkedIn Followers
                  {(numericFilters.linkedinFollowers.value || numericFilters.linkedinFollowers.growth) && (
                    <span className="filter-active-dot" />
                  )}
                </div>
                <GrowthToggle
                  active={growthToggles.linkedinFollowers}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinFollowers: v }))}
                />
                <span className="filter-label">Value &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 50000"
                  value={numericFilters.linkedinFollowers.value}
                  onChange={e => setNumField('linkedinFollowers', 'value', e.target.value)}
                  type="number"
                />
                <span className="filter-label">Growth % &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 20"
                  value={numericFilters.linkedinFollowers.growth}
                  onChange={e => setNumField('linkedinFollowers', 'growth', e.target.value)}
                  type="number"
                />
              </th>

              {/* LinkedIn Headcount */}
              <th className="tracker-th" style={{ minWidth: 155 }}>
                <div className="flex items-center gap-1">
                  LinkedIn Headcount
                  {(numericFilters.linkedinHeadcount.value || numericFilters.linkedinHeadcount.growth) && (
                    <span className="filter-active-dot" />
                  )}
                </div>
                <GrowthToggle
                  active={growthToggles.linkedinHeadcount}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinHeadcount: v }))}
                />
                <span className="filter-label">Value &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 500"
                  value={numericFilters.linkedinHeadcount.value}
                  onChange={e => setNumField('linkedinHeadcount', 'value', e.target.value)}
                  type="number"
                />
                <span className="filter-label">Growth % &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 40"
                  value={numericFilters.linkedinHeadcount.growth}
                  onChange={e => setNumField('linkedinHeadcount', 'growth', e.target.value)}
                  type="number"
                />
              </th>

              {/* LinkedIn Job Openings */}
              <th className="tracker-th" style={{ minWidth: 155 }}>
                <div className="flex items-center gap-1">
                  LinkedIn Job Openings
                  {(numericFilters.linkedinJobs.value || numericFilters.linkedinJobs.growth) && (
                    <span className="filter-active-dot" />
                  )}
                </div>
                <GrowthToggle
                  active={growthToggles.linkedinJobs}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinJobs: v }))}
                />
                <span className="filter-label">Value &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 50"
                  value={numericFilters.linkedinJobs.value}
                  onChange={e => setNumField('linkedinJobs', 'value', e.target.value)}
                  type="number"
                />
                <span className="filter-label">Growth % &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 80"
                  value={numericFilters.linkedinJobs.growth}
                  onChange={e => setNumField('linkedinJobs', 'growth', e.target.value)}
                  type="number"
                />
              </th>

              {/* Web Traffic */}
              <th className="tracker-th" style={{ minWidth: 155 }}>
                <div className="flex items-center gap-1">
                  Web Traffic
                  {(numericFilters.webTraffic.value || numericFilters.webTraffic.growth) && (
                    <span className="filter-active-dot" />
                  )}
                </div>
                <GrowthToggle
                  active={growthToggles.webTraffic}
                  onChange={v => setGrowthToggles(g => ({ ...g, webTraffic: v }))}
                />
                <span className="filter-label">Value &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 1000000"
                  value={numericFilters.webTraffic.value}
                  onChange={e => setNumField('webTraffic', 'value', e.target.value)}
                  type="number"
                />
                <span className="filter-label">Growth % &gt; min</span>
                <input
                  className="numeric-filter"
                  placeholder="e.g. 60"
                  value={numericFilters.webTraffic.growth}
                  onChange={e => setNumField('webTraffic', 'growth', e.target.value)}
                  type="number"
                />
              </th>
            </tr>
          </thead>

          {/* ============ TBODY ============ */}
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td
                  colSpan={16}
                  className="tracker-cell text-center py-12"
                  style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}
                >
                  No companies match the active filters.{' '}
                  <button
                    onClick={clearAllFilters}
                    style={{ color: 'hsl(var(--primary))', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company, rowIdx) => {
                const origIdx = getOriginalIdx(company);

                // Use origIdx for data; if origIdx is -1 (new company), use 0 as fallback
                const dataIdx = origIdx >= 0 ? origIdx : 0;

                const mData = monthlyData[selectedMonth]?.[dataIdx] || {};
                const gDataFollowers = growthData[growthToggles.linkedinFollowers]?.[dataIdx] || {};
                const gDataHeadcount = growthData[growthToggles.linkedinHeadcount]?.[dataIdx] || {};
                const gDataJobs = growthData[growthToggles.linkedinJobs]?.[dataIdx] || {};
                const gDataTraffic = growthData[growthToggles.webTraffic]?.[dataIdx] || {};

                const newsItems = qData?.newsHighlights?.[dataIdx] || ['No data available', 'No data available', 'No data available'];
                const custItems = qData?.customerWins?.[dataIdx] || ['No data available', 'No data available', 'No data available'];
                const partItems = qData?.partnerships?.[dataIdx] || ['No data available', 'No data available', 'No data available'];
                const cxoItems = qData?.cxoChanges?.[dataIdx] || ['No data available', 'No data available', 'No data available'];
                const prodItems = qData?.newProducts?.[dataIdx] || ['No data available', 'No data available', 'No data available'];

                const isHovered = hoveredRow === company.id;

                const frozenBg = isHovered
                  ? 'hsl(var(--table-row-hover))'
                  : rowIdx % 2 === 1
                  ? 'hsl(var(--table-row-alt))'
                  : 'hsl(var(--table-row-bg))';

                const frozenCellStyle = {
                  background: frozenBg,
                  transition: 'background-color 0.15s ease',
                };

                return (
                  <tr
                    key={company.id}
                    className="tracker-row"
                    onMouseEnter={() => setHoveredRow(company.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Company Name */}
                    <td
                      className="tracker-cell col-frozen"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}
                    >
                      <div className="company-name">{company.name}</div>
                    </td>

                    {/* Website */}
                    <td
                      className="tracker-cell col-frozen"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}
                    >
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="company-link"
                      >
                        <ExternalLink size={10} />
                        {company.website.replace('https://', '')}
                      </a>
                    </td>

                    {/* Sector */}
                    <td
                      className="tracker-cell col-frozen"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}
                    >
                      <SectorBadge sector={company.sector} />
                    </td>

                    {/* Sub-sector */}
                    <td
                      className="tracker-cell col-frozen"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[3], minWidth: 150, width: 150 }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: 'hsl(var(--foreground) / 0.7)', fontSize: '0.75rem' }}
                      >
                        {company.subsector}
                      </span>
                    </td>

                    {/* Category */}
                    <td
                      className="tracker-cell col-frozen col-frozen-last"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[4], minWidth: 128, width: 128 }}
                    >
                      <CategoryBadge category={company.category} />
                    </td>

                    {/* Revenue Range */}
                    <td
                      className="tracker-cell"
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 140 }}
                    >
                      <span className="revenue-badge">{company.revenueRange || 'N/A'}</span>
                    </td>

                    {/* Offerings Summary */}
                    <td
                      className="tracker-cell"
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 260, maxWidth: 260 }}
                    >
                      <p className="offerings-text">{company.offeringsSummary}</p>
                    </td>

                    {/* Quarterly: News Highlights */}
                    <td
                      className="tracker-cell"
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 166 }}
                    >
                      <BulletListCell items={newsItems} />
                    </td>

                    {/* Quarterly: Customer Wins */}
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={custItems} />
                    </td>

                    {/* Quarterly: Partnerships */}
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={partItems} />
                    </td>

                    {/* Quarterly: CXO Changes */}
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={cxoItems} />
                    </td>

                    {/* Quarterly: New Products */}
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={prodItems} />
                    </td>

                    {/* Monthly: LinkedIn Followers */}
                    <td
                      className="tracker-cell"
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 155 }}
                    >
                      <MetricCell
                        value={mData.linkedinFollowers || 0}
                        growth={gDataFollowers.linkedinFollowers || 0}
                        positive={(gDataFollowers.linkedinFollowers || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: LinkedIn Headcount */}
                    <td className="tracker-cell" style={{ minWidth: 155 }}>
                      <MetricCell
                        value={mData.linkedinHeadcount || 0}
                        growth={gDataHeadcount.linkedinHeadcount || 0}
                        positive={(gDataHeadcount.linkedinHeadcount || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: LinkedIn Job Openings */}
                    <td className="tracker-cell" style={{ minWidth: 155 }}>
                      <MetricCell
                        value={mData.linkedinJobs || 0}
                        growth={gDataJobs.linkedinJobs || 0}
                        positive={(gDataJobs.linkedinJobs || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: Web Traffic */}
                    <td className="tracker-cell" style={{ minWidth: 155 }}>
                      <MetricCell
                        value={mData.webTraffic || 0}
                        growth={gDataTraffic.webTraffic || 0}
                        positive={(gDataTraffic.webTraffic || 0) >= 0}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddCompany}
      />
    </div>
  );
};
