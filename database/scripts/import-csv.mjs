/**
 * Утилита для импорта трек-кодов из CSV/Excel в Supabase
 * 
 * Использование:
 * 1. Экспортируйте данные из Google Sheets в CSV
 * 2. Формат CSV: code,status,notes
 * 3. Запустите: node database/scripts/import-csv.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importTracksFromCSV(csvFilePath) {
  try {
    // Читаем CSV файл
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    
    // Парсим CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    console.log(`📦 Found ${records.length} tracks to import...`)

    // Подготавливаем данные для вставки
    const tracksToInsert = records.map(record => ({
      code: record.code || record.CODE || record.Code,
      status: record.status || record.STATUS || Record.Status || 'waiting',
      notes: record.notes || record.NOTES || record.Notes || '',
      received_date: record.received_date || null,
      intransit_date: record.intransit_date || null,
      border_date: record.border_date || null,
      warehouse_date: record.warehouse_date || null,
      delivered_date: record.delivered_date || null,
    })).filter(track => track.code) // Фильтруем записи без кода

    if (tracksToInsert.length === 0) {
      console.error('❌ No valid tracks found in CSV')
      return
    }

    // Вставляем в Supabase с обработкой дубликатов
    const { data, error } = await supabase
      .from('tracks')
      .upsert(tracksToInsert, { 
        onConflict: 'code',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('❌ Error importing tracks:', error.message)
      return
    }

    console.log(`✅ Successfully imported/updated ${data.length} tracks`)
    
    // Статистика
    const stats = {}
    data.forEach(track => {
      stats[track.status] = (stats[track.status] || 0) + 1
    })
    
    console.log('\n📊 Statistics by status:')
    Object.entries(stats).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Import failed:', error.message)
  }
}

// Запуск из командной строки
const csvFile = process.argv[2]
if (!csvFile) {
  console.log('Usage: node import-csv.mjs <path-to-csv-file>')
  console.log('\nCSV Format:')
  console.log('  code,status,notes,received_date,intransit_date,border_date,warehouse_date,delivered_date')
  console.log('\nExample:')
  console.log('  KH001,received,Получен на складе,2024-01-15,,,,')
  process.exit(1)
}

importTracksFromCSV(csvFile)
