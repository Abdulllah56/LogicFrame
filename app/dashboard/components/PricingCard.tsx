
'use client'

import React, { useEffect } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        Paddle: any;
    }
}

interface PricingCardProps {
    plan: any;
    isCurrentPlan: boolean;
    userEmail: string;
    userId: string;
}

export default function PricingCard({ plan, isCurrentPlan, userEmail, userId }: PricingCardProps) {

    const handleCheckout = () => {
        if (isCurrentPlan) return;

        if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
            console.error("Paddle Client Token is missing!");
            alert("Payment system is not configured correctly.");
            return;
        }

        if (!plan.paddlePriceId) {
            alert("This plan is not configured for payments yet.");
            return;
        }

        // Initialize Paddle if not already (safeguard)
        if (window.Paddle) {
            window.Paddle.Checkout.open({
                items: [{ priceId: plan.paddlePriceId, quantity: 1 }],
                customer: {
                    email: userEmail,
                },
                customData: {
                    user_id: userId,
                    plan_id: plan.id, // Pass internal Plan ID to link in webhook
                },
            });
        }
    };

    return (
        <>
            <div className={`rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800 border ${isCurrentPlan ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-200 dark:border-zinc-700'}`}>
                <div className="p-6">
                    <h2 className="text-2xl leading-6 font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
                    <p className="mt-4">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price / 100}</span>
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
                    </p>
                    <button
                        onClick={handleCheckout}
                        disabled={isCurrentPlan}
                        className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${isCurrentPlan
                                ? 'bg-green-100 text-green-800 cursor-default'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                    </button>
                </div>
                <div className="pt-6 pb-8 px-6">
                    <h3 className="text-xs font-medium text-gray-900 dark:text-white tracking-wide uppercase">What's included</h3>
                    <ul className="mt-6 space-y-4">
                        {plan.features &&
                            Object.entries(plan.features).map(([key, value]) => (
                                <li key={key} className="flex space-x-3">
                                    <span className="text-green-500">✔</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {key}: {String(value)}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export function PaddleLoader() {
    return (
        <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            onLoad={() => {
                if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && window.Paddle) {
                    window.Paddle.Initialize({
                        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
                        // eventCallback: function(data: any) { ... } 
                    });
                }
            }}
        />
    )
}
