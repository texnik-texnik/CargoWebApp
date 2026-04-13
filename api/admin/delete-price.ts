import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { error } = await supabase
      .from('prices')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
