import React from 'react';
import { TrendingUp, Building2, BarChart3, RefreshCw } from 'lucide-react';

export const DashboardHeader = ({ companyCount, onRefresh }) => {
  return (
    <div className="flex-shrink-0">
      {/* Accent line */}
      <div className="header-accent-line" />

      <div className="px-6 py-4" style={{ background: 'hsl(var(--table-group-header))' }}>
        <div className="flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'hsl(var(--primary) / 0.15)',
                border: '1px solid hsl(var(--primary) / 0.4)',
              }}
            >
              <TrendingUp size={18} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <h1
                className="text-lg font-bold leading-tight tracking-tight"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Growth Equity Fund Tracker
              </h1>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Portfolio intelligence & company monitoring dashboard
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-3">
            {/* Stat chips */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <Building2 size={12} style={{ color: 'hsl(var(--primary))' }} />
                <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {companyCount}
                </span>
                <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Companies</span>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <BarChart3 size={12} style={{ color: 'hsl(142 72% 42%)' }} />
                <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground))' }}>4</span>
                <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Sectors</span>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'hsl(var(--success))' }}
                />
                <span className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Live Q4 FY25</span>
              </div>
            </div>

            <button
              onClick={onRefresh}
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{
                background: 'hsl(var(--secondary))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
              }}
              title="Refresh data"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header divider */}
      <div style={{ height: '1px', background: 'hsl(var(--border))' }} />
    </div>
  );
};
