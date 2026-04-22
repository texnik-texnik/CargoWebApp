import React, { useEffect, useState } from 'react';
import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { User, Shield, ShieldOff, Search, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

interface UserData {
  id: string;
  telegram_id: string;
  phone: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { t } = useAppLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/admin?action=get-users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      setProcessingId(userId);
      const res = await authenticatedFetch('/api/admin?action=toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
      }
    } catch (e) {
      console.error('Error toggling admin status:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.phone || '').includes(searchTerm) ||
    (u.telegram_id || '').includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.users}</h2>
        <p className="text-muted-foreground">{t.usersDesc}</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchByCode || "Поиск пользователя..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">Имя / ID</th>
                    <th className="pb-3 pr-4">Телефон</th>
                    <th className="pb-3 pr-4 text-center">Статус</th>
                    <th className="pb-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{user.name || 'Без имени'}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.telegram_id}</div>
                      </td>
                      <td className="py-3 pr-4">
                        {user.phone || '—'}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {user.is_admin ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Админ
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Юзер
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          disabled={processingId === user.id}
                        >
                          {processingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.is_admin ? (
                            <ShieldOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Пользователи не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
