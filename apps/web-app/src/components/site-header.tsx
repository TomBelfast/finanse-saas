import React from "react"
import { SidebarTrigger } from "~/components/ui/sidebar"

export function SiteHeader({ children }: { children?: React.ReactNode }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="mr-2 h-4 w-[1px] bg-border" />
            </div>
            <div className="ml-auto flex items-center gap-2">
                {children}
            </div>
        </header>
    )
}
