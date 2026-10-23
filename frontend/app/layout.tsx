import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbLabelProvider } from "@/components/breadcrumb-label";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/ui/toast";
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
          <ToastProvider>
            <BreadcrumbLabelProvider>
              <SidebarProvider className="h-svh overflow-hidden">
                <AppSidebar />
                <SidebarInset className="my-2 mr-2 overflow-y-auto rounded-xl border border-border bg-sidebar shadow-sm">
                  <AppHeader />
                  {children}
                </SidebarInset>
              </SidebarProvider>
            </BreadcrumbLabelProvider>
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}