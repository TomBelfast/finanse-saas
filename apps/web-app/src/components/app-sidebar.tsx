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
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                        <span className="text-lg font-bold">F</span>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Finance</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.url}
                                        tooltip={item.title}
                                        onClick={() => history.push(item.url)}
                                    >
                                        <a href={item.url} onClick={(e) => e.preventDefault()}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
