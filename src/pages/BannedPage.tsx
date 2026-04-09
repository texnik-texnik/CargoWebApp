import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAppLanguage } from '../hooks/useLanguage';

export default function BannedPage() {
  const { t } = useAppLanguage();

  const bannedItems = [
    t.bannedGlass, t.bannedWeapons, t.bannedDanger, t.bannedDrugs,
    t.bannedAnimals, t.bannedPorno, t.bannedFood, t.bannedFake,
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.bannedList}</h2>
        <p className="text-muted-foreground">{t.bannedSubtitle}</p>
      </div>

      <Alert className="mb-4 border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-800">{t.bannedNotAccepted}</AlertTitle>
        <AlertDescription className="text-red-700">
          {t.bannedItemsDesc}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t.bannedListTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {bannedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Alert className="mt-4 border-orange-500 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-800">{t.bannedWarning}</AlertTitle>
        <AlertDescription className="text-orange-700">
          {t.bannedWarningDesc}
        </AlertDescription>
      </Alert>
    </div>
  );
}
