"use client";
import React, { useRef, useEffect } from "react";
import CanvasArea from "./components/CanvasArea";
import ControlsPanel from "./components/ControlsPanel";
import { initBeautifier } from "./lib/beautifier";

export default function Page() {
  const canvasRef = useRef(null);

  useEffect(() => {
    initBeautifier(canvasRef);
  }, []);

  return (
    <main className="flex flex-col md:flex-row gap-4 h-screen p-6 bg-gradient-to-b from-[#071028] to-[#08131c] text-white">
      <section className="flex-1 flex justify-center items-center">
        <CanvasArea canvasRef={canvasRef} />
      </section>
      <aside className="w-full md:w-[320px] bg-[#0f1727] rounded-xl shadow-lg p-4 flex flex-col gap-4">
        <ControlsPanel />
        <footer className="text-center text-sm text-gray-400 mt-auto">
          Client-side only • No uploads • Fast export
        </footer>
      </aside>
    </main>
  );
}
