import { AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

export default function BannedPage() {
  const bannedItems = [
    { category: 'Оружие и боеприпасы', reason: 'Законодательный запрет', severity: 'high' },
    { category: 'Наркотические вещества', reason: 'Законодательный запрет', severity: 'high' },
    { category: 'Алкоголь', reason: 'Ограничения на ввоз', severity: 'medium' },
    { category: 'Табачные изделия', reason: 'Ограничения на ввоз', severity: 'medium' },
    { category: 'Лекарства (рецептурные)', reason: 'Требуется разрешение', severity: 'medium' },
    { category: 'Животные и растения', reason: 'Требуется карантин', severity: 'medium' },
    { category: 'Деньги и ценные бумаги', reason: 'Ограничения на ввоз', severity: 'high' },
    { category: 'Взрывчатые вещества', reason: 'Законодательный запрет', severity: 'high' },
    { category: 'Токсичные вещества', reason: 'Законодательный запрет', severity: 'high' },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">Строгий запрет</Badge>;
      case 'medium': return <Badge variant="secondary">Ограничение</Badge>;
      default: return <Badge variant="outline">Информация</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Запрещенные товары</h2><p className="text-muted-foreground">Список товаров, которые нельзя доставлять</p></div>
      <Alert className="mb-6"><AlertTriangle className="h-4 w-4" /><AlertTitle>Важно!</AlertTitle><AlertDescription>Попытка отправки запрещенных товаров может привести к конфискации.</AlertDescription></Alert>
      <Card className="mb-6"><CardHeader><CardTitle>Запрещенные и ограниченные товары</CardTitle><CardDescription>Перед отправкой убедитесь, что ваш товар не входит в этот список</CardDescription></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Категория</TableHead><TableHead>Причина</TableHead><TableHead>Статус</TableHead></TableRow></TableHeader>
          <TableBody>{bannedItems.map((item) => (<TableRow key={item.category}><TableCell className="font-medium">{item.category}</TableCell><TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell><TableCell>{getSeverityBadge(item.severity)}</TableCell></TableRow>))}</TableBody></Table></CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Дополнительная информация</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><h4 className="font-semibold mb-2">Что делать если товар запрещен?</h4><p className="text-sm text-muted-foreground">Обратитесь к нам для консультации.</p></div>
          <div><h4 className="font-semibold mb-2">Ограничения на стоимость</h4><p className="text-sm text-muted-foreground">Максимальная стоимость одной посылки - $10,000.</p></div>
          <div><h4 className="font-semibold mb-2">Таможенные пошлины</h4><p className="text-sm text-muted-foreground">При стоимости свыше эквивалента 1000 EUR может взиматься пошлина.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
