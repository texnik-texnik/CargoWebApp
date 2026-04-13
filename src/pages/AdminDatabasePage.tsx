import { useAppLanguage } from '../hooks/useLanguage';
import { authenticatedFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Database, Search, Filter, ChevronLeft, ChevronRight, Loader2, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const statusLabels: Record<string, string> = {
  waiting: 'Ожидание',
  received: 'Получен',
  intransit: 'В пути',
  border: 'На границе',
  warehouse: 'На складе',
  payment: 'Оплата',
  delivered: 'Доставлен',
};

const statusColors: Record<string, string> = {
  waiting: 'bg-gray-100 text-gray-800',
  received: 'bg-blue-100 text-blue-800',
  intransit: 'bg-orange-100 text-orange-800',
  border: 'bg-yellow-100 text-yellow-800',
  warehouse: 'bg-purple-100 text-purple-800',
  payment: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
};

interface Track {
  id: string;
  code: string;
  status: string;
  received_date: string | null;
  intransit_date: string | null;
  border_date: string | null;
  warehouse_date: string | null;
  delivered_date: string | null;
  notes: string | null;
  created_at: string;
}

export default function AdminDatabasePage() {
  const { t } = useAppLanguage();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const response = await authenticatedFetch(`/api/admin?action=get-tracks&${params}`);
      const data = await response.json();

      if (response.ok) {
        setTracks(data.tracks);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTracks();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.database}</h2>
        <p className="text-muted-foreground">{t.databaseDesc}</p>
      </div>

      {/* Stats Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t.manageTracks}
          </CardTitle>
          <CardDescription>{total} треков в базе данных</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchByCode}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="waiting">{statusLabels.waiting}</SelectItem>
                <SelectItem value="received">{statusLabels.received}</SelectItem>
                <SelectItem value="intransit">{statusLabels.intransit}</SelectItem>
                <SelectItem value="border">{statusLabels.border}</SelectItem>
                <SelectItem value="warehouse">{statusLabels.warehouse}</SelectItem>
                <SelectItem value="payment">{statusLabels.payment}</SelectItem>
                <SelectItem value="delivered">{statusLabels.delivered}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.search}
            </Button>
          </form>

          {/* Tracks Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t.noTracksFound}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t.trackingCode}</TableHead>
                    <TableHead className="w-[120px]">{t.status}</TableHead>
                    <TableHead className="w-[180px]">{t.receivedDate}</TableHead>
                    <TableHead className="w-[180px]">{t.intransitDate}</TableHead>
                    <TableHead className="w-[180px]">{t.borderDate}</TableHead>
                    <TableHead className="w-[180px]">{t.warehouseDate}</TableHead>
                    <TableHead className="w-[180px]">{t.deliveredDate}</TableHead>
                    <TableHead>{t.notes}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-mono font-medium">{track.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[track.status] || ''}>
                          {statusLabels[track.status] || track.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.received_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.intransit_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.border_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.warehouse_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(track.delivered_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{track.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && tracks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Показано {tracks.length} из {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
