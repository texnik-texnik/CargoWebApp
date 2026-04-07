import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from '@/lib/telegram/bot'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Генерация 4-значного кода
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, telegramChatId } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Укажите номер телефона' },
        { status: 400 }
      )
    }

    // Валидация номера
    const phoneRegex = /^\+992\d{9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Неверный формат номера. Используйте: +992XXXXXXXXX' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Генерируем код подтверждения
    const verificationCode = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

    // Проверяем есть ли пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, telegram_chat_id')
      .eq('phone', phone)
      .single()

    // Отправляем код через Telegram бота
    if (!telegramChatId) {
      return NextResponse.json(
        { 
          error: 'Сначала запустите нашего Telegram бота',
          botUsername: process.env.TELEGRAM_BOT_USERNAME,
        },
        { status: 400 }
      )
    }

    const message = `🔐 <b>Код подтверждения Khuroson Cargo</b>

Ваш код: <b>${verificationCode}</b>

⏰ Действует 10 минут
Не сообщайте код другим лицам!`

    const sent = await sendTelegramMessage(telegramChatId, message)

    if (!sent) {
      return NextResponse.json(
        { error: 'Не удалось отправить код. Запустите бота: @' + process.env.TELEGRAM_BOT_USERNAME },
        { status: 500 }
      )
    }

    // Сохраняем код в базе
    if (existingUser) {
      await supabase
        .from('users')
        .update({
          verification_code: verificationCode,
          verification_expires: expiresAt.toISOString(),
          telegram_chat_id: telegramChatId,
        })
        .eq('phone', phone)
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен через Telegram',
      isRegistration: !existingUser,
    })

  } catch (error: any) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка отправки кода' },
      { status: 500 }
    )
  }
}
