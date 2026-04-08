import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const policySections = [
  {
    title: '1. Қабули бор',
    content: 'Борҳое, ки ба анбори мо супурда мешаванд, бояд дар қуттии солим ва беосеб бошанд. Бастабандӣ бояд ба тавре бошад, ки ҳангоми интиқол, боркунӣ ва фаровардан мол осеб набинад.',
  },
  {
    title: '2. Молҳои шикананда',
    content: 'Молҳои шикананда бояд бо бастабандии мустаҳкам фиристода шаванд. Дар сурати бастабандии нодуруст, ширкат барои зарари дохили бор ҷавобгар намебошад.',
  },
  {
    title: '3. Молҳои зуд вайроншаванда',
    content: 'Барои молҳое, ки ба гармӣ тобовар нестанд ё зуд вайрон мешаванд, ширкат танҳо ба ҳолати берунии бор ҷавобгар мебошад.',
  },
  {
    title: '4. Масъулияти ширкат',
    content: 'Ширкати KHUROSON CARGO танҳо баъд аз расидани бор ба анбори мо барои он ҷавобгар мешавад. Масъалаҳое, ки то расидани бор ба анбори мо рух медиҳанд, ба масъулияти ширкат дохил намешаванд.',
  },
  {
    title: '5. Ҳолатҳои ғайричашмдошт (Форс-мажор)',
    content: 'Дар ҳолатҳои ғайричашмдошт, мисли: карантин ё пандемия, офатҳои табиӣ, таъхир ё манъи парвозҳо, ҷанг ё маҳдудиятҳои воридоту содирот — мӯҳлати интиқол метавонад дароз шавад. Дар чунин ҳолатҳо, ҷуброни зарар аз ҷониби ширкат пешбинӣ намешавад.',
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Шартҳо ва қоидаҳо</h2>
        <p className="text-muted-foreground">KHUROSON CARGO - Қоидаҳои хизматрасонӣ</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>📜 Шартҳо ва қоидаҳои хизматрасонии KHUROSON CARGO</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Ширкати KHUROSON CARGO ба шумо барои эътимод ва интихоби мо ҳамчун интиқолдиҳандаи бор миннатдории худро баён менамояд. Барои ҳамкории беҳтар, лутфан бо қоидаҳои зерин шинос шавед.
          </p>
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
          <p className="text-center font-medium">Бо эҳтиром, KHUROSON CARGO</p>
        </CardContent>
      </Card>
    </div>
  );
}
