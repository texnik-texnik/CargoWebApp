import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';

interface Price {
  id: string;
  weight_from: number;
  weight_to: number | null;
  price: number;
  currency: string;
}

export default function AdminPricesPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ weight_from: string; weight_to: string; price: string }>({ weight_from: '', weight_to: '', price: '' });
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState<{ weight_from: string; weight_to: string; price: string }>({ weight_from: '', weight_to: '', price: '' });

  useEffect(() => { loadPrices(); }, []);

  async function loadPrices() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/get-prices');
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    try {
      const response = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          weight_from: parseFloat(editData.weight_from),
          weight_to: editData.weight_to ? parseFloat(editData.weight_to) : null,
          price: parseFloat(editData.price),
        }),
      });

      if (response.ok) {
        setSuccess('Цена обновлена!');
        setEditing(null);
        setTimeout(() => setSuccess(null), 3000);
        loadPrices();
      } else {
        const err = await response.json();
        setError(err.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить эту цену?')) return;
    try {
      const response = await fetch('/api/admin/delete-price', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSuccess('Цена удалена!');
        setTimeout(() => setSuccess(null), 3000);
        loadPrices();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAdd() {
    try {
      const response = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_from: parseFloat(newData.weight_from),
          weight_to: newData.weight_to ? parseFloat(newData.weight_to) : null,
          price: parseFloat(newData.price),
        }),
      });

      if (response.ok) {
        setSuccess('Цена добавлена!');
        setAdding(false);
        setNewData({ weight_from: '', weight_to: '', price: '' });
        setTimeout(() => setSuccess(null), 3000);
        loadPrices();
      } else {
        const err = await response.json();
        setError(err.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Управление ценами</h2>
          <p className="text-muted-foreground">Редактируйте тарифы на доставку</p>
        </div>
      </div>

      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-4 border-green-500 bg-green-50"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Тарифы</CardTitle>
              <CardDescription>Актуальные цены на доставку</CardDescription>
            </div>
            {!adding && (
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Вес от</TableHead>
                  <TableHead>Вес до</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price) => (
                  <TableRow key={price.id}>
                    {editing === price.id ? (
                      <>
                        <TableCell><Input type="number" value={editData.weight_from} onChange={(e) => setEditData({ ...editData, weight_from: e.target.value })} className="w-20" /></TableCell>
                        <TableCell><Input type="number" value={editData.weight_to} onChange={(e) => setEditData({ ...editData, weight_to: e.target.value })} className="w-20" placeholder="∞" /></TableCell>
                        <TableCell><Input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className="w-24" /></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleSave(price.id)}><Save className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{price.weight_from} кг</TableCell>
                        <TableCell>{price.weight_to ? `${price.weight_to} кг` : '∞'}</TableCell>
                        <TableCell><Badge>{price.price} {price.currency}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditing(price.id); setEditData({ weight_from: String(price.weight_from), weight_to: price.weight_to ? String(price.weight_to) : '', price: String(price.price) }); }}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(price.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                {adding && (
                  <TableRow>
                    <TableCell><Input type="number" value={newData.weight_from} onChange={(e) => setNewData({ ...newData, weight_from: e.target.value })} placeholder="0" className="w-20" /></TableCell>
                    <TableCell><Input type="number" value={newData.weight_to} onChange={(e) => setNewData({ ...newData, weight_to: e.target.value })} placeholder="∞" className="w-20" /></TableCell>
                    <TableCell><Input type="number" value={newData.price} onChange={(e) => setNewData({ ...newData, price: e.target.value })} className="w-24" /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleAdd}><Save className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewData({ weight_from: '', weight_to: '', price: '' }); }}><X className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
