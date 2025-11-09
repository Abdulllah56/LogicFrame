"use client";

import React from "react";
import Dashboard from "./dashboard/page"
import "../globals.css";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <Dashboard />
      </div>
    </main>
  );
}
