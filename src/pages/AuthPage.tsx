import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

export default function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'loading' | 'setup' | 'done'>('loading');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<any>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const getFullPhone = () => {
    const cleanDigits = phone.replace(/\D/g, '');
    return `+992${cleanDigits}`;
  };

  useEffect(() => {
    // Проверяем Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      // Не в Telegram - показываем ошибку
      setError('Приложение работает только внутри Telegram. Откройте через @JinjakBot');
      setStep('done');
      return;
    }

    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    
    if (!user) {
      setError('Не удалось получить данные пользователя. Перезапустите приложение.');
      setStep('done');
      return;
    }

    setTgUser(user);
    setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());

    // Проверяем авторизацию
    checkAuth(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth(user: any) {
    try {
      const response = await fetch('/api/auth/telegram-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
        }),
      });

      if (!response.ok) throw new Error('Ошибка авторизации');

      const data = await response.json();
      
      // Сохраняем пользователя
      localStorage.setItem('user', JSON.stringify(data.user));

      // Если есть телефон и имя - сразу на главную
      if (data.user.phone && data.user.name) {
        navigate('/');
      } else {
        // Нужна настройка профиля
        setPhone(data.user.phone || '');
        setName(data.user.name || name);
        setStep('setup');
      }
    } catch (err: any) {
      setError(err.message);
      setStep('done');
    }
  }

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.replace(/\D/g, '').length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (!name.trim()) {
      setError('Введите имя');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/telegram-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          phone: getFullPhone(),
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка сохранения');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === 'loading' ? 'Вход...' : step === 'setup' ? 'Завершите регистрацию' : 'Ошибка'}
          </CardTitle>
          <CardDescription>
            {step === 'loading' 
              ? 'Проверяем данные Telegram...' 
              : step === 'setup' 
                ? 'Для доставки укажите телефон и имя' 
                : error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя (латиницей)</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    placeholder="Toshmat"
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Используется в адресе склада Китая</p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="phone">Номер телефона</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-medium text-muted-foreground">+992</span>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="XX XXX XX XX"
                    className="flex-1"
                    required
                    maxLength={15}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Продолжить
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Авторизация через Telegram...</p>
            </div>
          )}

          {step === 'done' && error && (
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Повторить</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
