import React, { useState } from 'react';
import { Building2, Globe, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SECTORS, CATEGORIES } from '../data/companies';

export const AddCompanyModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    website: '',
    sector: '',
    subsector: '',
    category: '',
    revenueRange: '',
    offeringsSummary: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Company name is required';
    if (!form.sector) e.sector = 'Sector is required';
    if (!form.category) e.category = 'Category is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onAdd({
      ...form,
      id: `c${Date.now()}`,
      website: form.website || '#',
      subsector: form.subsector || 'General',
      revenueRange: form.revenueRange || 'N/A',
      offeringsSummary: form.offeringsSummary || 'No description provided.',
    });
    setForm({ name: '', website: '', sector: '', subsector: '', category: '', revenueRange: '', offeringsSummary: '' });
    setErrors({});
    onClose();
  };

  const revenueRanges = ['< $1M', '$1M–$10M', '$10M–$50M', '$50M–$100M', '$100M–$250M', '$250M+'];

  const inputStyle = {
    background: 'hsl(var(--secondary))',
    border: '1px solid hsl(var(--border))',
    color: 'hsl(var(--foreground))',
  };

  const errorInputStyle = {
    background: 'hsl(var(--secondary))',
    border: '1px solid hsl(var(--destructive))',
    color: 'hsl(var(--foreground))',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          boxShadow: '0 20px 60px hsl(220 15% 60% / 0.2)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'hsl(var(--primary) / 0.1)', border: '1.5px solid hsl(var(--primary) / 0.35)' }}
            >
              <Building2 size={14} style={{ color: 'hsl(var(--primary))' }} />
            </span>
            Add New Company
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {/* Company Name */}
          <div>
            <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Company Name *
            </Label>
            <div className="relative mt-1">
              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. PayFlow Technologies"
                className="pl-8 h-9 text-sm"
                style={errors.name ? errorInputStyle : inputStyle}
              />
            </div>
            {errors.name && <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>{errors.name}</p>}
          </div>

          {/* Website */}
          <div>
            <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Website URL
            </Label>
            <div className="relative mt-1">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <Input
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://company.com"
                className="pl-8 h-9 text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Sector & Sub-sector row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Sector *
              </Label>
              <div className="mt-1">
                <Select value={form.sector} onValueChange={v => setForm(f => ({ ...f, sector: v }))}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    style={errors.sector ? errorInputStyle : inputStyle}
                  >
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                    {SECTORS.map(s => (
                      <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.sector && <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>{errors.sector}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Sub-sector
              </Label>
              <div className="relative mt-1">
                <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <Input
                  value={form.subsector}
                  onChange={e => setForm(f => ({ ...f, subsector: e.target.value }))}
                  placeholder="e.g. Payments"
                  className="pl-8 h-9 text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Category & Revenue row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Category *
              </Label>
              <div className="mt-1">
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger
                    className="h-9 text-sm"
                    style={errors.category ? errorInputStyle : inputStyle}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.category && <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>{errors.category}</p>}
            </div>

            <div>
              <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Revenue Range
              </Label>
              <div className="mt-1">
                <Select value={form.revenueRange} onValueChange={v => setForm(f => ({ ...f, revenueRange: v }))}>
                  <SelectTrigger className="h-9 text-sm" style={inputStyle}>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
                    {revenueRanges.map(r => (
                      <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Offerings Summary */}
          <div>
            <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Offerings Summary
            </Label>
            <textarea
              value={form.offeringsSummary}
              onChange={e => setForm(f => ({ ...f, offeringsSummary: e.target.value }))}
              placeholder="Brief description of products/services..."
              rows={3}
              className="w-full mt-1 text-sm rounded-md px-3 py-2 resize-none outline-none"
              style={{
                background: 'hsl(var(--secondary))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-9 px-4 text-sm"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Cancel
            </Button>
            <button
              type="submit"
              className="btn-add-company"
              style={{ padding: '6px 20px', borderRadius: '8px' }}
            >
              Add Company
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
