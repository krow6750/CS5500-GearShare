'use client';

import { useState } from 'react';

export default function SearchableSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  required = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options?.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options?.find(option => option.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-900 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={selectedOption ? selectedOption.label : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder:text-slate-500"
          required={required}
        />
        
        {isOpen && filteredOptions?.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 