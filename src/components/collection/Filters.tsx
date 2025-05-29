import React from 'react';

interface FiltersProps {
  sort: string;
  category: string;
  onSortChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  accentColor?: string;
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'optical', label: 'Optical' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'sound', label: 'Sound' },
];

const sorts = [
  { value: 'name', label: 'Name' },
  { value: 'year', label: 'Year' },
  { value: 'inventor', label: 'Inventor' },
];

export const Filters: React.FC<FiltersProps> = ({ sort, category, onSortChange, onCategoryChange, accentColor = '#00FF99' }) => {
  return (
    <div className="flex flex-wrap gap-6 items-center mb-10">
      <div className="flex items-center gap-2">
        <span className="font-bold text-base" style={{ color: accentColor }}>Sort by:</span>
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          className="font-mono px-3 py-2 rounded-lg border-2 bg-transparent text-base focus:outline-none transition-all"
          style={{ borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}33` }}
        >
          {sorts.map(opt => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-base" style={{ color: accentColor }}>Category:</span>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-full font-mono font-bold border-2 transition-all duration-200 focus:outline-none ${category === cat.value ? 'text-black scale-105 shadow-lg' : 'bg-transparent text-foreground/80 hover:text-black'}`}
              style={{
                borderColor: accentColor,
                background: category === cat.value ? accentColor : undefined,
                boxShadow: category === cat.value ? `0 2px 8px 0 ${accentColor}44` : undefined,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters; 