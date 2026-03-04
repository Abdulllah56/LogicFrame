/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return {
            fallback: [
                // If Vercel has the PascalCase folders, these fallbacks will successfully route the lowercase requests
                { source: '/financefriend', destination: '/FinanceFriend' },
                { source: '/financefriend/:path*', destination: '/FinanceFriend/:path*' },
                { source: '/scopecreep', destination: '/ScopeCreep' },
                { source: '/scopecreep/:path*', destination: '/ScopeCreep/:path*' },
                { source: '/invoicechase', destination: '/InvoiceChase' },
                { source: '/invoicechase/:path*', destination: '/InvoiceChase/:path*' },
                { source: '/object-extractor', destination: '/Object-Extractor' },
                { source: '/object-extractor/:path*', destination: '/Object-Extractor/:path*' },
            ],
        };
    },
};

export default nextConfig;
