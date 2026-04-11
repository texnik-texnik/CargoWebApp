import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Проверяет, что пользователь является администратором.
 * Возвращает Supabase клиент и объект пользователя если проверка прошла.
 * Возвращает false если проверка не прошла (нужно отправить 403 ответ).
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ supabase: ReturnType<typeof createClient>; user: any } | false> {
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Получаем telegram_id из заголовка или query
  const telegramId = req.headers['x-telegram-id'] || req.query.telegram_id;

  if (!telegramId) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return false;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !user) {
    res.status(401).json({ error: 'Пользователь не найден' });
    return false;
  }

  if (user.is_admin !== true) {
    res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    return false;
  }

  return { supabase, user };
}
