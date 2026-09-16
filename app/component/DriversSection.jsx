'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Bike, Car, Footprints, Loader2, CheckCircle2, AlertCircle, X, Plus, Phone, Mail, Eye, EyeOff,
} from 'lucide-react';
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

const VEHICLE_TYPES = [
  { value: '', label: 'Not set' },
  { value: 'bike', label: 'Bike' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'on_foot', label: 'On foot' },
];

const vehicleIcon = (vehicleType) => {
  switch (vehicleType) {
    case 'motorcycle': return Bike;
    case 'car': return Car;
    case 'on_foot': return Footprints;
    default: return Bike;
  }
};

const initials = (firstName, lastName) =>
  `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();

const AddDriverModal = ({ onClose, onCreated, showToast }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', vehicleType: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) next.firstName = 'First name is required';
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) next.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Enter a valid email';
    if (!/^\+?[\d\s\-()]+$/.test(formData.phone.trim()) || !formData.phone.trim()) next.phone = 'Enter a valid phone number';
    if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.createDriver({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        ...(formData.vehicleType && { vehicleType: formData.vehicleType }),
      });
      showToast(`${formData.firstName.trim()} was added as a driver`);
      onCreated();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add driver' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Driver</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-slate-500 -mt-4 mb-6">
          Drivers are added to your currently selected branch and can sign in to the driver app right away.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmed"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Khan"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="driver@saborly.es"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 600 000 000"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle type (optional)</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DriversSection = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDrivers();
      setDrivers(data?.drivers || []);
    } catch {
      showToast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadDrivers}
          showToast={showToast}
        />
      )}

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border border-blue-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
            <p className="text-sm text-slate-500 mt-1">Manage delivery drivers for your current branch</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600
              text-white hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[240px] px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Bike className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No drivers yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Add your first driver so orders can be assigned for delivery.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {drivers.map((driver) => {
                    const VehicleIcon = vehicleIcon(driver.driverStatus?.vehicleType);
                    const isOnline = driver.driverStatus?.isOnline === true;
                    return (
                      <tr key={driver._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                              {initials(driver.firstName, driver.lastName)}
                            </div>
                            <p className="font-semibold text-gray-900">{driver.firstName} {driver.lastName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {driver.phone && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {driver.phone}
                              </p>
                            )}
                            {driver.email && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> {driver.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <VehicleIcon className="w-3.5 h-3.5" />
                            {VEHICLE_TYPES.find((v) => v.value === driver.driverStatus?.vehicleType)?.label || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                              isOnline
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DriversSection;
