'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Info, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const tgUser = tg.initDataUnsafe.user;
      setUser(tgUser);
      loadUserData(String(tgUser.id));
    } else {
      setUser({ first_name: 'Тест', id: 12345 });
      setLoading(false);
    }
  }, []);

  async function loadUserData(telegramId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (data) {
        const historyCodes = data.history ? data.history.split(',').filter(Boolean) : [];
        if (historyCodes.length > 0) {
          const { data: tracks } = await supabase
            .from('tracks')
            .select('*')
            .in('code', historyCodes.slice(0, 5))
            .order('updated_at', { ascending: false });

          setRecentTracks(tracks || []);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    { icon: Search, label: 'Поиск трека', href: '/tracks', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { icon: Info, label: 'Тарифы', href: '/info/prices', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { icon: TrendingUp, label: 'Статистика', href: '/dashboard', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { icon: User, label: 'Профиль', href: '/profile', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ];

  const statusColors: Record<string, string> = {
    waiting: 'bg-yellow-500',
    received: 'bg-blue-500',
    intransit: 'bg-indigo-500',
    border: 'bg-orange-500',
    warehouse: 'bg-purple-500',
    payment: 'bg-green-500',
    delivered: 'bg-emerald-500',
  };

  const statusLabels: Record<string, string> = {
    waiting: 'Ожидание',
    received: 'Получен',
    intransit: 'В пути',
    border: 'На границе',
    warehouse: 'На складе',
    payment: 'Оплата',
    delivered: 'Доставлен',
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Приветствие */}
      <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl">
            Добро пожаловать, {user?.first_name || 'Пользователь'}! 👋
          </CardTitle>
          <CardDescription className="text-white/90">
            Отслеживайте ваши грузы из Китая в Таджикистан
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="transition-all hover:shadow-md active:scale-[0.98] cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className={`rounded-full ${action.bgColor} p-4 mb-3 inline-flex`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Последние треки */}
      {recentTracks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Последние треки</h3>
            <Link href="/tracks">
              <Button variant="link" size="sm">Все треки</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentTracks.map((track) => (
              <Link
                key={track.id}
                href={`/tracks?code=${track.code}`}
              >
                <Card className="transition-all hover:shadow-md active:scale-[0.98]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{track.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {track.updated_at ? new Date(track.updated_at).toLocaleDateString('ru-RU') : ''}
                        </p>
                      </div>
                      <Badge className={`${statusColors[track.status] || 'bg-gray-500'} text-white`}>
                        {statusLabels[track.status] || track.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Если нет треков */}
      {recentTracks.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <CardTitle className="text-lg mb-2">У вас пока нет треков</CardTitle>
            <CardDescription className="mb-4">
              Начните с поиска по трек-номеру
            </CardDescription>
            <Link href="/tracks">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Найти трек
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
