'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, Globe, Save, LogOut, Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState('ru');
  const [saving, setSaving] = useState(false);
  const [myTracks, setMyTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
      loadUserProfile(String(tg.initDataUnsafe.user.id));
    }
  }, []);

  async function loadUserProfile(telegramId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('User not found, creating new user...');
        const newUser = {
          telegram_id: telegramId,
          name: user?.first_name || 'Пользователь',
          phone: '',
          lang: 'ru',
        };

        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return;
        }

        setUserData(createdUser);
        setName(createdUser.name || '');
        setPhone(createdUser.phone || '');
        setLang(createdUser.lang || 'ru');
        await loadMyTracks(createdUser.history);
      } else if (data) {
        setUserData(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setLang(data.lang || 'ru');
        await loadMyTracks(data.history);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function loadMyTracks(history: string) {
    if (!history) return;
    
    setLoadingTracks(true);
    try {
      const trackCodes = history.split(',').filter(Boolean);
      if (trackCodes.length === 0) return;

      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .in('code', trackCodes.slice(0, 10));

      if (data) {
        setMyTracks(data);
      }
    } catch (error) {
      console.error('Error loading my tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  }

  async function handleSave() {
    if (!user || !name.trim() || !phone.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ 
          telegram_id: user.id,
          name, 
          phone, 
          lang 
        })
        .eq('telegram_id', user.id);

      if (error) throw error;

      setEditing(false);
      // Перезагружаем профиль
      await loadUserProfile(String(user.id));
    } catch (error: any) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.close();
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

  const statusColors: Record<string, string> = {
    waiting: 'bg-yellow-500',
    received: 'bg-blue-500',
    intransit: 'bg-indigo-500',
    border: 'bg-orange-500',
    warehouse: 'bg-purple-500',
    payment: 'bg-green-500',
    delivered: 'bg-emerald-500',
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Профиль</h2>
        <p className="text-muted-foreground">
          {userData?.client_id ? `Клиент: ${userData.client_id}` : 'Управление профилем'}
        </p>
      </div>

      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="tracks">Мои треки</TabsTrigger>
        </TabsList>

        {/* Вкладка Профиль */}
        <TabsContent value="profile">

        {/* Аватар */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photo_url} alt={user.first_name} />
                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                  {user.first_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {user.first_name} {user.last_name || ''}
                </h3>
                <p className="text-sm text-muted-foreground">
                  ID: {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Форма профиля */}
        <Card>
          <CardHeader>
            <CardTitle>Информация профиля</CardTitle>
            <CardDescription>
              Управляйте вашими персональными данными
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Имя */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Имя
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  placeholder="Ваше имя"
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Телефон */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Телефон
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  placeholder="+992 XXX XX XX XX"
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Язык */}
              <div>
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Язык
                </Label>
                <Select
                  value={lang}
                  onValueChange={setLang}
                  disabled={!editing}
                >
                  <SelectTrigger id="language" className="mt-2">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="tj">Тоҷикӣ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кнопки */}
            <div className="mt-6 flex gap-2">
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  className="flex-1"
                >
                  Редактировать
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client ID */}
        {userData?.client_id && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Client ID</p>
              <p className="text-lg font-mono font-bold">{userData.client_id}</p>
            </CardContent>
          </Card>
        )}

        {/* Кнопка выхода */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="mt-6 w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Закрыть приложение
        </Button>
        </TabsContent>

        {/* Вкладка Мои треки */}
        <TabsContent value="tracks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Мои треки
              </CardTitle>
              <CardDescription>
                Треки которые вы искали недавно
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTracks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : myTracks.length > 0 ? (
                <div className="space-y-2">
                  {myTracks.map((track) => (
                    <Link
                      key={track.id}
                      href={`/tracks?code=${track.code}`}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="font-semibold">{track.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {track.updated_at ? new Date(track.updated_at).toLocaleDateString('ru-RU') : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColors[track.status] || 'bg-gray-500'} text-white`}>
                          {statusLabels[track.status] || track.status}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">У вас пока нет треков</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Начните с поиска по трек-номеру
                  </p>
                  <Link href="/tracks">
                    <Button>Найти трек</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
