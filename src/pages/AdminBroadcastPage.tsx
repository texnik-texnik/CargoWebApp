import React, { useState } from 'react';
import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

export default function AdminBroadcastPage() {
  const { t } = useAppLanguage();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; errors: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await authenticatedFetch('/api/admin?action=broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      if (data.success) {
        setResult({ sent: data.sent, errors: data.errors });
        setMessage('');
      } else {
        setError(data.error || 'Произошла ошибка при отправке');
      }
    } catch (e) {
      setError('Ошибка сети или сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.broadcast}</h2>
        <p className="text-muted-foreground">{t.broadcastDesc}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Новое сообщение</CardTitle>
          <CardDescription>
            Сообщение будет отправлено всем пользователям, которые взаимодействовали с ботом. 
            Можно использовать HTML-теги (b, i, a).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Введите текст сообщения..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px]"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                Отправлено: <strong>{result.sent}</strong>. 
                Ошибок: <strong>{result.errors}</strong>.
              </span>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleSend} 
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t.broadcast}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
