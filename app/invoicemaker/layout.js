export default function InvoiceMakerLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1">{children}</div>
    </div>
  );
}