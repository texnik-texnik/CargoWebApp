import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function genClientId(supabase: any): Promise<string> {
  const { data } = await supabase.from('users').select('client_id').not('client_id', 'is', null).order('created_at', { ascending: false }).limit(1);
  let n = 1001;
  if (data?.[0]?.client_id) { const num = parseInt(data[0].client_id.replace('KH-', ''), 10); if (!isNaN(num)) n = num + 1; }
  return `KH-${n}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, verificationCode } = req.body;
    if (!phone || !verificationCode) return res.status(400).json({ error: 'Укажите номер и код' });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: user, error: userError } = await supabase.from('users').select('*').eq('phone', phone).single();

    if (userError || !user) {
      const clientId = await genClientId(supabase);
      const { data: newUser, error: createError } = await supabase.from('users').insert({
        phone, name: '', client_id: clientId, lang: 'ru', history: '',
        verification_code: verificationCode, verification_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      }).select().single();
      if (createError) return res.status(500).json({ error: createError.message });

      // Send welcome via bot if telegram_chat_id exists
      if (newUser.telegram_chat_id) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: newUser.telegram_chat_id, parse_mode: 'HTML',
            text: `🎉 <b>Добро пожаловать!</b>\n\nКлиент: <b>${clientId}</b>\n\nВведите имя в приложении.` }),
        });
      }
      return res.status(200).json({ success: true, user: newUser, isNew: true });
    }

    if (user.verification_code !== verificationCode) return res.status(401).json({ error: 'Неверный код' });
    if (user.verification_expires && new Date(user.verification_expires) < new Date()) return res.status(401).json({ error: 'Код истёк' });

    await supabase.from('users').update({ verification_code: null, verification_expires: null }).eq('phone', phone);
    return res.status(200).json({ success: true, user, isNew: false });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
