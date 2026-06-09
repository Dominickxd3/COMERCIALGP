"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Título de ruta actual dinámico muy simple para el Topbar
    const pageTitles: Record<string, string> = {
        "/": "Inicio",
        "/familias": "Familias",
        "/subfamilias": "Subfamilias",
        "/productos": "Productos"
    };

    const currentTitle = pageTitles[pathname] || "Página";

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-sm font-medium">{currentTitle}</h1>
                    </div>
                </header>

                {/* Aquí se renderizarán tus rutas */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}