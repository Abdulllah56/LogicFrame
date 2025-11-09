import React from "react";

export default function ControlsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Logic Frame - Screenshot Beautifier</h1>

      {/* Upload */}
      <div>
        <label htmlFor="upload-image" className="block text-sm text-gray-400 mb-1">
          Upload image
        </label>
        <div className="relative w-full">
          <input id="upload-image" type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
          <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-gradient-to-r from-[#041953] to-[#061f34] hover:from-[#0a1632] hover:to-[#0c1a25] transition border border-transparent text-white">
            <span>Choose Image</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      <fieldset id="presets" className="flex flex-col gap-2">
        <legend className="text-sm text-gray-400">Presets</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["linkedin", "LinkedIn", "1200×628"],
            ["instagram", "Instagram", "1080×1080"],
            ["facebook", "Facebook", "1200×630"],
            ["reddit", "Reddit", "1200×800"],
          ].map(([key, label, size]) => (
            <button
              key={key}
              data-preset={key}
              className="text-sm border border-white/10 rounded-lg py-2 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              {label}
              <br />
              <small className="text-gray-400 text-xs">{size}</small>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Dimensions */}
      <div>
        <label className="text-sm text-gray-400">Custom dimensions (px)</label>
        <div className="flex gap-2">
          <input id="custom-width" type="number" min="1" step="1" className="flex-1 px-2 py-1 bg-transparent border border-white/10 rounded text-sm w-2.5" />
          <input id="custom-height" type="number" min="1" step="1" className="flex-1 px-2 py-1 bg-transparent border border-white/10 rounded text-sm w-2.5" />
        </div>
      </div>

      {/* Background */}
      <div>
        <label htmlFor="bg-color" className="text-sm text-gray-400">
          Background color
        </label>
        <input id="bg-color" type="color" className="w-full h-10 rounded border-none" />
      </div>

      {/* Padding */}
      <div>
        <label htmlFor="padding-slider" className="text-sm text-gray-400">
          Padding <span id="padding-value">60</span> px
        </label>
        <input id="padding-slider" type="range" min="0" max="200" defaultValue="60" className="w-full accent-blue-400" />
      </div>

      {/* Crop */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Crop</label>
        <div className="flex gap-2">
          <button id="start-crop" className="flex-1 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition">Start Crop</button>
          <button id="apply-crop" className="flex-1 py-2 rounded-full bg-green-600 hover:bg-green-500 transition hidden">Apply</button>
          <button id="cancel-crop" className="flex-1 py-2 rounded-full bg-gray-600 hover:bg-gray-500 transition hidden">Cancel</button>
        </div>
        <small id="crop-hint" className="text-xs text-gray-400 hidden">Drag to adjust selection. Press Esc to cancel.</small>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <button id="export-png" className="flex-1 py-2 rounded-full bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500">
          Export as PNG
        </button>
        <button id="copy-image" className="flex-1 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500">
          Copy Image
        </button>
      </div>

      <div id="message" className="text-sm text-gray-400 min-h-[24px]"></div>
    </div>
  );
}
