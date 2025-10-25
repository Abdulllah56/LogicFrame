"use client";
import { useState } from "react";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const [demoMode] = useState(true);

  const handleUpgrade = () => {
    // For now, just show a message
    alert("Pro features coming soon!");
  };

  const handleGetStarted = () => {
    // For now, directly allow access
    window.location.href = "/invoicemaker/invoices";
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that works best for your business. No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-2xl font-bold mb-2">Free</div>
              <div className="text-4xl font-bold mb-2">
                $0<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Up to 5 invoices per month</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Basic invoice templates</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Client management</span>
              </li>
              <li className="flex items-center space-x-3">
                <X className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">PDF export</span>
              </li>
              <li className="flex items-center space-x-3">
                <X className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Email invoices</span>
              </li>
              <li className="flex items-center space-x-3">
                <X className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Priority support</span>
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary shadow-lg">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-2xl font-bold mb-2">Pro</div>
              <div className="text-4xl font-bold mb-2">
                $19<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <p className="text-muted-foreground">Everything you need to scale</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500  shrink-0" />
                <span>Unlimited invoices</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Premium invoice templates</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Advanced client management</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>PDF export & download</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Email invoices to clients</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Overdue reminders</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>Analytics & reporting</span>
              </li>
            </ul>
            <Button 
              className="w-full shadow-sm" 
              onClick={handleUpgrade}
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Comparison */}
      <div className="text-center space-y-6">
        <p className="text-muted-foreground">
          All plans include a 14-day free trial. No credit card required for the free plan.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>

      {/* Subscription Form removed */}
    </div>
  );
}
