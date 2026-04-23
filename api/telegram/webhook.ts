import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generateCode(): string { return Math.floor(1000 + Math.random() * 9000).toString(); }

async function sendTG(chatId: string, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...(reply_markup && { reply_markup }) }),
  });
}

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '🔍 Ҷустуҷӯи трек' }, { text: '🇨🇳 Суроғаи Чин' }],
    [{ text: '👨‍💻 Администратор' }, { text: '🇹🇯 Суроғаи Хуросон' }],
    [{ text: '💰 Тарифҳо' }, { text: '👤 Профил' }]
  ],
  resize_keyboard: true
};

const CHINA_ADDR = `浙江省金华市义乌市荷叶塘工业区东青路87号一楼 库房1号门-Khuroson`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const update = req.body;
    if (!update?.message) return res.status(200).end();
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim();
    if (!text) return res.status(200).end();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (text === '/start') {
      await sendTG(chatId, '👋 Хуш омадед ба <b>KHUROSON CARGO</b>!\n\nБарои гирифтани рамзи тасдиқ рақами телефонатонро фиристед ё аз тугмаҳои поён истифода баред.', MAIN_KEYBOARD);
      return res.status(200).end();
    }

    // Обработка кнопок
    if (text === '🔍 Ҷустуҷӯи трек') {
      await sendTG(chatId, '🔎 Лутфан <b>трек-кодро</b> ворид кунед:');
      return res.status(200).end();
    }

    if (text === '🇨🇳 Суроғаи Чин') {
      await sendTG(chatId, `🇨🇳 <b>Суроғаи анбор дар Чин:</b>\n\n<code>${CHINA_ADDR}</code>\n\n(Барои нусхабардорӣ болои суроға пахш кунед)`);
      return res.status(200).end();
    }

    if (text === '👨‍💻 Администратор') {
      await sendTG(chatId, '👨‍💻 <b>Контактҳои администратор:</b>\n\nTelegram: @khuroson_admin\nТелефон: +992 000 00 00 00');
      return res.status(200).end();
    }

    if (text === '🇹🇯 Суроғаи Хуросон') {
      await sendTG(chatId, '🇹🇯 <b>Суроғаи мо дар Хуросон:</b>\n\nНоҳияи Хуросон, маркази ноҳия.\nОриентир: Назди бозор.');
      return res.status(200).end();
    }

    if (text === '💰 Тарифҳо') {
      const { data: prices } = await supabase.from('prices').select('*').order('weight_from', { ascending: true });
      let msg = '💰 <b>Тарифҳои интиқол:</b>\n\n';
      if (prices && prices.length > 0) {
        prices.forEach(p => {
          msg += `• Аз ${p.weight_from} то ${p.weight_to || '...'} кг: <b>$${p.price}</b>\n`;
        });
      } else {
        msg += 'Маълумот дар бораи нархҳо ҳоло дастрас нест.';
      }
      await sendTG(chatId, msg);
      return res.status(200).end();
    }

    if (text === '👤 Профил') {
      const { data: user } = await supabase.from('users').select('*').eq('telegram_id', String(update.message.from.id)).single();
      if (user) {
        await sendTG(chatId, `👤 <b>Профили шумо:</b>\n\nНом: ${user.name || 'Навишта нашудааст'}\nID: ${user.client_id || '—'}\nТелефон: ${user.phone || '—'}`);
      } else {
        await sendTG(chatId, '👤 Шумо то ҳол бақайдгирӣ накардаед. Лутфан рақами телефонатонро фиристед.');
      }
      return res.status(200).end();
    }

    // Проверка на номер телефона
    const phoneMatch = text.match(/^\+?992\d{9}$/);
    if (phoneMatch) {
      const phone = text.startsWith('+') ? text : `+${text}`;
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const { data: existing } = await supabase.from('users').select('*').eq('phone', phone).single();
      if (!existing) {
        const { data: last } = await supabase.from('users').select('client_id').not('client_id', 'is', null).order('created_at', { ascending: false }).limit(1);
        let n = 1001;
        if (last?.[0]?.client_id) { const num = parseInt(last[0].client_id.replace('KH-', ''), 10); if (!isNaN(num)) n = num + 1; }
        await supabase.from('users').insert({ phone, name: '', client_id: `KH-${n}`, telegram_chat_id: String(chatId), telegram_id: String(update.message.from.id), verification_code: code, verification_expires: expiresAt.toISOString() });
      } else {
        await supabase.from('users').update({ verification_code: code, verification_expires: expiresAt.toISOString(), telegram_chat_id: String(chatId), telegram_id: String(update.message.from.id) }).eq('phone', phone);
      }
      await sendTG(chatId, `🔐 <b>Рамзи тасдиқ:</b>\n\n━━━━━━━━━━━━━━━\n<b>    ${code}</b>\n━━━━━━━━━━━━━━━\n\n⏰ 10 дақиқа эътибор дорад.\nОнро дар барнома ворид кунед.`);
      return res.status(200).end();
    }

    // Если это трек-код (длинная строка без пробелов)
    if (text.length >= 8 && !text.includes(' ')) {
      const { data: track } = await supabase.from('tracks').select('*').eq('code', text).single();
      if (track) {
        const statusLabels: Record<string, string> = { waiting: 'Интизорӣ', received: 'Қабул шуд', intransit: 'Дар роҳ', border: 'Дар сарҳад', warehouse: 'Дар анбор', payment: 'Пардохт', delivered: 'Расонида шуд' };
        await sendTG(chatId, `📦 <b>Маълумот дар бораи трек:</b>\n\nКод: <code>${track.code}</code>\nВазъият: <b>${statusLabels[track.status] || track.status}</b>\nСанаи охирин: ${track.updated_at ? new Date(track.updated_at).toLocaleDateString() : '—'}`);
      } else {
        await sendTG(chatId, `❌ Трек-код <b>${text}</b> ёфт нашуд.`);
      }
      return res.status(200).end();
    }

    await sendTG(chatId, '⚠️ Лутфан рақами телефонро ворид кунед (масалан: +992900017456) ё аз меню истифода баред.', MAIN_KEYBOARD);
    return res.status(200).end();
  } catch (e) { console.error(e); return res.status(200).end(); }
}
