import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Key, CheckCircle, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const TELEGRAM_BOT_URL = 'https://t.me/JinjakBot';

export default function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'code' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('992')) {
      const rest = digits.slice(3);
      if (rest.length <= 2) return `+992 ${rest}`;
      if (rest.length <= 5) return `+992 ${rest.slice(0, 2)} ${rest.slice(2)}`;
      if (rest.length <= 7) return `+992 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
      return `+992 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
    }
    return value;
  };

  const handlePhoneSubmit = (e: React.FormEvent) => { e.preventDefault(); setError(null); setStep('code'); };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('992') ? `+${cleanPhone}` : `+992${cleanPhone}`;
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, verificationCode: code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка верификации');
      if (data.isNew) { setStep('name'); localStorage.setItem('temp_user', JSON.stringify(data.user)); return; }
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('992') ? `+${cleanPhone}` : `+992${cleanPhone}`;
      const response = await fetch('/api/auth/save-name', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, name: name.trim() }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error); }
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('temp_user');
      navigate('/');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{step === 'phone' ? 'Вход' : step === 'code' ? 'Код подтверждения' : 'Ваше имя'}</CardTitle>
          <CardDescription>{step === 'phone' ? 'Введите номер телефона' : step === 'code' ? 'Код из @JinjakBot' : 'Введите имя латинскими буквами'}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div><Label htmlFor="phone">Номер телефона</Label>
                <div className="relative mt-2"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+992 XX XXX XX XX" className="pl-10" required autoFocus /></div>
              </div>
              <Button type="submit" disabled={phone.length < 13} className="w-full"><Key className="mr-2 h-4 w-4" /> Получить код</Button>
              <Separator />
              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full"><ExternalLink className="mr-2 h-4 w-4" /> Открыть @JinjakBot</Button>
              </a>
              <p className="text-center text-xs text-muted-foreground">1. Откройте бота и введите номер<br/>2. Бот пришлёт 4-значный код<br/>3. Введите код ниже</p>
            </form>
          )}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div><Label htmlFor="code">4-значный код</Label>
                <div className="relative mt-2"><Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" className="pl-10 text-center text-2xl tracking-widest" maxLength={4} required autoFocus /></div>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" disabled={loading || code.length !== 4} className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Проверка...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Войти</>}</Button>
              <Button type="button" variant="ghost" onClick={() => { setStep('phone'); setCode(''); }} className="w-full"><ArrowLeft className="mr-2 h-4 w-4" /> Назад</Button>
            </form>
          )}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div><Label htmlFor="name">Имя (латиницей)</Label>
                <div className="relative mt-2"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} placeholder="Ali Valiyev" className="pl-10" required autoFocus /></div>
                <p className="mt-2 text-xs text-muted-foreground">Это имя будет использоваться в адресе склада в Китае</p>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" disabled={loading || !name.trim()} className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Регистрация...</> : <><CheckCircle className="mr-2 h-4 w-4" /> Завершить регистрацию</>}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
