import InvoiceNav from "./client/components/invoice-nav";

export default function InvoiceMakerLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <InvoiceNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}