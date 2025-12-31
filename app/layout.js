import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LogicFrame - Build Smarter, Scale Faster",
  description:
    "LogicFrame helps developers and teams build, deploy, and scale modern apps faster with AI-powered tools and analytics.",
  keywords: "LogicFrame, SaaS, developer tools, web app, productivity, AI",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      '/favicon.ico'
    ],
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: "LogicFrame - Build Smarter, Scale Faster",
    description:
      "Empower your workflow with LogicFrame’s AI-driven development tools and seamless integrations.",
    url: "https://logicframe.vercel.app",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicFrame - Build Smarter, Scale Faster",
    description: "AI-powered tools for developers and teams.",
    images: ["/og-image.png"],
  },
};

import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script src="https://cdn.jsdelivr.net/npm/colorthief@2.4.0/dist/color-thief.umd.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
