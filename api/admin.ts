import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

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
    // Read raw body for multipart parsing
    const rawBody = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const contentType = req.headers['content-type'] || '';
    const files: Array<{ name: string; content: string }> = [];

    if (contentType.includes('multipart/form-data')) {
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) return res.status(400).json({ error: 'Invalid multipart request' });
      const boundary = '--' + boundaryMatch[1];
      const body = rawBody.toString('utf-8');
      const parts = body.split(boundary);

      for (const part of parts) {
        if (!part.includes('filename=')) continue;
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd < 0) continue;
        const headers = part.substring(0, headerEnd);
        const content = part.substring(headerEnd + 4).trim();
        // Remove trailing boundary artifacts
        const cleanContent = content.replace(/\r?\n--$/, '').replace(/\r?\n--\r?\n$/, '').trim();

        const filenameMatch = headers.match(/filename=["']?([^"';\r\n]+)["']?/);
        if (!filenameMatch) continue;
        const filename = filenameMatch[1];

        if (filename.endsWith('.xlsx')) {
          // Parse xlsx with SheetJS
          const buf = Buffer.from(cleanContent, 'binary');
          const workbook = XLSX.read(buf, { type: 'buffer' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          files.push({ name: filename, content: parseXlsxRows(rows) });
        } else {
          // CSV
          files.push({ name: filename, content: cleanContent });
        }
      }
    } else if (typeof req.body === 'string') {
      files.push({ name: 'body.csv', content: req.body });
    }

    if (files.length === 0) {
      return res.status(400).json({ error: 'No files received' });
    }

    // Process all files
    let totalImported = 0;
    const allStats: Record<string, number> = {};
    const fileResults: Array<{ name: string; imported: number; stats: Record<string, number> }> = [];

    for (const file of files) {
      const tracksToInsert = parseCsvContent(file.content);

      if (tracksToInsert.length === 0) {
        fileResults.push({ name: file.name, imported: 0, stats: {} });
        continue;
      }

      const unique = new Map();
      tracksToInsert.forEach((t: any) => { if (t) unique.set(t.code, t); });

      const { data, error } = await (supabase as any).from('tracks').upsert(Array.from(unique.values()), { onConflict: 'code' }).select();
      if (error) return res.status(500).json({ error: error.message, file: file.name });

      const stats: Record<string, number> = {};
      data.forEach((t: any) => { stats[t.status] = (stats[t.status] || 0) + 1; });

      totalImported += data.length;
      Object.entries(stats).forEach(([k, v]) => { allStats[k] = (allStats[k] || 0) + v; });
      fileResults.push({ name: file.name, imported: data.length, stats });
    }

    res.status(200).json({ success: true, imported: totalImported, stats: allStats, files: fileResults });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}

/**
 * Парсит строки из xlsx (первая строка может быть заголовком или данными).
 * Возвращает CSV-строку в китайском формате.
 */
function parseXlsxRows(rows: any[][]): string {
  const lines: string[] = [];
  // Добавляем китайский заголовок
  lines.push('运单号,快递公司,操作人,入库时间,入库状态,入库重量,出库时间,出库状态,出库重量');

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    // Проверяем это заголовок или данные
    const firstCell = String(row[0] || '').trim();
    if (firstCell.includes('运单号') || firstCell.toLowerCase().includes('tracking') || firstCell.toLowerCase().includes('code')) {
      continue; // пропускаем заголовок
    }

    // Извлекаем код и дату_тип из строки
    let code: string | null = null;
    let dateType: string | null = null;

    for (const cell of row) {
      if (cell === null || cell === undefined) continue;
      const val = String(cell).trim();
      if (!code && val.length >= 8 && /^[A-Za-z0-9]{8,}$/.test(val)) {
        code = val;
      } else if (!dateType && (/\d{2}\.\d{2}\.\d{4}/.test(val) || /авто|transport|warehouse|border|достав/i.test(val))) {
        dateType = val;
      }
    }

    if (!code) continue;
    lines.push(buildChineseRow(code, dateType));
  }

  return lines.join('\n');
}

/**
 * Строит одну строку в китайском формате.
 */
function buildChineseRow(code: string, dateType: string | null): string {
  const parsed = parseDateType(dateType);
  const formattedDate = convertDateFormat(parsed.dateStr);
  const courier = detectCourier(code);

  let inDate = formattedDate || '';
  let outDate = '';
  let inStatus = parsed.chineseStatus;
  let outStatus = '';

  if (parsed.chineseStatus === '已出库' || parsed.chineseStatus === '边境' || parsed.chineseStatus === '仓库' || parsed.chineseStatus === '已签收') {
    outDate = formattedDate || '';
    inStatus = '已入库';
    outStatus = parsed.chineseStatus;
  }

  return `${code},${courier},,${inDate},${inStatus},,${outDate},${outStatus},`;
}

/**
 * Парсит '13.03.2026 авто' -> { dateStr, typeStr, chineseStatus }.
 */
function parseDateType(value: string | null): { dateStr: string | null; typeStr: string; chineseStatus: string } {
  if (!value) return { dateStr: null, typeStr: '', chineseStatus: '待入库' };

  const dateMatch = value.match(/^(\d{2}\.\d{2}\.\d{4})\s*(.*)/);
  const dateStr = dateMatch ? dateMatch[1] : null;
  const typeStr = dateMatch ? dateMatch[2].trim() : value;
  const typeLower = typeStr.toLowerCase();

  let chineseStatus = '待入库';
  if (/авто|transport|intransit/.test(typeLower)) chineseStatus = '已出库';
  else if (/border|границ/.test(typeLower)) chineseStatus = '边境';
  else if (/warehouse|склад/.test(typeLower)) chineseStatus = '仓库';
  else if (/delivered|достав|签收/.test(typeLower)) chineseStatus = '已签收';
  else if (/await|ожид/.test(typeLower)) chineseStatus = '待入库';
  else if (/received|получ|入库/.test(typeLower)) chineseStatus = '已入库';

  return { dateStr, typeStr, chineseStatus };
}

function convertDateFormat(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return dateStr;
  return `${match[3]}-${match[2]}-${match[1]} 12:00:00`;
}

function detectCourier(code: string): string {
  const upper = code.toUpperCase();
  if (upper.startsWith('YT')) return '圆通';
  if (upper.startsWith('SF')) return '顺丰';
  if (upper.startsWith('JT')) return '极兔';
  return '快递';
}

/**
 * Парсит CSV контент (поддерживает оба формата).
 */
function parseCsvContent(content: string): any[] {
  const csvLines = content.trim().split('\n');
  const hasHeader = csvLines[0].includes('运单号') || csvLines[0].toLowerCase().includes('code');
  const dataLines = hasHeader ? csvLines.slice(1) : csvLines;
  const tracks: any[] = [];

  for (const line of dataLines) {
    if (!line.trim()) continue;
    const parts = line.split(',');

    // Simple format: code,date,type (2-3 columns)
    if (parts.length < 9 && parts.length >= 2) {
      const code = parts[0].trim();
      if (!code || code.length < 8) continue;
      const parsed = parseDateType(parts[1]?.trim() || null);
      tracks.push({
        code,
        status: mapChineseToEnglish(parsed.chineseStatus),
        notes: parsed.typeStr,
        received_date: mapChineseToEnglish(parsed.chineseStatus) === 'received' ? convertDateFormat(parsed.dateStr) : null,
        intransit_date: mapChineseToEnglish(parsed.chineseStatus) === 'intransit' ? convertDateFormat(parsed.dateStr) : null,
        border_date: mapChineseToEnglish(parsed.chineseStatus) === 'border' ? convertDateFormat(parsed.dateStr) : null,
        warehouse_date: mapChineseToEnglish(parsed.chineseStatus) === 'warehouse' ? convertDateFormat(parsed.dateStr) : null,
        delivered_date: mapChineseToEnglish(parsed.chineseStatus) === 'delivered' ? convertDateFormat(parsed.dateStr) : null,
      });
      continue;
    }

    // Chinese format (9+ columns)
    if (parts.length >= 9) {
      const [code, , , inDate, , , outDate, outStatus] = parts;
      if (!code || code.trim().length < 10) continue;

      let status = 'waiting';
      const st = (outStatus || '').trim();
      if (st.includes('拍照') || st.includes('入库')) status = 'received';
      else if (st.includes('出库') || st.includes('运输')) status = 'intransit';
      else if (st.includes('边境')) status = 'border';
      else if (st.includes('仓库')) status = 'warehouse';
      else if (st.includes('交付') || st.includes('签收')) status = 'delivered';
      else if (st.includes('付款')) status = 'payment';

      let cn = '';
      const courier = (parts[1] || '').trim();
      if (code.startsWith('YT')) cn = '圆通'; else if (code.startsWith('SF')) cn = '顺丰'; else if (code.startsWith('JT')) cn = '极兔';
      cn = cn || courier;

      tracks.push({
        code: code.trim(),
        status,
        notes: cn,
        received_date: inDate?.trim() || null,
        intransit_date: outDate?.trim() || null,
        border_date: status === 'border' ? (outDate?.trim() || inDate?.trim() || null) : null,
        warehouse_date: status === 'warehouse' ? (outDate?.trim() || inDate?.trim() || null) : null,
        delivered_date: status === 'delivered' ? (outDate?.trim() || inDate?.trim() || null) : null,
      });
    }
  }
  return tracks;
}

function mapChineseToEnglish(chineseStatus: string): string {
  switch (chineseStatus) {
    case '已入库': return 'received';
    case '已出库': return 'intransit';
    case '边境': return 'border';
    case '仓库': return 'warehouse';
    case '已签收': return 'delivered';
    case '待入库': return 'waiting';
    default: return 'waiting';
  }
}

// GET /api/admin?action=get-tracks&page=1&limit=50
async function handleGetTracks(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const archived = req.query.archived === 'true';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = (supabase as any)
      .from('tracks')
      .select('*', { count: 'exact' })
      .eq('archived', archived)
      .order('intransit_date', { ascending: false, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.ilike('code', `%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({
      success: true,
      tracks: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/admin?action=archive-old-tracks
// Archives only delivered tracks older than the cutoff date.
// Non-delivered tracks (waiting, received, intransit, etc.) are NOT archived
// to prevent hiding unresolved shipments from users.
async function handleArchiveOldTracks(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { months = 4 } = req.body;
    const monthsNum = parseInt(months);
    if (isNaN(monthsNum) || monthsNum < 1 || monthsNum > 24) {
      return res.status(400).json({ error: 'months must be between 1 and 24' });
    }
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsNum);
    // Use consistent date format matching DB storage (YYYY-MM-DD HH:MM:SS)
    const cutoffStr = cutoffDate.toISOString().split('T')[0] + ' 00:00:00';

    // Single atomic UPDATE — only archive DELIVERED tracks to avoid hiding unresolved shipments
    const { data, error } = await (supabase as any)
      .from('tracks')
      .update({ archived: true, archived_at: new Date().toISOString() })
      .eq('archived', false)
      .eq('status', 'delivered')
      .not('intransit_date', 'is', null)
      .lt('intransit_date', cutoffStr)
      .select('code');

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.length) {
      return res.status(200).json({ success: true, archived: 0, message: 'No tracks to archive' });
    }

    return res.status(200).json({
      success: true,
      archived: data.length,
      codes: data.map((t: any) => t.code),
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/admin?action=unarchive-track
async function handleUnarchiveTrack(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code required' });

    const { data, error } = await (supabase as any)
      .from('tracks')
      .update({ archived: false, archived_at: null })
      .eq('code', code)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, track: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// GET /api/admin?action=archive-stats
async function handleArchiveStats(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    // Use count from query result, not array length — more reliable on error edge cases
    const { data: active, error: activeError, count: activeCount } = await (supabase as any)
      .from('tracks')
      .select('id', { count: 'exact' })
      .eq('archived', false);

    const { data: archived, error: archivedError, count: archivedCount } = await (supabase as any)
      .from('tracks')
      .select('id', { count: 'exact' })
      .eq('archived', true);

    if (activeError || archivedError) return res.status(500).json({ error: activeError?.message || archivedError?.message });

    return res.status(200).json({
      success: true,
      activeCount: activeCount || 0,
      archivedCount: archivedCount || 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/admin?action=batch-update
async function handleBatchUpdate(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { startDate, endDate, newStatus, dateColumn = 'intransit_date' } = req.body;
    if (!startDate || !endDate || !newStatus) return res.status(400).json({ error: 'Укажите даты и статус' });
    const dateColMap: Record<string, string> = { received: 'received_date', intransit: 'intransit_date', border: 'border_date', warehouse: 'warehouse_date', delivered: 'delivered_date' };
    // Only update non-archived tracks to prevent data integrity issues
    const { data: tracks, error: fetchError } = await (supabase as any).from('tracks').select('code').eq('archived', false).gte(dateColumn, `${startDate} 00:00:00+00`).lte(dateColumn, `${endDate} 23:59:59+00`).not(dateColumn, 'is', null);
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

// GET /api/admin?action=get-users
async function handleGetUsers(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, users: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/admin?action=toggle-admin
async function handleToggleAdmin(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { userId, isAdmin } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, user: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/admin?action=broadcast
async function handleBroadcast(req: VercelRequest, res: VercelResponse, supabase: SupabaseClient) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });

    // Получаем всех пользователей с telegram_id
    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id')
      .not('telegram_id', 'is', null);

    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0) return res.status(200).json({ success: true, sent: 0 });

    let sentCount = 0;
    let errorCount = 0;

    // Отправляем сообщения (в идеале использовать очередь, но для небольшого числа пользователей сойдет и так)
    for (const user of users) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: message,
            parse_mode: 'HTML'
          })
        });
        
        if (response.ok) sentCount++;
        else errorCount++;
      } catch (e) {
        errorCount++;
      }
    }

    return res.status(200).json({ success: true, sent: sentCount, errors: errorCount });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
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
    case 'get-tracks':
      return handleGetTracks(req, res, supabase);
    case 'archive-old-tracks':
      return handleArchiveOldTracks(req, res, supabase);
    case 'unarchive-track':
      return handleUnarchiveTrack(req, res, supabase);
    case 'archive-stats':
      return handleArchiveStats(req, res, supabase);
    case 'get-users':
      return handleGetUsers(req, res, supabase);
    case 'toggle-admin':
      return handleToggleAdmin(req, res, supabase);
    case 'broadcast':
      return handleBroadcast(req, res, supabase);
    default:
      return res.status(400).json({ error: 'Unknown action. Use: get-prices, update-price, delete-price, import-csv, batch-update, get-tracks, archive-old-tracks, unarchive-track, archive-stats, get-users, toggle-admin, broadcast' });
  }
}
