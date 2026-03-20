import React from 'react';

export const FinanceFriendIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ff-grad1" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ff-grad2" x1="40" y1="40" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#047857" />
            </linearGradient>
        </defs>
        <rect x="15" y="30" width="70" height="45" rx="12" fill="url(#ff-grad1)" className="drop-shadow-lg" />
        <rect x="25" y="20" width="60" height="40" rx="10" fill="url(#ff-grad2)" className="drop-shadow-xl" />
        <circle cx="55" cy="40" r="12" fill="#ECFDF5" />
        <path d="M55 33V47M50 37H60M50 43H60" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="75" cy="40" r="4" fill="#6EE7B7" />
        <path d="M35 20V30" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 20V30" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export const ScopeCreepIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sc-grad1" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id="sc-grad2" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C4B5FD" />
                <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
        </defs>
        <path d="M50 15L20 28V55C20 72 32 85 50 90C68 85 80 72 80 55V28L50 15Z" fill="url(#sc-grad1)" className="drop-shadow-lg" />
        <path d="M50 25L30 35V55C30 68 38 78 50 82C62 78 70 68 70 55V35L50 25Z" fill="url(#sc-grad2)" />
        <path d="M40 50L45 55L60 40" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="15" r="4" fill="#F5F3FF" />
    </svg>
);

export const InvoiceChaseIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="ic-grad1" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="ic-grad2" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF3C7" />
                <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
        </defs>
        <rect x="25" y="15" width="50" height="70" rx="8" fill="url(#ic-grad1)" className="drop-shadow-xl opacity-90" />
        <rect x="35" y="25" width="45" height="65" rx="6" fill="#FFFFFF" className="drop-shadow-md" />
        <path d="M45 40H65M45 50H65M45 60H55" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        <circle cx="65" cy="70" r="10" fill="url(#ic-grad2)" />
        <path d="M62 70L65 73L70 66" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 50C85 55 85 65 75 70" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
    </svg>
);

export const ObjectExtractorIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="oe-grad1" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D946EF" />
                <stop offset="1" stopColor="#A21CAF" />
            </linearGradient>
        </defs>
        <path d="M25 25H75C80.5228 25 85 29.4772 85 35V75C85 80.5228 80.5228 85 75 85H25C19.4772 85 15 80.5228 15 75V35C15 29.4772 19.4772 25 25 25Z" fill="url(#oe-grad1)" opacity="0.3" stroke="#D946EF" strokeWidth="2" strokeDasharray="6 6" className="drop-shadow-lg" />
        <path d="M35 45L50 35L65 45V60L50 70L35 60V45Z" fill="url(#oe-grad1)" className="drop-shadow-xl" />
        <path d="M50 35V52M35 45L50 52M65 45L50 52" stroke="#FDF4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="85" cy="25" r="5" fill="#E879F9" />
        <circle cx="20" cy="85" r="3" fill="#E879F9" />
        <path d="M65 25C70 20 75 20 80 25" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
    </svg>
);

export const ScreenshotBeautifierIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sb-grad1" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0EA5E9" />
                <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="sb-grad2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
        </defs>
        <rect x="15" y="25" width="70" height="50" rx="6" fill="url(#sb-grad1)" className="drop-shadow-2xl" />
        <rect x="25" y="15" width="70" height="50" rx="6" fill="url(#sb-grad2)" className="drop-shadow-xl" />
        <circle cx="35" cy="25" r="3" fill="#E0F2FE" />
        <circle cx="45" cy="25" r="3" fill="#BAE6FD" />
        <circle cx="55" cy="25" r="3" fill="#7DD3FC" />
        <path d="M25 35H95" stroke="#0284C7" strokeWidth="2" />
        <path d="M75 10L85 5L80 15L90 20L80 25L85 35L75 30L65 35L70 25L60 20L70 15L65 5L75 10Z" fill="#38BDF8" opacity="0.8" />
        <circle cx="20" cy="80" r="4" fill="#38BDF8" />
        <circle cx="10" cy="65" r="2" fill="#7DD3FC" />
    </svg>
);

export const InvoiceMakerIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="im-grad1" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="im-grad2" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFF6FF" />
                <stop offset="1" stopColor="#93C5FD" />
            </linearGradient>
        </defs>
        <path d="M25 20H60L75 35V80C75 82.7614 72.7614 85 70 85H25C22.2386 85 20 82.7614 20 80V25C20 22.2386 22.2386 20 25 20Z" fill="url(#im-grad1)" className="drop-shadow-xl text-opacity-10" />
        <path d="M35 15H70L85 30V75C85 77.7614 82.7614 80 80 80H35C32.2386 80 30 77.7614 30 75V20C30 17.2386 32.2386 15 35 15Z" fill="#FFFFFF" className="drop-shadow-md" />
        <path d="M70 15V30H85" fill="#DBEAFE" />
        <path d="M45 40H70M45 50H70M45 60H55" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
        <path d="M35 80L20 95L10 85" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const GenericToolIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            <linearGradient id="gen-grad1" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#64748B" />
                <stop offset="1" stopColor="#334155" />
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="url(#gen-grad1)" className="drop-shadow-lg" />
        <path d="M40 40H60V60H40V40Z" fill="#F8FAFC" opacity="0.8" />
        <path d="M60 40L40 60" stroke="#334155" strokeWidth="3" />
    </svg>
);
