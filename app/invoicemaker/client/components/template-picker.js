"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card } from './ui/card';

export function TemplatePicker({ invoice, onGenerate, onClose }) {
  const [template, setTemplate] = useState('modern');
  const [logo, setLogo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const templateStyles = {
    modern: {
      previewClass: 'bg-gradient-to-r from-blue-600 to-blue-800',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
      activeClass: 'ring-blue-500'
    },
    classic: {
      previewClass: 'bg-gray-800',
      buttonClass: 'bg-gray-800 hover:bg-gray-900',
      activeClass: 'ring-gray-500'
    },
    minimal: {
      previewClass: 'bg-white border-2 border-gray-200',
      buttonClass: 'bg-gray-900 hover:bg-gray-800',
      activeClass: 'ring-gray-400'
    },
    professional: {
      previewClass: 'bg-gradient-to-r from-gray-700 to-gray-900',
      buttonClass: 'bg-gray-800 hover:bg-gray-900',
      activeClass: 'ring-gray-500'
    },
    elegant: {
      previewClass: 'bg-gradient-to-r from-pruple-500 to-purple-700',
      buttonClass: 'bg-purple-600 hover:bg-purple-700',
      activeClass: 'ring-purple-500'
    },
    sleek: {
      previewClass: 'bg-gradient-to-r from-green-500 to-green-700',
      buttonClass: 'bg-green-600 hover:bg-green-700',
      activeClass: 'ring-green-500'
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate({ template, logo });
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto modal-bg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Choose Invoice Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(templateStyles).map(([key, style]) => (
            <Card
              key={key}
              className={`
                cursor-pointer p-3 relative transition-all hover:scale-105 recent-invoices-card
                ${template === key ? 'ring-2 ring-offset-2 ' + style.activeClass : ''}
              `}
              onClick={() => setTemplate(key)}
            >
              <div className={`h-20 rounded-lg mb-2 ${style.previewClass}`} />
              <div className="text-center font-medium capitalize text-sm text-foreground">{key}</div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              className="text-foreground border-border hover:bg-muted"
            >
              <Upload className="w-4 h-4 mr-1" />
              {logo ? 'Change Logo' : 'Add Logo'}
            </Button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logo && (
              <div className="h-10 w-10 rounded border border-border p-1 bg-white">
                <img src={logo} alt="Logo preview" className="h-full w-full object-contain" />
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="sm"
            className={templateStyles[template].buttonClass}
          >
            <Download className="w-4 h-4 mr-1" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>

        {/* Full Invoice Preview */}
        <div className="border border-border rounded-lg overflow-hidden scale-90 origin-top bg-white">
          <div className={`${templateStyles[template].previewClass} p-6`}>
            {/* Header */}
            <div className={`flex justify-between items-start ${template === 'minimal' ? 'text-gray-900' : 'text-white'}`}>
              <div>
                {logo && (
                  <div className="bg-white p-2 rounded mb-4 w-32">
                    <img src={logo} alt="Logo" className="h-8 object-contain" />
                  </div>
                )}
                <h1 className="text-3xl font-bold">INVOICE</h1>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold mb-2">{invoice.invoiceNumber}</div>
                <div className="text-sm opacity-90">
                  <div>Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
                  <div>Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8">
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="border-l-4 pl-6" style={{ borderColor: template === 'minimal' ? '#374151' : templateStyles[template].buttonClass.split(' ')[0].replace('bg-', '#') }}>
                <h3 className={`text-lg font-bold mb-4 text-gray-900`}>FROM</h3>
                <div className="space-y-2">
                  <div className="font-semibold text-lg text-gray-900">Your Business Name</div>
                  <div className="text-gray-600">hello@business.com</div>
                  <div className="text-gray-600">123 Business Street</div>
                  <div className="text-gray-600">City, Country</div>
                </div>
              </div>
              <div className="border-l-4 pl-6" style={{ borderColor: template === 'minimal' ? '#374151' : templateStyles[template].buttonClass.split(' ')[0].replace('bg-', '#') }}>
                <h3 className={`text-lg font-bold mb-4 text-gray-900`}>TO</h3>
                <div className="space-y-2">
                  <div className="font-semibold text-lg text-gray-900">{invoice.clientName}</div>
                  <div className="text-gray-600">{invoice.clientEmail}</div>
                  <div className="text-gray-600">{invoice.projectName}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-12 rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className={`bg-gray-50 border-b border-gray-200`}>
                    <th className="text-left py-4 px-6 text-gray-900 font-semibold">Description</th>
                    <th className="text-center py-4 px-6 text-gray-900 font-semibold w-24">Quantity</th>
                    <th className="text-right py-4 px-6 text-gray-900 font-semibold w-32">Rate</th>
                    <th className="text-right py-4 px-6 text-gray-900 font-semibold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className={`border-b border-gray-200`}>
                      <td className="py-4 px-6 text-gray-900">{item.description}</td>
                      <td className="py-4 px-6 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-4 px-6 text-right text-gray-900">${Number(item.rate).toFixed(2)}</td>
                      <td className="py-4 px-6 text-right text-gray-900">${(Number(item.quantity) * Number(item.rate)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-3">
                <div className={`flex justify-between py-3 px-4 bg-gray-50 rounded-lg text-gray-900`}>
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">${Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between py-3 px-4 bg-gray-50 rounded-lg text-gray-900`}>
                  <span className="font-medium">Tax ({invoice.taxRate}%)</span>
                  <span className="font-semibold">${Number(invoice.taxAmount).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between p-4 rounded-lg text-white text-lg font-bold ${templateStyles[template].buttonClass.replace('hover:', '')}`}>
                  <span>TOTAL</span>
                  <span>${Number(invoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 mt-8 pt-8 border-t border-gray-200">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}