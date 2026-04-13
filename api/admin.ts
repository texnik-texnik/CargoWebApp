import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Проверяет, что пользователь является администратором.
 */
async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ supabase: SupabaseClient; user: any } | false> {
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const telegramId = req.headers['x-telegram-id'] || req.query.telegram_id;

  if (!telegramId) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return false;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !user) {
    res.status(401).json({ error: 'Пользователь не найден' });
    return false;
  }

  if (user.is_admin !== true) {
    res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    return false;
  }

  return { supabase, user };
}

// GET /api/admin?action=get-prices
async function handleGetPrices(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .order('weight_from', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ prices: data || [] });
}

// POST /api/admin?action=update-price
async function handleUpdatePrice(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  const { weight_from, weight_to, price, id } = req.body;
  if (weight_from === undefined || weight_from === null || price === undefined || price === null) {
    return res.status(400).json({ error: 'weight_from and price required' });
  }
  if (id) {
    const { data, error } = await supabase
      .from('prices')
      .update({ weight_from, weight_to: weight_to || null, price, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, price: data });
  } else {
    const { data, error } = await supabase
      .from('prices')
      .insert({ weight_from, weight_to: weight_to || null, price })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, price: data });
  }
}

// DELETE /api/admin?action=delete-price
async function handleDeletePrice(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const { error } = await supabase.from('prices').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}

// POST /api/admin?action=import-csv
async function handleImportCsv(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
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

// POST /api/admin?action=batch-update
async function handleBatchUpdate(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;
  const action = req.query.action || req.body?.action;

  switch (action) {
    case 'get-prices':
      return handleGetPrices(req, res, supabase);
    case 'update-price':
      return handleUpdatePrice(req, res, supabase);
    case 'delete-price':
      return handleDeletePrice(req, res, supabase);
    case 'import-csv':
      return handleImportCsv(req, res, supabase);
    case 'batch-update':
      return handleBatchUpdate(req, res, supabase);
    default:
      return res.status(400).json({ error: 'Unknown action. Use: get-prices, update-price, delete-price, import-csv, batch-update' });
  }
}
