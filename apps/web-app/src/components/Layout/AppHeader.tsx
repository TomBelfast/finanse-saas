import React from 'react';
import { Button } from '~/components/ui/button';
import { ThemeToggleCompact } from '~/components/ui/theme-toggle';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';

interface User {
  uid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | string[] | null;
}

interface AppHeaderProps {
    user: User | null | undefined;
    unreadNotifications: number;
    onOpenNotifications: () => void;
    onOpenProfile: () => void;
    title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    user,
    unreadNotifications,
    onOpenNotifications,
    onOpenProfile,
    title
}) => {
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(userActions.logOutUser());
        window.location.href = '/auth/login';
    };

    return (
        <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 shrink-0 justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold md:text-xl">{title || ''}</h1>
            </div>
            <div className="flex items-center gap-3">
                <ThemeToggleCompact />

                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-foreground" onClick={onOpenNotifications}>
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                            <Avatar className="h-9 w-9 cursor-pointer">
                                <AvatarImage src={Array.isArray(user?.avatarUrl) ? user.avatarUrl[0] : user?.avatarUrl || undefined} alt={user?.firstName} />
                                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onOpenProfile}>
                            Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                            Ustawienia
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            Wyloguj
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
