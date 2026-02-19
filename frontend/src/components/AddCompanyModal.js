import React, { useState } from 'react';
import { Building2, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export const AddCompanyModal = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    website: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Company name is required';
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
      id: `c${Date.now()}`,
      name: form.name.trim(),
      website: form.website || '#',
      sector: 'N/A',
      subsector: 'N/A',
      category: 'N/A',
      revenueRange: 'N/A',
      offeringsSummary: 'No description provided.',
    });
    setForm({ name: '', website: '' });
    setErrors({});
    onClose();
  };

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
        className="max-w-md"
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

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          {/* Company Name */}
          <div>
            <Label className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Company Name *
            </Label>
            <div className="relative mt-1">
              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <Input
                data-testid="add-company-name-input"
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
                data-testid="add-company-website-input"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://company.com"
                className="pl-8 h-9 text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-9 px-4 text-sm"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              data-testid="add-company-cancel-btn"
            >
              Cancel
            </Button>
            <button
              type="submit"
              className="btn-add-company"
              style={{ padding: '6px 20px', borderRadius: '8px' }}
              data-testid="add-company-submit-btn"
            >
              Add Company
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
