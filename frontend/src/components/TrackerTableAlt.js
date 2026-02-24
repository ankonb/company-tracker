import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, Plus, ChevronDown, TrendingUp, TrendingDown, Filter, X, MessageSquare, ArrowUp } from 'lucide-react';
import {
  initialCompanies,
  quarterlyData,
  monthlyData,
  growthData,
  interactionData,
  annualFinancialData,
  QUARTERS,
  MONTHS,
  GROWTH_PERIODS,
  SECTORS,
  CATEGORIES,
  FISCAL_YEARS,
} from '../data/companiesAlt';
import { AddCompanyModal } from './AddCompanyModal';

// ═══════ Shared color maps ═══════
const BADGE_COLORS = {
  'Healthcare & MedTech': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'E-commerce & Retail': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
  'EdTech & Learning': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Real Estate & PropTech': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
  'SaaS & Enterprise': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'Consumer & D2C': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  'Telemedicine': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'Hospital Management': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'Diagnostics': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'Mental Health': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'Health Insurance Tech': { bg: 'hsl(340 82% 94%)', color: 'hsl(340 82% 38%)', border: 'hsl(340 82% 75%)' },
  'Marketplace': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
  'D2C Brands': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
  'Social Commerce': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
  'Logistics Tech': { bg: 'hsl(24 95% 94%)', color: 'hsl(24 95% 38%)', border: 'hsl(24 95% 75%)' },
  'Quick Commerce': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  'K-12 Education': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Test Prep': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Skill Development': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Corporate Training': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Higher Education': { bg: 'hsl(262 83% 94%)', color: 'hsl(262 83% 38%)', border: 'hsl(262 83% 75%)' },
  'Property Listings': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
  'Home Services': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
  'Co-working': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
  'Facility Management': { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)' },
  'CRM Solutions': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'HR Tech': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'Marketing Tech': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'Cybersecurity': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'Data Analytics': { bg: 'hsl(210 80% 94%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 75%)' },
  'Food Tech': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  'Travel Tech': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  'Fitness & Wellness': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
  'Lifestyle': { bg: 'hsl(38 92% 94%)', color: 'hsl(38 92% 35%)', border: 'hsl(38 92% 70%)' },
};

const getBadgeStyle = (label) => BADGE_COLORS[label] || { bg: 'hsl(210 80% 95%)', color: 'hsl(210 80% 35%)', border: 'hsl(210 80% 80%)' };
const COL_BADGE = { bg: 'hsl(220 15% 94%)', color: 'hsl(220 15% 35%)', border: 'hsl(220 15% 80%)' };

// ═══════ Formatters ═══════
const fmtNum = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};
const fmtINR = (n) => {
  if (n === undefined || n === null) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `\u20B9${sign}${abs >= 1000 ? abs.toLocaleString('en-IN') : abs} Cr`;
};
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysAgo = (d) => { const diff = Math.floor((new Date() - new Date(d)) / 86400000); return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`; };

// ═══════ Micro-components ═══════
const BadgeSpan = ({ label, style: overrideStyle }) => {
  const s = getBadgeStyle(label);
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, ...overrideStyle }}>{label}</span>;
};

const InlineBadge = ({ label, type, prefix }) => {
  const s = type === 'col' ? COL_BADGE : getBadgeStyle(label);
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '1px 8px', borderRadius: type === 'col' ? 6 : 9999, fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'middle', lineHeight: '1.4' }}>
      {prefix && <span style={{ opacity: 0.55, marginRight: 2 }}>{prefix}</span>}{label}
    </span>
  );
};

const GrowthToggle = ({ active, onChange }) => (
  <div className="growth-toggle">
    {GROWTH_PERIODS.map(p => <button key={p} className={`growth-toggle-btn ${active === p ? 'active' : ''}`} onClick={() => onChange(p)} type="button">{p}</button>)}
  </div>
);

const MetricCell = ({ value, growth, positive }) => (
  <div>
    <div className="metric-value">{fmtNum(value)}</div>
    <div className={`metric-growth ${positive ? 'positive' : 'negative'}`}>
      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{Math.abs(growth).toFixed(1)}%
    </div>
  </div>
);

const FinancialCell = ({ value, growth, format, showYoY = false, noArrow = false }) => (
  <div>
    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'hsl(var(--foreground))' }}>
      {format === 'pct' ? `${value}%` : fmtINR(value)}
    </div>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3,
      padding: '1px 7px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600,
      background: growth >= 0 ? 'hsl(142 76% 92%)' : 'hsl(0 84% 94%)',
      color: growth >= 0 ? 'hsl(142 76% 28%)' : 'hsl(0 84% 38%)',
      border: `1px solid ${growth >= 0 ? 'hsl(142 76% 78%)' : 'hsl(0 84% 78%)'}`,
    }}>
      {!noArrow && (growth >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />)}
      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%{showYoY ? ' YoY' : ''}
    </div>
  </div>
);

const BulletListCell = ({ items }) => (
  <ul className="bullet-list">{items.map((item, i) => <li key={i} className="bullet-item"><span className="bullet-dot" /><span>{item}</span></li>)}</ul>
);

const MinMaxFilter = ({ labelPrefix, minVal, maxVal, onMinChange, onMaxChange }) => (
  <div style={{ marginTop: 3 }}>
    <span className="filter-label">{labelPrefix}</span>
    <div style={{ display: 'flex', gap: 3 }}>
      <input className="numeric-filter" style={{ width: '50%' }} placeholder="Min" value={minVal} onChange={e => onMinChange(e.target.value)} type="number" />
      <input className="numeric-filter" style={{ width: '50%' }} placeholder="Max" value={maxVal} onChange={e => onMaxChange(e.target.value)} type="number" />
    </div>
  </div>
);

// ═══════ Integration logos ═══════
const GoogleCalendarLogo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill="#fff" stroke="#4285F4" strokeWidth="1.5"/><rect x="3" y="3" width="18" height="5" rx="2" fill="#4285F4"/><text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4285F4">18</text></svg>;
const GmailLogo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" fill="#fff" stroke="#EA4335" strokeWidth="1.2"/><path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" fill="none"/></svg>;
const OutlookLogo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/><ellipse cx="10" cy="12" rx="5" ry="4.5" fill="#fff"/><text x="10" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0078D4">O</text></svg>;

const INTERACTION_TYPES = ['Email', 'Meeting', 'Call'];
const INTERACTION_TYPE_STYLES = {
  Email: { bg: 'hsl(0 72% 95%)', color: 'hsl(0 72% 42%)', border: 'hsl(0 72% 78%)', icon: <GmailLogo /> },
  Meeting: { bg: 'hsl(217 91% 95%)', color: 'hsl(217 91% 40%)', border: 'hsl(217 91% 78%)', icon: <GoogleCalendarLogo /> },
  Call: { bg: 'hsl(142 76% 94%)', color: 'hsl(142 76% 30%)', border: 'hsl(142 76% 70%)', icon: <OutlookLogo /> },
};

// ═══════ Multi-select dropdown ═══════
const TypeMultiSelect = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const allSelected = selected.size === 0;
  const toggle = (type) => {
    const next = new Set(selected);
    if (next.has(type)) next.delete(type); else next.add(type);
    onChange(next);
  };
  const label = allSelected ? 'All types' : selected.size === 1 ? [...selected][0] : `${selected.size} types`;
  return (
    <div ref={ref} style={{ position: 'relative', marginTop: 4 }}>
      <button type="button" onClick={() => setOpen(!open)} className="header-filter-select" style={{ paddingRight: 20, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
        {label}
        <ChevronDown size={9} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, boxShadow: '0 4px 12px hsl(0 0% 0%/0.1)', padding: 4, marginTop: 2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', fontSize: '0.68rem', cursor: 'pointer', color: 'hsl(var(--foreground))' }}>
            <input type="checkbox" checked={allSelected} onChange={() => onChange(new Set())} style={{ accentColor: 'hsl(340 82% 52%)' }} /> All
          </label>
          {INTERACTION_TYPES.map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', fontSize: '0.68rem', cursor: 'pointer', color: 'hsl(var(--foreground))' }}>
              <input type="checkbox" checked={allSelected || selected.has(t)} onChange={() => toggle(t)} style={{ accentColor: 'hsl(340 82% 52%)' }} /> {t}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════ Constants ═══════
const FROZEN_OFFSETS = [0, 170, 314, 486];
const INIT_NUMERIC = {
  linkedinFollowers: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinHeadcount: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  linkedinJobs:      { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  webTraffic:        { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
};
const INIT_FINANCIAL = {
  revenue:     { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  grossMargin: { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
  ebitda:      { valueMin: '', valueMax: '', growthMin: '', growthMax: '' },
};
const rangeActive = (f) => f.valueMin !== '' || f.valueMax !== '' || f.growthMin !== '' || f.growthMax !== '';

// ═══════ Chat examples with # for sectors/categories, @ for columns ═══════
const CHAT_EXAMPLES = [
  { parts: ['Which companies in ', { badge: 'Telemedicine', prefix: '#' }, ' had greater than 2 ', { colBadge: 'Customer Wins', prefix: '@' }, '?'] },
  { parts: ['Create a market research report for the ', { badge: 'Healthcare & MedTech', prefix: '#' }, ' sector using ', { colBadge: 'Key Discussion Points', prefix: '@' }] },
  { parts: ['List companies with ', { colBadge: 'Headcount', prefix: '@' }, ' growth >10x in ', { badge: 'K-12 Education', prefix: '#' }] },
  { parts: ['Summarize ', { colBadge: 'Key Discussion Points', prefix: '@' }, ' from all meetings with ', { badge: 'SaaS & Enterprise', prefix: '#' }, ' companies'] },
  { parts: ['Which ', { badge: 'E-commerce & Retail', prefix: '#' }, ' companies have ', { colBadge: 'Web Traffic', prefix: '@' }, ' above 5M?'] },
  { parts: ['Compare ', { colBadge: 'Next Steps', prefix: '@' }, ' across all ', { badge: 'Real Estate & PropTech', prefix: '#' }, ' companies'] },
  { parts: ['Show companies in ', { badge: 'Food Tech', prefix: '#' }, ' with ', { colBadge: 'Revenue', prefix: '@' }, ' above \u20B9500 Cr'] },
  { parts: ['Generate analysis for ', { badge: 'Cybersecurity', prefix: '#' }, ' based on ', { colBadge: 'New Products & Launches', prefix: '@' }] },
  { parts: ['Which ', { badge: 'Consumer & D2C', prefix: '#' }, ' companies discuss IPO in ', { colBadge: 'Key Discussion Points', prefix: '@' }, '?'] },
  { parts: ['Find ', { badge: 'EdTech & Learning', prefix: '#' }, ' companies with ', { colBadge: 'LinkedIn Followers', prefix: '@' }, ' growth above 15%'] },
  // Tutorial slide — shown after each full cycle
  { isTutorial: true, parts: [
    { text: 'Type ' },
    { symbol: '#', label: 'to select a sector or category', style: 'hash' },
    { text: '  and  ' },
    { symbol: '@', label: 'to select a column name', style: 'at' },
  ]},
];

// Column names for @ autocomplete
const COLUMN_NAMES = [
  'Revenue', 'Gross Margin', 'EBITDA', 'Offerings Summary',
  'News Highlights', 'Customer Wins', 'Partnerships', 'CXO Changes', 'New Products & Launches',
  'LinkedIn Followers', 'LinkedIn Headcount', 'LinkedIn Job Openings', 'Web Traffic',
  'Last Interaction', 'Last Interaction Type', 'Key Discussion Points', 'Next Steps',
];
// Sector + Category options for # autocomplete
const HASH_OPTIONS = [...SECTORS, ...CATEGORIES];

const ChatBar = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Autocomplete state
  const [acOpen, setAcOpen] = useState(false);
  const [acType, setAcType] = useState(null); // 'hash' or 'at'
  const [acQuery, setAcQuery] = useState('');
  const [acTriggerPos, setAcTriggerPos] = useState(-1);
  const inputRef = useRef(null);
  const acRef = useRef(null);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => { setCurrentIdx(prev => (prev + 1) % CHAT_EXAMPLES.length); setIsAnimating(false); }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused]);

  // Close autocomplete on outside click
  useEffect(() => {
    const handler = (e) => { if (acRef.current && !acRef.current.contains(e.target)) setAcOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setChatInput(val);

    // Check for # or @ triggers
    const cursorPos = e.target.selectionStart;
    let foundTrigger = false;

    // Scan backwards from cursor to find the most recent unmatched # or @
    for (let i = cursorPos - 1; i >= 0; i--) {
      const ch = val[i];
      if (ch === ' ' && i < cursorPos - 1) break; // stop at space if we have some query
      if (ch === '#' || ch === '@') {
        const query = val.substring(i + 1, cursorPos);
        setAcType(ch === '#' ? 'hash' : 'at');
        setAcQuery(query.toLowerCase());
        setAcTriggerPos(i);
        setAcOpen(true);
        foundTrigger = true;
        break;
      }
    }
    if (!foundTrigger) {
      setAcOpen(false);
    }
  };

  const handleSelect = (option) => {
    // Replace trigger + query with the selected option
    const before = chatInput.substring(0, acTriggerPos);
    const after = chatInput.substring(acTriggerPos + 1 + acQuery.length);
    const trigger = acType === 'hash' ? '#' : '@';
    setChatInput(before + trigger + option + after + ' ');
    setAcOpen(false);
    inputRef.current?.focus();
  };

  const acOptions = useMemo(() => {
    const list = acType === 'hash' ? HASH_OPTIONS : COLUMN_NAMES;
    if (!acQuery) return list.slice(0, 8);
    return list.filter(o => o.toLowerCase().includes(acQuery)).slice(0, 8);
  }, [acType, acQuery]);

  const example = CHAT_EXAMPLES[currentIdx];

  const renderPlaceholder = () => {
    if (example.isTutorial) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {example.parts.map((part, i) => {
            if (part.text) return <span key={i}>{part.text}</span>;
            const isHash = part.style === 'hash';
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: 5, fontWeight: 700, fontSize: '0.8rem',
                  background: isHash ? 'hsl(340 82% 92%)' : 'hsl(220 15% 92%)',
                  color: isHash ? 'hsl(340 82% 42%)' : 'hsl(220 15% 35%)',
                  border: `1px solid ${isHash ? 'hsl(340 82% 78%)' : 'hsl(220 15% 78%)'}`,
                }}>{part.symbol}</span>
                <span style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>{part.label}</span>
              </span>
            );
          })}
        </div>
      );
    }
    return example.parts.map((part, i) =>
      typeof part === 'string' ? <span key={i}>{part}</span> :
      part.badge ? <InlineBadge key={i} label={part.badge} prefix={part.prefix} /> :
      <InlineBadge key={i} label={part.colBadge} type="col" prefix={part.prefix} />
    );
  };

  return (
    <div data-testid="ai-chat-bar" style={{ position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '12px 20px', background: 'linear-gradient(to top, hsl(var(--background)) 70%, transparent)' }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', background: 'hsl(var(--card))', borderRadius: 16,
        border: '1px solid hsl(var(--border))', boxShadow: isFocused ? '0 -4px 24px hsl(160 40% 45% / 0.12), 0 0 0 2px hsl(160 40% 45% / 0.15)' : '0 -4px 24px hsl(0 0% 0% / 0.06), 0 2px 8px hsl(0 0% 0% / 0.04)',
        padding: '4px 4px 4px 16px', display: 'flex', alignItems: 'center', gap: 10, transition: 'box-shadow 0.2s ease',
        position: 'relative',
      }}>
        <MessageSquare size={16} style={{ color: 'hsl(160 40% 40%)', flexShrink: 0 }} />
        <div style={{ flex: 1, position: 'relative', minHeight: 40, display: 'flex', alignItems: 'center' }}>
          {!chatInput && !isFocused && (
            <div data-testid="chat-rotating-placeholder" style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
              pointerEvents: 'none', opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.35s ease, transform 0.35s ease', fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5', overflow: 'hidden',
            }}>
              {renderPlaceholder()}
            </div>
          )}
          <input ref={inputRef} data-testid="chat-input" type="text" value={chatInput} onChange={handleInputChange}
            onFocus={() => setIsFocused(true)} onBlur={() => { if (!chatInput) { setIsFocused(false); } }}
            onKeyDown={(e) => { if (e.key === 'Escape') setAcOpen(false); }}
            placeholder={isFocused ? 'Use # for sectors/categories, @ for columns...' : ''}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: 'hsl(var(--foreground))', lineHeight: '40px', fontFamily: 'inherit' }}
          />

          {/* Autocomplete dropdown */}
          {acOpen && acOptions.length > 0 && (
            <div ref={acRef} data-testid="chat-autocomplete-dropdown" style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6, zIndex: 60,
              background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10,
              boxShadow: '0 -8px 24px hsl(0 0% 0% / 0.1)', padding: 4, maxHeight: 240, overflowY: 'auto',
            }}>
              <div style={{ padding: '4px 10px 6px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))' }}>
                {acType === 'hash' ? 'Sectors & Categories' : 'Column Names'}
              </div>
              {acOptions.map((option) => {
                const s = acType === 'hash' ? getBadgeStyle(option) : COL_BADGE;
                return (
                  <button key={option} data-testid={`ac-option-${option}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px',
                      border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 6,
                      fontSize: '0.78rem', color: 'hsl(var(--foreground))', textAlign: 'left',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: 4, fontWeight: 700, fontSize: '0.7rem',
                      background: acType === 'hash' ? 'hsl(340 82% 92%)' : 'hsl(220 15% 92%)',
                      color: acType === 'hash' ? 'hsl(340 82% 42%)' : 'hsl(220 15% 35%)',
                      flexShrink: 0,
                    }}>
                      {acType === 'hash' ? '#' : '@'}
                    </span>
                    <span style={{
                      padding: '1px 8px', borderRadius: acType === 'hash' ? 9999 : 6,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      fontSize: '0.72rem', fontWeight: 500,
                    }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button data-testid="chat-send-button" style={{
          width: 36, height: 36, borderRadius: 10, background: '#3a9e7e',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          opacity: chatInput ? 1 : 0.5, transition: 'opacity 0.15s ease',
        }}>
          <ArrowUp size={18} color="white" strokeWidth={2.5} />
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', opacity: 0.6 }}>AI-powered company intelligence — ask questions about your data using natural language</span>
      </div>
    </div>
  );
};

// ═══════ Main Component ═══════
export const TrackerTableAlt = () => {
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 FY25');
  const [selectedMonth, setSelectedMonth] = useState('Apr 2025');
  const [selectedYear, setSelectedYear] = useState('FY25');
  const [growthToggles, setGrowthToggles] = useState({ linkedinFollowers: 'YoY', linkedinHeadcount: 'YoY', linkedinJobs: 'YoY', webTraffic: 'YoY' });

  const [sectorFilter, setSectorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [numericFilters, setNumericFilters] = useState(INIT_NUMERIC);
  const [financialFilters, setFinancialFilters] = useState(INIT_FINANCIAL);
  const [typeFilter, setTypeFilter] = useState(new Set());
  const [dateFilterMin, setDateFilterMin] = useState('');
  const [dateFilterMax, setDateFilterMax] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const setNumField = (col, field, val) => setNumericFilters(prev => ({ ...prev, [col]: { ...prev[col], [field]: val } }));
  const setFinField = (col, field, val) => setFinancialFilters(prev => ({ ...prev, [col]: { ...prev[col], [field]: val } }));

  const hasActiveFilters = sectorFilter || categoryFilter || typeFilter.size > 0 || dateFilterMin || dateFilterMax ||
    Object.values(numericFilters).some(rangeActive) || Object.values(financialFilters).some(rangeActive);

  const passesRange = (val, min, max) => {
    if (min !== '' && !isNaN(Number(min)) && val < Number(min)) return false;
    if (max !== '' && !isNaN(Number(max)) && val > Number(max)) return false;
    return true;
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (sectorFilter && company.sector !== sectorFilter) return false;
      if (categoryFilter && company.subsector !== categoryFilter) return false;

      const origIdx = initialCompanies.findIndex(ic => ic.id === company.id);
      if (origIdx === -1) return true;

      // Interaction filters
      const interaction = interactionData[origIdx] || {};
      if (typeFilter.size > 0 && !typeFilter.has(interaction.type)) return false;
      if (dateFilterMin && interaction.lastDate < dateFilterMin) return false;
      if (dateFilterMax && interaction.lastDate > dateFilterMax) return false;

      // Financial filters
      const fin = annualFinancialData[selectedYear]?.[origIdx] || {};
      const ff = financialFilters;
      if (!passesRange(fin.revenue || 0, ff.revenue.valueMin, ff.revenue.valueMax)) return false;
      if (!passesRange(fin.revenueGrowth || 0, ff.revenue.growthMin, ff.revenue.growthMax)) return false;
      if (!passesRange(Math.round((fin.revenue || 0) * (fin.grossMargin || 0) / 100), ff.grossMargin.valueMin, ff.grossMargin.valueMax)) return false;
      if (!passesRange(fin.grossMarginGrowth || 0, ff.grossMargin.growthMin, ff.grossMargin.growthMax)) return false;
      if (!passesRange(fin.ebitda || 0, ff.ebitda.valueMin, ff.ebitda.valueMax)) return false;
      if (!passesRange(fin.ebitdaGrowth || 0, ff.ebitda.growthMin, ff.ebitda.growthMax)) return false;

      // Monthly numeric filters
      const mData = monthlyData[selectedMonth]?.[origIdx] || {};
      const nf = numericFilters;
      if (!passesRange(mData.linkedinFollowers || 0, nf.linkedinFollowers.valueMin, nf.linkedinFollowers.valueMax)) return false;
      if (!passesRange(mData.linkedinHeadcount || 0, nf.linkedinHeadcount.valueMin, nf.linkedinHeadcount.valueMax)) return false;
      if (!passesRange(mData.linkedinJobs || 0, nf.linkedinJobs.valueMin, nf.linkedinJobs.valueMax)) return false;
      if (!passesRange(mData.webTraffic || 0, nf.webTraffic.valueMin, nf.webTraffic.valueMax)) return false;

      const gF = growthData[growthToggles.linkedinFollowers]?.[origIdx] || {};
      const gH = growthData[growthToggles.linkedinHeadcount]?.[origIdx] || {};
      const gJ = growthData[growthToggles.linkedinJobs]?.[origIdx] || {};
      const gT = growthData[growthToggles.webTraffic]?.[origIdx] || {};
      if (!passesRange(gF.linkedinFollowers || 0, nf.linkedinFollowers.growthMin, nf.linkedinFollowers.growthMax)) return false;
      if (!passesRange(gH.linkedinHeadcount || 0, nf.linkedinHeadcount.growthMin, nf.linkedinHeadcount.growthMax)) return false;
      if (!passesRange(gJ.linkedinJobs || 0, nf.linkedinJobs.growthMin, nf.linkedinJobs.growthMax)) return false;
      if (!passesRange(gT.webTraffic || 0, nf.webTraffic.growthMin, nf.webTraffic.growthMax)) return false;

      return true;
    });
  }, [companies, sectorFilter, categoryFilter, numericFilters, financialFilters, typeFilter, dateFilterMin, dateFilterMax, selectedMonth, selectedYear, growthToggles]);

  const handleAddCompany = (c) => setCompanies(prev => [...prev, c]);

  const clearAllFilters = () => {
    setSectorFilter(''); setCategoryFilter('');
    setNumericFilters(INIT_NUMERIC); setFinancialFilters(INIT_FINANCIAL);
    setTypeFilter(new Set()); setDateFilterMin(''); setDateFilterMax('');
  };

  const qData = quarterlyData[selectedQuarter];

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-3">
          <img src="/pascal-ai-logo.png" alt="Pascal AI" style={{ height: 32 }} />
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }} data-testid="alt-tracker-title">Company Tracker</h1>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Multi-sector company monitoring dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}><span className="font-semibold">{companies.length}</span> Companies</div>
          <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}><span className="font-semibold">{SECTORS.length}</span> Sectors</div>
          <button className="btn-add-company" data-testid="add-company-btn" onClick={() => setAddModalOpen(true)} style={{ background: 'white', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px hsl(0 0% 0% / 0.06)' }}>
            <Plus size={13} /> Add Company
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Showing <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{filteredCompanies.length}</span> of {companies.length} companies</span>
          {hasActiveFilters && (
            <button className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'hsl(340 82% 52% / 0.08)', color: 'hsl(340 82% 45%)', border: '1px solid hsl(340 82% 52% / 0.3)', cursor: 'pointer' }} onClick={clearAllFilters}>
              <X size={10} /> Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="tracker-table-wrapper flex-1" style={{ margin: '12px 16px', marginBottom: 0 }}>
        <table className="tracker-table">
          <thead>
            {/* Group headers */}
            <tr>
              <th colSpan={4} className="tracker-th group-header col-frozen" style={{ left: 0, zIndex: 31, minWidth: 624 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Company Details</span></th>
              <th colSpan={3} className="tracker-th group-header" style={{ minWidth: 480, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(340 82% 45%)' }}>Annual Data</span>
                  <select className="period-selector" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} data-testid="year-selector">
                    {FISCAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </th>
              <th colSpan={1} className="tracker-th group-header" style={{ minWidth: 260, borderLeft: '2px solid hsl(var(--border))' }}><span style={{ color: 'hsl(262 83% 45%)' }}>Company Offerings</span></th>
              <th colSpan={5} className="tracker-th group-header" style={{ minWidth: 830, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(24 95% 40%)' }}>Quarterly Data</span>
                  <select className="period-selector" value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>{QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}</select>
                </div>
              </th>
              <th colSpan={4} className="tracker-th group-header" style={{ minWidth: 660, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(142 76% 35%)' }}>Monthly Data</span>
                  <select className="period-selector" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                </div>
              </th>
              <th colSpan={4} className="tracker-th group-header" data-testid="interaction-tracking-header" style={{ minWidth: 700, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'hsl(217 91% 45%)' }}>Interaction Tracking</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 6, padding: '2px 8px', background: 'hsl(217 91% 97%)', borderRadius: 8, border: '1px solid hsl(217 91% 90%)' }}>
                    <GoogleCalendarLogo /><GmailLogo /><OutlookLogo />
                    <span style={{ fontSize: '0.6rem', color: 'hsl(217 91% 50%)', fontWeight: 500 }}>Connected</span>
                  </div>
                </div>
              </th>
            </tr>

            {/* Sub-headers */}
            <tr>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>Company Name</th>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>Website</th>
              <th className="tracker-th col-frozen" style={{ left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                <div className="flex items-center gap-1">Sector {sectorFilter && <span className="filter-active-dot" />}</div>
                <div className="relative">
                  <select className="header-filter-select" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={{ paddingRight: 20 }}>
                    <option value="">All sectors</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>
              <th className="tracker-th col-frozen col-frozen-last" style={{ left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                <div className="flex items-center gap-1">Category {categoryFilter && <span className="filter-active-dot" />}</div>
                <div className="relative">
                  <select className="header-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ paddingRight: 20 }}>
                    <option value="">All</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </th>

              {/* Annual: Revenue */}
              <th className="tracker-th" data-testid="col-revenue" style={{ minWidth: 160, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1">{'Revenue (\u20B9)'} {rangeActive(financialFilters.revenue) && <span className="filter-active-dot" />}</div>
                <MinMaxFilter labelPrefix="Value (Cr)" minVal={financialFilters.revenue.valueMin} maxVal={financialFilters.revenue.valueMax} onMinChange={v => setFinField('revenue','valueMin',v)} onMaxChange={v => setFinField('revenue','valueMax',v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={financialFilters.revenue.growthMin} maxVal={financialFilters.revenue.growthMax} onMinChange={v => setFinField('revenue','growthMin',v)} onMaxChange={v => setFinField('revenue','growthMax',v)} />
              </th>
              {/* Annual: Gross Margin */}
              <th className="tracker-th" data-testid="col-gross-margin" style={{ minWidth: 160 }}>
                <div className="flex items-center gap-1">{'Gross Margin (\u20B9)'} {rangeActive(financialFilters.grossMargin) && <span className="filter-active-dot" />}</div>
                <MinMaxFilter labelPrefix="Value (Cr)" minVal={financialFilters.grossMargin.valueMin} maxVal={financialFilters.grossMargin.valueMax} onMinChange={v => setFinField('grossMargin','valueMin',v)} onMaxChange={v => setFinField('grossMargin','valueMax',v)} />
                <MinMaxFilter labelPrefix="Margin %" minVal={financialFilters.grossMargin.growthMin} maxVal={financialFilters.grossMargin.growthMax} onMinChange={v => setFinField('grossMargin','growthMin',v)} onMaxChange={v => setFinField('grossMargin','growthMax',v)} />
              </th>
              {/* Annual: EBITDA */}
              <th className="tracker-th" data-testid="col-ebitda" style={{ minWidth: 160 }}>
                <div className="flex items-center gap-1">{'EBITDA (\u20B9)'} {rangeActive(financialFilters.ebitda) && <span className="filter-active-dot" />}</div>
                <MinMaxFilter labelPrefix="Value (Cr)" minVal={financialFilters.ebitda.valueMin} maxVal={financialFilters.ebitda.valueMax} onMinChange={v => setFinField('ebitda','valueMin',v)} onMaxChange={v => setFinField('ebitda','valueMax',v)} />
                <MinMaxFilter labelPrefix="Margin %" minVal={financialFilters.ebitda.growthMin} maxVal={financialFilters.ebitda.growthMax} onMinChange={v => setFinField('ebitda','growthMin',v)} onMaxChange={v => setFinField('ebitda','growthMax',v)} />
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
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinFollowers.valueMin} maxVal={numericFilters.linkedinFollowers.valueMax} onMinChange={v => setNumField('linkedinFollowers','valueMin',v)} onMaxChange={v => setNumField('linkedinFollowers','valueMax',v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinFollowers.growthMin} maxVal={numericFilters.linkedinFollowers.growthMax} onMinChange={v => setNumField('linkedinFollowers','growthMin',v)} onMaxChange={v => setNumField('linkedinFollowers','growthMax',v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">LinkedIn Headcount {rangeActive(numericFilters.linkedinHeadcount) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.linkedinHeadcount} onChange={v => setGrowthToggles(g => ({ ...g, linkedinHeadcount: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinHeadcount.valueMin} maxVal={numericFilters.linkedinHeadcount.valueMax} onMinChange={v => setNumField('linkedinHeadcount','valueMin',v)} onMaxChange={v => setNumField('linkedinHeadcount','valueMax',v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinHeadcount.growthMin} maxVal={numericFilters.linkedinHeadcount.growthMax} onMinChange={v => setNumField('linkedinHeadcount','growthMin',v)} onMaxChange={v => setNumField('linkedinHeadcount','growthMax',v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">LinkedIn Job Openings {rangeActive(numericFilters.linkedinJobs) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.linkedinJobs} onChange={v => setGrowthToggles(g => ({ ...g, linkedinJobs: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.linkedinJobs.valueMin} maxVal={numericFilters.linkedinJobs.valueMax} onMinChange={v => setNumField('linkedinJobs','valueMin',v)} onMaxChange={v => setNumField('linkedinJobs','valueMax',v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.linkedinJobs.growthMin} maxVal={numericFilters.linkedinJobs.growthMax} onMinChange={v => setNumField('linkedinJobs','growthMin',v)} onMaxChange={v => setNumField('linkedinJobs','growthMax',v)} />
              </th>
              <th className="tracker-th" style={{ minWidth: 165 }}>
                <div className="flex items-center gap-1">Web Traffic {rangeActive(numericFilters.webTraffic) && <span className="filter-active-dot" />}</div>
                <GrowthToggle active={growthToggles.webTraffic} onChange={v => setGrowthToggles(g => ({ ...g, webTraffic: v }))} />
                <MinMaxFilter labelPrefix="Value" minVal={numericFilters.webTraffic.valueMin} maxVal={numericFilters.webTraffic.valueMax} onMinChange={v => setNumField('webTraffic','valueMin',v)} onMaxChange={v => setNumField('webTraffic','valueMax',v)} />
                <MinMaxFilter labelPrefix="Growth %" minVal={numericFilters.webTraffic.growthMin} maxVal={numericFilters.webTraffic.growthMax} onMinChange={v => setNumField('webTraffic','growthMin',v)} onMaxChange={v => setNumField('webTraffic','growthMax',v)} />
              </th>

              {/* Interaction sub-headers */}
              <th className="tracker-th" data-testid="col-last-interaction" style={{ minWidth: 140, borderLeft: '2px solid hsl(var(--border))' }}>
                <div className="flex items-center gap-1.5"><GoogleCalendarLogo /><span>Last Interaction</span></div>
                <div style={{ marginTop: 4 }}>
                  <span className="filter-label">From</span>
                  <input type="date" className="numeric-filter" style={{ width: '100%' }} value={dateFilterMin} onChange={e => setDateFilterMin(e.target.value)} />
                </div>
                <div style={{ marginTop: 3 }}>
                  <span className="filter-label">To</span>
                  <input type="date" className="numeric-filter" style={{ width: '100%' }} value={dateFilterMax} onChange={e => setDateFilterMax(e.target.value)} />
                </div>
              </th>
              <th className="tracker-th" data-testid="col-interaction-type" style={{ minWidth: 130 }}>
                <div className="flex items-center gap-1.5"><GmailLogo /><span>Last Interaction Type</span></div>
                <TypeMultiSelect selected={typeFilter} onChange={setTypeFilter} />
              </th>
              <th className="tracker-th" data-testid="col-key-points" style={{ minWidth: 220 }}>
                <div className="flex items-center gap-1.5"><OutlookLogo /><span>Key Discussion Points</span></div>
              </th>
              <th className="tracker-th" data-testid="col-next-steps" style={{ minWidth: 220 }}>Next Steps</th>
            </tr>
          </thead>

          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={21} className="tracker-cell text-center py-12" style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                  No companies match the active filters. <button onClick={clearAllFilters} style={{ color: 'hsl(340 82% 45%)', cursor: 'pointer', textDecoration: 'underline' }}>Clear all filters</button>
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company, rowIdx) => {
                const origIdx = initialCompanies.findIndex(ic => ic.id === company.id);
                const dataIdx = origIdx >= 0 ? origIdx : 0;

                const fin = annualFinancialData[selectedYear]?.[dataIdx] || {};
                const mData = monthlyData[selectedMonth]?.[dataIdx] || {};
                const gF = growthData[growthToggles.linkedinFollowers]?.[dataIdx] || {};
                const gH = growthData[growthToggles.linkedinHeadcount]?.[dataIdx] || {};
                const gJ = growthData[growthToggles.linkedinJobs]?.[dataIdx] || {};
                const gT = growthData[growthToggles.webTraffic]?.[dataIdx] || {};

                const newsItems = qData?.newsHighlights?.[dataIdx] || ['No data'];
                const custItems = qData?.customerWins?.[dataIdx] || ['No data'];
                const partItems = qData?.partnerships?.[dataIdx] || ['No data'];
                const cxoItems  = qData?.cxoChanges?.[dataIdx] || ['No data'];
                const prodItems = qData?.newProducts?.[dataIdx] || ['No data'];
                const interaction = interactionData[dataIdx] || {};
                const typeStyle = INTERACTION_TYPE_STYLES[interaction.type] || INTERACTION_TYPE_STYLES.Email;

                const isHovered = hoveredRow === company.id;
                const frozenBg = isHovered ? 'hsl(var(--table-row-hover))' : rowIdx % 2 === 1 ? 'hsl(var(--table-row-alt))' : 'hsl(var(--table-row-bg))';
                const frozenStyle = { background: frozenBg, transition: 'background-color 0.15s ease' };

                return (
                  <tr key={company.id} className="tracker-row" onMouseEnter={() => setHoveredRow(company.id)} onMouseLeave={() => setHoveredRow(null)}>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[0], minWidth: 170, width: 170 }}>
                      <div className="company-name">{company.name}</div>
                    </td>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[1], minWidth: 144, width: 144 }}>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="company-link"><ExternalLink size={10} />{company.website.replace('https://','')}</a>
                    </td>
                    <td className="tracker-cell col-frozen" style={{ ...frozenStyle, left: FROZEN_OFFSETS[2], minWidth: 172, width: 172 }}>
                      <BadgeSpan label={company.sector} />
                    </td>
                    <td className="tracker-cell col-frozen col-frozen-last" style={{ ...frozenStyle, left: FROZEN_OFFSETS[3], minWidth: 138, width: 138 }}>
                      <BadgeSpan label={company.subsector || 'N/A'} style={{ fontSize: '0.68rem' }} />
                    </td>

                    {/* Annual financial cells */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 160 }}>
                      <FinancialCell value={fin.revenue} growth={fin.revenueGrowth || 0} format="inr" showYoY />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 160 }}>
                      <FinancialCell value={Math.round((fin.revenue || 0) * (fin.grossMargin || 0) / 100)} growth={fin.grossMargin || 0} format="inr" noArrow />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 160 }}>
                      <FinancialCell value={fin.ebitda} growth={fin.revenue ? parseFloat(((fin.ebitda || 0) / fin.revenue * 100).toFixed(1)) : 0} format="inr" noArrow />
                    </td>

                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 260, maxWidth: 260 }}>
                      <p className="offerings-text">{company.offeringsSummary}</p>
                    </td>
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 166 }}><BulletListCell items={newsItems} /></td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}><BulletListCell items={custItems} /></td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}><BulletListCell items={partItems} /></td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}><BulletListCell items={cxoItems} /></td>
                    <td className="tracker-cell" style={{ minWidth: 166 }}><BulletListCell items={prodItems} /></td>

                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 165 }}>
                      <MetricCell value={mData.linkedinFollowers || 0} growth={gF.linkedinFollowers || 0} positive={(gF.linkedinFollowers || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.linkedinHeadcount || 0} growth={gH.linkedinHeadcount || 0} positive={(gH.linkedinHeadcount || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.linkedinJobs || 0} growth={gJ.linkedinJobs || 0} positive={(gJ.linkedinJobs || 0) >= 0} />
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 165 }}>
                      <MetricCell value={mData.webTraffic || 0} growth={gT.webTraffic || 0} positive={(gT.webTraffic || 0) >= 0} />
                    </td>

                    {/* Interaction cells */}
                    <td className="tracker-cell" style={{ borderLeft: '2px solid hsl(var(--border))', minWidth: 140 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>{interaction.lastDate ? fmtDate(interaction.lastDate) : '—'}</div>
                      <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{interaction.lastDate ? daysAgo(interaction.lastDate) : ''}</div>
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {typeStyle.icon}
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px', borderRadius: 6, background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>{interaction.type || '—'}</span>
                      </div>
                    </td>
                    <td className="tracker-cell" style={{ minWidth: 220 }}><BulletListCell items={interaction.keyPoints || ['No data']} /></td>
                    <td className="tracker-cell" style={{ minWidth: 220 }}><BulletListCell items={interaction.nextSteps || ['No data']} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ChatBar />
      <AddCompanyModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddCompany} />
    </div>
  );
};
