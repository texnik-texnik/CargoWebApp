import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await requireAdmin(req, res);
  if (!adminCheck) return;

  const { supabase } = adminCheck;

  try {
    const { weight_from, weight_to, price, id } = req.body;

    if (weight_from === undefined || weight_from === null || price === undefined || price === null) {
      return res.status(400).json({ error: 'weight_from and price required' });
    }

    if (id) {
      // Обновление существующей цены
      const { data, error } = await supabase
        .from('prices')
        .update({ weight_from, weight_to: weight_to || null, price, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true, price: data });
    } else {
      // Создание новой цены
      const { data, error } = await supabase
        .from('prices')
        .insert({ weight_from, weight_to: weight_to || null, price })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ success: true, price: data });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
