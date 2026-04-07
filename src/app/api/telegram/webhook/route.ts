import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

async function sendTelegramMessage(chatId: string, text: string, reply_markup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
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
    if (!text) return new NextResponse('ok')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // /start — просим имя
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        `👋 Добро пожаловать в Khuroson Cargo!\n\nВведите ваше <b>имя латинскими буквами</b>.\n\nПример: <b>Ali Valiyev</b>`,
        { force_reply: true, input_field_placeholder: 'Ali Valiyev' }
      )
      return new NextResponse('ok')
    }

    // Проверяем — это имя (нет phone)?
    const { data: pendingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .is('phone', null)
      .maybeSingle()

    if (pendingUser) {
      await supabase
        .from('users')
        .update({ name: text })
        .eq('telegram_chat_id', String(chatId))
        .is('phone', null)

      await sendTelegramMessage(
        chatId,
        `✅ Отлично, ${text}!\n\nТеперь введите ваш <b>номер телефона</b>.\n\nФормат: <b>+992XXXXXXXXX</b>`,
        { force_reply: true, input_field_placeholder: '+992...' }
      )
      return new NextResponse('ok')
    }

    // Проверка номера телефона
    const phoneMatch = text.match(/^\+?992\d{9}$/)

    if (phoneMatch) {
      const phone = text.startsWith('+') ? text : `+${text}`
      const code = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (!existingUser) {
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
          name: '',
          client_id: `KH-${nextNumber}`,
          telegram_chat_id: String(chatId),
          telegram_id: String(update.message.from.id),
          verification_code: code,
          verification_expires: expiresAt.toISOString(),
        })
      } else {
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

    // Непонятный ввод
    await sendTelegramMessage(
      chatId,
      `⚠️ Пожалуйста, введите:\n\n• <b>Имя латиницей</b> (если вы новый пользователь)\n• или <b>+992XXXXXXXXX</b> (для входа)`,
      { force_reply: true, input_field_placeholder: 'Ivan или +992...' }
    )

    return new NextResponse('ok')
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('ok')
  }
}
