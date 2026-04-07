import { Package, DollarSign, Clock, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

export default function PricesPage() {
  const pricingData = [
    { category: 'Одежда и обувь', pricePerKg: '$4', time: '15-20 дней', icon: Package },
    { category: 'Электроника', pricePerKg: '$6', time: '15-20 дней', icon: DollarSign },
    { category: 'Оборудование', pricePerKg: '$5', time: '20-25 дней', icon: Truck },
    { category: 'Запчасти', pricePerKg: '$5', time: '15-20 дней', icon: Clock },
    { category: 'Обычные грузы', pricePerKg: '$4-5', time: '15-20 дней', icon: Package },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Тарифы</h2><p className="text-muted-foreground">Стоимость доставки из Китая в Таджикистан</p></div>
      <Tabs defaultValue="pricing" className="mb-6">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="pricing">Тарифы</TabsTrigger><TabsTrigger value="info">Информация</TabsTrigger></TabsList>
        <TabsContent value="pricing">
          <Card><CardHeader><CardTitle>Тарифы на доставку</CardTitle><CardDescription>Цены указаны за 1 кг веса груза</CardDescription></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Категория</TableHead><TableHead>Цена/кг</TableHead><TableHead>Срок</TableHead></TableRow></TableHeader>
              <TableBody>{pricingData.map((item) => (
                <TableRow key={item.category}><TableCell className="font-medium"><div className="flex items-center gap-2"><item.icon className="h-4 w-4 text-primary" />{item.category}</div></TableCell><TableCell><Badge variant="secondary">{item.pricePerKg}</Badge></TableCell><TableCell>{item.time}</TableCell></TableRow>
              ))}</TableBody></Table></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="info">
          <Card><CardHeader><CardTitle>Важная информация</CardTitle><CardDescription>Условия доставки и оплата</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><h4 className="font-semibold mb-2">Минимальный вес</h4><p className="text-sm text-muted-foreground">Минимальный вес груза для отправки - 1 кг.</p></div>
              <div><h4 className="font-semibold mb-2">Объемный вес</h4><p className="text-sm text-muted-foreground">Для легких, но объемных грузов: (Д × Ш × В) / 5000</p></div>
              <div><h4 className="font-semibold mb-2">Оплата</h4><p className="text-sm text-muted-foreground">Оплата при получении груза в Таджикистане.</p></div>
              <div><h4 className="font-semibold mb-2">Страхование</h4><p className="text-sm text-muted-foreground">Все грузы застрахованы.</p></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card><CardHeader><CardTitle>Нужна консультация?</CardTitle><CardDescription>Свяжитесь с нами</CardDescription></CardHeader>
        <CardContent><div className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><span className="font-medium">Telegram:</span><a href="https://t.me/khuroson_cargo" className="text-primary hover:underline">@khuroson_cargo</a></p>
          <p className="flex items-center gap-2"><span className="font-medium">Телефон:</span><a href="tel:+992927848483" className="text-primary hover:underline">+992 92 784 84 83</a></p>
        </div></CardContent>
      </Card>
    </div>
  );
}
