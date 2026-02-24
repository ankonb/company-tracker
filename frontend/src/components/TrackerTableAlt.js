import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';
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
} from '../data/companiesAlt';
// AddCompanyModal removed - this tracker is read-only

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
  const colors = {
    'Healthcare & MedTech': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
    'E-commerce & Retail': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
    'EdTech & Learning': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
    'Real Estate & PropTech': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
    'SaaS & Enterprise': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
    'Consumer & D2C': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  };
  const style = colors[sector] || { bg: 'hsl(210 80% 95%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 80%)' };
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {sector}
    </span>
  );
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
const MinMaxFilter = ({ labelPrefix, minVal, maxVal, onMinChange, onMaxChange }) => (
  <div style={{ marginTop: 3 }}>
    <span className="filter-label">{labelPrefix}</span>
    <div style={{ display: 'flex', gap: 3 }}>
      <input
        className="numeric-filter"
        style={{ width: '50%' }}
        placeholder="Min"
        value={minVal}
        onChange={e => onMinChange(e.target.value)}
        type="number"
      />
      <input
        className="numeric-filter"
        style={{ width: '50%' }}
        placeholder="Max"
        value={maxVal}
        onChange={e => onMaxChange(e.target.value)}
        type="number"
      />
    </div>
  </div>
);

// Frozen column left offsets
const FROZEN_OFFSETS = [0, 170, 314, 486];

// Initial numeric filter state
const INIT_NUMERIC = {
  linkedinFollowers: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinHeadcount: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinJobs:      { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  webTraffic:        { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
};

const rangeActive = (f) =>
  f.valueMin !== '' || f.valueMax !== '' || f.growthMin !== '' || f.growthMax !== '';

export const TrackerTableAlt = () => {
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

  const [hoveredRow, setHoveredRow] = useState(null);

  const setNumField = (col, field, val) =>
    setNumericFilters(prev => ({ ...prev, [col]: { ...prev[col], [field]: val } }));

  const hasActiveFilters =
    sectorFilter || categoryFilter || revenueFilter ||
    Object.values(numericFilters).some(rangeActive);

  const getOriginalIdx = (company) =>
    initialCompanies.findIndex(ic => ic.id === company.id);

  const passesRange = (val, min, max) => {
    if (min !== '' && !isNaN(Number(min)) && val < Number(min)) return false;
    if (max !== '' && !isNaN(Number(max)) && val > Number(max)) return false;
    return true;
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (sectorFilter && company.sector !== sectorFilter) return false;
      if (categoryFilter && company.subsector !== categoryFilter) return false;
      if (revenueFilter && company.revenueRange !== revenueFilter) return false;

      const origIdx = initialCompanies.findIndex(ic => ic.id === company.id);
      if (origIdx === -1) return true;

      const mData = monthlyData[selectedMonth]?.[origIdx] || {};
      const nf = numericFilters;

      if (!passesRange(mData.linkedinFollowers || 0, nf.linkedinFollowers.valueMin, nf.linkedinFollowers.valueMax)) return false;
      if (!passesRange(mData.linkedinHeadcount || 0, nf.linkedinHeadcount.valueMin, nf.linkedinHeadcount.valueMax)) return false;
      if (!passesRange(mData.linkedinJobs || 0, nf.linkedinJobs.valueMin, nf.linkedinJobs.valueMax)) return false;
      if (!passesRange(mData.webTraffic || 0, nf.webTraffic.valueMin, nf.webTraffic.valueMax)) return false;

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

  const clearAllFilters = () => {
    setSectorFilter('');
    setCategoryFilter('');
    setRevenueFilter('');
    setNumericFilters(INIT_NUMERIC);
  };

  const qData = quarterlyData[selectedQuarter];

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(340 82% 52%), hsl(24 95% 53%))', boxShadow: '0 4px 12px hsl(340 82% 52% / 0.3)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Portfolio Tracker - Client View
            </h1>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Multi-sector company monitoring dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
            <span className="font-semibold">{companies.length}</span> Companies
          </div>
          <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
            <span className="font-semibold">{SECTORS.length}</span> Sectors
          </div>
        </div>
      </div>

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
                background: 'hsl(340 82% 52% / 0.08)',
                color: 'hsl(340 82% 45%)',
                border: '1px solid hsl(340 82% 52% / 0.3)',
                cursor: 'pointer',
              }}
              onClick={clearAllFilters}
            >
              <X size={10} />
              Clear all filters
            </button>
          )}
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }}>
          Read-only view
        </div>
      </div>

      {/* Table */}
      <div className="tracker-table-wrapper flex-1" style={{ margin: '12px 16px' }}>
        <table className="tracker-table">
          <thead>
            <tr>
              <th colSpan={4} className="tracker-th group-header col-frozen" style={{ left: 0, zIndex: 31, minWidth: 624 }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Company Details</span>
              </th>
              <th colSpan={1} className="tracker-th group-header" style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}>
                <span style={{ color: 'hsl(340 82% 45%)' }}>Annual Data</span>
              </th>
              <th colSpan={1} className="tracker-th group-header" style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}>
                <span style={{ color: 'hsl(262 83% 45%)' }}>Company Offerings</span>
              </th>
              <th colSpan={5} className="tracker-th group-header" style={{ minWidth: 830, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(24 95% 40%)' }}>Quarterly Data</span>
                  <select className="period-selector" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </th>
              <th colSpan={4} className="tracker-th group-header" style={{ minWidth: 660, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(142 76% 35%)' }}>Monthly Data</span>
                  <select className="period-selector" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </th>
            </tr>

            <tr>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>Company Name</th>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>Website</th>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                <div className="flex items-center gap-1">Sector {sectorFilter && <span className="filter-active-dot" />}</div>
                <div className="relative">
                  <select className="header-filter-select" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={{ paddingRight: '20px' }}>
                    <option value="">All sectors</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>
              <th className="tracker-th col-frozen col-frozen-last" style={{ left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                <div className="flex items-center gap-1">Category {categoryFilter && <span className="filter-active-dot" />}</div>
                <div className="relative">
                  <select className="header-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ paddingRight: '20px' }}>
                    <option value="">All</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>
              <th className="tracker-th" style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">Revenue Range {revenueFilter && <span className="filter-active-dot" />}</div>
                <div className="relative">
                  <select className="header-filter-select" value={revenueFilter} onChange={e => setRevenueFilter(e.target.value)} style={{ paddingRight: '20px' }}>
                    <option value="">All ranges</option>
                    {REVENUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>
              <th className="tracker-th" style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}>Offerings Summary</th>
              <th className="tracker-th" style={{ minWidth: 166, borderLeft: '2px solid hsl(var(--border))' }}>News Highlights</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Customer Wins</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Partnerships</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>CXO Changes</th>
              <th className="tracker-th" style={{ minWidth: 166 }}>New Products &amp; Launches</th>
              <th className="tracker-th" style={{ minWidth: 165, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">LinkedIn Followers {rangeActive(numericFilters.linkedinFollowers) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.linkedinFollowers} onChange={v => setGrowthToggles(g => ({ ...g, linkedinFollowers: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinFollowers.valueMin} maxVal={numericFilters.linkedinFollowers.valueMax} onMinChange={v => setNumField('linkedinFollowers', 'valueMin', v)} onMaxChange={v => setNumField('linkedinFollowers', 'valueMax', v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinFollowers.growthMin} maxVal={numericFilters.linkedinFollowers.growthMax} onMinChange={v => setNumField('linkedinFollowers', 'growthMin', v)} onMaxChange={v => setNumField('linkedinFollowers', 'growthMax', v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">LinkedIn Headcount {rangeActive(numericFilters.linkedinHeadcount) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.linkedinHeadcount} onChange={v => setGrowthToggles(g => ({ ...g, linkedinHeadcount: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinHeadcount.valueMin} maxVal={numericFilters.linkedinHeadcount.valueMax} onMinChange={v => setNumField('linkedinHeadcount', 'valueMin', v)} onMaxChange={v => setNumField('linkedinHeadcount', 'valueMax', v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinHeadcount.growthMin} maxVal={numericFilters.linkedinHeadcount.growthMax} onMinChange={v => setNumField('linkedinHeadcount', 'growthMin', v)} onMaxChange={v => setNumField('linkedinHeadcount', 'growthMax', v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">LinkedIn Job Openings {rangeActive(numericFilters.linkedinJobs) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.linkedinJobs} onChange={v => setGrowthToggles(g => ({ ...g, linkedinJobs: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinJobs.valueMin} maxVal={numericFilters.linkedinJobs.valueMax} onMinChange={v => setNumField('linkedinJobs', 'valueMin', v)} onMaxChange={v => setNumField('linkedinJobs', 'valueMax', v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinJobs.growthMin} maxVal={numericFilters.linkedinJobs.growthMax} onMinChange={v => setNumField('linkedinJobs', 'growthMin', v)} onMaxChange={v => setNumField('linkedinJobs', 'growthMax', v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">Web Traffic {rangeActive(numericFilters.webTraffic) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.webTraffic} onChange={v => setGrowthToggles(g => ({ ...g, webTraffic: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.webTraffic.valueMin} maxVal={numericFilters.webTraffic.valueMax} onMinChange={v => setNumField('webTraffic', 'valueMin', v)} onMaxChange={v => setNumField('webTraffic', 'valueMax', v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.webTraffic.growthMin} maxVal={numericFilters.webTraffic.growthMax} onMinChange={v => setNumField('webTraffic', 'growthMin', v)} onMaxChange={v => setNumField('webTraffic', 'growthMax', v)} />
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={15} className="tracker-cell text-center py-12" style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                  No companies match the active filters.{' '}
                  <button onClick={clearAllFilters} style={{ color: 'hsl(340 82% 45%)', cursor: 'pointer', textDecoration: 'underline' }}>
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
                  <tr key={company.id} className="tracker-row" onMouseEnter={() => setHoveredRow(company.id)} onMouseLeave={() => setHoveredRow(null)}>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>
                      <div className="company-name">{company.name}</div>
                    </td>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="company-link">
                        <ExternalLink size={10} />
                        {company.website.replace('https://', '')}
                      </a>
                    </td>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                      <SectorBadge sector={company.sector} />
                    </td>
                    <td className="tracker-cell col-frozen col-frozen-last" style={{ ...frozenStyle, left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                      <span className="text-xs" style={{ color: 'hsl(var(--foreground))', fontSize: '0.72rem' }}>
                        {company.subsector || 'N/A'}
                      </span>
                    </td>
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 140 }}>
                      <span className="revenue-badge">{company.revenueRange || 'N/A'}</span>
                    </td>
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 260, maxWidth: 260 }}>
                      <p className="offerings-text">{company.offeringsSummary}</p>
                    </td>
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

      {/* Read-only tracker - no add company modal */}
    </div>
  );
};
