import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { useState, useEffect, useRef } from 'react';
import { Archive, RotateCcw, Database, Search, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface Track {
  id: string;
  code: string;
  status: string;
  intransit_date: string | null;
  archived_at: string | null;
  notes: string | null;
}

interface ArchiveStats {
  activeCount: number;
  archivedCount: number;
  activeByStatus: Record<string, number>;
}

export default function AdminArchivePage() {
  const { t, lang } = useAppLanguage();
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [archivedTracks, setArchivedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [result, setResult] = useState<{ archived: number; cutoffDate: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 30;

  const statusLabels: Record<string, string> = {
    waiting: t.waiting,
    received: t.received,
    intransit: t.intransit,
    border: t.border,
    warehouse: t.warehouse,
    payment: t.payment,
    delivered: t.delivered,
  };

  const loadStats = async () => {
    try {
      const response = await authenticatedFetch('/api/admin?action=archive-stats');
      const data = await response.json();
      if (response.ok) setStats(data);
    } catch (err) {
      console.error('Failed to load archive stats:', err);
    }
  };

  const loadArchived = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'get-tracks',
        archived: 'true',
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set('search', search.trim());

      const response = await authenticatedFetch(`/api/admin?${params}`);
      const data = await response.json();
      if (response.ok) {
        setArchivedTracks(data.tracks);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load archived tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  useEffect(() => {
    loadArchived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleArchiveOld = async () => {
    const confirmMsg = lang === 'tj' ? 'Ҳамаи трекҳои РАСОНИДАШУДАИ аз 4 моҳ кӯҳнаро ба архив мебаред? Ин амалро бекор кардан мумкин аст.' : 'Архивировать все ДОСТАВЛЕННЫЕ треки старше 4 месяцев? Это действие можно отменить.';
    if (!window.confirm(confirmMsg)) return;

    setArchiving(true); setError(null); setResult(null);
    try {
      const response = await authenticatedFetch('/api/admin?action=archive-old-tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: 4 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Archive error');
      setResult({ archived: data.archived, cutoffDate: data.cutoffDate });
      loadStats();
      loadArchived();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async (code: string) => {
    try {
      const response = await authenticatedFetch('/api/admin?action=unarchive-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (response.ok) {
        loadStats();
        loadArchived();
      }
    } catch (err) {
      console.error('Failed to unarchive:', err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.archiveTitle}</h2>
        <p className="text-muted-foreground">{t.archiveDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.activeTracks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.archivedTracks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.archivedCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.deliveredCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeByStatus?.delivered || 0}</div>
          </CardContent>
        </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {t.archiveOldTitle}
          </CardTitle>
          <CardDescription>{t.archiveOldDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleArchiveOld} disabled={archiving} size="lg" className="w-full">
            {archiving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.archiving}...</>
            ) : (
              <><Archive className="mr-2 h-4 w-4" /> {t.archiveOldBtn}</>
            )}
          </Button>

          {result && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">{t.archiveSuccess}</AlertTitle>
              <AlertDescription className="text-green-700">
                {t.archiveSuccessDesc.replace('{count}', String(result.archived))}
                <br />
                <span className="text-sm">{t.archiveCutoff.replace('{date}', formatDate(result.cutoffDate))}</span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.error}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t.archivedList}
          </CardTitle>
          <CardDescription>{t.tracksInDb.replace('{count}', String(archivedTracks.length)).replace('базе данных', 'архиве').replace('пойгоҳи додаҳо', 'архив')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchArchive} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : archivedTracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t.noArchivedTracks}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{t.trackingCode}</TableHead>
                    <TableHead className="w-[120px]">{t.statusLabel}</TableHead>
                    <TableHead className="w-[140px]">{t.intransitDate}</TableHead>
                    <TableHead className="w-[140px]">{t.archivedAt}</TableHead>
                    <TableHead className="w-[100px]">{t.actionsLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedTracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-mono font-medium">{track.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{statusLabels[track.status] || track.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.intransit_date)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(track.archived_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchive(track.code)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && archivedTracks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {t.shownOf.replace('{count}', String(archivedTracks.length)).replace('{total}', String(archivedTracks.length))}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ←
                </Button>
                <span className="text-sm">{t.page.replace('{current}', String(page)).replace('{total}', String(totalPages))}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
