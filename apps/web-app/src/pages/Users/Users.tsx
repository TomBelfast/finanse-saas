import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '~/components/ui/alert-dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// Validation schema for user form
const userSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  role: z.enum(['admin', 'user', 'editor']),
  status: z.enum(['active', 'inactive', 'pending']),
});

type UserFormValues = z.infer<typeof userSchema>;

const Users: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  // Mock data load (replace with real API later)
  useEffect(() => {
    const mock: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2023-06-15 09:23',
        createdAt: '2023-01-10',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        status: 'active',
        lastLogin: '2023-06-14 15:45',
        createdAt: '2023-02-20',
      },
      {
        id: '3',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        role: 'editor',
        status: 'inactive',
        lastLogin: '2023-05-30 11:20',
        createdAt: '2023-03-05',
      },
    ];
    setTimeout(() => {
      setUsers(mock);
      setLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    setDialogMode('add');
    setEditingUser(null);
    reset();
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setDialogMode('edit');
    setEditingUser(user);
    reset({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: UserFormValues) => {
    if (dialogMode === 'add') {
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success(t('dashboard:users.userAdded'));
    } else if (dialogMode === 'edit' && editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u))
      );
      toast.success(t('dashboard:users.userUpdated'));
    }
    setIsDialogOpen(false);
  };

  const confirmDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(t('dashboard:users.userDeleted'));
    setDeletingUserId(null);
  };

  return (
    <div className="container mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard:users.title')}</h2>
        <Button onClick={openAddDialog} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          {t('dashboard:users.addUser')}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder={t('dashboard:users.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        {/* Additional filters can be added here using Select components */}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dashboard:users.columns.user')}</TableHead>
            <TableHead>{t('dashboard:users.columns.role')}</TableHead>
            <TableHead>{t('dashboard:users.columns.status')}</TableHead>
            <TableHead>{t('dashboard:users.columns.lastLogin')}</TableHead>
            <TableHead>{t('dashboard:users.columns.createdAt')}</TableHead>
            <TableHead>{t('common:actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {t(`dashboard:users.roles.${user.role}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'}>
                  {t(`dashboard:users.statuses.${user.status}`)}
                </Badge>
              </TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog open={deletingUserId === user.id} onOpenChange={(open) => setDeletingUserId(open ? user.id : null)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('dashboard:users.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('dashboard:users.deleteWarning')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmDelete(user.id)}>{t('common:delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? t('dashboard:users.addUser') : t('dashboard:users.editUser')}</DialogTitle>
            <DialogDescription>{dialogMode === 'add' ? t('dashboard:users.addUserDescription') : t('dashboard:users.editUserDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">{t('common:name')}</label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message?.toString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">{t('common:email')}</label>
              <Input id="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message?.toString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="role">{t('dashboard:users.columns.role')}</label>
              <Select onValueChange={(val) => (register('role').onChange({ target: { value: val } } as any))} defaultValue={dialogMode === 'edit' && editingUser ? editingUser.role : undefined}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder={t('common:select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('dashboard:users.roles.admin')}</SelectItem>
                  <SelectItem value="editor">{t('dashboard:users.roles.editor')}</SelectItem>
                  <SelectItem value="user">{t('dashboard:users.roles.user')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message?.toString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="status">{t('dashboard:users.columns.status')}</label>
              <Select onValueChange={(val) => (register('status').onChange({ target: { value: val } } as any))} defaultValue={dialogMode === 'edit' && editingUser ? editingUser.status : undefined}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder={t('common:select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('dashboard:users.statuses.active')}</SelectItem>
                  <SelectItem value="inactive">{t('dashboard:users.statuses.inactive')}</SelectItem>
                  <SelectItem value="pending">{t('dashboard:users.statuses.pending')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message?.toString()}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common:cancel')}</Button>
              <Button type="submit">{dialogMode === 'add' ? t('common:add') : t('common:save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
