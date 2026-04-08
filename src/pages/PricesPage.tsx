import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function PricesPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Тарифы</h2>
        <p className="text-muted-foreground">Стоимость доставки Китай → Таджикистан</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Базовые тарифы</CardTitle>
          <CardDescription>Стоимость за 1 кг груза</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Вес</TableHead>
                <TableHead>Цена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">До 0.5 кг</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">15 сомони</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">1 кг и больше</TableCell>
                <TableCell>
                  <Badge className="bg-blue-500">25 сомони/кг</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Важно</AlertTitle>
        <AlertDescription>
          Точная стоимость рассчитывается после взвешивания груза на складе в Китае.
        </AlertDescription>
      </Alert>
    </div>
  );
}
