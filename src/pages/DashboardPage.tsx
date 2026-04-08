import { useAppLanguage } from '../hooks/useLanguage';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../lib/supabase/client';

export default function DashboardPage() {
  const { t } = useAppLanguage();
  const [stats, setStats] = useState({ totalTracks: 0, activeTracks: 0, deliveredTracks: 0, totalUsers: 0 });
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
    } catch (error) { console.error('Error loading stats:', error); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="container mx-auto px-4 py-6 max-w-4xl"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Статистика</h2><p className="text-muted-foreground">Общая информация о системе</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { title: t.totalTracks, value: stats.totalTracks, icon: Package, color: 'text-blue-500' },
          { title: 'Активных', value: stats.activeTracks, icon: TrendingUp, color: 'text-orange-500' },
          { title: t.deliveredCount, value: stats.deliveredTracks, icon: AlertCircle, color: 'text-green-500' },
          { title: 'Пользователей', value: stats.totalUsers, icon: Users, color: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{stat.title}</CardTitle><stat.icon className={`h-4 w-4 ${stat.color}`} /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Быстрые действия</CardTitle><CardDescription>Переход к основным разделам</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { title: 'Поиск треков', desc: 'Найти по номеру', href: '/tracks' },
              { title: 'Тарифы', desc: 'Стоимость доставки', href: '/info/prices' },
              { title: 'Профиль', desc: 'Настройки аккаунта', href: '/profile' },
            ].map((item) => (
              <Link key={item.href} to={item.href} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                <Badge variant="outline">Перейти</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
