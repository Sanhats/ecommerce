import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: "Showroom Store",
  description: "Tienda online y gestión de showroom",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><CartProvider>{children}</CartProvider></body></html>;
}
