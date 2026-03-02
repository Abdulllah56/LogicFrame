"use client";

import dynamic from 'next/dynamic';

// Dynamically import the App component with SSR disabled
// This is necessary because the App uses browser-only APIs and refs
// which rely on window/document objects unavailable during server-side rendering
const App = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 text-sm">Loading Object Extractor...</p>
      </div>
    </div>
  )
});

export default function ObjectExtractorPage() {
  return <App />;
}
