import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

interface FileItem {
  file: File;
  id: string;
}

export default function AdminImportPage() {
  const { t } = useAppLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = { 
    waiting: t.waiting, 
    received: t.received, 
    intransit: t.intransit, 
    border: t.border, 
    warehouse: t.warehouse, 
    payment: t.payment, 
    delivered: t.delivered 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileItem[] = Array.from(e.target.files).map(f => ({
        file: f,
        id: Math.random().toString(36).substring(7),
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
      setResult(null);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f.file));
      const response = await authenticatedFetch('/api/admin?action=import-csv', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload error');
      setResult(data);
      setFiles([]);
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); }
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.importTracks}</h2>
        <p className="text-muted-foreground">{t.importTracksDesc}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> {t.supportedFormats}</CardTitle>
          <CardDescription>{t.autoConvert}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-green-600" /> {t.xlsxFormat}</p>
          <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> {t.csvFormat}</p>
          <Separator />
          <p className="text-muted-foreground">{t.multiUploadNote}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>{t.fileLoading}</CardTitle><CardDescription>{files.length > 0 ? `${t.totalUsers.replace('Пользователей', 'Выбрано файлов').replace('Истифодабарандагон', 'Файлҳо интихоб шудаанд')}: ${files.length}` : t.clickSelect}</CardDescription></CardHeader>
        <CardContent>
          <label className="block mb-4">
            <input type="file" accept=".xlsx,.csv" multiple onChange={handleFileChange} className="hidden" />
            <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-accent">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">{t.clickToSelectFiles}</p>
                <p className="text-sm text-muted-foreground">{t.xlsxCsvMulti}</p>
              </div>
            </div>
          </label>

          {files.length > 0 && (
            <div className="mb-4 space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {f.file.name.endsWith('.xlsx') ? <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" /> : <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFile(f.id)} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">{t.totalSize}: {(totalSize / 1024).toFixed(1)} KB</p>
            </div>
          )}

          <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full" size="lg">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.loading}</> : <><Upload className="mr-2 h-4 w-4" /> {t.uploadCount.replace('{count}', String(files.length))}</>}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertTitle>{t.error}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> {t.importSuccess}</CardTitle>
            <CardDescription>{t.importedTotal.replace('{count}', String(result.imported))}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Per-file results */}
              {result.files && result.files.length > 1 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{t.byFiles}</h4>
                  {result.files.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="truncate">{f.name}</span>
                      <Badge variant="secondary">{f.imported} {t.tracks}</Badge>
                    </div>
                  ))}
                  <Separator />
                </div>
              )}

              {/* Overall stats */}
              <div>
                <h4 className="font-medium mb-2">{t.stats}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.stats || {}).map(([status, count]) => (
                    <Badge key={status} variant="secondary">{statusLabels[status] || status}: {String(count)}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <Button onClick={() => { setFiles([]); setResult(null); }} variant="outline" className="w-full">{t.uploadMore}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
