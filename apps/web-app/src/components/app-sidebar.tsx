import * as React from "react"
import {
    Home,
    CreditCard,
    Wallet,
    ShieldCheck,
    BarChart3,
    Settings,
    FileCheck,
    Brain,
} from "lucide-react"
import { useLocation, useHistory } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "~/lib/utils"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "~/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation('dashboard')
    const history = useHistory()
    const location = useLocation()

    const items = [
        { title: t('menu.dashboard', 'Dashboard'), url: "/", icon: Home },
        { title: t('menu.loans', 'Loans'), url: "/loans", icon: CreditCard },
        { title: t('menu.finances', 'Finances'), url: "/finances", icon: Wallet },
        { title: t('menu.insurances', 'Insurances'), url: "/insurances", icon: ShieldCheck },
        { title: t('menu.ai', 'AI'), url: "/ai", icon: Brain },
        { title: t('menu.reports', 'Reports'), url: "/reports", icon: BarChart3 },
        { title: t('menu.finished', 'Zakończone'), url: "/finished", icon: FileCheck },
        { title: t('menu.settings', 'Settings'), url: "/settings", icon: Settings },
    ]

    return (
        <Sidebar variant="inset" {...props} className="border-r border-border/50">
            <SidebarHeader className="h-[--header-height] flex justify-center">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
                        <span className="text-xl font-black italic">F</span>
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Finanse Saas</span>
                        <span className="truncate text-[10px] uppercase tracking-widest text-muted-foreground font-medium">System Zarządzania</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70 mb-2">Główna nawigacja</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {items.map((item) => {
                                const active = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.title}
                                            onClick={() => history.push(item.url)}
                                            className={cn(
                                                "h-11 px-4 rounded-xl transition-all duration-200 group",
                                                active
                                                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 font-semibold"
                                                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <a href={item.url} onClick={(e) => e.preventDefault()} className="flex items-center gap-3">
                                                <item.icon className={cn(
                                                    "h-5 w-5 transition-transform duration-200",
                                                    !active && "group-hover:scale-110"
                                                )} />
                                                <span className="text-sm tracking-tight">{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
