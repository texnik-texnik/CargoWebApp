import { useAppLanguage } from '../hooks/useLanguage';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, AlertCircle, Phone, ArrowRight, Keyboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ъ': '', 'ь': '',
    'ғ': 'gh', 'ӣ': 'i', 'қ': 'q', 'ӯ': 'u', 'ҳ': 'h', 'ҷ': 'j',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ы': 'Y', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya', 'Ъ': '', 'Ь': '',
    'Ғ': 'Gh', 'Ӣ': 'I', 'Қ': 'Q', 'Ӯ': 'U', 'Ҳ': 'H', 'Ҷ': 'J'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

export default function AuthPage() {
  const { t, lang, setLang } = useAppLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'loading' | 'language' | 'phone_choice' | 'setup' | 'done'>('loading');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<any>(null);
  const [isTgContactAvailable, setIsTgContactAvailable] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const getFullPhone = () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.startsWith('992')) return `+${cleanDigits}`;
    return `+992${cleanDigits}`;
  };

  const checkAuth = useCallback(async (user: any) => {
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

      if (!response.ok) throw new Error(t.authError || 'Ошибка авторизации');

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.phone && data.user.name) {
        navigate('/');
      } else {
        const hasLang = localStorage.getItem('app_lang_set');
        if (!hasLang) {
          setStep('language');
        } else if (data.user.phone) {
          setPhone(data.user.phone.replace('+992', ''));
          setStep('setup');
        } else {
          setStep('phone_choice');
        }
        setName(data.user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim());
      }
    } catch (err: any) {
      setError(err.message);
      setStep('done');
    }
  }, [navigate, t.authError]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      setError(t.appTelegramOnly);
      setStep('done');
      return;
    }

    tg.ready();
    tg.expand();

    if (tg.isVersionAtLeast?.('6.9')) {
      setIsTgContactAvailable(true);
    }

    const user = tg.initDataUnsafe?.user;
    
    if (!user) {
      setError(t.failedUserData || 'Failed to get user data. Restart.');
      setStep('done');
      return;
    }

    setTgUser(user);
    checkAuth(user);
  }, [t.appTelegramOnly, t.failedUserData, checkAuth]);

  const handleLanguageSelect = (selectedLang: 'ru' | 'tj') => {
    setLang(selectedLang);
    localStorage.setItem('app_lang_set', 'true');
    setStep('phone_choice');
  };

  const handleRequestContact = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.requestContact) {
      tg.requestContact((callbackData: any) => {
        if (callbackData.status === 'sent' && callbackData.responseUnsafe?.contact?.phone_number) {
          let phoneNum = callbackData.responseUnsafe.contact.phone_number;
          // IMPORTANT: Telegram might return phone with + or without it
          phoneNum = phoneNum.replace(/\D/g, '');
          if (phoneNum.startsWith('992')) {
            phoneNum = phoneNum.slice(3);
          }
          setPhone(formatPhone(phoneNum));
          // After sharing contact, move to setup to confirm name and see the warning
          setStep('setup');
        } else {
          // If user cancelled or error
          console.log('Contact request failed or cancelled');
        }
      });
    }
  };

  const handleNameChange = (val: string) => {
    const transliterated = transliterate(val);
    setName(transliterated.replace(/[^a-zA-Z\s]/g, ''));
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setError(t.validPhone || 'Enter valid phone');
      return;
    }

    if (!name.trim()) {
      setError(t.noName);
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
          lang: lang // Save language preference
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Save error');
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
      <Card className="w-full max-w-md border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
            {step === 'loading' ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <User className="h-10 w-10" />
            )}
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            {step === 'loading' ? t.login : step === 'language' ? 'Language / Забон' : step === 'phone_choice' ? 'Регистрация' : step === 'setup' ? t.completeReg : t.error}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {step === 'loading' 
              ? t.checkingTelegram 
              : step === 'language'
                ? 'Выберите язык обслуживания'
                : step === 'phone_choice' 
                  ? 'Выберите способ привязки номера'
                  : step === 'setup' 
                    ? t.providePhoneName 
                    : error}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 'language' && (
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => handleLanguageSelect('ru')}
                className="h-16 text-lg font-bold flex justify-between px-6"
                variant="outline"
              >
                <span>🇷🇺 Русский</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => handleLanguageSelect('tj')}
                className="h-16 text-lg font-bold flex justify-between px-6"
                variant="outline"
              >
                <span>🇹🇯 Тоҷикӣ</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {step === 'phone_choice' && (
            <div className="space-y-4">
              {isTgContactAvailable && (
                <Button 
                  onClick={handleRequestContact}
                  className="w-full h-16 text-lg font-bold gap-3 shadow-lg shadow-primary/20"
                >
                  <Phone className="h-6 w-6" />
                  Использовать номер Telegram
                </Button>
              )}
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Или</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="w-full h-14 text-base font-medium gap-3 border-dashed"
              >
                <Keyboard className="h-5 w-5" />
                Ввести другой номер вручную
              </Button>
            </div>
          )}

          {step === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-xl">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs font-medium">
                  {t.phoneWarning}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  {t.phoneLabel}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-12 items-center rounded-xl border bg-muted/30 px-4 font-bold text-lg text-primary">
                    +992
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="00 000 00 00"
                    className="h-12 flex-1 text-xl rounded-xl transition-all focus:ring-4 focus:ring-primary/10"
                    required
                    autoFocus={!phone}
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  {t.nameLabel}
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Toshmat Toshmatov"
                    className="h-12 pl-12 text-lg rounded-xl transition-all focus:ring-4 focus:ring-primary/10"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 px-1 leading-tight">
                  {t.chinaAddrDesc} (авто-перевод на латиницу)
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-xl border-none bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="h-14 w-full text-xl font-black rounded-2xl shadow-xl shadow-primary/25 transition-all active:scale-95">
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    {t.continue}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </>
                )}
              </Button>

              <button 
                type="button"
                onClick={() => setStep('phone_choice')}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Вернуться к выбору способа
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/5">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              </div>
              <p className="mt-8 animate-pulse text-lg font-bold text-primary">{t.authTelegram}</p>
            </div>
          )}

          {step === 'done' && error && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
                <AlertCircle className="h-10 w-10" />
              </div>
              <p className="mb-8 text-lg text-destructive font-bold px-4">{error}</p>
              <Button onClick={() => window.location.reload()} size="lg" className="px-12 rounded-2xl h-14 text-lg">
                {t.back || 'Повторить'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
