import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Kamu adalah HITCAL AI VISION, asisten yang menganalisis foto makanan dan mengestimasi kandungan kalorinya.

Tugasmu:
1. Identifikasi setiap komponen makanan yang terlihat di foto (termasuk topping, lauk, minuman terpisah).
2. Estimasikan kalori tiap komponen berdasarkan porsi yang terlihat.
3. Buat judul singkat (2-5 kata) dan deskripsi singkat 1 kalimat untuk keseluruhan foto.

Balas HANYA dalam format JSON valid, tanpa markdown code fence, dengan struktur persis seperti ini:
{
  "judul": "string, judul singkat makanan",
  "deskripsi": "string, deskripsi singkat 1 kalimat",
  "rincian": [
    { "nama": "string nama komponen", "kalori": number }
  ],
  "totalKalori": number
}

totalKalori harus sama dengan penjumlahan semua kalori di rincian. Jika foto tidak berisi makanan, kembalikan rincian kosong dan totalKalori 0 dengan deskripsi yang menjelaskan bahwa tidak ada makanan terdeteksi.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diatur di environment variables." },
      { status: 500 }
    );
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Foto tidak ditemukan di request." }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: "Gagal menghubungi Gemini API." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { error: "Gemini tidak mengembalikan hasil analisis." },
        { status: 502 }
      );
    }

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analyze food error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menganalisis foto." },
      { status: 500 }
    );
  }
}
