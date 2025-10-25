"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../client/hooks/useAuth";
import { useToast } from "../../client/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../client/components/ui/card";
import { Button } from "../../client/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Overdue</Badge>;
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
          <Link href="/invoicemaker/invoices" className="text-blue-500 hover:text-blue-700">
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
        <Button onClick={handleDownloadPDF} className="flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Invoice #{invoice.invoiceNumber}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created: {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Client and Company Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.clientName}</p>
                <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                <p className="text-sm text-muted-foreground">{invoice.clientAddress}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Project Details</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.projectName}</p>
                <p className="text-sm text-muted-foreground">Due: {format(new Date(invoice.dueDate), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-4">Invoice Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">${item.rate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">${item.quantity * item.rate}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Total</td>
                    <td className="px-6 py-3 text-right text-sm font-bold">${invoice.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
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