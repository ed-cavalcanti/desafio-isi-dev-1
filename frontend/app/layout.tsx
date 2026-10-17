import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-sans",
});

export const metadata = {
  title: "App",
  description: "Desafio ISI Dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          <SidebarProvider className="h-svh overflow-hidden">
            <AppSidebar />
            <SidebarInset className="my-2 mr-2 overflow-y-auto rounded-xl border border-border bg-sidebar shadow-sm">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}