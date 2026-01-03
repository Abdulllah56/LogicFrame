'use client';

import React from 'react';
import { Palette } from 'lucide-react';

const ColorPalettePanel = ({
  palette,
}) => {
  if (!palette || palette.length === 0) {
    return null;
  }

  const rgbToHex = (rgb) => {
    return '#' + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  return (
    <div className="absolute bottom-24 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="text-orange-500" size={16} />
        <span className="text-sm font-semibold">Color Palette</span>
      </div>
      <div className="flex gap-2">
        {palette.map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700"
            style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
            title={rgbToHex(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalettePanel;
