import { Link } from 'react-router-dom';
import { Upload, Database, Users, Bell, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function AdminPage() {
  const sections = [
    { title: 'Управление ценами', desc: 'Изменить тарифы на доставку', icon: DollarSign, href: '/admin/prices', color: 'text-green-500' },
    { title: 'Импорт CSV', desc: 'Загрузить треки из китайской таблицы', icon: Upload, href: '/admin/import', color: 'text-blue-500' },
    { title: 'Массовое обновление', desc: 'Обновить статусы по диапазону дат', icon: Calendar, href: '/admin/batch-update', color: 'text-orange-500' },
    { title: 'База данных', desc: 'Управление треками', icon: Database, href: '#', color: 'text-green-500' },
    { title: 'Пользователи', desc: 'Управление пользователями', icon: Users, href: '#', color: 'text-purple-500' },
    { title: 'Рассылка', desc: 'Отправить уведомления', icon: Bell, href: '#', color: 'text-red-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Админ-панель</h2><p className="text-muted-foreground">Управление системой доставки</p></div>
      <div className="space-y-4">
        {sections.map((s) => (
          <Link key={s.href} to={s.href}>
            <Card className="transition-all hover:shadow-md active:scale-[0.98]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-muted p-2 ${s.color}`}><s.icon className="h-6 w-6" /></div>
                    <div><CardTitle className="text-lg">{s.title}</CardTitle><CardDescription>{s.desc}</CardDescription></div>
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
