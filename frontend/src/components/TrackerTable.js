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

// Sector badge
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

// Growth toggle
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

// Metric cell
const MetricCell = ({ value, growth, positive }) => (
  <div>
    <div className="metric-value">{fmtNum(value)}</div>
    <div className={`metric-growth ${positive ? 'positive' : 'negative'}`}>
      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(growth).toFixed(1)}%
    </div>
  </div>
);

// Bullet list cell
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

// Min/Max dual filter row component
const MinMaxFilter = ({ labelPrefix, minVal, maxVal, onMinChange, onMaxChange, placeholder }) => (
  <div style={{ marginTop: 3 }}>
    <span className="filter-label">{labelPrefix}</span>
    <div style={{ display: 'flex', gap: 3 }}>
      <input
        className="numeric-filter"
        style={{ width: '50%' }}
        placeholder={`Min`}
        value={minVal}
        onChange={e => onMinChange(e.target.value)}
        type="number"
      />
      <input
        className="numeric-filter"
        style={{ width: '50%' }}
        placeholder={`Max`}
        value={maxVal}
        onChange={e => onMaxChange(e.target.value)}
        type="number"
      />
    </div>
  </div>
);

// Frozen column left offsets — 4 frozen cols (Sub-sector removed)
// Company Name(170) | Website(144) | Sector(172) | Category(128)
const FROZEN_OFFSETS = [0, 170, 314, 486];

// Initial numeric filter state — min + max for value and growth %
const INIT_NUMERIC = {
  linkedinFollowers: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinHeadcount: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinJobs:      { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  webTraffic:        { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
};

// Helper: check if a min/max range is active
const rangeActive = (f) =>
  f.valueMin !== '' || f.valueMax !== '' || f.growthMin !== '' || f.growthMax !== '';

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

  const [sectorFilter, setSectorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [revenueFilter, setRevenueFilter] = useState('');
  const [numericFilters, setNumericFilters] = useState(INIT_NUMERIC);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Update a single field in the numeric filter for a column
  const setNumField = (col, field, val) =>
    setNumericFilters(prev => ({ ...prev, [col]: { ...prev[col], [field]: val } }));

  const hasActiveFilters =
    sectorFilter || categoryFilter || revenueFilter ||
    Object.values(numericFilters).some(rangeActive);

  const getOriginalIdx = (company) =>
    initialCompanies.findIndex(ic => ic.id === company.id);

  // Numeric range check helper
  const passesRange = (val, min, max) => {
    if (min !== '' && !isNaN(Number(min)) && val < Number(min)) return false;
    if (max !== '' && !isNaN(Number(max)) && val > Number(max)) return false;
    return true;
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (sectorFilter && company.sector !== sectorFilter) return false;
      if (categoryFilter && company.category !== categoryFilter) return false;
      if (revenueFilter && company.revenueRange !== revenueFilter) return false;

      const origIdx = initialCompanies.findIndex(ic => ic.id === company.id);
      if (origIdx === -1) return true; // newly added company — pass through

      const mData = monthlyData[selectedMonth]?.[origIdx] || {};
      const nf = numericFilters;

      // LinkedIn Followers — value range
      if (!passesRange(mData.linkedinFollowers || 0, nf.linkedinFollowers.valueMin, nf.linkedinFollowers.valueMax)) return false;
      // LinkedIn Headcount — value range
      if (!passesRange(mData.linkedinHeadcount || 0, nf.linkedinHeadcount.valueMin, nf.linkedinHeadcount.valueMax)) return false;
      // LinkedIn Jobs — value range
      if (!passesRange(mData.linkedinJobs || 0, nf.linkedinJobs.valueMin, nf.linkedinJobs.valueMax)) return false;
      // Web Traffic — value range
      if (!passesRange(mData.webTraffic || 0, nf.webTraffic.valueMin, nf.webTraffic.valueMax)) return false;

      // Growth % ranges (per-column toggle period)
      const gFollowers = growthData[growthToggles.linkedinFollowers]?.[origIdx] || {};
      const gHeadcount = growthData[growthToggles.linkedinHeadcount]?.[origIdx] || {};
      const gJobs      = growthData[growthToggles.linkedinJobs]?.[origIdx] || {};
      const gTraffic   = growthData[growthToggles.webTraffic]?.[origIdx] || {};

      if (!passesRange(gFollowers.linkedinFollowers || 0, nf.linkedinFollowers.growthMin, nf.linkedinFollowers.growthMax)) return false;
      if (!passesRange(gHeadcount.linkedinHeadcount || 0, nf.linkedinHeadcount.growthMin, nf.linkedinHeadcount.growthMax)) return false;
      if (!passesRange(gJobs.linkedinJobs || 0, nf.linkedinJobs.growthMin, nf.linkedinJobs.growthMax)) return false;
      if (!passesRange(gTraffic.webTraffic || 0, nf.webTraffic.growthMin, nf.webTraffic.growthMax)) return false;

      return true;
    });
  }, [companies, sectorFilter, categoryFilter, revenueFilter, numericFilters, selectedMonth, growthToggles]);

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
    <div className="flex flex-col" style={{ height: '100vh', background: 'hsl(var(--background))' }}>
      <DashboardHeader companyCount={companies.length} onRefresh={() => {}} />

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-2.5 flex-shrink-0"
        style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
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

        <button className="btn-add-company" onClick={() => setAddModalOpen(true)}>
          <Plus size={13} />
          Add Company
        </button>
      </div>

      {/* Table */}
      <div className="tracker-table-wrapper flex-1" style={{ margin: '12px 16px' }}>
        <table className="tracker-table">
          <thead>
            {/* ── Group header row ── */}
            <tr>
              <th
                colSpan={4}
                className="tracker-th group-header col-frozen"
                style={{ left: 0, zIndex: 31, minWidth: 624 }}
              >
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Company Details</span>
              </th>

              <th
                colSpan={1}
                className="tracker-th group-header"
                style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(210 80% 45%)' }}>Annual Data</span>
              </th>

              <th
                colSpan={1}
                className="tracker-th group-header"
                style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(280 60% 45%)' }}>Company Offerings</span>
              </th>

              <th
                colSpan={5}
                className="tracker-th group-header"
                style={{ minWidth: 830, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(38 80% 40%)' }}>Quarterly Data</span>
                  <select className="period-selector" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </th>

              <th
                colSpan={4}
                className="tracker-th group-header"
                style={{ minWidth: 660, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(150 83% 32%)' }}>Monthly Data</span>
                  <select className="period-selector" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </th>
            </tr>

            {/* ── Column header row ── */}
            <tr>
              {/* FROZEN: Company Name */}
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>
                Company Name
              </th>

              {/* FROZEN: Website */}
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>
                Website
              </th>

              {/* FROZEN: Sector */}
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                <div className="flex items-center gap-1">
                  Sector
                  {sectorFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select"
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

              {/* FROZEN: Category */}
              <th className="tracker-th col-frozen col-frozen-last" style={{ left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                <div className="flex items-center gap-1">
                  Category
                  {categoryFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select"
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

              {/* Revenue Range with filter */}
              <th className="tracker-th" style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">
                  Revenue Range
                  {revenueFilter && <span className="filter-active-dot" />}
                </div>
                <div className="relative">
                  <select
                    className="header-filter-select"
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

              {/* Offerings Summary */}
              <th className="tracker-th" style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}>
                Offerings Summary
              </th>

              {/* Quarterly sub-columns */}
              <th className="tracker-th" style={{ minWidth: 166, borderLeft: '2px solid hsl(var(--border))' }}>News Highlights</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Customer Wins</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Partnerships</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>CXO Changes</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Products &amp; Launches</th>

              {/* Monthly: LinkedIn Followers */}
              <th className="tracker-th" style={{ minWidth: 165, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">
                  LinkedIn Followers
                  {rangeActive(numericFilters.linkedinFollowers) && <span className="filter-active-dot" />}
                </div>
                <GrowthToggle active={growthToggles.linkedinFollowers} onChange={v => setGrowthToggles(g => ({ ...g, linkedinFollowers: v }))} />
                <MinMaxFilter
                  labelPrefix="Value"
                  minVal={numericFilters.linkedinFollowers.valueMin}
                  maxVal={numericFilters.linkedinFollowers.valueMax}
                  onMinChange={v => setNumField('linkedinFollowers', 'valueMin', v)}
                  onMaxChange={v => setNumField('linkedinFollowers', 'valueMax', v)}
                />
                <MinMaxFilter
                  labelPrefix="Growth %"
                  minVal={numericFilters.linkedinFollowers.growthMin}
                  maxVal={numericFilters.linkedinFollowers.growthMax}
                  onMinChange={v => setNumField('linkedinFollowers', 'growthMin', v)}
                  onMaxChange={v => setNumField('linkedinFollowers', 'growthMax', v)}
                />
              </th>

              {/* Monthly: LinkedIn Headcount */}
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">
                  LinkedIn Headcount
                  {rangeActive(numericFilters.linkedinHeadcount) && <span className="filter-active-dot" />}
                </div>
                <GrowthToggle active={growthToggles.linkedinHeadcount} onChange={v => setGrowthToggles(g => ({ ...g, linkedinHeadcount: v }))} />
                <MinMaxFilter
                  labelPrefix="Value"
                  minVal={numericFilters.linkedinHeadcount.valueMin}
                  maxVal={numericFilters.linkedinHeadcount.valueMax}
                  onMinChange={v => setNumField('linkedinHeadcount', 'valueMin', v)}
                  onMaxChange={v => setNumField('linkedinHeadcount', 'valueMax', v)}
                />
                <MinMaxFilter
                  labelPrefix="Growth %"
                  minVal={numericFilters.linkedinHeadcount.growthMin}
                  maxVal={numericFilters.linkedinHeadcount.growthMax}
                  onMinChange={v => setNumField('linkedinHeadcount', 'growthMin', v)}
                  onMaxChange={v => setNumField('linkedinHeadcount', 'growthMax', v)}
                />
              </th>

              {/* Monthly: LinkedIn Job Openings */}
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">
                  LinkedIn Job Openings
                  {rangeActive(numericFilters.linkedinJobs) && <span className="filter-active-dot" />}
                </div>
                <GrowthToggle active={growthToggles.linkedinJobs} onChange={v => setGrowthToggles(g => ({ ...g, linkedinJobs: v }))} />
                <MinMaxFilter
                  labelPrefix="Value"
                  minVal={numericFilters.linkedinJobs.valueMin}
                  maxVal={numericFilters.linkedinJobs.valueMax}
                  onMinChange={v => setNumField('linkedinJobs', 'valueMin', v)}
                  onMaxChange={v => setNumField('linkedinJobs', 'valueMax', v)}
                />
                <MinMaxFilter
                  labelPrefix="Growth %"
                  minVal={numericFilters.linkedinJobs.growthMin}
                  maxVal={numericFilters.linkedinJobs.growthMax}
                  onMinChange={v => setNumField('linkedinJobs', 'growthMin', v)}
                  onMaxChange={v => setNumField('linkedinJobs', 'growthMax', v)}
                />
              </th>

              {/* Monthly: Web Traffic */}
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">
                  Web Traffic
                  {rangeActive(numericFilters.webTraffic) && <span className="filter-active-dot" />}
                </div>
                <GrowthToggle active={growthToggles.webTraffic} onChange={v => setGrowthToggles(g => ({ ...g, webTraffic: v }))} />
                <MinMaxFilter
                  labelPrefix="Value"
                  minVal={numericFilters.webTraffic.valueMin}
                  maxVal={numericFilters.webTraffic.valueMax}
                  onMinChange={v => setNumField('webTraffic', 'valueMin', v)}
                  onMaxChange={v => setNumField('webTraffic', 'valueMax', v)}
                />
                <MinMaxFilter
                  labelPrefix="Growth %"
                  minVal={numericFilters.webTraffic.growthMin}
                  maxVal={numericFilters.webTraffic.growthMax}
                  onMinChange={v => setNumField('webTraffic', 'growthMin', v)}
                  onMaxChange={v => setNumField('webTraffic', 'growthMax', v)}
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
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
                const dataIdx = origIdx >= 0 ? origIdx : 0;

                const mData       = monthlyData[selectedMonth]?.[dataIdx] || {};
                const gFollowers  = growthData[growthToggles.linkedinFollowers]?.[dataIdx] || {};
                const gHeadcount  = growthData[growthToggles.linkedinHeadcount]?.[dataIdx] || {};
                const gJobs       = growthData[growthToggles.linkedinJobs]?.[dataIdx] || {};
                const gTraffic    = growthData[growthToggles.webTraffic]?.[dataIdx] || {};

                const newsItems = qData?.newsHighlights?.[dataIdx] || ['No data', 'No data', 'No data'];
                const custItems = qData?.customerWins?.[dataIdx]   || ['No data', 'No data', 'No data'];
                const partItems = qData?.partnerships?.[dataIdx]   || ['No data', 'No data', 'No data'];
                const cxoItems  = qData?.cxoChanges?.[dataIdx]     || ['No data', 'No data', 'No data'];
                const prodItems = qData?.newProducts?.[dataIdx]    || ['No data', 'No data', 'No data'];

                const isHovered = hoveredRow === company.id;
                const frozenBg = isHovered
                  ? 'hsl(var(--table-row-hover))'
                  : rowIdx % 2 === 1 ? 'hsl(var(--table-row-alt))' : 'hsl(var(--table-row-bg))';
                const frozenStyle = { background: frozenBg, transition: 'background-color 0.15s ease' };

                return (
                  <tr
                    key={company.id}
                    className="tracker-row"
                    onMouseEnter={() => setHoveredRow(company.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Company Name */}
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>
                      <div className="company-name">{company.name}</div>
                    </td>

                    {/* Website */}
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="company-link">
                        <ExternalLink size={10} />
                        {company.website.replace('https://', '')}
                      </a>
                    </td>

                    {/* Sector */}
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                      <SectorBadge sector={company.sector} />
                    </td>

                    {/* Category (displays subsector value) */}
                    <td className="tracker-cell col-frozen col-frozen-last" style={{ ...frozenStyle, left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                      <span className="text-xs" style={{ color: 'hsl(var(--foreground))', fontSize: '0.72rem' }}>
                        {company.subsector || 'N/A'}
                      </span>
                    </td>

                    {/* Revenue Range */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 140 }}>
                      <span className="revenue-badge">{company.revenueRange || 'N/A'}</span>
                    </td>

                    {/* Offerings Summary */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 260, maxWidth: 260 }}>
                      <p className="offerings-text">{company.offeringsSummary}</p>
                    </td>

                    {/* Quarterly */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 166 }}>
                      <BulletListCell items={newsItems} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={custItems} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={partItems} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={cxoItems} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}>
                      <BulletListCell items={prodItems} />
                    </td>

                    {/* Monthly */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 165 }}>
                      <MetricCell value={mData.linkedinFollowers || 0} growth={gFollowers.linkedinFollowers || 0} positive={(gFollowers.linkedinFollowers || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.linkedinHeadcount || 0} growth={gHeadcount.linkedinHeadcount || 0} positive={(gHeadcount.linkedinHeadcount || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.linkedinJobs || 0} growth={gJobs.linkedinJobs || 0} positive={(gJobs.linkedinJobs || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.webTraffic || 0} growth={gTraffic.webTraffic || 0} positive={(gTraffic.webTraffic || 0) >= 0} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddCompanyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddCompany}
      />
    </div>
  );
};
