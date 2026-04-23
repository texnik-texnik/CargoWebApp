import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { telegram_id, first_name, last_name, username, phone, name, lang } = req.body;
    
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
      if (phone && !existingUser.phone) updateData.phone = phone;
      if (name && !existingUser.name) updateData.name = name;
      if (lang && !existingUser.lang) updateData.lang = lang;

      let finalUser = existingUser;
      if (Object.keys(updateData).length > 0) {
        const { data } = await supabase
          .from('users')
          .update(updateData)
          .eq('telegram_id', telegram_id)
          .select()
          .single();
        if (data) finalUser = data;
      }

      return res.status(200).json({
        success: true,
        user: finalUser,
        isNew: false
      });
    }

    // Создаем нового пользователя
    // Генерируем новый client_id
    const { data: last } = await supabase
      .from('users')
      .select('client_id')
      .not('client_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let n = 1001;
    if (last?.[0]?.client_id) {
      const num = parseInt(last[0].client_id.replace('KH-', ''), 10);
      if (!isNaN(num)) n = num + 1;
    }

    const insertData: any = {
      telegram_id: String(telegram_id),
      name: name || `${first_name || ''} ${last_name || ''}`.trim(),
      client_id: `KH-${n}`,
    };
    
    if (username) insertData.username = username;
    if (phone) insertData.phone = phone;
    if (lang) insertData.lang = lang;

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
