import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAgent } from '../../lib/sessionStore';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('atp_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    const sessionData = getSession(sessionId);
    const agent = getAgent(sessionId);
    if (!sessionData || !agent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const did = sessionData.did;
    const res = await agent.com.atproto.repo.describeRepo({ repo: did });
    if (res.success && res.data && Array.isArray(res.data.collections)) {
      // Return collections as array of NSIDs
      return NextResponse.json({ collections: res.data.collections });
    }
    return NextResponse.json({ collections: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
