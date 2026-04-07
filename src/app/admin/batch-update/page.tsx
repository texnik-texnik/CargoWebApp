'use client';

import { useState } from 'react';
import { Calendar, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AdminBatchUpdatePage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [dateColumn, setDateColumn] = useState('intransit_date')
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const statusLabels: Record<string, string> = {
    waiting: 'Ожидает',
    received: 'Получен на складе',
    intransit: 'В пути',
    border: 'На границе',
    warehouse: 'На складе (Душанбе)',
    payment: 'Ожидает оплату',
    delivered: 'Доставлен',
  }

  const columnLabels: Record<string, string> = {
    intransit_date: '出库时间 (Отправка)',
    received_date: '入库时间 (Получение)',
    border_date: 'Дата границы',
    warehouse_date: 'Дата склада',
    delivered_date: 'Дата доставки',
  }

  const handleBatchUpdate = async () => {
    if (!startDate || !endDate || !newStatus) {
      setError('Заполните все поля')
      return
    }

    setUpdating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          newStatus,
          dateColumn,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Массовое обновление статусов</h2>
        <p className="text-muted-foreground">
          Измените статус всех треков в выбранном диапазоне дат
        </p>
      </div>

      {/* Форма обновления */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Параметры обновления
          </CardTitle>
          <CardDescription>
            Выберите диапазон дат и новый статус
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Диапазон дат */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Начальная дата</Label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <Label htmlFor="end-date">Конечная дата</Label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <Separator />

          {/* Новый статус */}
          <div>
            <Label htmlFor="status">Новый статус</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status" className="mt-2">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">⏳ Ожидает</SelectItem>
                <SelectItem value="received">📦 Получен на складе</SelectItem>
                <SelectItem value="intransit">🚚 В пути</SelectItem>
                <SelectItem value="border">🛃 На границе</SelectItem>
                <SelectItem value="warehouse">🏭 На складе (Душанбе)</SelectItem>
                <SelectItem value="payment">💰 Ожидает оплату</SelectItem>
                <SelectItem value="delivered">✅ Доставлен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Колонка для поиска */}
          <div>
            <Label htmlFor="date-column">Поиск по дате</Label>
            <Select value={dateColumn} onValueChange={setDateColumn}>
              <SelectTrigger id="date-column" className="mt-2">
                <SelectValue placeholder="Выберите колонку" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intransit_date">出库时间 (Дата отправки)</SelectItem>
                <SelectItem value="received_date">入库时间 (Дата получения)</SelectItem>
                <SelectItem value="border_date">Дата границы</SelectItem>
                <SelectItem value="warehouse_date">Дата склада</SelectItem>
                <SelectItem value="delivered_date">Дата доставки</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Кнопка обновления */}
          <Button
            onClick={handleBatchUpdate}
            disabled={updating || !startDate || !endDate || !newStatus}
            className="w-full"
            size="lg"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обновление...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Обновить все треки
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ошибка */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Результат */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Успешно обновлено!
            </CardTitle>
            <CardDescription>
              {result.updated} треков обновлено
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Новый статус:</span>
                <Badge>{statusLabels[newStatus] || newStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Диапазон дат:</span>
                <span className="text-sm">
                  {startDate} → {endDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Поиск по:</span>
                <span className="text-sm">{columnLabels[dateColumn] || dateColumn}</span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                ✅ Обновлено треков: <strong>{result.updated}</strong>
              </p>
              <Button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setNewStatus('')
                  setDateColumn('intransit_date')
                  setResult(null)
                }}
                variant="outline"
                className="w-full"
              >
                Обновить ещё
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Подсказка */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 Как использовать</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Пример:</strong> Все треки отправленные с 1 по 5 мая
          </p>
          <p>
            1. Выберите: <strong>01.05.2025</strong> → <strong>05.05.2025</strong>
          </p>
          <p>
            2. Выберите статус: <strong>В пути</strong>
          </p>
          <p>
            3. Поиск по: <strong>出库时间 (Дата отправки)</strong>
          </p>
          <p>
            4. Нажмите <strong>Обновить</strong> - все треки отправленные в этом диапазоне получат статус "В пути"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
