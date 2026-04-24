import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppLanguage } from '../hooks/useLanguage';

interface Price {
  id: string;
  weight_from: number;
  weight_to: number | null;
  price: number;
  currency: string;
}

export default function PricesPage() {
  const { t } = useAppLanguage();
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPrices(); }, []);

  async function loadPrices() {
    try {
      const response = await fetch('/api/prices/get-prices');
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices || []);
      }
    } catch (err) {
      console.error('Error loading prices:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.pricesTitle}</h2>
        <p className="text-muted-foreground">{t.pricesSubtitle}</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t.basePrices}</CardTitle>
          <CardDescription>{t.perKgDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">{t.loading}</span>
            </div>
          ) : prices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.priceWeightFrom}</TableHead>
                  <TableHead>{t.priceWeightTo}</TableHead>
                  <TableHead>{t.priceValue}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">{price.weight_from} {t.unitKg}</TableCell>
                    <TableCell>{price.weight_to ? `${price.weight_to} ${t.unitKg}` : '∞'}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{price.price} {price.currency}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">{t.noPrices}</p>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t.important}</AlertTitle>
        <AlertDescription>
          {t.exactCostAlert}
        </AlertDescription>
      </Alert>
    </div>
  );
}
