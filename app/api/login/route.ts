import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { createSessionId, storeSession, storeAgent } from '../../lib/sessionStore';

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

  // Create a session id for client cookie
  const sid = createSessionId();
  console.log('Login API - Created session ID:', sid);

  // Create an AtpAgent that will persist session data via persistSession callback
  let savedSessionData: import('@atproto/api').AtpSessionData | undefined = undefined;
  const agent = new AtpAgent({
    service: 'https://bsky.social',
    persistSession: (evt, sess) => {
      console.log('Login API - persistSession callback called:', evt, !!sess);
      // persistSession is called on login/resume; save the session data in-memory
      if (evt === 'create' || evt === 'update') {
        if (sess) {
          console.log('Login API - Storing session data');
          savedSessionData = sess;
          storeSession(sid, sess);
        }
      }
    },
  });

  try {
    console.log('Login API - Attempting login');
    await agent.login({ identifier, password });
    console.log('Login API - Login successful, session data:', !!savedSessionData);
    // store agent in agent cache for quick reuse
    storeAgent(sid, agent);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: errorMsg }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  // Set httpOnly cookie for session
  res.headers.set('Set-Cookie', `atp_session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
  return res;
}
