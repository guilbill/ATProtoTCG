import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../lib/sessionStore';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('atp_session')?.value;
  console.log('Session API - Cookie present:', !!cookie);
  console.log('Session API - Cookie value:', cookie);
  if (!cookie) return NextResponse.json({ loggedIn: false });
  const sess = getSession(cookie);
  console.log('Session API - Session data found:', !!sess);
  if (!sess) return NextResponse.json({ loggedIn: false });
  // sess may contain handle/identifier info under session data structures
  type SessionData = { handle?: string; did?: string };
  const sessionData = sess as SessionData;
  const identifier = sessionData.handle || sessionData.did || undefined;
  console.log('Session API - Returning logged in true');
  return NextResponse.json({ loggedIn: true, identifier });
}
