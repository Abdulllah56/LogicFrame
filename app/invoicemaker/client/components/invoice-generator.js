import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { useToast } from '../hooks/use-toast'
export function InvoiceGenerator({ initialData, onSave }) {
  const [template, setTemplate] = useState(initialData?.template || 'modern');
  const [logo, setLogo] = useState(initialData?.logo || '');
  const [invoiceData, setInvoiceData] = useState(initialData?.invoiceData || {
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    from: {
      name: 'Your Business Name',
      email: 'hello@business.com',
      address: '123 Business St',
      city: 'City, Country',
      phone: '+1 234 567 8900'
    },
    to: {
      name: 'Client Name',
      email: 'client@email.com',
      address: '456 Client Ave',
      city: 'City, Country'
    },
    items: [
      { description: 'Service/Product Description', quantity: 1, rate: 0 }
    ],
    taxRate: 0,
    notes: 'Thank you for your business!'
  });

  const { toast } = useToast();
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : parseFloat(value) || 0
    };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = () => {
    onSave({
      template,
      logo,
      invoiceData
    });
    toast({
      title: "Success",
      description: "Invoice template saved successfully",
    });
  };

  // Template Styles
  const templateStyles = {
    modern: {
      container: 'bg-white',
      header: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8',
      accent: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    classic: {
      container: 'bg-white border-4 border-gray-800',
      header: 'bg-gray-800 text-white p-8',
      accent: 'text-gray-800',
      button: 'bg-gray-800 hover:bg-gray-900'
    },
    minimal: {
      container: 'bg-white',
      header: 'border-b-2 border-gray-200 p-8',
      accent: 'text-gray-900',
      button: 'bg-gray-900 hover:bg-gray-800'
    }
  };

  const currentStyle = templateStyles[template];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Controls */}
      <Card className="max-w-4xl mx-auto mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={template === 'modern' ? 'default' : 'outline'}
              onClick={() => setTemplate('modern')}
            >
              Modern
            </Button>
            <Button
              variant={template === 'classic' ? 'default' : 'outline'}
              onClick={() => setTemplate('classic')}
            >
              Classic
            </Button>
            <Button
              variant={template === 'minimal' ? 'default' : 'outline'}
              onClick={() => setTemplate('minimal')}
            >
              Minimal
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Logo
            </Button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button onClick={handleSave}>
              <Download className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice */}
      <Card className={`max-w-4xl mx-auto ${currentStyle.container}`}>
        {/* Header */}
        <div className={currentStyle.header}>
          <div className="flex justify-between items-start">
            <div>
              {logo && <img src={logo} alt="Logo" className="h-16 mb-4 bg-white p-2 rounded" />}
              <h1 className="text-4xl font-bold">INVOICE</h1>
            </div>
            <div className="text-right">
              <Input
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                className="bg-transparent border-b text-right text-xl font-semibold mb-2"
              />
              <div className="text-sm opacity-90">
                <div>
                  Date: 
                  <Input
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                    className="bg-transparent border-b"
                  />
                </div>
                <div>
                  Due: 
                  <Input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    className="bg-transparent border-b"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* From/To Section */}
        <div className="grid grid-cols-2 gap-8 p-8">
          <div>
            <h3 className={`font-bold mb-2 ${currentStyle.accent}`}>FROM:</h3>
            <Input
              value={invoiceData.from.name}
              onChange={(e) => setInvoiceData({...invoiceData, from: {...invoiceData.from, name: e.target.value}})}
              className="mb-2"
              placeholder="Your Business Name"
            />
            <Input
              value={invoiceData.from.email}
              onChange={(e) => setInvoiceData({...invoiceData, from: {...invoiceData.from, email: e.target.value}})}
              className="mb-2"
              placeholder="your@email.com"
            />
            <Input
              value={invoiceData.from.address}
              onChange={(e) => setInvoiceData({...invoiceData, from: {...invoiceData.from, address: e.target.value}})}
              className="mb-2"
              placeholder="Street Address"
            />
            <Input
              value={invoiceData.from.city}
              onChange={(e) => setInvoiceData({...invoiceData, from: {...invoiceData.from, city: e.target.value}})}
              className="mb-2"
              placeholder="City, Country"
            />
            <Input
              value={invoiceData.from.phone}
              onChange={(e) => setInvoiceData({...invoiceData, from: {...invoiceData.from, phone: e.target.value}})}
              placeholder="Phone Number"
            />
          </div>
          
          <div>
            <h3 className={`font-bold mb-2 ${currentStyle.accent}`}>TO:</h3>
            <Input
              value={invoiceData.to.name}
              onChange={(e) => setInvoiceData({...invoiceData, to: {...invoiceData.to, name: e.target.value}})}
              className="mb-2"
              placeholder="Client Name"
            />
            <Input
              value={invoiceData.to.email}
              onChange={(e) => setInvoiceData({...invoiceData, to: {...invoiceData.to, email: e.target.value}})}
              className="mb-2"
              placeholder="client@email.com"
            />
            <Input
              value={invoiceData.to.address}
              onChange={(e) => setInvoiceData({...invoiceData, to: {...invoiceData.to, address: e.target.value}})}
              className="mb-2"
              placeholder="Client Address"
            />
            <Input
              value={invoiceData.to.city}
              onChange={(e) => setInvoiceData({...invoiceData, to: {...invoiceData.to, city: e.target.value}})}
              placeholder="Client City, Country"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 pb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 font-semibold">Description</th>
                <th className="text-center py-2 font-semibold w-20">Qty</th>
                <th className="text-right py-2 font-semibold w-28">Rate</th>
                <th className="text-right py-2 font-semibold w-28">Amount</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </td>
                  <td className="text-center">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="text-center"
                      min="0"
                    />
                  </td>
                  <td className="text-right">
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      className="text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="text-right font-semibold">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <Button
            variant="ghost"
            onClick={addItem}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Totals */}
        <div className="px-8 pb-8">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Subtotal:</span>
                <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="flex items-center gap-2">
                  Tax 
                  <Input
                    type="number"
                    value={invoiceData.taxRate}
                    onChange={(e) => setInvoiceData({...invoiceData, taxRate: parseFloat(e.target.value) || 0})}
                    className="w-16 text-center"
                    min="0"
                    step="0.1"
                  />%
                </span>
                <span className="font-semibold">${calculateTax().toFixed(2)}</span>
              </div>
              <div className={`flex justify-between py-3 text-xl font-bold ${currentStyle.accent}`}>
                <span>TOTAL:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-8 pb-8">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <Textarea
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
            className="w-full"
            rows={3}
            placeholder="Payment terms, thank you message, etc."
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 text-center text-sm text-gray-600">
          <p>Made with InvoiceMaster</p>
        </div>
      </Card>
    </div>
  );
}