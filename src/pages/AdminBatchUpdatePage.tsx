import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';

const statusLabels: Record<string, string> = { waiting: 'Ожидает', received: 'Получен', intransit: 'В пути', border: 'На границе', warehouse: 'На складе', payment: 'Оплата', delivered: 'Доставлен' };

export default function AdminBatchUpdatePage() {
  const { t } = useAppLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [dateColumn, setDateColumn] = useState('intransit_date');
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const columnLabels: Record<string, string> = { intransit_date: t.dispatchTime, received_date: t.receivingTime, border_date: t.borderDate, warehouse_date: t.warehouseDate, delivered_date: t.deliveryDate };

  const handleBatchUpdate = async () => {
    if (!startDate || !endDate || !newStatus) { setError(t.fillAllFields); return; }
    setUpdating(true); setError(null); setResult(null);
    try {
      const response = await authenticatedFetch('/api/admin?action=batch-update', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, newStatus, dateColumn }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.error);
      setResult(data);
    } catch (err: any) { setError(err.message); }
    finally { setUpdating(false); }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Массовое обновление статусов</h2><p className="text-muted-foreground">Измените статус всех треков в выбранном диапазоне дат</p></div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Параметры</CardTitle><CardDescription>Выберите диапазон дат и новый статус</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="start-date">Начальная дата</Label><input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><Label htmlFor="end-date">Конечная дата</Label><input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
          </div>
          <Separator />
          <div><Label>Новый статус</Label>
            <Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger className="mt-2"><SelectValue placeholder="Выберите статус" /></SelectTrigger><SelectContent>
              <SelectItem value="waiting">⏳ Ожидает</SelectItem><SelectItem value="received">📦 Получен</SelectItem><SelectItem value="intransit">🚚 В пути</SelectItem>
              <SelectItem value="border">🛃 На границе</SelectItem><SelectItem value="warehouse">🏭 На складе</SelectItem><SelectItem value="payment">💰 Ожидает оплату</SelectItem><SelectItem value="delivered">✅ Доставлен</SelectItem>
            </SelectContent></Select>
          </div>
          <Separator />
          <div><Label>Поиск по дате</Label>
            <Select value={dateColumn} onValueChange={setDateColumn}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="intransit_date">出库时间 (Отправка)</SelectItem><SelectItem value="received_date">入库时间 (Получение)</SelectItem>
              <SelectItem value="border_date">Дата границы</SelectItem><SelectItem value="warehouse_date">Дата склада</SelectItem><SelectItem value="delivered_date">Дата доставки</SelectItem>
            </SelectContent></Select>
          </div>
          <Separator />
          <Button onClick={handleBatchUpdate} disabled={updating || !startDate || !endDate || !newStatus} className="w-full" size="lg">
            {updating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Обновление...</> : <><Calendar className="mr-2 h-4 w-4" /> Обновить все треки</>}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertTitle>Ошибка</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {result && <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Успешно!</CardTitle><CardDescription>{result.updated} треков обновлено</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Новый статус:</span><Badge>{statusLabels[newStatus] || newStatus}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Диапазон:</span><span className="text-sm">{startDate} → {endDate}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Поиск по:</span><span className="text-sm">{columnLabels[dateColumn]}</span></div>
            <Separator />
            <Button onClick={() => { setStartDate(''); setEndDate(''); setNewStatus(''); setDateColumn('intransit_date'); setResult(null); }} variant="outline" className="w-full">Обновить ещё</Button>
          </div>
        </CardContent>
      </Card>}
    </div>
  );
}
