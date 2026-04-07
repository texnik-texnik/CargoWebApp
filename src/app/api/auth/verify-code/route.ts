import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Генерация 4-значного номера клиента
async function generateClientNumber(supabase: any): Promise<string> {
  // Получаем последний номер
  const { data: lastUser } = await supabase
    .from('users')
    .select('client_id')
    .not('client_id', 'is', null)
    .order('client_id', { ascending: false })
    .limit(1)

  let nextNumber = 1001
  
  if (lastUser && lastUser.client_id) {
    const lastNumber = parseInt(lastUser.client_id.replace('KH-', ''), 10)
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  return `KH-${nextNumber}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, verificationCode, name, telegramChatId, telegramUserId } = body

    if (!phone || !verificationCode) {
      return NextResponse.json(
        { error: 'Укажите номер и код' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Ищем пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (userError || !user) {
      // Новый пользователь - регистрация
      const clientNumber = await generateClientNumber(supabase)

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone,
          name: name || 'Пользователь',
          client_id: clientNumber,
          telegram_id: telegramUserId || '',
          telegram_chat_id: telegramChatId || '',
          lang: 'ru',
          history: '',
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        )
      }

      // Отправляем приветственное сообщение
      const welcomeMessage = `🎉 <b>Добро пожаловать в Khuroson Cargo!</b>

Ваш номер клиента: <b>${clientNumber}</b>

Теперь вы можете отслеживать ваши грузы через приложение.

📦 <b>Как использовать:</b>
• Откройте приложение
• Войдите по номеру телефона
• Отслеживайте ваши грузы`

      if (telegramChatId) {
        const { sendTelegramMessage } = await import('@/lib/telegram/bot')
        await sendTelegramMessage(telegramChatId, welcomeMessage)
      }

      return NextResponse.json({
        success: true,
        user: newUser,
        isNew: true,
      })

    } else {
      // Существующий пользователь - проверка кода
      if (user.verification_code !== verificationCode) {
        return NextResponse.json(
          { error: 'Неверный код подтверждения' },
          { status: 401 }
        )
      }

      // Проверяем не истёк ли код
      if (user.verification_expires) {
        const expiresAt = new Date(user.verification_expires)
        if (expiresAt < new Date()) {
          return NextResponse.json(
            { error: 'Код истёк. Запросите новый' },
            { status: 401 }
          )
        }
      }

      // Обновляем Telegram данные если нужно
      const updateData: any = {}
      if (telegramChatId && !user.telegram_chat_id) {
        updateData.telegram_chat_id = telegramChatId
      }
      if (telegramUserId && !user.telegram_id) {
        updateData.telegram_id = telegramUserId
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('users')
          .update(updateData)
          .eq('phone', phone)
      }

      // Очищаем код подтверждения
      await supabase
        .from('users')
        .update({
          verification_code: null,
          verification_expires: null,
        })
        .eq('phone', phone)

      return NextResponse.json({
        success: true,
        user,
        isNew: false,
      })
    }

  } catch (error: any) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка верификации' },
      { status: 500 }
    )
  }
}
