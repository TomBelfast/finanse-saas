import React from 'react';
import {
    Home,
    Users,
    BarChart3,
    DollarSign,
    Settings,
    Lock,
    FileText,
    ShieldCheck,
    CreditCard,
    FileCheck
} from 'lucide-react';

export interface MenuItem {
    name: string;
    path: string;
    icon: React.ReactElement;
    label: string;
    onlyForAdmin?: boolean;
}

export const menuItems: MenuItem[] = [
    {
        name: 'home',
        path: '/home',
        icon: <Home className="h-4 w-4" />,
        label: 'menu.home',
    },
    {
        name: 'users',
        path: '/users',
        icon: <Users className="h-4 w-4" />,
        label: 'menu.users',
    },
    {
        name: 'reports',
        path: '/reports',
        icon: <BarChart3 className="h-4 w-4" />,
        label: 'menu.reports',
    },
    {
        name: 'subscription',
        path: '/subscription',
        icon: <DollarSign className="h-4 w-4" />,
        label: 'menu.subscription',
    },
    {
        name: 'settings',
        path: '/settings',
        icon: <Settings className="h-4 w-4" />,
        label: 'menu.settings',
    },
    {
        name: 'admin',
        path: '/admin',
        icon: <Lock className="h-4 w-4" />,
        label: 'menu.admin',
        onlyForAdmin: true,
    },
    {
        name: 'subscriptions',
        path: '/subscriptions',
        icon: <FileText className="h-4 w-4 text-teal-400" />,
        label: 'subscriptions',
    },
    {
        name: 'insurances',
        path: '/insurances',
        icon: <ShieldCheck className="h-4 w-4 text-teal-400" />,
        label: 'insurances',
    },
    {
        name: 'loans',
        path: '/loans',
        icon: <CreditCard className="h-4 w-4 text-teal-400" />,
        label: 'loans',
    },
    {
        name: 'finished',
        path: '/finished',
        icon: <FileCheck className="h-4 w-4 text-gray-500" />, // Użyłem FileCheck zamiast FileText dla odróżnienia
        label: 'finished',
    },
];
