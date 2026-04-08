import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { telegram_id, first_name, last_name, username, phone, name } = req.body;
    
    if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });

    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Проверяем существует ли пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .single();

    if (existingUser) {
      // Пользователь уже есть - обновляем данные если есть новые
      const updateData: any = {};
      if (phone) updateData.phone = phone;
      if (name) updateData.name = name;
      
      if (Object.keys(updateData).length > 0) {
        await supabase.from('users').update(updateData).eq('telegram_id', telegram_id);
      }
      
      return res.status(200).json({ 
        success: true, 
        user: { ...existingUser, ...updateData },
        isNew: false
      });
    }

    // Создаем нового пользователя
    const insertData: any = {
      telegram_id,
      name: name || `${first_name || ''} ${last_name || ''}`.trim(),
    };
    
    if (username) insertData.username = username;
    if (phone) insertData.phone = phone;

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ success: true, user: newUser, isNew: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
