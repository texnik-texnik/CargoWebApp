import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Генерация 4-значного кода
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Отправка сообщения
async function sendTelegramMessage(chatId: string, text: string, reply_markup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  }
  if (reply_markup) body.reply_markup = reply_markup

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const update = body
    
    if (!update.message) return new NextResponse('ok')

    const chatId = update.message.chat.id
    const text = update.message.text?.trim()
    const firstName = update.message.from?.first_name || 'Пользователь'

    if (!text) return new NextResponse('ok')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Команда /start
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        `👋 Здравствуйте, ${firstName}!\n\nДля входа в приложение введите ваш номер телефона.\n\nФормат: <b>+992XXXXXXXXX</b>`,
        { force_reply: true, input_field_placeholder: '+992...' }
      )
      return new NextResponse('ok')
    }

    // Проверка является ли текст номером телефона
    const phoneMatch = text.match(/^\+?992\d{9}$/)
    
    if (phoneMatch) {
      const phone = text.startsWith('+') ? text : `+${text}`
      
      // Генерируем код
      const code = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      // Проверяем/создаём пользователя
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      if (!existingUser) {
        // Создаём нового пользователя
        const { data: lastUser } = await supabase
          .from('users')
          .select('client_id')
          .not('client_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
        
        let nextNumber = 1001
        if (lastUser && lastUser.length > 0 && lastUser[0].client_id) {
          const num = parseInt(lastUser[0].client_id.replace('KH-', ''), 10)
          if (!isNaN(num)) nextNumber = num + 1
        }

        await supabase.from('users').insert({
          phone,
          name: firstName,
          client_id: `KH-${nextNumber}`,
          telegram_chat_id: String(chatId),
          telegram_id: String(update.message.from.id),
          verification_code: code,
          verification_expires: expiresAt.toISOString(),
        })
      } else {
        // Обновляем код для существующего
        await supabase
          .from('users')
          .update({
            verification_code: code,
            verification_expires: expiresAt.toISOString(),
            telegram_chat_id: String(chatId),
            telegram_id: String(update.message.from.id),
          })
          .eq('phone', phone)
      }

      await sendTelegramMessage(
        chatId,
        `🔐 <b>Ваш код подтверждения:</b>\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `<b>    ${code}</b>\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `⏰ Действует 10 минут\n` +
        `Введите этот код в приложении.`
      )
      
      return new NextResponse('ok')
    }

    // Если введено что-то другое
    await sendTelegramMessage(
      chatId,
      `⚠️ Пожалуйста, введите корректный номер телефона.\n\nПример: <b>+992927848483</b>`,
      { force_reply: true, input_field_placeholder: '+992...' }
    )

    return new NextResponse('ok')
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('ok')
  }
}
