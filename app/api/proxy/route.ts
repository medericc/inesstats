// app/api/proxy/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ROT13
function rot13Char(c: string): string {
  if (c >= 'a' && c <= 'z') return String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97);
  if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + 13) % 26) + 65);
  return c;
}

function rot13(s: string) {
  return s.split('').map(rot13Char).join('');
}

// Base64 → UTF8
function base64Decode(b64: string) {
  return Buffer.from(b64, 'base64').toString('utf-8');
}

// combine ROT13 + Base64
function decodeStatBroadcast(encoded: string) {
  const cleaned = encoded.replace(/\s+/g, '');
  return base64Decode(rot13(cleaned));
}

export async function POST(request: Request) {
  try {
    const { game } = await request.json();
    if (!game) {
      return NextResponse.json({ error: 'game manquant' }, { status: 400 });
    }

    const url = `https://stats.statbroadcast.com/interface/webservice/stats?data=ZXZlbnQ9NjIwOTA2JnhtbD11cmkvNjIwOTA2LnhtbCZ4c2w9YmFza2V0YmFsbC9zYi5iYmdhbWUubW9iaWxlLnN0YXR1cy54c2wmc3BvcnQ9YmJnYW1lJmZpbGV0aW1lPTEmdHlwZT1tb2JpbGUmc3RhcnQ9dHJ1ZQ==&_=1762816983355`;
    const resp = await fetch(url);
    const text = await resp.text();

    // 🔐 Décodage du flux
    const decodedHTML = decodeStatBroadcast(text);

    return new NextResponse(decodedHTML, {
      status: resp.status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (err: any) {
    console.error('💥 /api/proxy error:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
