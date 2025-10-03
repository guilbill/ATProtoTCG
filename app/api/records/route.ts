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
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    if (!collection) {
      return NextResponse.json({ error: 'Missing collection parameter' }, { status: 400 });
    }
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection,
      limit: 50
    });
    if (res.success && Array.isArray(res.data.records)) {
      return NextResponse.json({ records: res.data.records });
    }
    return NextResponse.json({ records: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
