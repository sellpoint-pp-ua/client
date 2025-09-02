import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CartDrawerProvider from "@/components/cart/CartDrawerProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Sell Point - Маркетплейс України",
  description: "Найбільший маркетплейс України",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <CartDrawerProvider>
            {children}
          </CartDrawerProvider>
        </div>
      </body>
    </html>
  );
}
