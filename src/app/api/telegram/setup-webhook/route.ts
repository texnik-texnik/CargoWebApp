import { NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET() {
  const webhookUrl = `${APP_URL}/api/telegram/webhook`
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  
  try {
    const res = await fetch(url)
    const data = await res.json()
    
    return NextResponse.json({
      success: data.ok,
      webhook_url: webhookUrl,
      telegram_response: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
