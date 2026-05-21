'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Percent, ToggleLeft, ToggleRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/apiService';

const api = new ApiService();

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-medium transition-all
      ${type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
      {type === 'success'
        ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
      {message}
    </div>
  );
};

const SettingsSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(20);
  const [percentageInput, setPercentageInput] = useState('20');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      const fod = data?.settings?.firstOrderDiscountSettings;
      if (fod) {
        setDiscountEnabled(fod.isEnabled !== false);
        const pct = fod.discountPercentage ?? 20;
        setDiscountPercentage(pct);
        setPercentageInput(String(pct));
      }
    } catch {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleToggle = async () => {
    const next = !discountEnabled;
    setSaving(true);
    try {
      await api.toggleFirstOrderDiscount(next, discountPercentage);
      setDiscountEnabled(next);
      showToast(`First-order discount ${next ? 'enabled' : 'disabled'}`);
    } catch {
      showToast('Failed to update setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePercentageSave = async () => {
    const pct = parseFloat(percentageInput);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      showToast('Enter a percentage between 1 and 100', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.toggleFirstOrderDiscount(discountEnabled, pct);
      setDiscountPercentage(pct);
      showToast('Discount percentage updated');
    } catch {
      showToast('Failed to update percentage', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border-0 p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage promotions and restaurant configuration</p>
        </div>

        {/* First-order discount card */}
        <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">First-Order Mobile Discount</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automatically applied to new mobile customers on their first order</p>
            </div>
          </div>

          {/* Card body */}
          <div className="px-8 py-6 space-y-6">

            {/* Enable / disable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Enable discount</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  When off, no discount is applied even if a customer qualifies
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={saving}
                aria-label={discountEnabled ? 'Disable discount' : 'Enable discount'}
                className="flex items-center gap-2 focus:outline-none disabled:opacity-50"
              >
                {saving
                  ? <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
                  : discountEnabled
                    ? <ToggleRight className="w-12 h-8 text-emerald-500" strokeWidth={1.5} />
                    : <ToggleLeft className="w-12 h-8 text-slate-400" strokeWidth={1.5} />
                }
                <span className={`text-xs font-semibold ${discountEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {discountEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border
              ${discountEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${discountEnabled ? 'bg-emerald-500' : 'bg-red-400'}`} />
              {discountEnabled
                ? `Active — ${discountPercentage}% off first mobile order`
                : 'Inactive — no discount is being offered'}
            </div>

            <hr className="border-gray-100" />

            {/* Percentage input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Discount percentage
              </label>
              <p className="text-xs text-slate-500 mb-3">
                The % deducted from the subtotal. Validated and applied server-side.
              </p>
              <div className="flex items-center gap-3">
                <div className="relative w-32">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={percentageInput}
                    onChange={e => setPercentageInput(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-3 text-sm font-medium
                      text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  onClick={handlePercentageSave}
                  disabled={saving || percentageInput === String(discountPercentage)}
                  className="px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600
                    text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2 transition-all"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>

            {/* How it works info box */}
            <div className="bg-slate-50 rounded-2xl px-5 py-4 text-xs text-slate-600 space-y-1.5 border border-slate-100">
              <p className="font-semibold text-slate-700 mb-2">How it works</p>
              <p>• Discount is only shown and applied on the <strong>mobile app</strong>, not the web.</p>
              <p>• A customer qualifies if they have <strong>zero previous orders</strong> on their account.</p>
              <p>• Each <strong>device</strong> can only benefit once, even across multiple accounts.</p>
              <p>• The discount is <strong>calculated and enforced server-side</strong> — it cannot be faked.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsSection;
