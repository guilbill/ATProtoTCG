import { NextRequest, NextResponse } from 'next/server';
import { getCreds } from '../../lib/sessionStore';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('atp_session')?.value;
  if (!cookie) return NextResponse.json({ loggedIn: false });
  const creds = getCreds(cookie);
  if (!creds) return NextResponse.json({ loggedIn: false });
  // Return masked identifier for UI
  return NextResponse.json({ loggedIn: true, identifier: creds.identifier });
}
