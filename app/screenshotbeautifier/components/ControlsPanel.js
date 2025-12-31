import React, { useState } from "react";
import { Layout, Palette, SlidersHorizontal, Download, History, Upload, Image as ImageIcon, Link as LinkIcon, Loader2, Code, Terminal, ChevronDown, RotateCcw } from "lucide-react";

export default function ControlsPanel() {
  const [activeTab, setActiveTab] = useState("layout");

  const tabs = [
    { id: "layout", label: "Layout", icon: Layout },
    { id: "style", label: "Style", icon: Palette },
    { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
    { id: "code", label: "Code", icon: Code },
    { id: "export", label: "Export", icon: Download },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-black/20 backdrop-blur-xl border-l border-slate-200 dark:border-white/5 overflow-hidden">
      {/* Loading Overlay */}
      <div id="loading-overlay" className="hidden absolute inset-0 bg-white/80 dark:bg-black/80 z-50 flex-col items-center justify-center backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin mb-2" />
        <span id="loading-text" className="text-sm font-medium text-slate-700 dark:text-white">Processing...</span>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="p-4 border-b border-slate-200 dark:border-white/5 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button id="undo-btn" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 disabled:opacity-30 transition-all border border-slate-100 dark:border-white/5 shadow-sm active:scale-95" title="Undo">
              <History className="w-4 h-4" />
            </button>
            <button id="redo-btn" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 disabled:opacity-30 transition-all border border-slate-100 dark:border-white/5 shadow-sm transform scale-x-[-1] active:scale-95" title="Redo">
              <History className="w-4 h-4" />
            </button>
          </div>
          <button id="reset-btn" className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all uppercase tracking-wider font-bold active:scale-95">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative group">
            <input id="upload-image" type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <button className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-[#00D9FF]/10 to-[#00D9FF]/5 border border-dashed border-[#00D9FF]/30 group-hover:border-[#00D9FF] group-hover:bg-[#00D9FF]/10 transition-all text-[#00D9FF]">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Upload Image</span>
            </button>
          </div>

          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input id="url-input" type="text" list="recent-urls-list" placeholder="Paste URL..." className="w-full pl-9 pr-2 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-gray-200 focus:border-[#00D9FF] outline-none placeholder:text-slate-400" />
              <datalist id="recent-urls-list"></datalist>
            </div>
            <button id="url-submit" className="px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-[#00D9FF] dark:hover:bg-[#00D9FF] hover:text-white transition-all text-xs font-bold active:scale-95 shadow-sm">
              GO
            </button>
          </div>
        </div>

        <div id="batch-queue-container" className="hidden flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">In Queue</span>
            <div className="flex items-center gap-2">
              <span id="queue-count" className="text-[10px] font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-600 dark:text-gray-300">0</span>
              <button id="clear-queue-btn" className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase">Clear</button>
            </div>
          </div>
          <div id="batch-list" className="flex flex-col gap-1 max-h-[70px] overflow-y-auto rounded-lg p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 md-scrollbar"></div>
        </div>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/10 shrink-0">
        <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-lg transition-all duration-300 relative ${isActive ? 'bg-white dark:bg-white/10 shadow-sm text-[#00D9FF]' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
              >
                <Icon className={`w-4 h-4 mb-0.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[9px] font-bold uppercase tracking-tight">{t.label}</span>
                {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#00D9FF]"></div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto md-scrollbar p-4 space-y-6 pb-24">

        {/* LAYOUT TAB */}
        <div className={activeTab === 'layout' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400' : 'hidden'}>
          {/* Canvas Presets */}
          <section id="presets" className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">Canvas Presets</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                ["linkedin", "LinkedIn", "1200×628"],
                ["twitter", "Twitter", "1200×675"],
                ["instagram", "Instagram", "1080×1080"],
                ["github", "GitHub", "1280×640"],
                ["facebook", "Facebook", "1200×630"],
                ["youtube", "YouTube", "1280×720"],
              ].map(([key, label, size]) => (
                <button key={key} data-preset={key} className="text-left px-3 py-3 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-2xl hover:border-[#00D9FF] hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200 group">
                  <div className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-tight group-hover:text-[#00D9FF]">{label}</div>
                  <div className="text-[9px] text-slate-400 font-mono tracking-tighter">{size}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Size */}
          <section className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-bold text-slate-700 dark:text-white uppercase">Dimensions</h3>
              <button id="fit-image-btn" className="text-[9px] font-black text-[#00D9FF] hover:underline uppercase tracking-widest">Fit Image</button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-1 space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Width</span>
                <input id="custom-width" type="number" className="w-full px-3 py-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-700 dark:text-white focus:border-[#00D9FF] outline-none" />
              </div>
              <div className="pt-4 text-slate-200">×</div>
              <div className="flex-1 space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Height</span>
                <input id="custom-height" type="number" className="w-full px-3 py-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-700 dark:text-white focus:border-[#00D9FF] outline-none" />
              </div>
            </div>

            <div className="flex justify-between items-center p-1 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 pl-2">
                <input id="lock-ratio-toggle" type="checkbox" className="accent-[#00D9FF] w-3.5 h-3.5 rounded cursor-pointer" />
                <label htmlFor="lock-ratio-toggle" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Lock Ratio</label>
              </div>
              <div className="flex gap-1" id="aspect-ratios">
                <button data-ratio="1.777" className="px-2 py-1 text-[10px] rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/20 transition font-black">16:9</button>
                <button data-ratio="1" className="px-2 py-1 text-[10px] rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/20 transition font-black">1:1</button>
              </div>
            </div>

            <div id="dimension-warning" className="hidden p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-[10px] text-amber-700 dark:text-amber-400 leading-tight italic">
              <span id="dimension-warning-text"></span>
            </div>
          </section>

          {/* Padding & Grid */}
          <section className="space-y-4">
            <div className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
              <div className="flex justify-between text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-tight">
                <span>Canvas Padding</span>
                <span id="padding-value" className="text-[#00D9FF] font-mono">60</span>
              </div>
              <input id="padding-slider" type="range" min="0" max="200" defaultValue="60" className="w-full accent-[#00D9FF] h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-3xl">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Alignment Grid</span>
              </div>
              <input id="grid-toggle" type="checkbox" className="accent-[#00D9FF] w-5 h-5 rounded cursor-pointer" />
            </div>
          </section>

          {/* Crop Tool */}
          <section className="p-4 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-3xl border border-cyan-200/50 dark:border-cyan-500/20 space-y-4 shadow-lg shadow-cyan-500/5">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-[0.2em]">Crop Utility</h3>
              <small id="crop-hint" className="hidden text-[10px] text-cyan-500 font-bold italic animate-pulse">Drag handles</small>
            </div>
            <div className="flex gap-2">
              <button id="start-crop" className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-400 shadow-sm border border-cyan-100 hover:bg-cyan-600 hover:text-white transition-all">Start Crop</button>
              <button id="apply-crop" className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl bg-green-500 text-white shadow-xl shadow-green-500/20 hidden">Apply</button>
              <button id="cancel-crop" className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hidden">Exit</button>
            </div>
          </section>
        </div>

        {/* STYLE TAB */}
        <div className={activeTab === 'style' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400' : 'hidden'}>
          {/* Background Branding */}
          <section className="space-y-3 px-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modern Background</h3>
              <div className="flex p-1 bg-slate-200/50 dark:bg-black/30 rounded-xl" id="bg-type-group">
                <button data-bg-type="solid" className="px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all data-[active=true]:bg-white dark:data-[active=true]:bg-white/20 data-[active=true]:text-[#00D9FF] data-[active=true]:shadow-sm">Solid</button>
                <button data-bg-type="gradient" className="px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all data-[active=true]:bg-white dark:data-[active=true]:bg-white/20 data-[active=true]:text-[#00D9FF] data-[active=true]:shadow-sm">Gradient</button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-5 shadow-sm">
              <input id="bg-color" type="color" className="h-10 w-full rounded-2xl cursor-pointer border-0 p-0 overflow-hidden shadow-inner hidden" />

              <div id="gradients-container" className="space-y-4">
                <div className="grid grid-cols-5 gap-2.5">
                  {[
                    "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)",
                    "linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)",
                    "linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)",
                    "linear-gradient(135deg, #7928CA 0%, #FF0080 100%)",
                    "linear-gradient(135deg, #2D3748 0%, #1A202C 100%)"
                  ].map((g, i) => (
                    <button key={i} data-gradient={g} className="w-full aspect-square rounded-full shadow-md border-2 border-transparent hover:border-[#00D9FF] transition-all hover:scale-110 active:scale-95" style={{ background: g }} />
                  ))}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Direction</span>
                    <div className="flex gap-1" id="gradient-direction-group">
                      {['to-br', 'to-r', 'to-b', 'radial'].map(d => (
                        <button key={d} data-direction={d} className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/5 hover:border-[#00D9FF]/50 transition-all data-[active=true]:border-[#00D9FF] data-[active=true]:bg-[#00D9FF]/10">
                          <div className={`w-3 h-3 rounded-[2px] bg-slate-300 dark:bg-white/30 border border-slate-400/20 ${d.replace('to-', '')}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input id="gradient-color-1" type="color" defaultValue="#FF0080" className="h-9 flex-1 rounded-xl cursor-pointer border-0 p-0 shadow-sm" />
                    <span className="text-slate-300">→</span>
                    <input id="gradient-color-2" type="color" defaultValue="#7928CA" className="h-9 flex-1 rounded-xl cursor-pointer border-0 p-0 shadow-sm" />
                    <button id="apply-custom-gradient" className="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-lg">SET</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Window Frame Branding */}
          <section className="space-y-3 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Window Style</h3>
            <div className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 shadow-sm">
              <div className="grid grid-cols-3 gap-2" id="window-style-group">
                {['none', 'mac_dark', 'mac_light'].map(s => (
                  <button key={s} data-style={s} className="py-2.5 text-[10px] font-black uppercase rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#00D9FF] transition-all data-[active=true]:bg-slate-900 dark:data-[active=true]:bg-white data-[active=true]:text-white dark:data-[active=true]:text-black data-[active=true]:border-transparent">
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="shadow-select" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Drop Shadow</label>
                  <select id="shadow-select" className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-[#00D9FF]">
                    <option value="none">Ghost</option>
                    <option value="small">Soft</option>
                    <option value="medium">Classic</option>
                    <option value="large">Deep</option>
                    <option value="xl">Epic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="roundness-slider" className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Radius</label>
                  <div className="pt-2.5">
                    <input id="roundness-slider" type="range" min="0" max="32" defaultValue="12" className="w-full accent-[#00D9FF] h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Watermarking */}
          <section className="space-y-3 px-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branding Watermark</h3>
              <input id="watermark-toggle" type="checkbox" className="accent-[#00D9FF] w-5 h-5 rounded cursor-pointer" />
            </div>
            <div className="p-4 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
              <div className="relative group">
                <input
                  id="watermark-text"
                  type="text"
                  placeholder="@yourhandle"
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black text-slate-700 dark:text-white focus:border-[#00D9FF] outline-none group-hover:border-slate-300 transition-colors"
                  maxLength="30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Position</label>
                  <div className="grid grid-cols-2 gap-1.5" id="watermark-position-group">
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                      <button key={pos} data-position={pos} className="py-2 text-[9px] font-black rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all uppercase leading-none active:scale-95">
                        {pos.split('-').map(s => s[0]).join('')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Bold Weight</label>
                  <div className="flex items-center justify-center h-8 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-100 dark:border-white/10">
                    <input id="watermark-bold-toggle" type="checkbox" className="accent-[#00D9FF] w-5 h-5 rounded cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Font Size</label>
                </div>
                <input id="watermark-size-slider" type="range" min="12" max="100" defaultValue="24" className="w-full accent-[#00D9FF] h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </section>
        </div>

        {/* ADJUST TAB */}
        <div className={activeTab === 'adjust' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400' : 'hidden'}>
          <section className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between px-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Brightness Filter</span>
              </div>
              <input id="brightness-slider" type="range" min="0" max="200" defaultValue="100" className="w-full accent-[#00D9FF] h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between px-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contrast Factor</span>
              </div>
              <input id="contrast-slider" type="range" min="0" max="200" defaultValue="100" className="w-full accent-[#00D9FF] h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>
          </section>

          <section className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-tight">Image Sharpness</span>
              </div>
              <input id="sharpen-toggle" type="checkbox" className="accent-[#00D9FF] w-5 h-5 rounded cursor-pointer" />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Privacy Shield</h4>
                  <button id="clear-blurs-btn" className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 hover:text-red-400 transition-colors">
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 leading-tight italic">Blur sensitive content by painting over it.</p>
              </div>

              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Blur Intensity</span>
                  <span id="blur-intensity-val" className="text-[9px] font-black text-[#00D9FF]">20px</span>
                </div>
                <input id="blur-intensity-slider" type="range" min="0" max="100" defaultValue="20" className="w-full accent-[#00D9FF] h-1 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
              </div>

              <button id="blur-tool-btn" className="w-full py-4 text-xs font-black uppercase rounded-2xl border-2 border-dashed border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/5 hover:border-[#00D9FF] data-[active=true]:bg-[#00D9FF] data-[active=true]:text-white data-[active=true]:border-transparent transition-all flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>PAINT BLUR TOOL</span>
              </button>
            </div>
          </section>

          <section id="readability-container" className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-4 shadow-xl hidden">
            <div className="flex items-center gap-3">
              <div id="readability-badge" className="w-3.5 h-3.5 rounded-full bg-[#00D9FF]/30 border border-[#00D9FF] animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Image Fidelity</span>
                <span id="readability-text" className="text-[11px] font-black text-white italic">Ready to analyze</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
              <input id="high-quality-toggle" type="checkbox" className="accent-[#00D9FF] w-4 h-4" defaultChecked />
              <label htmlFor="high-quality-toggle" className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter cursor-pointer">MAX Quality Rendering</label>
            </div>
          </section>
        </div>

        {/* CODE TAB */}
        <div className={activeTab === 'code' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400' : 'hidden'}>
          <section className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 px-1 pb-1">
              <Terminal className="w-5 h-5 text-[#00D9FF]" />
              <h3 className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-[0.2em]">Snippet Port</h3>
            </div>

            <div className="relative">
              <textarea
                id="code-input"
                placeholder="// Paste sensitive logic or UI markup here..."
                className="w-full h-48 p-4 text-[11px] font-mono bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl outline-none focus:ring-2 focus:ring-[#00D9FF]/20 resize-none md-scrollbar leading-relaxed"
                spellCheck="false"
              ></textarea>
            </div>

            <div className="flex gap-2">
              <select id="code-language" className="flex-1 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-black outline-none focus:border-[#00D9FF] appearance-none cursor-pointer">
                {['javascript', 'typescript', 'python', 'html', 'css', 'json', 'java', 'go', 'rust', 'sql', 'bash', 'plaintext'].map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
              <button id="render-code-btn" className="flex-1 py-3 text-[11px] font-black uppercase rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-[#00D9FF] hover:text-white transition-all shadow-xl active:scale-95">
                IMPORT CODE
              </button>
            </div>
          </section>
        </div>

        {/* EXPORT TAB */}
        <div className={activeTab === 'export' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400' : 'hidden'}>
          <section className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-7">
            <div className="space-y-5">
              <div className="space-y-2 px-1">
                <label htmlFor="export-format" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Export Container</label>
                <select id="export-format" className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-black outline-none focus:border-[#00D9FF]">
                  <option value="image/png">Lossless (PNG)</option>
                  <option value="image/jpeg">Efficient (JPEG)</option>
                  <option value="image/webp">Next-Gen (WebP)</option>
                </select>
              </div>

              <div id="quality-container" className="hidden p-5 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 space-y-4 opacity-50 pointer-events-none transition-all">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Bitrate Quality</span>
                  <span id="quality-value" className="text-xs font-mono font-black text-[#00D9FF]">90</span>
                </div>
                <input id="export-quality" type="range" min="10" max="100" defaultValue="90" className="w-full accent-[#00D9FF] h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4 px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Rendering Scale</label>
              <div className="flex p-1.5 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/10 gap-1.5" id="export-scale-group">
                {[1, 2, 3].map(scale => (
                  <button key={scale} data-scale={scale} className="flex-1 py-3 text-xs font-black rounded-xl transition-all data-[active=true]:bg-[#00D9FF] data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=false]:text-slate-500">
                    {scale}x
                  </button>
                ))}
              </div>
            </div>

            <button id="export-batch" className="hidden w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              <span>EXPORT ALL AS ZIP</span>
            </button>
          </section>

          <div className="grid grid-cols-2 gap-3 px-1 pt-2">
            <button id="export-json-btn" className="py-3 text-[10px] font-black uppercase rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 transition-all shadow-sm">Save Backup</button>
            <button id="import-json-btn" className="py-3 text-[10px] font-black uppercase rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 transition-all shadow-sm">Restore</button>
            <input id="import-json-input" type="file" accept=".json" className="hidden" />
          </div>
        </div>

      </div >

      {/* --- FLOATING ACTION BAR --- */}
      <div className="shrink-0 mt-auto p-3">
        <div className="mx-auto w-full max-w-sm p-3 sm:p-4 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-white/5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.15)] space-y-2">
          <div className="flex flex-col items-center gap-1">
            <div id="message" className="text-[10px] text-center font-bold text-[#00D9FF] uppercase tracking-tight h-4 min-h-[16px] leading-4"></div>
            <div id="filesize-estimate" className="text-[10px] text-center text-slate-500 dark:text-gray-500 font-mono font-black uppercase tracking-[0.08em]">
              EST SIZE: <span className="text-[#00D9FF]">-- KB</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button id="copy-image" className="col-span-1 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">
              COPY
            </button>
            <button id="export-btn" className="col-span-1 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.05em] hover:bg-[#00D9FF] hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group">
              <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              <span>DOWNLOAD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
