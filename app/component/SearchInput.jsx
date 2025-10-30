// components/SearchInput.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = React.memo(({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}) => {
  const inputRef = React.useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;