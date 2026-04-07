import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, newStatus, dateColumn } = body

    if (!startDate || !endDate || !newStatus) {
      return NextResponse.json(
        { error: 'Укажите даты и статус' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Определяем колонку для поиска (по умолчанию intransit_date)
    const searchColumn = dateColumn || 'intransit_date'

    // Определяем колонку даты для нового статуса
    const dateColumnMap: Record<string, string> = {
      received: 'received_date',
      intransit: 'intransit_date',
      border: 'border_date',
      warehouse: 'warehouse_date',
      delivered: 'delivered_date',
    }

    const statusDateColumn = dateColumnMap[newStatus]
    const now = new Date().toISOString()

    // Находим треки в диапазоне дат по выбранной колонке
    const { data: tracksToUpdate, error: fetchError } = await supabase
      .from('tracks')
      .select('code, received_date, intransit_date, border_date, warehouse_date, delivered_date')
      .gte(searchColumn, `${startDate} 00:00:00+00`)
      .lte(searchColumn, `${endDate} 23:59:59+00`)
      .not(searchColumn, 'is', null)

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (tracksToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'Треки в выбранном диапазоне не найдены' },
        { status: 404 }
      )
    }

    // Обновляем статус и дату
    const updateData: any = {
      status: newStatus,
    }
    
    if (statusDateColumn) {
      updateData[statusDateColumn] = now
    }

    const codes = tracksToUpdate.map((t: any) => t.code)

    const { data, error: updateError } = await supabase
      .from('tracks')
      .update(updateData)
      .in('code', codes)
      .select()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: data.length,
      codes: codes,
    })

  } catch (error: any) {
    console.error('Batch update error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка обновления' },
      { status: 500 }
    )
  }
}
