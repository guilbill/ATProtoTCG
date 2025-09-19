import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { getSession, getAgent, storeAgent } from '../../lib/sessionStore';

// Serve AT-Proto blobs using authenticated agent
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cid = url.searchParams.get('cid');
  if (!cid) return NextResponse.json({ error: 'Missing cid' }, { status: 400 });

  // Get session from cookie OR from query parameter (for img tag compatibility)
  let sid = req.cookies.get('atp_session')?.value;
  if (!sid) {
    sid = url.searchParams.get('session') || undefined;
  }
  
  if (!sid) {
    console.log('Blob API - No session cookie or parameter');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Try to get cached agent or create one from session
    let agent: AtpAgent | undefined = getAgent(sid);
    
    if (!agent) {
      const sess = getSession(sid);
      if (!sess) {
        console.log('Blob API - No session data found');
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }
      
      console.log('Blob API - Creating agent from session data');
      agent = new AtpAgent({ service: 'https://bsky.social' });
      await agent.resumeSession(sess);
      storeAgent(sid, agent);
    }

    const userDid = agent.session?.did;
    if (!userDid) {
      console.log('Blob API - No DID in agent session');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('Blob API - Fetching blob via Bluesky CDN:', cid, 'for DID:', userDid);
    
    // Use Bluesky CDN to fetch the blob - more reliable than sync.getBlob
    const blobUrl = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${userDid}&cid=${cid}`;
    
    const response = await fetch(blobUrl, {
      headers: {
        'Authorization': `Bearer ${agent.session?.accessJwt}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log('Blob API - Error fetching blob:', errorMsg);
    return NextResponse.json({ 
      error: 'Failed to fetch blob', 
      details: errorMsg,
      cid: cid
    }, { status: 404 });
  }
}
