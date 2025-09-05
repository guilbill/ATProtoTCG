import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '../../lib/sessionStore';

export async function POST(req: NextRequest) {
  const sid = req.cookies.get('atp_session')?.value;
  if (sid) deleteSession(sid);
  const res = NextResponse.json({ success: true });
  // Clear cookie
  res.headers.set('Set-Cookie', `atp_session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  return res;
}
