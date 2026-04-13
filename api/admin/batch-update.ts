import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;

  try {
    const { startDate, endDate, newStatus, dateColumn = 'intransit_date' } = req.body;
    if (!startDate || !endDate || !newStatus) return res.status(400).json({ error: 'Укажите даты и статус' });

    const dateColMap: Record<string, string> = { received: 'received_date', intransit: 'intransit_date', border: 'border_date', warehouse: 'warehouse_date', delivered: 'delivered_date' };

    const { data: tracks, error: fetchError } = await (supabase as any).from('tracks').select('code').gte(dateColumn, `${startDate} 00:00:00+00`).lte(dateColumn, `${endDate} 23:59:59+00`).not(dateColumn, 'is', null);
    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!tracks?.length) return res.status(404).json({ error: 'Треки не найдены' });

    const updateData: any = { status: newStatus };
    if (dateColMap[newStatus]) updateData[dateColMap[newStatus]] = new Date().toISOString();

    const codes = tracks.map((t: any) => t.code);
    const { data, error } = await (supabase as any).from('tracks').update(updateData).in('code', codes).select();
    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ success: true, updated: data.length, codes });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}
