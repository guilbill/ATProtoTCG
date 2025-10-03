import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAgent } from '../../../lib/sessionStore';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sessionId = request.cookies.get('atp_session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }
  const sessionData = getSession(sessionId);
  const agent = getAgent(sessionId);
  if (!sessionData || !agent) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // id is the record URI: at://did:plc:xxx/collection/rkey
  // Example: at://did:plc:xxx/app.bsky.graph.follow/3lsr7a722oq2g
  const match = id.match(/^at:\/\/[^/]+\/([^/]+\.[^/]+\.[^/]+\.[^/]+)\/(.+)$/);
  let collection = '';
  let rkey = '';
  if (match) {
    collection = match[1];
    rkey = match[2];
  } else {
    // fallback: try splitting
    const parts = id.split('/');
    collection = parts.length >= 4 ? parts[2] + '/' + parts[3] : 'app.tcg.card';
    rkey = parts.length >= 5 ? parts[4] : parts.pop() || '';
  }
  if (!collection) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }
  const res = await agent.com.atproto.repo.getRecord({
    repo: sessionData.did,
    collection,
    rkey,
  });
  if (res.success && res.data) {
    return NextResponse.json({ record: res.data });
  }
  return NextResponse.json({ error: 'Record not found' }, { status: 404 });
}
