import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;

  try {
    // Accept CSV as text in body or as JSON array
    let tracksToInsert: any[] = [];

    if (Array.isArray(req.body)) {
      tracksToInsert = req.body;
    } else if (typeof req.body === 'string') {
      const lines = req.body.trim().split('\n').slice(1);
      tracksToInsert = lines.map((line: string) => {
        const parts = line.split(',');
        if (parts.length < 9) return null;
        const [code, _co, _op, inDate, _inSt, inWeight, outDate, outStatus, outWeight] = parts;
        if (!code || code.length < 10) return null;
        let status = 'waiting';
        const st = (outStatus || '').trim();
        if (st.includes('拍照') || st.includes('入库')) status = 'received';
        else if (st.includes('出库') || st.includes('运输')) status = 'intransit';
        else if (st.includes('边境')) status = 'border';
        else if (st.includes('仓库')) status = 'warehouse';
        else if (st.includes('交付') || st.includes('签收')) status = 'delivered';
        else if (st.includes('付款')) status = 'payment';
        let cn = '';
        if (code.startsWith('YT')) cn = '圆通'; else if (code.startsWith('SF')) cn = '顺丰'; else if (code.startsWith('JT')) cn = '极兔';
        const w = (outWeight || inWeight || '').trim();
        return { code: code.trim(), status, notes: [cn, w ? `Вес: ${w}` : ''].filter(Boolean).join(' | '), received_date: inDate?.trim() || null, intransit_date: outDate?.trim() || null, border_date: status === 'border' ? (outDate?.trim() || inDate?.trim() || null) : null, warehouse_date: status === 'warehouse' ? (outDate?.trim() || inDate?.trim() || null) : null, delivered_date: status === 'delivered' ? (outDate?.trim() || inDate?.trim() || null) : null };
      }).filter(Boolean);
    }

    const unique = new Map();
    tracksToInsert.forEach((t: any) => { if (t) unique.set(t.code, t); });

    const { data, error } = await (supabase as any).from('tracks').upsert(Array.from(unique.values()), { onConflict: 'code' }).select();
    if (error) return res.status(500).json({ error: error.message });

    const stats: Record<string, number> = {};
    data.forEach((t: any) => { stats[t.status] = (stats[t.status] || 0) + 1; });
    res.status(200).json({ success: true, imported: data.length, stats });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}
