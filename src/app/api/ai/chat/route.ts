import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // TODO: Интегрировать с Groq API или Gemini API
    // Пока заглушка для демонстрации
    
    const response = {
      response: `Спасибо за вопрос! В настоящий момент AI-ассистент находится в разработке.\n\nВаш вопрос: "${message}"\n\nСкоро я смогу:\n• Отвечать на вопросы о грузах\n• Рассказывать о тарифах\n• Помогать с отслеживанием\n\nА пока попробуйте поискать трек по номеру!`,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
