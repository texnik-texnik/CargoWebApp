import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name } = body

    if (!phone || !name) {
      return NextResponse.json({ error: 'Укажите телефон и имя' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('phone', phone)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error('Save name error:', error)
    return NextResponse.json({ error: error.message || 'Ошибка' }, { status: 500 })
  }
}
