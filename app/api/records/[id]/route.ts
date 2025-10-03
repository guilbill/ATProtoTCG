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
  // NSID: one or more dot-separated segments, e.g. app.bsky.feed.post
  let collection = '';
  let rkey = '';
  const uriMatch = id.match(/^at:\/\/([^/]+)\/((?:[a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+)\/(.+)$/);
  if (uriMatch) {
    // uriMatch[2] is the collection NSID, uriMatch[3] is rkey
    collection = uriMatch[2];
    rkey = uriMatch[3];
  } else {
    // fallback: try splitting
    const parts = id.replace(/^at:\/\//, '').split('/');
    // parts[1] is collection NSID, parts[2] is rkey
    collection = parts.length >= 3 ? parts[1] : '';
    rkey = parts.length >= 3 ? parts[2] : '';
  }
  // Validate collection as NSID: must have at least two dots
  if (!collection || !/^([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+$/.test(collection)) {
    return NextResponse.json({ error: 'Invalid collection: must be a valid NSID' }, { status: 400 });
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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
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

    // Parse the record URI to get collection and rkey
    let collection = '';
    let rkey = '';
    const uriMatch = id.match(/^at:\/\/([^/]+)\/((?:[a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+)\/(.+)$/);
    if (uriMatch) {
      collection = uriMatch[2];
      rkey = uriMatch[3];
    } else {
      const parts = id.replace(/^at:\/\//, '').split('/');
      collection = parts.length >= 3 ? parts[1] : '';
      rkey = parts.length >= 3 ? parts[2] : '';
    }

    if (!collection || !/^([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+$/.test(collection)) {
      return NextResponse.json({ error: 'Invalid collection: must be a valid NSID' }, { status: 400 });
    }

    // Get the updated record data from request body
    const body = await request.json();
    const { value } = body;

    if (!value || typeof value !== 'object') {
      return NextResponse.json({ error: 'Invalid record value' }, { status: 400 });
    }

    // Update the record using putRecord
    const res = await agent.com.atproto.repo.putRecord({
      repo: sessionData.did,
      collection,
      rkey,
      record: value,
    });

    if (res.success) {
      return NextResponse.json({ success: true, data: res.data });
    }

    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update record';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
