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
      await sendTG(chatId, '👋 Добро пожаловать!\n\nВведите <b>номер телефона</b>.\nФормат: <b>+992XXXXXXXXX</b>', { force_reply: true, input_field_placeholder: '+992...' });
      return res.status(200).end();
    }

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
      await sendTG(chatId, `🔐 <b>Код подтверждения:</b>\n\n━━━━━━━━━━━━━━━\n<b>    ${code}</b>\n━━━━━━━━━━━━━━━\n\n⏰ 10 минут\nВведите в приложении.`);
      return res.status(200).end();
    }

    await sendTG(chatId, '⚠️ Введите номер: <b>+992XXXXXXXXX</b>', { force_reply: true });
    return res.status(200).end();
  } catch (e) { console.error(e); return res.status(200).end(); }
}
