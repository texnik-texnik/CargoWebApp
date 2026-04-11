import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;

  try {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .order('weight_from', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ prices: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
