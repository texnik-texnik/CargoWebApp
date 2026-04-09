import { useAppLanguage } from '../hooks/useLanguage';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }


export default function AIChatPage() {
  const { t } = useAppLanguage();
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', content: t.aiGreeting, timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput(''); setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage.content }) });
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response || t.aiError, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t.aiFallback, timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI-ассистент</CardTitle><CardDescription>Задайте вопрос</CardDescription></CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  <p className="mt-1 text-xs opacity-70">{m.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {m.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary text-secondary-foreground"><User className="h-4 w-4" /></AvatarFallback></Avatar>}
              </div>
            ))}
            {loading && <div className="flex gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar><div className="rounded-lg bg-muted px-4 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Сообщение..." disabled={loading} className="flex-1" />
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
