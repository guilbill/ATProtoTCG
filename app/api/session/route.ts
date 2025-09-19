import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../lib/sessionStore';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('atp_session')?.value;
  if (!cookie) return NextResponse.json({ loggedIn: false });
  const sess = getSession(cookie);
  if (!sess) return NextResponse.json({ loggedIn: false });
  // sess may contain handle/identifier info under session data structures
  const identifier = (sess as any).handle || (sess as any).did || undefined;
  return NextResponse.json({ loggedIn: true, identifier });
}
