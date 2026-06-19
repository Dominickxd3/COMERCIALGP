import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComercialGP",
  description: "Dashboard comercial",
  icons: {
    icon: [
      { url: "/logo-gp.png?v=2", type: "image/png" },
    ],
    shortcut: ["/logo-gp.png?v=2"],
    apple: [
      { url: "/logo-gp.png?v=2", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
