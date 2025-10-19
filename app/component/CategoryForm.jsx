import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { apiService } from '../services/apiService';

const CategoryForm = ({ onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    name: { en: '', es: '', ca: '', ar: '' },
    description: { en: '', es: '', ca: '', ar: '' },
    imageUrl: '',
    icon: '🍔',
    sortOrder: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: {
          en: initialData.name?.en || '',
          es: initialData.name?.es || '',
          ca: initialData.name?.ca || '',
          ar: initialData.name?.ar || '',
        },
        description: {
          en: initialData.description?.en || '',
          es: initialData.description?.es || '',
          ca: initialData.description?.ca || '',
          ar: initialData.description?.ar || '',
        },
        imageUrl: initialData.imageUrl || '',
        icon: initialData.icon || '🍔',
        sortOrder: initialData.sortOrder || 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('name.') || name.startsWith('description.')) {
      const [field, lang] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.en) newErrors.nameEn = 'English name is required';
    if (!formData.imageUrl) newErrors.imageUrl = 'Image URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSubmit = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder),
      };

      if (mode === 'edit') {
        await apiService.updateCategory(initialData._id, dataToSubmit);
      } else {
        await apiService.createCategory(dataToSubmit);
      }
      onSubmit();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save category' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['en', 'es', 'ca', 'ar'].map((lang) => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name ({lang.toUpperCase()}) {lang === 'en' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={`name.${lang}`}
                  value={formData.name[lang]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter name in ${lang.toUpperCase()}`}
                />
                {errors[`name${lang.toUpperCase()}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`name${lang.toUpperCase()}`]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['en', 'es', 'ca', 'ar'].map((lang) => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description ({lang.toUpperCase()})
                </label>
                <textarea
                  name={`description.${lang}`}
                  value={formData.description[lang]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter description in ${lang.toUpperCase()}`}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 flex items-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                Upload Image
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl"
                />
              )}
            </div>
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter emoji or icon (e.g., 🍔)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sort order"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckbox}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
              />
              Active
            </label>
          </div>
          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              {mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;