import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ExternalLink, Plus, ChevronDown, TrendingUp, TrendingDown, Filter } from 'lucide-react';
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

// Utility: format number
const fmtNum = (n) => {
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
  const [numericFilters, setNumericFilters] = useState({
    linkedinFollowers: '',
    linkedinHeadcount: '',
    linkedinJobs: '',
    webTraffic: '',
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Derived filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c, i) => {
      if (sectorFilter && c.sector !== sectorFilter) return false;
      if (categoryFilter && c.category !== categoryFilter) return false;

      const mData = monthlyData[selectedMonth]?.[i] || {};
      const gData = growthData[growthToggles.linkedinFollowers]?.[i] || {};

      if (numericFilters.linkedinFollowers && mData.linkedinFollowers < Number(numericFilters.linkedinFollowers)) return false;
      if (numericFilters.linkedinHeadcount && mData.linkedinHeadcount < Number(numericFilters.linkedinHeadcount)) return false;
      if (numericFilters.linkedinJobs && mData.linkedinJobs < Number(numericFilters.linkedinJobs)) return false;
      if (numericFilters.webTraffic && mData.webTraffic < Number(numericFilters.webTraffic)) return false;

      return true;
    });
  }, [companies, sectorFilter, categoryFilter, numericFilters, selectedMonth, growthToggles]);

  const handleAddCompany = (newCompany) => {
    setCompanies(prev => [...prev, newCompany]);
  };

  const qData = quarterlyData[selectedQuarter];

  // Get index of company in original array for data lookup
  const getOriginalIndex = (company) => companies.findIndex(c => c.id === company.id);

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'hsl(var(--background))' }}
    >
      <DashboardHeader companyCount={companies.length} onRefresh={() => {}} />

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{
          background: 'hsl(var(--table-group-header))',
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
          {(sectorFilter || categoryFilter) && (
            <button
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: 'hsl(var(--destructive) / 0.15)',
                color: 'hsl(var(--destructive))',
                border: '1px solid hsl(var(--destructive) / 0.3)',
                cursor: 'pointer',
              }}
              onClick={() => { setSectorFilter(''); setCategoryFilter(''); }}
            >
              Clear filters
            </button>
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
                style={{ minWidth: 130, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(192 85% 55%)' }}>Annual Data</span>
              </th>

              {/* Company Offerings */}
              <th
                colSpan={1}
                className="tracker-th group-header"
                style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <span style={{ color: 'hsl(280 68% 68%)' }}>Company Offerings</span>
              </th>

              {/* Quarterly Data */}
              <th
                colSpan={5}
                className="tracker-th group-header"
                style={{ minWidth: 830, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(38 95% 60%)' }}>Quarterly Data</span>
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
                style={{ minWidth: 580, borderLeft: '2px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(142 72% 55%)' }}>Monthly Data</span>
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
                <div>Sector</div>
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
                <div>Category</div>
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

              {/* === ANNUAL DATA === */}
              <th
                className="tracker-th"
                style={{ minWidth: 130, borderLeft: '2px solid hsl(var(--border))' }}
              >
                Revenue Range
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
              <th className="tracker-th" style={{ minWidth: 166 }}>New Products & Launches</th>

              {/* === MONTHLY SUB-COLUMNS === */}
              <th className="tracker-th" style={{ minWidth: 145, borderLeft: '2px solid hsl(var(--border))' }}>
                <div>LinkedIn Followers</div>
                <GrowthToggle
                  active={growthToggles.linkedinFollowers}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinFollowers: v }))}
                />
                <input
                  className="numeric-filter"
                  placeholder="> min value"
                  value={numericFilters.linkedinFollowers}
                  onChange={e => setNumericFilters(f => ({ ...f, linkedinFollowers: e.target.value }))}
                  type="number"
                />
              </th>
              <th className="tracker-th" style={{ minWidth: 145 }}>
                <div>LinkedIn Headcount</div>
                <GrowthToggle
                  active={growthToggles.linkedinHeadcount}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinHeadcount: v }))}
                />
                <input
                  className="numeric-filter"
                  placeholder="> min value"
                  value={numericFilters.linkedinHeadcount}
                  onChange={e => setNumericFilters(f => ({ ...f, linkedinHeadcount: e.target.value }))}
                  type="number"
                />
              </th>
              <th className="tracker-th" style={{ minWidth: 145 }}>
                <div>LinkedIn Job Openings</div>
                <GrowthToggle
                  active={growthToggles.linkedinJobs}
                  onChange={v => setGrowthToggles(g => ({ ...g, linkedinJobs: v }))}
                />
                <input
                  className="numeric-filter"
                  placeholder="> min value"
                  value={numericFilters.linkedinJobs}
                  onChange={e => setNumericFilters(f => ({ ...f, linkedinJobs: e.target.value }))}
                  type="number"
                />
              </th>
              <th className="tracker-th" style={{ minWidth: 145 }}>
                <div>Web Traffic</div>
                <GrowthToggle
                  active={growthToggles.webTraffic}
                  onChange={v => setGrowthToggles(g => ({ ...g, webTraffic: v }))}
                />
                <input
                  className="numeric-filter"
                  placeholder="> min value"
                  value={numericFilters.webTraffic}
                  onChange={e => setNumericFilters(f => ({ ...f, webTraffic: e.target.value }))}
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
                  No companies match your filters. Try clearing the filters above.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company, rowIdx) => {
                const origIdx = getOriginalIndex(company);
                const mData = monthlyData[selectedMonth]?.[origIdx] || {};
                const gDataFollowers = growthData[growthToggles.linkedinFollowers]?.[origIdx] || {};
                const gDataHeadcount = growthData[growthToggles.linkedinHeadcount]?.[origIdx] || {};
                const gDataJobs = growthData[growthToggles.linkedinJobs]?.[origIdx] || {};
                const gDataTraffic = growthData[growthToggles.webTraffic]?.[origIdx] || {};

                const newsItems = qData?.newsHighlights?.[origIdx] || ['No data', 'No data', 'No data'];
                const custItems = qData?.customerWins?.[origIdx] || ['No data', 'No data', 'No data'];
                const partItems = qData?.partnerships?.[origIdx] || ['No data', 'No data', 'No data'];
                const cxoItems = qData?.cxoChanges?.[origIdx] || ['No data', 'No data', 'No data'];
                const prodItems = qData?.newProducts?.[origIdx] || ['No data', 'No data', 'No data'];

                const isHovered = hoveredRow === company.id;

                const frozenCellStyle = {
                  background: isHovered
                    ? 'hsl(var(--table-row-hover))'
                    : rowIdx % 2 === 1
                    ? 'hsl(var(--table-row-alt))'
                    : 'hsl(var(--table-row-bg))',
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
                      <div
                        className="text-xs mt-1.5"
                        style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.68rem' }}
                      >
                        — &nbsp;{company.subsector}
                      </div>
                    </td>

                    {/* Sub-sector */}
                    <td
                      className="tracker-cell col-frozen"
                      style={{ ...frozenCellStyle, left: FROZEN_OFFSETS[3], minWidth: 150, width: 150 }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: 'hsl(var(--foreground) / 0.75)', fontSize: '0.75rem' }}
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
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 130 }}
                    >
                      <span className="revenue-badge">{company.revenueRange}</span>
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
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 166, verticalAlign: 'top' }}
                    >
                      <BulletListCell items={newsItems} />
                    </td>

                    {/* Quarterly: Customer Wins */}
                    <td className="tracker-cell" style={{ minWidth: 166, verticalAlign: 'top' }}>
                      <BulletListCell items={custItems} />
                    </td>

                    {/* Quarterly: Partnerships */}
                    <td className="tracker-cell" style={{ minWidth: 166, verticalAlign: 'top' }}>
                      <BulletListCell items={partItems} />
                    </td>

                    {/* Quarterly: CXO Changes */}
                    <td className="tracker-cell" style={{ minWidth: 166, verticalAlign: 'top' }}>
                      <BulletListCell items={cxoItems} />
                    </td>

                    {/* Quarterly: New Products */}
                    <td className="tracker-cell" style={{ minWidth: 166, verticalAlign: 'top' }}>
                      <BulletListCell items={prodItems} />
                    </td>

                    {/* Monthly: LinkedIn Followers */}
                    <td
                      className="tracker-cell"
                      style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 145 }}
                    >
                      <MetricCell
                        value={mData.linkedinFollowers || 0}
                        growth={gDataFollowers.linkedinFollowers || 0}
                        positive={(gDataFollowers.linkedinFollowers || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: LinkedIn Headcount */}
                    <td className="tracker-cell" style={{ minWidth: 145 }}>
                      <MetricCell
                        value={mData.linkedinHeadcount || 0}
                        growth={gDataHeadcount.linkedinHeadcount || 0}
                        positive={(gDataHeadcount.linkedinHeadcount || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: LinkedIn Job Openings */}
                    <td className="tracker-cell" style={{ minWidth: 145 }}>
                      <MetricCell
                        value={mData.linkedinJobs || 0}
                        growth={gDataJobs.linkedinJobs || 0}
                        positive={(gDataJobs.linkedinJobs || 0) >= 0}
                      />
                    </td>

                    {/* Monthly: Web Traffic */}
                    <td className="tracker-cell" style={{ minWidth: 145 }}>
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
