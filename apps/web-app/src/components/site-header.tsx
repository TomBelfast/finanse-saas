import React from "react"
import { SidebarTrigger } from "~/components/ui/sidebar"

export function SiteHeader({ children }: { children?: React.ReactNode }) {
    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4 transition-[width,height,background-color] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 hover:bg-accent/50 transition-colors" />
                <div className="mr-2 h-4 w-[1px] bg-border/60" />
            </div>
            <div className="ml-auto flex items-center gap-4">
                {children}
            </div>
        </header>
    )
}
