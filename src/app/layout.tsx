import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Advent of SQL · A little query. A little Christmas magic.", template: "%s · Advent of SQL" }, description: "Twelve cozy SQL challenges in Santa's workshop. Learn by solving, one star at a time." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en"><body>{children}</body></html>;
}
