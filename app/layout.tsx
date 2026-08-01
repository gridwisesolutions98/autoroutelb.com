import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Footer from "./footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "AutoRoute LB — Car Rentals in Lebanon",
    template: "%s | AutoRoute LB",
  },
  description: "Rent a car or list your fleet with trusted agencies across Lebanon.",
  openGraph: {
    siteName: "AutoRoute LB",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const LOCALE_BOOTSTRAP = `
(function() {
  var m = document.cookie.match(/(?:^|; )locale=([^;]*)/);
  if (m && decodeURIComponent(m[1]) === "ar") {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="locale-bootstrap" strategy="beforeInteractive">
          {LOCALE_BOOTSTRAP}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
