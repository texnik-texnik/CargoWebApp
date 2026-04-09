import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useAppLanguage } from '../hooks/useLanguage';

export default function TermsPage() {
  const { t } = useAppLanguage();

  const policySections = [
    { title: t.termsAccept, content: t.termsAcceptDesc },
    { title: t.termsFragile, content: t.termsFragileDesc },
    { title: t.termsPerishable, content: t.termsPerishableDesc },
    { title: t.termsResponsibility, content: t.termsResponsibilityDesc },
    { title: t.termsForceMajeure, content: t.termsForceMajeureDesc },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.termsTitle}</h2>
        <p className="text-muted-foreground">{t.termsSubtitle}</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>📜 {t.termsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t.termsThanks}</p>
        </CardContent>
      </Card>

      {policySections.map((section, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{section.content}</p>
          </CardContent>
        </Card>
      ))}

      <Separator className="my-6" />

      <Card>
        <CardContent className="pt-6">
          <p className="text-center font-medium">{t.termsRespect}</p>
        </CardContent>
      </Card>
    </div>
  );
}
