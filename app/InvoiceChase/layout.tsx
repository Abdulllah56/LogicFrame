import './src/index.css';

export const metadata = {
    title: 'Invoice Chase',
    description: 'Invoice Management Application',
};

export default function InvoiceChaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="invoice-chase-app h-full w-full">
            {children}
        </div>
    );
}
