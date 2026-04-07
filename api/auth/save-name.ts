import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { phone, name } = req.body;
    if (!phone || !name) return res.status(400).json({ error: 'Укажите телефон и имя' });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase.from('users').update({ name: name.trim() }).eq('phone', phone).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, user: data });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
