'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, Globe, Save, LogOut, Package, ChevronRight, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Загружаем пользователя из localStorage (после авторизации)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setPhone(parsed.phone || '');
      loadUserProfile(parsed.phone);
    }
  }, []);

  async function loadUserProfile(phone: string) {
    if (!phone) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (data) {
        setUserData(data);
        setName(data.name || '');
        setPhone(data.phone || phone);
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

      if (data) setMyTracks(data);
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
          phone,
          name, 
          lang 
        })
        .eq('phone', phone);

      if (error) throw error;

      setEditing(false);
      await loadUserProfile(phone);
      
      // Обновляем localStorage
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) tg.close();
    else window.location.href = '/';
  }

  // Генерируем адрес Китая
  const chinaAddress = userData?.name 
    ? `浙江省金华市义乌市荷叶塘工业区东青路87号一楼 库房1号门-khuroson-${userData.name.toLowerCase().replace(/\s+/g, '-')}-${(userData.phone || '').replace('+992', '')}`
    : `浙江省金华市义乌市荷叶塘工业区东青路87号一楼 库房1号门`;

  const copyAddress = async () => {
    try {
      const fullAddress = `联系人：khuroson-cargo\n联系电话：19524101010\n收货地址：${chinaAddress}`;
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="address">Адрес</TabsTrigger>
          <TabsTrigger value="tracks">Мои треки</TabsTrigger>
        </TabsList>

        {/* Вкладка Профиль */}
        <TabsContent value="profile">
          {/* Аватар и основная информация */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                    {(name || user.name || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{name || user.name || 'Пользователь'}</h3>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                  {userData?.client_id && (
                    <Badge className="mt-2">{userData.client_id}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Форма профиля */}
          <Card>
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>Управляйте вашими персональными данными</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Имя (латиницей)
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editing}
                    placeholder="Ivan Ivanov"
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Телефон
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    disabled
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Язык
                  </Label>
                  <Select value={lang} onValueChange={setLang} disabled={!editing}>
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

              <div className="mt-6 flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)} className="flex-1">
                    Редактировать
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" onClick={handleLogout} className="mt-6 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </TabsContent>

        {/* Вкладка Адрес Китая */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Адрес склада в Китае</CardTitle>
              <CardDescription>
                Используйте этот адрес для доставки грузов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
                <p><span className="text-muted-foreground">联系人：</span>khuroson-cargo</p>
                <p><span className="text-muted-foreground">联系电话：</span>19524101010</p>
                <p><span className="text-muted-foreground">收货地址：</span>{chinaAddress}</p>
              </div>

              <Button onClick={copyAddress} className="w-full" variant="outline">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать адрес
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Как использовать:</p>
                <p>1. Скопируйте полный адрес</p>
                <p>2. Отправьте продавцу в Китае</p>
                <p>3. Груз будет доставлен на наш склад</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка Мои треки */}
        <TabsContent value="tracks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Мои треки
              </CardTitle>
              <CardDescription>Треки которые вы искали недавно</CardDescription>
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
