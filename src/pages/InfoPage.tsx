import { useAppLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';
import { DollarSign, Ban, MapPin, ScrollText, ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function InfoPage() {
  const { t } = useAppLanguage();
  const sections = [
    { title: t.pricesTitle, desc: t.pricesDesc, icon: DollarSign, href: '/info/prices', color: 'text-green-500' },
    { title: t.bannedTitle, desc: t.bannedDesc, icon: Ban, href: '/info/banned', color: 'text-red-500' },
    { title: t.addresses, desc: t.addressesDesc, icon: MapPin, href: '/info/addresses', color: 'text-blue-500' },
    { title: t.termsTitle, desc: t.termsDesc, icon: ScrollText, href: '/info/terms', color: 'text-purple-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Информация</h2><p className="text-muted-foreground">Полезная информация о доставке</p></div>
      <div className="space-y-4">
        {sections.map((section) => (
          <Link key={section.href} to={section.href}>
            <Card className="transition-all hover:shadow-md active:scale-[0.98]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-muted p-2 ${section.color}`}><section.icon className="h-6 w-6" /></div>
                    <div><CardTitle className="text-lg">{section.title}</CardTitle><CardDescription>{section.desc}</CardDescription></div>
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
