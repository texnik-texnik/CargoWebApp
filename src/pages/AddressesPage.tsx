import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';

import { useAppLanguage } from '../hooks/useLanguage';

export default function AddressesPage() {
  const { t } = useAppLanguage();
  const chinaAddress = {
    title: t.chinaWarehouse,
    address: '广东省广州市白云区石井街石沙路288号',
    phone: '+86 130 0000 0000',
    hours: t.hoursChina || 'Пн-Сб: 9:00 - 18:00 (GMT+8)',
    email: 'china@khuroson.com',
  };
  const tajikistanAddress = {
    title: t.tajikistanOffice,
    address: t.tajikistanAddr || 'г. Душанбе, ул. Примерная, д. 123',
    phone: '+992 00 000 00 00',
    hours: t.hoursTJ || 'Пн-Сб: 9:00 - 18:00 (GMT+5)',
    email: 'info@khuroson.com',
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.addresses}</h2>
        <p className="text-muted-foreground">{t.addressesDesc}</p>
      </div>
      <Tabs defaultValue="china" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="china">🇨🇳 {t.chinaAddrTitle.split(' ')[0] === 'Адрес' ? 'Китай' : 'Чин'}</TabsTrigger>
          <TabsTrigger value="tajikistan">🇹🇯 {t.tajikAddresses.split(' ')[0] === 'Адреса' ? 'Таджикистан' : 'Тоҷикистон'}</TabsTrigger>
        </TabsList>
        <TabsContent value="china">
          <Card>
            <CardHeader>
              <CardTitle>{chinaAddress.title}</CardTitle>
              <CardDescription>{t.chinaDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.warehouseAddress}</p>
                  <p className="text-sm text-muted-foreground">{chinaAddress.address}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.phoneLabel}</p>
                  <a href={`tel:${chinaAddress.phone}`} className="text-sm text-primary hover:underline">{chinaAddress.phone}</a>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.hours}</p>
                  <p className="text-sm text-muted-foreground">{chinaAddress.hours}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${chinaAddress.email}`} className="text-sm text-primary hover:underline">{chinaAddress.email}</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tajikistan">
          <Card>
            <CardHeader>
              <CardTitle>{tajikistanAddress.title}</CardTitle>
              <CardDescription>{t.tajikDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.warehouseAddress}</p>
                  <p className="text-sm text-muted-foreground">{tajikistanAddress.address}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.phoneLabel}</p>
                  <a href={`tel:${tajikistanAddress.phone}`} className="text-sm text-primary hover:underline">{tajikistanAddress.phone}</a>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{t.hours}</p>
                  <p className="text-sm text-muted-foreground">{tajikistanAddress.hours}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${tajikistanAddress.email}`} className="text-sm text-primary hover:underline">{tajikistanAddress.email}</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>{t.findWarehouse}</CardTitle>
          <CardDescription>{t.warehouseInstructions}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{t.step1}</p>
          <p className="text-muted-foreground">{t.step1Desc || 'После оформления заказа вы получите уникальный трек-номер.'}</p>
          <p className="font-medium">{t.step2}</p>
          <p className="text-muted-foreground">{t.step2Desc || 'При отправке укажите трек-номер на посылке.'}</p>
          <p className="font-medium">{t.step3}</p>
          <p className="text-muted-foreground">{t.step3Desc || 'Отправьте груз на указанный адрес в Гуанчжоу.'}</p>
          <p className="font-medium">{t.step4}</p>
          <p className="text-muted-foreground">{t.step4Desc || 'Используйте приложение для отслеживания.'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
