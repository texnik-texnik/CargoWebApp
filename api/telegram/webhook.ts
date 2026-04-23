import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

const CHINA_ADDR_BASE = `浙江省金华市义乌市荷叶塘工業区东青路87号一楼 库房1号门-Khuroson`;

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ъ': '', 'ь': '',
    'ғ': 'gh', 'ӣ': 'i', 'қ': 'q', 'ӯ': 'u', 'ҳ': 'h', 'ҷ': 'j',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ы': 'Y', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya', 'Ъ': '', 'Ь': '',
    'Ғ': 'Gh', 'Ӣ': 'I', 'Қ': 'Q', 'Ӯ': 'U', 'Ҳ': 'H', 'Ҷ': 'J'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const update = req.body;
    if (!update?.message) return res.status(200).end();
    const chatId = update.message.chat.id;
    const text = update.message.text?.trim();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userId = String(update.message.from.id);

    if (text === '/start') {
      await sendTG(chatId, '👋 Хуш омадед ба <b>KHUROSON CARGO</b>!\n\nИн бот ба шумо кӯмак мекунад, ки борҳои худро пайгирӣ кунед ва маълумоти лозимиро гиред.\n\nЛутфан аз тугмаҳои поён истифода баред.', MAIN_KEYBOARD);
      return res.status(200).end();
    }

    // Обработка кнопок
    if (text === '🔍 Ҷустуҷӯи трек') {
      await sendTG(chatId, '🔎 Лутфан <b>трек-кодро</b> ворид кунед:');
      return res.status(200).end();
    }

    if (text === '🇨🇳 Суроғаи Чин') {
      const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
      
      let personalizedAddr = CHINA_ADDR_BASE;
      if (user && user.name && user.phone) {
        const phoneShort = user.phone.replace('+992', '').replace(/\s/g, '');
        const nameSlug = transliterate(user.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        personalizedAddr = `${CHINA_ADDR_BASE}-${nameSlug}-${phoneShort}`;
      }

      await sendTG(chatId, `🇨🇳 <b>Суроғаи анбор дар Чин:</b>\n\n<code>${personalizedAddr}</code>\n\n(Барои нусхабардорӣ болои суроға пахш кунед)`);
      return res.status(200).end();
    }

    if (text === '👨‍💻 Администратор') {
      await sendTG(chatId, '👨‍💻 <b>Контактҳои администратор:</b>\n\nTelegram: @IT_TEXNIK\nТелефон: +992 900017456');
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
      const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
      if (user) {
        await sendTG(chatId, `👤 <b>Профили шумо:</b>\n\nНом: ${user.name || 'Навишта нашудааст'}\nID: ${user.client_id || '—'}\nТелефон: ${user.phone || '—'}`);
      } else {
        await sendTG(chatId, '👤 Шумо то ҳол бақайдгирӣ накардаед. Лутфан аввал дар барнома бақайдгирӣ кунед.');
      }
      return res.status(200).end();
    }

    // Если это трек-код (длинная строка без пробелов)
    if (text && text.length >= 8 && !text.includes(' ')) {
      const { data: track } = await supabase.from('tracks').select('*').eq('code', text).single();
      if (track) {
        const statusLabels: Record<string, string> = { waiting: 'Интизорӣ', received: 'Қабул шуд', intransit: 'Дар роҳ', border: 'Дар сарҳад', warehouse: 'Дар анбор', payment: 'Пардохт', delivered: 'Расонида шуд' };
        await sendTG(chatId, `📦 <b>Маълумот дар бораи трек:</b>\n\nКод: <code>${track.code}</code>\nВазъият: <b>${statusLabels[track.status] || track.status}</b>\nСанаи охирин: ${track.updated_at ? new Date(track.updated_at).toLocaleDateString() : '—'}`);
      } else {
        await sendTG(chatId, `❌ Трек-код <b>${text}</b> ёфт нашуд.`);
      }
      return res.status(200).end();
    }

    await sendTG(chatId, '⚠️ Лутфан аз меню истифода баред.', MAIN_KEYBOARD);
    return res.status(200).end();
  } catch (e) { console.error(e); return res.status(200).end(); }
}
