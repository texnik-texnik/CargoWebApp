import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const statusLabels: Record<string, string> = { waiting: 'Ожидает', received: 'Получен', intransit: 'В пути', border: 'На границе', warehouse: 'На складе', payment: 'Оплата', delivered: 'Доставлен' };


export default function AdminImportPage() {
  const { t } = useAppLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(null); setResult(null); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await authenticatedFetch('/api/admin/import-csv', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload error');
      setResult(data);
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Импорт треков из CSV</h2><p className="text-muted-foreground">Загрузите CSV файл из китайской таблицы</p></div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Как использовать</CardTitle><CardDescription>Автоматическая конвертация и загрузка</CardDescription></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">Шаг 1: Экспорт из Google Sheets</p><p className="text-muted-foreground">File → Download → CSV (.csv)</p>
          <p className="font-medium">Шаг 2: Загрузите файл сюда</p><p className="text-muted-foreground">Файл автоматически сконвертируется и загрузится в базу</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Загрузка CSV</CardTitle><CardDescription>Поддерживаются файлы с китайскими колонками</CardDescription></CardHeader>
        <CardContent>
          <label className="block mb-4">
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-accent">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center"><p className="font-medium">{file ? file.name : t.selectCSV}</p><p className="text-sm text-muted-foreground">{file ? `${(file.size / 1024).toFixed(2)} KB` : t.clickSelect}</p></div>
            </div>
          </label>
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка...</> : <><Upload className="mr-2 h-4 w-4" /> Загрузить треки</>}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertTitle>Ошибка</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {result && <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Успешно!</CardTitle><CardDescription>{result.imported} треков загружено</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium">Статистика:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.stats || {}).map(([status, count]) => (
                <Badge key={status} variant="secondary">{statusLabels[status] || status}: {String(count)}</Badge>
              ))}
            </div>
            <Separator />
            <Button onClick={() => { setFile(null); setResult(null); }} variant="outline" className="w-full">Загрузить ещё</Button>
          </div>
        </CardContent>
      </Card>}
    </div>
  );
}
