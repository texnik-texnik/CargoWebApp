import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { phone, trackCode } = req.body;
    if (!phone || !trackCode) return res.status(400).json({ error: 'Укажите телефон и трек-код' });
    
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Получаем текущую историю
    const { data: user } = await supabase
      .from('users')
      .select('history')
      .eq('phone', phone)
      .single();
    
    const history = user?.history ? user.history.split(',').filter(Boolean) : [];
    const newHistory = [trackCode, ...history.filter((c: string) => c !== trackCode)].slice(0, 50);
    
    // Обновляем историю
    const { error } = await supabase
      .from('users')
      .update({ history: newHistory.join(',') })
      .eq('phone', phone);
    
    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ success: true, history: newHistory });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
