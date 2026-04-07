import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не загружен' },
        { status: 400 }
      )
    }

    // Читаем CSV
    const csvContent = await file.text()
    const lines = csvContent.trim().split('\n')
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1)
    
    console.log(`📦 Найдено ${dataLines.length} записей`)

    // Парсим и конвертируем
    const tracksToInsert = dataLines.map((line) => {
      const parts = line.split(',')
      
      if (parts.length < 9) return null

      const [
        code,           // 0: 运单号
        company,        // 1: 快递公司
        operator,       // 2: 操作人
        inDate,         // 3: 入库时间
        inStatus,       // 4: 入库状态
        inWeight,       // 5: 入库重量
        outDate,        // 6: 出库时间
        outStatus,      // 7: 出库状态
        outWeight       // 8: 出库重量
      ] = parts

      if (!code || code.length < 10) return null

      // Определяем статус
      let status = 'waiting'
      const statusText = outStatus?.trim() || inStatus?.trim() || ''
      
      if (statusText.includes('拍照') || statusText.includes('入库')) {
        status = 'received'
      } else if (statusText.includes('出库') || statusText.includes('运输') || statusText.includes('在途')) {
        status = 'intransit'
      } else if (statusText.includes('边境') || statusText.includes('报关')) {
        status = 'border'
      } else if (statusText.includes('仓库') || statusText.includes('到仓')) {
        status = 'warehouse'
      } else if (statusText.includes('交付') || statusText.includes('签收') || statusText.includes('送达')) {
        status = 'delivered'
      } else if (statusText.includes('付款') || statusText.includes('支付')) {
        status = 'payment'
      } else if (statusText.includes('等待') || statusText.includes('待发')) {
        status = 'waiting'
      }

      // Определяем компанию
      let companyName = ''
      if (code.startsWith('YT')) companyName = '圆通速递'
      else if (code.startsWith('SF')) companyName = '顺丰速运'
      else if (code.startsWith('ZTO')) companyName = '中通快递'
      else if (code.startsWith('STO')) companyName = '申通快递'
      else if (code.startsWith('YD')) companyName = '韵达快递'
      else if (code.startsWith('JT')) companyName = '极兔速递'
      else if (company) companyName = company.trim()

      // Формируем заметки
      const notesParts = []
      if (companyName) notesParts.push(companyName)
      const weight = outWeight?.trim() || inWeight?.trim()
      if (weight) notesParts.push(`Вес: ${weight}`)
      
      const notes = notesParts.join(' | ')
      
      // Используем реальные даты из CSV файла
      return {
        code: code.trim(),
        status,
        notes,
        received_date: inDate?.trim() || null,
        intransit_date: outDate?.trim() || null,  // Берём из出库时间
        border_date: status === 'border' ? (outDate?.trim() || inDate?.trim() || null) : null,
        warehouse_date: status === 'warehouse' ? (outDate?.trim() || inDate?.trim() || null) : null,
        delivered_date: status === 'delivered' ? (outDate?.trim() || inDate?.trim() || null) : null,
      }
    }).filter(Boolean)

    if (tracksToInsert.length === 0) {
      return NextResponse.json(
        { error: 'Не найдено валидных треков' },
        { status: 400 }
      )
    }

    // Удаляем дубликаты - оставляем последнюю версию каждого кода
    const uniqueTracks = new Map()
    tracksToInsert.forEach(track => {
      uniqueTracks.set(track.code, track)
    })
    
    const finalTracks = Array.from(uniqueTracks.values())

    console.log(`📦 Уникальных треков: ${finalTracks.length} (было ${tracksToInsert.length})`)

    // Загружаем в Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase
      .from('tracks')
      .upsert(finalTracks, { 
        onConflict: 'code',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Статистика
    const stats: Record<string, number> = {}
    data.forEach((track: any) => {
      stats[track.status] = (stats[track.status] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      imported: data.length,
      stats,
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка импорта' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
