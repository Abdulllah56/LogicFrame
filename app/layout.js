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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
