import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Coba model utama dulu; kalau overload (503) atau not-found (404),
// otomatis jatuh ke model cadangan berikutnya.
const MODEL_CHAIN = ["gemini-flash-latest", "gemini-2.5-flash"];

const MAX_RETRIES_PER_MODEL = 2;
const RETRY_DELAY_MS = 1200;

const SYSTEM_PROMPT = `Kamu adalah HITCAL AI VISION, asisten yang menganalisis foto makanan dan mengestimasi kandungan kalorinya.

Tugasmu:
1. Identifikasi setiap komponen makanan yang terlihat di foto (termasuk topping, lauk, minuman terpisah).
2. Estimasikan kalori tiap komponen berdasarkan porsi yang terlihat.
3. Buat judul singkat (2-5 kata) dan deskripsi singkat 1 kalimat untuk keseluruhan foto.

Aturan penamaan komponen di "rincian" (PENTING untuk keterbacaan UI):
- Nama tiap komponen singkat, maksimal sekitar 3-4 kata, tanpa keterangan lokasi yang bertele-tele.
- Kalau ada beberapa wadah/porsi berisi makanan yang sama, bedakan pakai ukuran/urutan singkat di dalam kurung, contoh: "Bubur ayam (porsi besar)", "Bubur ayam (porsi sedang)", "Kerupuk singkong (piring kiri)" — BUKAN "Bubur ayam (topping mangkuk atas dengan kuah kuning)".
- Nama bahan/topping cukup nama bahannya saja, contoh: "Ayam suwir", "Kacang goreng", "Bawang goreng", "Seledri" — jangan ditambah embel-embel "(topping mangkuk atas)" di tiap baris.
- Kalau satu wadah punya banyak topping, boleh urutkan berturut-turut per wadah (base dulu baru topping-toppingnya) tapi tetap dengan nama singkat masing-masing.

Aturan konsistensi estimasi:
- Gunakan patokan porsi standar Indonesia (contoh: 1 mangkuk bubur ukuran sedang ±200-250 kalori, 1 genggam kerupuk goreng ±80-100 kalori) sebagai acuan, jangan menebak-nebak secara acak.
- Bulatkan tiap angka kalori ke kelipatan 10 terdekat.
- Untuk foto yang sama atau mirip, estimasi harus konsisten — dasarkan murni pada apa yang terlihat di foto (ukuran wadah, jenis makanan, porsi relatif), bukan variasi acak.

Balas HANYA dalam format JSON valid, tanpa markdown code fence, dengan struktur persis seperti ini:
{
  "judul": "string, judul singkat makanan",
  "deskripsi": "string, deskripsi singkat 1 kalimat",
  "rincian": [
    { "nama": "string nama komponen singkat", "kalori": number }
  ],
  "totalKalori": number
}

totalKalori harus sama dengan penjumlahan semua kalori di rincian. Jika foto tidak berisi makanan, kembalikan rincian kosong dan totalKalori 0 dengan deskripsi yang menjelaskan bahwa tidak ada makanan terdeteksi.`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function callGemini(
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<{ ok: true; text: string } | { ok: false; status: number; errText: string }> {
  const res = await fetch(`${buildUrl(model)}?key=${apiKey}`, {
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
        temperature: 0,
        topK: 1,
        topP: 0.1,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, status: res.status, errText };
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return { ok: false, status: 502, errText: "Respons kosong dari Gemini." };
  }
  return { ok: true, text };
}

// 503 (overload) dan 429 (rate limit) layak di-retry / dialihkan ke model lain.
// 404 (model tidak ada) langsung dialihkan ke model berikutnya tanpa retry.
function isRetryable(status: number) {
  return status === 503 || status === 429;
}
function shouldFallbackModel(status: number) {
  return status === 503 || status === 429 || status === 404;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diatur di environment variables." },
      { status: 500 }
    );
  }

  let imageBase64: string, mimeType: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType;
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Foto tidak ditemukan di request." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  let lastError: { status: number; errText: string } | null = null;

  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const result = await callGemini(model, apiKey, imageBase64, mimeType);

        if (result.ok) {
          try {
            const cleaned = result.text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            return NextResponse.json(parsed);
          } catch (parseErr) {
            console.error("Gagal parse JSON dari Gemini:", result.text);
            return NextResponse.json(
              { error: "Gemini mengembalikan format yang tidak terbaca." },
              { status: 502 }
            );
          }
        }

        lastError = { status: result.status, errText: result.errText };
        console.error(`Gemini API error (model=${model}, attempt=${attempt}):`, result.errText);

        if (isRetryable(result.status) && attempt < MAX_RETRIES_PER_MODEL) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        if (shouldFallbackModel(result.status)) {
          break; // lanjut ke model berikutnya di MODEL_CHAIN
        }

        // Error lain (400/403/dst) — gak akan membaik dengan retry/fallback, langsung berhenti.
        return NextResponse.json(
          { error: "Gagal menghubungi Gemini API." },
          { status: 502 }
        );
      } catch (err) {
        console.error("Analyze food network error:", err);
        lastError = { status: 500, errText: String(err) };
        if (attempt < MAX_RETRIES_PER_MODEL) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }
  }

  const overloaded = lastError?.status === 503 || lastError?.status === 429;
  return NextResponse.json(
    {
      error: overloaded
        ? "Server Gemini lagi sibuk banget nih. Coba upload ulang beberapa saat lagi."
        : "Gagal menghubungi Gemini API.",
    },
    { status: 502 }
  );
}
