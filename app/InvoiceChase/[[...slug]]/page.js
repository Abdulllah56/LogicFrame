"use client";

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the App component with SSR disabled
// This is necessary because the App uses react-router-dom's BrowserRouter
// which relies on window/document objects unavailable during server-side rendering
const App = dynamic(() => import('../src/App'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    )
})

const InvoiceChase = () => {
    return (
        <App />
    )
}

export default InvoiceChase
