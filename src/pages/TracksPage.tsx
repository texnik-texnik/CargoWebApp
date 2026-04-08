import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ScanLine, History, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { supabase } from '../lib/supabase/client';

export default function TracksPage() {
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState(searchParams.get('code') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadSearchHistory(parsed.phone);
    } else {
      const localHistory = JSON.parse(localStorage.getItem('track_history') || '[]');
      setSearchHistory(localHistory);
    }
    const code = searchParams.get('code');
    if (code) handleSearch(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сохраняем трек в историю поиска
  async function saveTrackToHistory(code: string) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      // Сохраняем локально
      saveToLocalStorage(code);
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      const { data: u } = await supabase.from('users').select('history').eq('phone', parsed.phone).single();
      const history = u?.history ? u.history.split(',').filter(Boolean) : [];
      const newHistory = [code, ...history.filter((c: string) => c !== code)].slice(0, 50);
      await supabase.from('users').update({ history: newHistory.join(',') }).eq('phone', parsed.phone);
      setSearchHistory(newHistory);
    } catch (err) {
      console.error('Error saving to history:', err);
      saveToLocalStorage(code);
    }
  }

  async function loadSearchHistory(phone: string) {
    try {
      const { data } = await supabase.from('users').select('history').eq('phone', phone).single();
      if (data?.history) setSearchHistory(data.history.split(',').filter(Boolean));
    } catch (err) { console.error('Error loading history:', err); }
  }

  async function handleSearch(code: string) {
    if (!code.trim()) return;
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.from('tracks').select('*').ilike('code', `%${code}%`);
      if (error) throw error;
      setSearchResults(data || []);
      setSearchCode(code);
      
      // Всегда сохраняем трек в историю
      await saveTrackToHistory(code);
    } catch (err: any) { setError(err.message || 'Ошибка поиска'); }
    finally { setLoading(false); }
  }

  function saveToLocalStorage(code: string) {
    const localHistory = JSON.parse(localStorage.getItem('track_history') || '[]');
    const newHistory = [code, ...localHistory.filter((c: string) => c !== code)].slice(0, 50);
    localStorage.setItem('track_history', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  }

  function clearHistory() {
    setSearchHistory([]);
    if (user) supabase.from('users').update({ history: '' }).eq('phone', user.phone);
    else localStorage.removeItem('track_history');
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="mb-6">
        <CardHeader><CardTitle>Поиск трека</CardTitle><CardDescription>Введите трек-номер для отслеживания</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchCode} onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchCode)} placeholder="Введите трек-номер..." className="pl-10" />
            </div>
            <Button onClick={() => handleSearch(searchCode)} disabled={loading || !searchCode.trim()}>
              {loading ? '...' : 'Найти'}
            </Button>
          </div>
          <Button variant="outline" className="mt-2 w-full" disabled>
            <ScanLine className="mr-2 h-4 w-4" /> Сканировать фото (AI)
          </Button>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Найдено: {searchResults.length}</h3>
          <div className="space-y-2">
            {searchResults.map((track) => (
              <Link key={track.id} to={`/tracks?code=${track.code}`}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{track.code}</p>
                        {track.notes && <p className="text-sm text-muted-foreground line-clamp-1">{track.notes}</p>}
                        {track.updated_at && <p className="text-xs text-muted-foreground">{new Date(track.updated_at).toLocaleDateString('ru-RU')}</p>}
                      </div>
                      <Badge className="text-white bg-primary">{track.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchCode && searchResults.length === 0 && !loading && (
        <Card><CardContent className="pt-6 text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Ничего не найдено</h3>
          <p className="text-sm text-muted-foreground">Проверьте правильность введенного кода</p>
        </CardContent></Card>
      )}

      {searchHistory.length > 0 && !searchCode && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-5 w-5" /> История поиска</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearHistory}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((code) => (
                <Button key={code} variant="outline" size="sm" onClick={() => handleSearch(code)} className="rounded-full">{code}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
