import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_MODEL = "qwen/qwen3.8-27b";

const BASE_PROMPT = `Kamu adalah HidakaAi, asisten AI ramah yang hidup di dalam aplikasi Hitcal — aplikasi pelacak kalori harian.

Peranmu:
- Bantu jawab pertanyaan seputar nutrisi, kalori, gizi, dan pola makan sehat sehari-hari.
- Kasih saran menu/makanan yang masuk akal kalau user nanya "makan apa enaknya", terutama kalau ada info sisa kuota kalori hari ini di bawah — sesuaikan saran sama sisa kuota itu.
- Boleh bantu jelasin fitur Hitcal juga kalau ditanya (foto makanan buat deteksi kalori otomatis, target kalori dihitung dari BMR formula Mifflin-St Jeor, dst).
- Gaya bahasa santai, Bahasa Indonesia sehari-hari, ramah kayak temen — tapi tetap informatif dan gak asal ngomong.
- Jawaban RINGKAS. Ini chat kecil di pojok layar HP, bukan artikel — 2-4 kalimat cukup kecuali user minta detail.
- JANGAN kasih diagnosis medis atau rekomendasi medis yang serius (misal soal kondisi kesehatan spesifik, obat, dsb) — kalau pertanyaannya udah ke arah situ, saranin buat konsultasi ke dokter atau ahli gizi.
- Kalau ditanya di luar topik makanan/kesehatan/Hitcal, boleh jawab santai tapi gak perlu maksa nyambungin ke topik kalori kalau memang gak relevan.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY belum diatur di environment variables." },
      { status: 500 }
    );
  }

  let messages: ChatMessage[];
  let context: string | undefined;
  try {
    const body = await req.json();
    messages = body.messages;
    context = body.context;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Pesan gak valid." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Request gak valid." }, { status: 400 });
  }

  const systemPrompt = context
    ? `${BASE_PROMPT}\n\nData user saat ini:\n${context}`
    : BASE_PROMPT;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.6,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq chat error:", errText);
      let detail = errText;
      try {
        const parsedErr = JSON.parse(errText);
        detail = parsedErr?.error?.message ?? errText;
      } catch {
        // errText wasn't JSON, use as-is
      }
      return NextResponse.json(
        { error: `HidakaAi lagi gangguan (${res.status}): ${detail}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return NextResponse.json(
        { error: "HidakaAi gak ngasih respons. Coba lagi." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Hidaka chat network error:", err);
    return NextResponse.json(
      { error: "Gagal terhubung ke HidakaAi. Cek koneksi internet kamu." },
      { status: 500 }
    );
  }
}
