import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { telegram_id, phone, name, lang } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
    
    const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone;
    if (lang) updateData.lang = lang;
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('telegram_id', telegram_id)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, user: data });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}
