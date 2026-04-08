import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Globe, Save, LogOut, Package, ChevronRight, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase } from '../lib/supabase/client';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState('ru');
  const [saving, setSaving] = useState(false);
  const [myTracks, setMyTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setPhone(parsed.phone || '');
      setIsAuthenticated(true);
      loadUserProfile(parsed.phone);
    } else {
      // Пользователь не авторизован
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserProfile(p: string) {
    if (!p) {
      console.error('No phone provided');
      return;
    }
    try {
      console.log('Loading profile for phone:', p);
      const { data, error } = await supabase.from('users').select('*').eq('phone', p).single();
      
      if (error) {
        console.error('Supabase error:', error.message, error.code);
        // Если пользователь не найден - создаем минимальный профиль
        if (error.code === 'PGRST116') {
          setUserData({ phone: p, name: '', lang: 'ru' });
          return;
        }
      }
      
      if (data) {
        console.log('Profile loaded:', data);
        setUserData(data);
        setName(data.name || '');
        setLang(data.lang || 'ru');
        await loadMyTracks(data.history);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback: показываем минимальный профиль
      setUserData({ phone: p, name: '', lang: 'ru' });
    }
  }

  async function loadMyTracks(history: string) {
    if (!history) return;
    setLoadingTracks(true);
    try {
      const codes = history.split(',').filter(Boolean);
      if (codes.length === 0) return;
      const { data } = await supabase.from('tracks').select('*').in('code', codes.slice(0, 10));
      if (data) setMyTracks(data);
    } catch (error) { console.error('Error loading tracks:', error); }
    finally { setLoadingTracks(false); }
  }

  async function handleSave() {
    if (!phone || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({ name: name.trim(), lang }).eq('phone', phone);
      if (error) throw error;
      setEditing(false); await loadUserProfile(phone);
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), phone, name: name.trim(), lang }));
    } catch (error: any) { console.error('Error saving:', error); }
    finally { setSaving(false); }
  }

  function handleLogout() {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) tg.close(); else window.location.href = '/';
  }

  const phoneWithoutCountry = (userData?.phone || '').replace('+992', '').replace(/\s/g, '');
  const nameSlug = (userData?.name || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const chinaAddress = `浙江省金华市义乌市荷叶塘工业区东青路87号一楼 库房1号门-Khuroson-${nameSlug}-${phoneWithoutCountry}`;
  const fullAddress = `联系人：khuroson-cargo\n联系电话：19524101010\n收货地址：${chinaAddress}`;

  const copyAddress = async () => {
    try { await navigator.clipboard.writeText(fullAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { console.error('Copy failed:', e); }
  };

  const statusLabels: Record<string, string> = { waiting: 'Ожидание', received: 'Получен', intransit: 'В пути', border: 'На границе', warehouse: 'На складе', payment: 'Оплата', delivered: 'Доставлен' };
  const statusColors: Record<string, string> = { waiting: 'bg-yellow-500', received: 'bg-blue-500', intransit: 'bg-indigo-500', border: 'bg-orange-500', warehouse: 'bg-purple-500', payment: 'bg-green-500', delivered: 'bg-emerald-500' };

  // Не авторизован - показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="h-20 w-20 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Войдите в профиль</h2>
          <p className="text-muted-foreground mb-6">Для доступа к профилю необходимо авторизоваться через Telegram</p>
          <Link to="/auth">
            <Button>Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Загрузка профиля
  if (!userData) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Профиль</h2><p className="text-muted-foreground">{userData?.client_id ? `Клиент: ${userData.client_id}` : 'Управление профилем'}</p></div>

      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="address">Адрес</TabsTrigger>
          <TabsTrigger value="tracks">Мои треки</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="mb-4"><CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{(name || 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              <div><h3 className="text-xl font-semibold">{name || 'Введите имя'}</h3><p className="text-sm text-muted-foreground">{phone}</p>{userData?.client_id && <Badge className="mt-2">{userData.client_id}</Badge>}</div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Информация профиля</CardTitle><CardDescription>Управляйте вашими персональными данными</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4" /> Имя (латиницей)</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} placeholder="Ivan Ivanov" className="mt-2" /></div>
              <Separator />
              <div><Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Телефон</Label>
                <Input id="phone" type="tel" value={phone} disabled className="mt-2" /></div>
              <Separator />
              <div><Label htmlFor="language" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Язык</Label>
                <Select value={lang} onValueChange={setLang} disabled={!editing}><SelectTrigger id="language" className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ru">Русский</SelectItem><SelectItem value="tj">Тоҷикӣ</SelectItem></SelectContent></Select></div>
            </div>
            <div className="mt-6 flex gap-2">
              {editing ? (<><Button onClick={handleSave} disabled={saving} className="flex-1"><Save className="mr-2 h-4 w-4" />{saving ? 'Сохранение...' : 'Сохранить'}</Button><Button variant="outline" onClick={() => setEditing(false)}>Отмена</Button></>)
                : (<Button onClick={() => setEditing(true)} className="flex-1">Редактировать</Button>)}
            </div>
          </CardContent></Card>

          <Button variant="destructive" onClick={handleLogout} className="mt-6 w-full"><LogOut className="mr-2 h-4 w-4" /> Выйти</Button>
        </TabsContent>

        <TabsContent value="address">
          <Card><CardHeader><CardTitle>Адрес склада в Китае</CardTitle><CardDescription>Используйте этот адрес для доставки грузов</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
              <p><span className="text-muted-foreground">联系人：</span>khuroson-cargo</p>
              <p><span className="text-muted-foreground">联系电话：</span>19524101010</p>
              <p><span className="text-muted-foreground">收货地址：</span>{chinaAddress}</p>
            </div>
            <Button onClick={copyAddress} className="w-full" variant="outline">
              {copied ? <><Check className="mr-2 h-4 w-4" /> Скопировано!</> : <><Copy className="mr-2 h-4 w-4" /> Копировать адрес</>}
            </Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tracks">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Мои треки</CardTitle><CardDescription>Треки которые вы искали недавно</CardDescription></CardHeader>
          <CardContent>
            {loadingTracks ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              : myTracks.length > 0 ? <div className="space-y-2">
                {myTracks.map((track) => (
                  <Link key={track.id} to={`/tracks?code=${track.code}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer">
                      <div><p className="font-semibold">{track.code}</p><p className="text-sm text-muted-foreground">{track.updated_at ? new Date(track.updated_at).toLocaleDateString('ru-RU') : ''}</p></div>
                      <div className="flex items-center gap-2"><Badge className={`${statusColors[track.status] || 'bg-gray-500'} text-white`}>{statusLabels[track.status] || track.status}</Badge><ChevronRight className="h-5 w-5 text-muted-foreground" /></div>
                    </div>
                  </Link>
                ))}</div>
              : <div className="py-8 text-center"><Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">У вас пока нет треков</h3><Link to="/tracks"><Button>Найти трек</Button></Link></div>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
