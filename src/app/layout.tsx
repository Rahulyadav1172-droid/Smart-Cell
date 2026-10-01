import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'स्मार्ट सेल अयोध्या | पुलिस कमान पोर्टल (C-Plan & e-Office Vault)',
  description: 'उत्तर प्रदेश पुलिस जनपद अयोध्या - संभ्रांत नागरिक C-Plan डाटाबेस एवं e-Office VPN क्रेडेंशियल वॉल्ट',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="h-full dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
