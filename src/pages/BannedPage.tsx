import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const bannedItems = [
  'Стеклянные изделия',
  'Оружие и военные предметы',
  'Опасные материалы',
  'Наркотические и психотропные вещества',
  'Животные и растения',
  'Порнографические материалы',
  'Пищевые и медицинские продукты',
  'Фальшивые деньги и документы',
];

export default function BannedPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Запрещенные товары</h2>
        <p className="text-muted-foreground">Список грузов, которые не принимает наше карго</p>
      </div>

      <Alert className="mb-4 border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-800">НАШЕ КАРГО НЕ ПРИНИМАЕТ:</AlertTitle>
        <AlertDescription className="text-red-700">
          Следующие товары запрещены к доставке
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Запрещенный список</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {bannedItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Alert className="mt-4 border-orange-500 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-800">‼️❌ Важно!</AlertTitle>
        <AlertDescription className="text-orange-700">
          Если вы заказали эти товары, вы подтверждаете, что мы не несём ответственность за доставку и принятие вашего товара!
        </AlertDescription>
      </Alert>
    </div>
  );
}
