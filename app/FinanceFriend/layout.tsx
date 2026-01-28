// app/financefriend/layout.tsx
import '../../app/financefriend/styles/financefriend.css'
import Header from './components/layout/Header'

export const metadata = {
  title: 'FinanceFriend — Personal Finance Dashboard',
  description: 'Track spending, bills, budgets and savings goals with FinanceFriend.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'FinanceFriend — Personal Finance Dashboard',
    description: 'Track spending, bills, budgets and savings goals with FinanceFriend.',
    url: 'https://logicframe.vercel.app/financefriend',
    images: ['/og-financefriend.png']
  },
  icons: { icon: '/favicon.ico' }
};

export default function FinanceFriendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinanceFriend",
    url: "https://logicframe.vercel.app/financefriend",
    description: "Track spending, bills, budgets and savings goals with FinanceFriend.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Background gradients matching landing page */}
      <div className="fixed inset-0 bg-gradient-radial from-[rgba(0,217,255,0.08)] from-0% to-transparent to-50% via-[rgba(0,217,255,0.06)] via-80% z-[-1] pointer-events-none"></div>
      <div className="fixed w-[300px] h-[300px] bg-[rgba(0,217,255,0.3)] rounded-full blur-[80px] opacity-30 top-[10%] left-[10%] animate-float z-[-1] pointer-events-none"></div>
      <div className="fixed w-[400px] h-[400px] bg-[rgba(0,217,255,0.2)] rounded-full blur-[80px] opacity-30 bottom-[10%] right-[10%] animate-float animation-delay-7000 z-[-1] pointer-events-none"></div>

      <div className="finance-friend-app relative z-0">
        <Header />
        <main>
          {children}
        </main>
      </div>
    </>
  )
} 