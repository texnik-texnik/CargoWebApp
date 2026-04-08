import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Укажите телефон' });
    
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone as string)
      .single();
    
    if (error) return res.status(404).json({ error: error.message });
    return res.status(200).json({ user: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
