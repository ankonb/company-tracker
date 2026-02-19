import React from 'react';
import { TrendingUp, Building2, BarChart3 } from 'lucide-react';

export const DashboardHeader = ({ companyCount, onRefresh }) => {
  return (
    <div className="flex-shrink-0" style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
      {/* Teal accent line at top */}
      <div className="header-accent-line" />

      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'hsl(var(--primary) / 0.1)',
                border: '1.5px solid hsl(var(--primary) / 0.35)',
              }}
            >
              <TrendingUp size={15} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <h1
                className="text-base font-bold leading-tight tracking-tight"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Growth Equity Fund Tracker
              </h1>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Portfolio intelligence &amp; company monitoring dashboard
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="hidden md:flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{
                background: 'hsl(var(--secondary))',
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
                background: 'hsl(var(--secondary))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <BarChart3 size={12} style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground))' }}>4</span>
              <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Sectors</span>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{
                background: 'hsl(150 83% 95%)',
                border: '1px solid hsl(150 83% 80%)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--primary))' }}
              />
              <span className="text-xs font-medium" style={{ color: 'hsl(150 83% 28%)' }}>Live Q4 FY25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
