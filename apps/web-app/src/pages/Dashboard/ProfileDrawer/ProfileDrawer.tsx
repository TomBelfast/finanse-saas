import React, { FunctionComponent } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppStore, getUserInitial, userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import { useUser } from '@clerk/clerk-react';
import { LogOut, User } from 'lucide-react';

interface OwnProps {
  isOpen: boolean;
  toggleDrawer: () => void;
}

type Props = OwnProps;

const ProfileDrawer: FunctionComponent<Props> = ({ toggleDrawer, isOpen }) => {
  const { t } = useTranslation('dashboard');
  const { details } = useSelector((store: AppStore) => store.user);
  const { user } = useUser();
  const dispatch = useAppDispatch();

  const logoutUser = async () => {
    dispatch(userActions.logOutUser());
    // Perform any other cleanup or redirection if needed
    window.location.href = '/auth/login';
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleDrawer}>
      <SheetContent className="w-[350px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{t<string>('profileDrawer.title')}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="rounded-lg text-lg">
                  {getUserInitial(`${details?.firstName} ${details?.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold">
                {details?.firstName || ''} {details?.lastName || ''}
              </h4>
              <p className="text-sm text-muted-foreground">{details?.email}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={logoutUser} variant="destructive" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              {t<string>('logout')}
            </Button>
          </div>
        </div>

        <Separator />

      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
