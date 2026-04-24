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
import { useAppLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase/client';

export default function ProfilePage() {
  const { t, lang, setLang } = useAppLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [myTracks, setMyTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
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
      setError('Phone not specified');
      setUserData({ phone: '', name: '', lang: 'ru' });
      return;
    }
    try {
      
      // Используем serverless API вместо прямого Supabase запроса
      const response = await fetch(`/api/auth/get-profile?phone=${encodeURIComponent(p)}`);
      
      if (!response.ok) {
        const err = await response.json();
        
        // Если пользователь не найден
        if (response.status === 404) {
          setUserData({ phone: p, name: '', lang: 'ru' });
          return;
        }
        
        setError(`Error: ${err.error || 'Failed to load profile'}`);
        setUserData({ phone: p, name: '', lang: 'ru' });
        return;
      }
      
      const result = await response.json();
      const data = result.user;
      
      if (data) {
        
        // ОДИН вызов setUserData для всех полей
        setUserData(data);
        
        
        // Если имя не введён - показываем диалог
        if (!data.name || data.name.trim() === '') {
          setShowNamePrompt(true);
        }
        
        await loadMyTracks(data.history);
      }
    } catch (err: any) {
      setError(`Error: ${err.message || 'Unknown error'}`);
      // Fallback: показываем минимальный профиль
      setUserData({ phone: p, name: '', lang: 'ru' });
    }
  }

  // Lazy load tracks only when user switches to 'tracks' tab
  useEffect(() => {
    if (activeTab === 'tracks' && userData?.history && myTracks.length === 0 && !loadingTracks) {
      loadMyTracks(userData.history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userData?.history]);

  async function loadMyTracks(history: string) {
    if (!history) return;
    setLoadingTracks(true);
    try {
      const codes = history.split(',').filter(Boolean);
      if (codes.length === 0) return;
      // Select only columns needed for my tracks display — reduces bandwidth
      const { data } = await supabase.from('tracks').select('id, code, status, updated_at').eq('archived', false).in('code', codes.slice(0, 10));
      if (data) setMyTracks(data);
    } catch (err) {
      // Error loading tracks
    } finally { setLoadingTracks(false); }
  }

  async function handleSave() {
    if (!phone || !userData?.name?.trim()) return;
    setSaving(true);
    try {
      const nameToSave = userData.name.trim();
      const langToSave = userData.lang || lang || 'ru';
      const telegramId = userData.telegram_id;

      if (!telegramId) throw new Error('Telegram ID not found');
      
      const response = await fetch('/api/auth/save-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telegram_id: telegramId, 
          phone: phone, 
          name: nameToSave, 
          lang: langToSave 
        }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Save error');
      }

      const result = await response.json();
      const updatedUserFromDb = result.user;
      
      // Обновляем localStorage и состояние
      localStorage.setItem('user', JSON.stringify(updatedUserFromDb));
      setUserData(updatedUserFromDb);
      setPhone(updatedUserFromDb.phone);
      
      setEditing(false);
      setSuccessMessage(t.profileSaved);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(`Error: ${error.message}`);
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
      setUserData((prev: any) => ({ ...prev, name: pendingName.trim() }));
      await loadUserProfile(phone);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, name: pendingName.trim() }));
    } catch (error: any) {
      setError(t.error);
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
    }
  }

  function handleLogout() {
    localStorage.removeItem('user');
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      // Перезагружаем Mini App для повторной авторизации
      tg.close();
    }
    window.location.href = '/';
  }

  const phoneWithoutCountry = (userData?.phone || '').replace('+992', '').replace(/\s/g, '');
  const nameSlug = (userData?.name || 'user').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const chinaAddress = `浙江省金华市义乌市荷叶塘工业区东青路87号一楼 库房1号门-Khuroson-${nameSlug}-${phoneWithoutCountry}`;
  const fullAddress = `联系人：khuroson-cargo\n联系电话：19524101010\n收货地址：${chinaAddress}`;

  const copyAddress = async () => {
    try { await navigator.clipboard.writeText(fullAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { /* ignore */ }
  };

  const statusLabels: Record<string, string> = { 
    waiting: t.waiting, 
    received: t.received, 
    intransit: t.intransit, 
    border: t.border, 
    warehouse: t.warehouse, 
    payment: t.payment, 
    delivered: t.delivered 
  };
  const statusColors: Record<string, string> = { waiting: 'bg-yellow-500', received: 'bg-blue-500', intransit: 'bg-indigo-500', border: 'bg-orange-500', warehouse: 'bg-purple-500', payment: 'bg-green-500', delivered: 'bg-emerald-500' };

  // Не авторизован - показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="h-20 w-20 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">{t.loginToProfile}</h2>
          <p className="text-muted-foreground mb-6">{t.loginToProfileDesc}</p>
          <Link to="/auth">
            <Button>{t.verify}</Button>
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
          <p className="text-muted-foreground">{t.profileLoading}</p>
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
          <p className="text-red-600 text-xs mt-1">{t.profileLimited}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium text-sm">{successMessage}</p>
        </div>
      )}
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">{t.profileTitle}</h2><p className="text-muted-foreground">{userData?.client_id ? `${t.clientLabel}: ${userData.client_id}` : t.profileDesc}</p></div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t.profileTitle}</TabsTrigger>
          <TabsTrigger value="address">{t.warehouseAddress}</TabsTrigger>
          <TabsTrigger value="tracks">{t.myTracksTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="mb-4"><CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{(userData?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              <div><h3 className="text-xl font-semibold">{userData?.name || t.noName}</h3><p className="text-sm text-muted-foreground">{phone}</p>{userData?.client_id && <Badge className="mt-2">{userData.client_id}</Badge>}</div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>{t.profileInfo}</CardTitle><CardDescription>{t.profileInfoDesc}</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4" /> {t.nameLabel}</Label>
                <Input id="name" value={userData?.name || ''} onChange={(e) => setUserData((prev: any) => ({ ...prev, name: e.target.value }))} disabled={!editing} placeholder="Ivan Ivanov" className="mt-2" /></div>
              <Separator />
              <div><Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> {t.phoneLabel}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-muted-foreground">+992</span>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={phone.replace('+992', '')} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone('+992' + val);
                    }}
                    disabled={!editing} 
                    placeholder="90 000 00 00" 
                    className="flex-1" 
                  />
                </div>
              </div>
              <Separator />
              <div><Label htmlFor="language" className="flex items-center gap-2"><Globe className="h-4 w-4" /> {t.langLabel}</Label>
                <Select value={lang} onValueChange={(val) => setLang(val as 'ru' | 'tj')} disabled={!editing}><SelectTrigger id="language" className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ru">{t.russian}</SelectItem><SelectItem value="tj">{t.tajik}</SelectItem></SelectContent></Select></div>
            </div>
            <div className="mt-6 flex gap-2">
              {editing ? (<><Button onClick={handleSave} disabled={saving} className="flex-1"><Save className="mr-2 h-4 w-4" />{saving ? t.saving : t.saveBtn}</Button><Button variant="outline" onClick={() => setEditing(false)}>{t.cancelBtn}</Button></>)
                : (<Button onClick={() => setEditing(true)} className="flex-1">{t.edit}</Button>)}
            </div>
          </CardContent></Card>

          <Button variant="destructive" onClick={handleLogout} className="mt-6 w-full"><LogOut className="mr-2 h-4 w-4" /> {t.logout}</Button>
        </TabsContent>

        <TabsContent value="address">
          <Card><CardHeader><CardTitle>{t.chinaAddrTitle}</CardTitle><CardDescription>{t.chinaAddrDesc}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
              <p><span className="text-muted-foreground">联系人：</span>khuroson-cargo</p>
              <p><span className="text-muted-foreground">联系电话：</span>19524101010</p>
              <p><span className="text-muted-foreground">收货地址：</span>{chinaAddress}</p>
            </div>
            <Button onClick={copyAddress} className="w-full" variant="outline">
              {copied ? <><Check className="mr-2 h-4 w-4" /> {t.copied}</> : <><Copy className="mr-2 h-4 w-4" /> {t.copyAddress}</>}
            </Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="tracks">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> {t.myTracksTitle}</CardTitle><CardDescription>{t.myTracksDesc}</CardDescription></CardHeader>
          <CardContent>
            {loadingTracks ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              : myTracks.length > 0 ? <div className="space-y-2">
                {myTracks.map((track) => (
                  <Link key={track.id} to={`/tracks?code=${track.code}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer">
                      <div><p className="font-semibold">{track.code}</p><p className="text-sm text-muted-foreground">{track.updated_at ? new Date(track.updated_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB') : ''}</p></div>
                      <div className="flex items-center gap-2"><Badge className={`${statusColors[track.status] || 'bg-gray-500'} text-white`}>{statusLabels[track.status] || track.status}</Badge><ChevronRight className="h-5 w-5 text-muted-foreground" /></div>
                    </div>
                  </Link>
                ))}</div>
              : <div className="py-8 text-center"><Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">{t.noTracksYet}</h3><Link to="/tracks"><Button>{t.findTrack}</Button></Link></div>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Dialog для запроса имени */}
      <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.welcomeTitle}</DialogTitle>
            <DialogDescription>
              {t.namePromptDesc}
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
                {t.chinaAddrDescLong}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveName} disabled={saving || !pendingName.trim()}>
              {saving ? t.saving : t.saveBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
