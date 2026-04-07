'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTracks: 0,
    activeTracks: 0,
    deliveredTracks: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [tracksRes, usersRes] = await Promise.all([
        supabase.from('tracks').select('id, status'),
        supabase.from('users').select('id'),
      ]);

      const tracks = tracksRes.data || [];
      const users = usersRes.data || [];

      setStats({
        totalTracks: tracks.length,
        activeTracks: tracks.filter(t => !['delivered'].includes(t.status)).length,
        deliveredTracks: tracks.filter(t => t.status === 'delivered').length,
        totalUsers: users.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Всего треков',
      value: stats.totalTracks,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Активных',
      value: stats.activeTracks,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
    {
      title: 'Доставлено',
      value: stats.deliveredTracks,
      icon: AlertCircle,
      color: 'text-green-500',
    },
    {
      title: 'Пользователей',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Статистика</h2>
        <p className="text-muted-foreground">
          Общая информация о системе
        </p>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Быстрые ссылки */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Переход к основным разделам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/tracks"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">Поиск треков</p>
                <p className="text-sm text-muted-foreground">
                  Найти по номеру
                </p>
              </div>
              <Badge variant="outline">Перейти</Badge>
            </Link>
            <Link
              href="/ai-chat"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">AI-ассистент</p>
                <p className="text-sm text-muted-foreground">
                  Задать вопрос
                </p>
              </div>
              <Badge variant="outline">Перейти</Badge>
            </Link>
            <Link
              href="/info/prices"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">Тарифы</p>
                <p className="text-sm text-muted-foreground">
                  Стоимость доставки
                </p>
              </div>
              <Badge variant="outline">Перейти</Badge>
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">Профиль</p>
                <p className="text-sm text-muted-foreground">
                  Настройки аккаунта
                </p>
              </div>
              <Badge variant="outline">Перейти</Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
