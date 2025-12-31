"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../client/hooks/useAuth";
import { useToast } from "../../client/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../client/components/ui/card";
import { Button } from "../../client/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Download, Paperclip } from "lucide-react";
import { Badge } from "../../client/components/ui/badge";
import { TemplatePicker } from "../../client/components/template-picker";

export default function InvoiceView() {
  const { id } = useParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Demo Mode",
        description: "Currently viewing in demo mode",
      });
    }
  }, [authLoading, isAuthenticated, toast]);

  useEffect(() => {
    // Load invoice from localStorage
    const loadInvoice = () => {
      try {
        const invoices = JSON.parse(localStorage.getItem('invoicemaker_invoices') || '[]');
        const found = invoices.find(inv => inv.id === id);
        if (found) {
          setInvoice(found);
        } else {
          toast({
            title: "Error",
            description: "Invoice not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice",
          variant: "destructive",
        });
      }
    };

    if (id) {
      loadInvoice();
    }
  }, [id, toast]);

  const handleDownloadPDF = async () => {
    setShowTemplatePicker(true);
  };

  const handleGeneratePDF = async (templateData) => {
    if (!invoice) return;

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your invoice...",
    });

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { StyledInvoicePDF } = await import('../../client/components/styled-invoice-pdf');
      
      // Generate PDF with template
      const blob = await pdf(
        <StyledInvoicePDF 
          invoice={invoice}
          template={templateData.template}
          logo={templateData.logo}
        />
      ).toBlob();
      
      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Success",
        description: "Invoice PDF has been downloaded",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="status-badge status-paid">Paid</Badge>;
      case "pending":
        return <Badge className="status-badge status-pending">Pending</Badge>;
      case "overdue":
        return <Badge className="status-badge status-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <Link href="/invoicemaker/invoices">
            <Button variant="link">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/invoicemaker/invoices">
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadPDF} className="common-button">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-gray-500">
                <Paperclip className="w-5 h-5" />
                <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                #{invoice.invoiceNumber}
              </p>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Client and Company Information */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-gray-600">Billed To</h3>
              <div className="space-y-1">
                <p className="font-medium text-lg text-gray-800">{invoice.clientName}</p>
                <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                <p className="text-sm text-gray-500">{invoice.clientAddress}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-3 text-gray-600">Project Details</h3>
              <div className="space-y-1">
                <p className="font-medium text-lg text-gray-800">{invoice.projectName}</p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Date:</span> {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Due:</span> {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.rate.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">${(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800">${invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-gray-800">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2 text-gray-600">Notes</h3>
              <p className="text-sm text-gray-500">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Picker Dialog */}
      {showTemplatePicker && (
        <TemplatePicker
          invoice={invoice}
          onGenerate={handleGeneratePDF}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}