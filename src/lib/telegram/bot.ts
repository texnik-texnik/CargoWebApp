/**
 * Telegram Bot API helper
 * Отправляет сообщения через Telegram Bot (бесплатно)
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME

if (!BOT_TOKEN) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN not set')
}

/**
 * Отправить сообщение пользователю через Telegram бота
 * @param chatId - ID чата (telegram chat ID)
 * @param message - Текст сообщения
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.error('❌ Telegram bot token not configured')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('❌ Telegram API error:', data.description)
      return false
    }

    console.log(`✅ Message sent to chat ${chatId}`)
    return true
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error)
    return false
  }
}

/**
 * Получить информацию о пользователе по chat ID
 */
export async function getTelegramUser(chatId: string): Promise<any> {
  if (!BOT_TOKEN) return null

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId }),
    })

    const data = await response.json()
    return data.ok ? data.result : null
  } catch (error) {
    console.error('Error getting Telegram user:', error)
    return null
  }
}
