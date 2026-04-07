/**
 * Конвертер китайского CSV в формат Khuroson Cargo
 * 
 * Формат: CSV с запятыми
 * 运单号,快递公司,操作人,入库时间,入库状态,入库重量,出库时间,出库状态,出库重量
 */

import { readFileSync, writeFileSync } from 'fs'

function convertChineseCSV(inputFile, outputFile) {
  try {
    const csvContent = readFileSync(inputFile, 'utf-8')
    const lines = csvContent.trim().split('\n')
    
    // Пропускаем заголовок
    const dataLines = lines.slice(1)
    
    console.log(`📦 Найдено ${dataLines.length} записей`)

    const convertedLines = ['code,status,notes,received_date,intransit_date,border_date,warehouse_date,delivered_date']

    for (const line of dataLines) {
      const parts = line.split(',')
      
      if (parts.length < 9) continue

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

      if (!code || code.length < 10) continue

      // Определяем статус по статусу出库 (приоритет) или入库
      let status = 'waiting'
      const statusText = outStatus || inStatus || ''
      
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

      // Определяем компанию по префиксу
      let companyName = ''
      if (code.startsWith('YT')) companyName = '圆通速递'
      else if (code.startsWith('SF')) companyName = '顺丰速运'
      else if (code.startsWith('ZTO')) companyName = '中通快递'
      else if (code.startsWith('STO')) companyName = '申通快递'
      else if (code.startsWith('YD')) companyName = '韵达快递'
      else if (code.startsWith('JT')) companyName = '极兔速递'
      else if (company) companyName = company

      // Формируем заметки
      const notesParts = []
      if (companyName) notesParts.push(companyName)
      if (outWeight) notesParts.push(`Вес: ${outWeight}`)
      else if (inWeight) notesParts.push(`Вес: ${inWeight}`)
      
      const notes = notesParts.join(' | ')

      // Используем出库时间 как основную дату (если есть)
      const mainDate = outDate || inDate || ''

      // Создаём CSV строку
      const csvLine = [
        code,
        status,
        notes ? `"${notes}"` : '',
        inDate || '',
        status === 'intransit' ? mainDate : '',
        status === 'border' ? mainDate : '',
        status === 'warehouse' ? mainDate : '',
        status === 'delivered' ? mainDate : ''
      ].join(',')

      convertedLines.push(csvLine)
    }

    writeFileSync(outputFile, convertedLines.join('\n'), 'utf-8')
    
    console.log(`\n✅ Конвертация завершена!`)
    console.log(`📄 Файл сохранён: ${outputFile}`)
    console.log(`📦 Конвертировано треков: ${convertedLines.length - 1}`)
    
    // Статистика
    const stats = {}
    convertedLines.slice(1).forEach(line => {
      const parts = line.split(',')
      const status = parts[1]
      stats[status] = (stats[status] || 0) + 1
    })
    
    const labels = {
      waiting: 'Ожидает',
      received: 'Получен',
      intransit: 'В пути',
      border: 'На границе',
      warehouse: 'На складе',
      payment: 'Оплата',
      delivered: 'Доставлен'
    }
    
    console.log('\n📊 Статистика по статусам:')
    Object.entries(stats).forEach(([status, count]) => {
      console.log(`  ${labels[status] || status}: ${count}`)
    })
    
    console.log('\n📥 Импорт в Supabase:')
    console.log('   1. Откройте Supabase Dashboard')
    console.log('   2. Table Editor → tracks')
    console.log('   3. Insert → Import CSV')
    console.log(`   4. Загрузите: ${outputFile}`)

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  }
}

const inputFile = process.argv[2]
if (!inputFile) {
  console.log('Использование: node convert-chinese-csv.mjs <файл.csv>')
  process.exit(1)
}

convertChineseCSV(inputFile, 'converted-tracks.csv')
