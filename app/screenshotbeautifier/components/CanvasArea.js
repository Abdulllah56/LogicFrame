import React from "react";

export default function CanvasArea({ canvasRef }) {
  return (
    <div
      id="drop-zone"
      className="relative w-full max-w-[1400px] border border-dashed border-slate-300 dark:border-[rgba(0,217,255,0.2)] rounded-xl p-6 flex justify-center items-center min-h-[220px] transition-colors duration-300"
    >
      <canvas
        id="main-canvas"
        ref={canvasRef}
        width={1200}
        height={628}
        className="block max-w-full max-h-[80vh] rounded-lg shadow-lg bg-transparent"
      />
      <div
        id="drop-hint"
        className="absolute bottom-3 left-3 text-xs text-gray-400 select-none"
      >
        Drop image here or use &quot;Upload image&quot;
      </div>
    </div>
  );
}
