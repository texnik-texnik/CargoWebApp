'use client';

import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function AddressesPage() {
  const chinaAddress = {
    title: 'Китай (Гуанчжоу)',
    address: '广东省广州市白云区石井街石沙路288号',
    phone: '+86 130 0000 0000',
    hours: 'Пн-Сб: 9:00 - 18:00 (GMT+8)',
    email: 'china@khuroson.com',
  };

  const tajikistanAddress = {
    title: 'Таджикистан (Душанбе)',
    address: 'г. Душанбе, ул. Примерная, д. 123',
    phone: '+992 00 000 00 00',
    hours: 'Пн-Сб: 9:00 - 18:00 (GMT+5)',
    email: 'info@khuroson.com',
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Адреса</h2>
        <p className="text-muted-foreground">
          Наши офисы в Китае и Таджикистане
        </p>
      </div>

      <Tabs defaultValue="china" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="china">🇨🇳 Китай</TabsTrigger>
          <TabsTrigger value="tajikistan">🇹🇯 Таджикистан</TabsTrigger>
        </TabsList>

        <TabsContent value="china">
          <Card>
            <CardHeader>
              <CardTitle>{chinaAddress.title}</CardTitle>
              <CardDescription>Основной склад для приема грузов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Адрес</p>
                  <p className="text-sm text-muted-foreground">{chinaAddress.address}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Телефон</p>
                  <a href={`tel:${chinaAddress.phone}`} className="text-sm text-primary hover:underline">
                    {chinaAddress.phone}
                  </a>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Режим работы</p>
                  <p className="text-sm text-muted-foreground">{chinaAddress.hours}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${chinaAddress.email}`} className="text-sm text-primary hover:underline">
                    {chinaAddress.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tajikistan">
          <Card>
            <CardHeader>
              <CardTitle>{tajikistanAddress.title}</CardTitle>
              <CardDescription>Пункт выдачи грузов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Адрес</p>
                  <p className="text-sm text-muted-foreground">{tajikistanAddress.address}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Телефон</p>
                  <a href={`tel:${tajikistanAddress.phone}`} className="text-sm text-primary hover:underline">
                    {tajikistanAddress.phone}
                  </a>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Режим работы</p>
                  <p className="text-sm text-muted-foreground">{tajikistanAddress.hours}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${tajikistanAddress.email}`} className="text-sm text-primary hover:underline">
                    {tajikistanAddress.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Как найти склад */}
      <Card>
        <CardHeader>
          <CardTitle>Как найти склад в Китае?</CardTitle>
          <CardDescription>Инструкция для отправки груза</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">Шаг 1: Получите трек-номер</p>
          <p className="text-muted-foreground">
            После оформления заказа вы получите уникальный трек-номер для вашего груза.
          </p>
          <p className="font-medium">Шаг 2: Укажите трек-номер</p>
          <p className="text-muted-foreground">
            При отправке укажите трек-номер на посылке. Это поможет идентифицировать ваш груз.
          </p>
          <p className="font-medium">Шаг 3: Отправьте груз</p>
          <p className="text-muted-foreground">
            Отправьте груз на указанный адрес в Гуанчжоу. Мы примем и обработаем вашу посылку.
          </p>
          <p className="font-medium">Шаг 4: Отслеживайте статус</p>
          <p className="text-muted-foreground">
            Используйте приложение для отслеживания статуса вашего груза в реальном времени.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
