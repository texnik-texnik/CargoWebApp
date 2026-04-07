'use client';

import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TrackCardProps {
  track: {
    id: string;
    code: string;
    status: string;
    updated_at?: string;
    notes?: string;
  };
}

const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-500 hover:bg-yellow-600',
  received: 'bg-blue-500 hover:bg-blue-600',
  intransit: 'bg-indigo-500 hover:bg-indigo-600',
  border: 'bg-orange-500 hover:bg-orange-600',
  warehouse: 'bg-purple-500 hover:bg-purple-600',
  payment: 'bg-green-500 hover:bg-green-600',
  delivered: 'bg-emerald-500 hover:bg-emerald-600',
};

const statusLabels: Record<string, string> = {
  waiting: 'Ожидание',
  received: 'Получен',
  intransit: 'В пути',
  border: 'На границе',
  warehouse: 'На складе',
  payment: 'Оплата',
  delivered: 'Доставлен',
};

export function TrackCard({ track }: TrackCardProps) {
  const statusColor = statusColors[track.status] || 'bg-gray-500 hover:bg-gray-600';
  const statusLabel = statusLabels[track.status] || track.status;

  return (
    <Link
      to={`/tracks/${track.id}`}
      className="block transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <Card className="hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg ${statusColor} p-2 transition-colors`}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">{track.code}</p>
                {track.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {track.notes}
                  </p>
                )}
                {track.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(track.updated_at).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColor} text-white`}>
                {statusLabel}
              </Badge>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
