import { NextRequest, NextResponse } from 'next/server';
import { createSessionId, storeCreds } from '../../lib/sessionStore';

export async function POST(req: NextRequest) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }

  const maybe = body as { identifier?: unknown; password?: unknown };
  const identifier = typeof maybe.identifier === 'string' ? maybe.identifier.trim() : '';
  const password = typeof maybe.password === 'string' ? maybe.password.trim() : '';

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const sid = createSessionId();
  storeCreds(sid, { identifier, password });

  const res = NextResponse.json({ success: true });
  // Set httpOnly cookie for session
  res.headers.set('Set-Cookie', `atp_session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
  return res;
}
