'use client';

import Link from 'next/link';
import { Upload, Database, Users, Bell, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const adminSections = [
    {
      title: 'Импорт CSV',
      description: 'Загрузить треки из китайской таблицы',
      icon: Upload,
      href: '/admin/import',
      color: 'text-blue-500',
    },
    {
      title: 'Массовое обновление',
      description: 'Обновить статусы по диапазону дат',
      icon: Calendar,
      href: '/admin/batch-update',
      color: 'text-orange-500',
    },
    {
      title: 'База данных',
      description: 'Управление треками и пользователями',
      icon: Database,
      href: '/admin/database',
      color: 'text-green-500',
    },
    {
      title: 'Пользователи',
      description: 'Управление пользователями',
      icon: Users,
      href: '/admin/users',
      color: 'text-purple-500',
    },
    {
      title: 'Рассылка',
      description: 'Отправить уведомления',
      icon: Bell,
      href: '/admin/notifications',
      color: 'text-red-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Админ-панель</h2>
        <p className="text-muted-foreground">
          Управление системой доставки
        </p>
      </div>

      <div className="space-y-4">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="transition-all hover:shadow-md active:scale-[0.98]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-muted p-2 ${section.color}`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
