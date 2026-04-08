import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Globe, Save, LogOut, Package, ChevronRight, Copy, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { supabase } from '../lib/supabase/client';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLang, setEditLang] = useState('ru');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [myTracks, setMyTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('ProfilePage mounted - loading user...');
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      console.log('User from localStorage:', parsed);
      setPhone(parsed.phone || '');
      setIsAuthenticated(true);
      // Принудительно загружаем профиль каждый раз
      loadUserProfile(parsed.phone);
    } else {
      // Пользователь не авторизован
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserProfile(p: string) {
    if (!p) {
      setError('Телефон не указан');
      setUserData({ phone: '', editName: '', editLang: 'ru' });
      return;
    }
    try {
      // Добавляем cache-busting для получения свежих данных
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', p)
        .single();

      if (supabaseError) {
        // Если пользователь не найден - создаем минимальный профиль
        if (supabaseError.code === 'PGRST116') {
          setUserData({ phone: p, editName: '', editLang: 'ru' });
          return;
        }
        setError(`Ошибка: ${supabaseError.message}`);
        // Fallback
        setUserData({ phone: p, editName: '', editLang: 'ru' });
        return;
      }

      if (data) {
        console.log('========== PROFILE LOADED ==========');
        console.log('Full data from DB:', JSON.stringify(data, null, 2));
        console.log('DB name:', data.name, '| type:', typeof data.name);
        console.log('DB lang:', data.lang, '| type:', typeof data.lang);
        
        // Обновляем userData
        setUserData(data);
        
        // Обновляем локальные состояния
        const newName = data.name || '';
        const newLang = data.lang || 'ru';
        console.log('Setting editName to: "%s" (was "%s")', newName, editName);
        console.log('Setting editLang to: "%s" (was "%s")', newLang, editLang);
        setEditName(newName);
        setEditLang(newLang);
        
        console.log('After setState - editName should be:', newName);
        console.log('=====================================');
        
        // Если имя не введён - показываем диалог
        if (!data.name || data.name.trim() === '') {
          setShowNamePrompt(true);
        }
        
        await loadMyTracks(data.history);
      }
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
      // Fallback: показываем минимальный профиль
      setUserData({ phone: p, editName: '', editLang: 'ru' });
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
    if (!phone || !editName.trim()) return;
    setSaving(true);
    try {
      // Используем serverless API для обхода RLS
      const response = await fetch('/api/auth/save-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: editName.trim(), lang: editLang }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка сохранения');
      }
      
      // Сначала обновляем localStorage
      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), phone, name: editName.trim(), lang: editLang };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Обновляем userData локально (без перезагрузки из БД)
      setUserData((prev: any) => ({ ...prev, name: editName.trim(), lang: editLang }));
      
      // Обновляем локальные состояния явно
      setEditName(editName.trim());
      setEditLang(editLang);
      
      setEditing(false);
      setSuccessMessage('✅ Профиль успешно сохранён!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving:', error);
      setError(`Ошибка сохранения: ${error.message}`);
    }
    finally { setSaving(false); }
  }

  async function handleSaveName() {
    if (!pendingName.trim() || !phone) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({ name: pendingName.trim() }).eq('phone', phone);
      if (error) throw error;
      setShowNamePrompt(false);
      setEditName(pendingName.trim());
      await loadUserProfile(phone);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, name: pendingName.trim() }));
    } catch (error: any) {
      console.error('Error saving editName:', error);
      setError('Не удалось сохранить имя');
    }
    finally { setSaving(false); }
  }

  // Функция для сохранения треков в историю (будет использоваться в TracksPage)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function saveTrackToHistory(trackCode: string) {
    if (!phone) return;
    try {
      const user = await supabase.from('users').select('history').eq('phone', phone).single();
      if (user.data) {
        const history = user.data.history ? user.data.history.split(',').filter(Boolean) : [];
        // Добавляем трек в начало и убираем дубликаты
        const newHistory = [trackCode, ...history.filter((c: string) => c !== trackCode)].slice(0, 50);
        await supabase.from('users').update({ history: newHistory.join(',') }).eq('phone', phone);
        // Обновляем локально
        setUserData((prev: any) => ({ ...prev, history: newHistory.join(',') }));
      }
    } catch (error) {
      console.error('Error saving track to history:', error);
    }
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

  // Загрузка профиля - показываем спиннер
  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Загрузка профиля...</p>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // Ошибка загрузки но данные есть
  const showErrorBanner = error && userData?.phone;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {showErrorBanner && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium text-sm">⚠️ {error}</p>
          <p className="text-red-600 text-xs mt-1">Профиль загружен в ограниченном режиме</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium text-sm">{successMessage}</p>
        </div>
      )}
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
              <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{(userData?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              <div><h3 className="text-xl font-semibold">{userData?.name || 'Введите имя'}</h3><p className="text-sm text-muted-foreground">{phone}</p>{userData?.client_id && <Badge className="mt-2">{userData.client_id}</Badge>}</div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Информация профиля</CardTitle><CardDescription>Управляйте вашими персональными данными</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><Label htmlFor="editName" className="flex items-center gap-2"><User className="h-4 w-4" /> Имя (латиницей)</Label>
                <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!editing} placeholder="Ivan Ivanov" className="mt-2" /></div>
              <Separator />
              <div><Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Телефон</Label>
                <Input id="phone" type="tel" value={phone} disabled className="mt-2" /></div>
              <Separator />
              <div><Label htmlFor="language" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Язык</Label>
                <Select value={editLang} onValueChange={setEditLang} disabled={!editing}><SelectTrigger id="language" className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ru">Русский</SelectItem><SelectItem value="tj">Тоҷикӣ</SelectItem></SelectContent></Select></div>
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

      {/* Dialog для запроса имени */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>👋 Добро пожаловать!</DialogTitle>
            <DialogDescription>
              Для полного доступа к профилю пожалуйста введите ваше имя латиницей
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Toshmat"
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Имя будет использоваться для генерации адреса склада в Китае
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} disabled={saving || !pendingName.trim()}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Отладочная информация */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs space-y-1">
        <p><strong>Отладка:</strong></p>
        <p>editName: "{editName}"</p>
        <p>editLang: "{editLang}"</p>
        <p>userData.name: "{userData?.name}"</p>
        <p>userData.lang: "{userData?.lang}"</p>
      </div>
    </div>
  );
}
