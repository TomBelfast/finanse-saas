import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { menuItems } from '~/config/menuItems';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAppDispatch } from '~/initializeStore';
import { userActions } from '@akademiasaas/shared';

interface AppSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isAdmin?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, setCollapsed, isAdmin }) => {
    const { t } = useTranslation(['dashboard']);
    const dispatch = useAppDispatch();
    const location = useLocation();

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        dispatch(userActions.logOutUser());
        // Redirect handled by routes or auth checker usually, but force refresh or redirect here helps
        window.location.href = '/auth/login';
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-card border-r transition-all duration-300 relative z-10",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="flex items-center justify-between p-4 border-b h-16 shrink-0">
                {!collapsed && <span className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">SaaS App</span>}
                <Button variant="ghost" size="icon" onClick={toggleCollapse} className={cn("ml-auto", collapsed && "mx-auto")}>
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-muted">
                <nav className="grid gap-1 px-2">
                    {menuItems.map((item) => {
                        if (item.onlyForAdmin && !isAdmin) return null;

                        // Check if active (simple startsWith for subroutes support if needed, or exact match)
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground group relative",
                                    isActive ? "bg-primary/10 text-primary" : "text-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? t(item.label) : undefined}
                            >
                                {React.cloneElement(item.icon as React.ReactElement, {
                                    className: cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary" : "text-foreground")
                                })}
                                {!collapsed && <span>{t(item.label)}</span>}
                                {collapsed && isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                )}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t mt-auto shrink-0">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                        collapsed && "justify-center px-0"
                    )}
                    onClick={handleLogout}
                    title={collapsed ? "Wyloguj" : undefined}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="ml-2">Wyloguj</span>}
                </Button>
            </div>
        </div>
    );
};
