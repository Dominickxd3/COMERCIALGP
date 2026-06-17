"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { HeaderActionsProvider, useHeaderActions } from "./header-actions-context";

const routeNames: Record<string, string> = {
  "/": "Inicio",
};

function AppHeader() {
  const pathname = usePathname();
  const currentTitle = routeNames[pathname] || "Pagina";
  const isHome = pathname === "/";
  const { actions } = useHeaderActions();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur">
      <div className="flex flex-1 items-center justify-between gap-2 px-4 lg:px-6 w-full">
        {/* Left: trigger + logo/title + desktop breadcrumb (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Desktop breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Grupo Pecuario</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isHome ? "Inicio" : currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: page-injected actions */}
        {actions ? (
          <div className="flex flex-1 md:flex-none items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="hidden md:block peer" data-variant="inset" data-state="expanded">
        <AppSidebar />
      </div>
      <SidebarInset className="bg-[#F8FAFC]">
        <HeaderActionsProvider>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 pt-6 lg:p-6">{children}</main>
        </HeaderActionsProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
