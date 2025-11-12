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

    // ⚡️ VERSION PLAY-BY-PLAY ("pxp") au lieu de "mobile"
    const url = `https://stats.statbroadcast.com/interface/webservice/stats?data=ZXZlbnQ9${game}JnhtbD11cmkv${game}.eG1sJnhzbD1iYXNrZXRiYWxsL3NiLmJiZ2FtZS5tb2JpbGUucHhwLnhtbCZzcG9ydD1iYmdhbWUmZmlsZXRpbWU9MSZ0eXBlPXB4cCZzdGFydD10cnVl&_=1762816983355`;

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
