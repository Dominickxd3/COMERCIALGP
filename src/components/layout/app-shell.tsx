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

const routeNames: Record<string, string> = {
  "/": "Inicio",
  "/familias": "Familias",
  "/subfamilias": "Subfamilias",
  "/productos": "Productos",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentTitle = routeNames[pathname] || "Pagina";
  const isHome = pathname === "/";

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-[#F8FAFC]">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Grupo Pecuario</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{isHome ? "Inicio" : currentTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pt-6 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
