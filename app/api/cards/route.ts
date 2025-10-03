import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { getSession, getAgent, storeAgent } from '../../lib/sessionStore';

export async function POST(req: NextRequest) {
  return handleCardRequest(req);
}

export async function GET(req: NextRequest) {
  return handleCardRequest(req);
}

export async function DELETE(req: NextRequest) {
  // Parse body for specific card URI
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { uri } = (body as { uri?: string }) || {};
  if (uri) {
    return handleDeleteCard(req, uri);
  } else {
    return handleDeleteAllCards(req);
  }
// Delete a specific card by URI
async function handleDeleteCard(req: NextRequest, uri: string) {
  try {
    let agent: AtpAgent | undefined;
    const sid = req.cookies.get('atp_session')?.value;
    if (sid) agent = getAgent(sid);
    if (!agent && sid) {
      const sess = getSession(sid);
      if (sess) {
        agent = new AtpAgent({ service: 'https://bsky.social' });
        await agent.resumeSession(sess);
        storeAgent(sid, agent);
      }
    }
    if (!agent) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const did = agent.session?.did;
    if (!did) throw new Error('No DID after authentication');
    // Extract rkey from URI
    const rkey = uri.split('/').pop();
    if (!rkey) throw new Error('Invalid card URI');
    await agent.com.atproto.repo.deleteRecord({
      repo: did,
      collection: 'app.tcg.card',
      rkey,
    });
    return NextResponse.json({ success: true, message: `Deleted card ${uri}` });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete card';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
}

async function handleDeleteAllCards(req: NextRequest) {
  try {
    let agent: AtpAgent | undefined;
    const sid = req.cookies.get('atp_session')?.value;
    
    if (sid) agent = getAgent(sid);
    
    // If no cached agent, but we have stored session data, resume it
    if (!agent && sid) {
      const sess = getSession(sid);
      if (sess) {
        agent = new AtpAgent({ service: 'https://bsky.social' });
        await agent.resumeSession(sess);
        storeAgent(sid, agent);
      }
    }
    
    if (!agent) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const did = agent.session?.did;
    if (!did) throw new Error('No DID after authentication');
    
    // Get all cards first
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: 'app.tcg.card',
    });
    
    // Delete each card record
    let deletedCount = 0;
    if (Array.isArray(res.data.records)) {
      for (const record of res.data.records) {
        await agent.com.atproto.repo.deleteRecord({
          repo: did,
          collection: 'app.tcg.card',
          rkey: record.uri.split('/').pop()! // Extract rkey from URI
        });
        deletedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deletedCount} cards` 
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete cards';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

async function handleCardRequest(req: NextRequest) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // empty or invalid JSON body — continue with session lookup
    body = {};
  }
  const { identifier, password } = (body as { identifier?: string; password?: string }) || {};

  // Try to resume session from stored AtpSessionData, or reuse cached agent
  try {
    let agent: AtpAgent | undefined;
    const sid = req.cookies.get('atp_session')?.value;
    
    if (sid) agent = getAgent(sid);
    
    // If no cached agent, but we have stored session data, resume it
    if (!agent && sid) {
      const sess = getSession(sid);
      if (sess) {
        agent = new AtpAgent({ service: 'https://bsky.social' });
        await agent.resumeSession(sess);
        storeAgent(sid, agent);
      }
    }
    // If still no agent, try to login with provided credentials
    if (!agent) {
      if (!identifier || !password) {
        // If we have a session cookie but no valid session data, the session has expired
        // Return 401 instead of 400 to indicate authentication issue
        return NextResponse.json({ error: 'Session expired, please login again' }, { status: 401 });
      }
      agent = new AtpAgent({ service: 'https://bsky.social' });
      await agent.login({ identifier, password });
      if (sid) storeAgent(sid, agent);
    }
    const did = agent.session?.did;
    if (!did) throw new Error('No DID after login');
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: 'app.tcg.card',
    });

  interface Card {
    name: string;
    attack: number;
    defense: number;
    type: string;
    rarity: string;
    createdAt?: string;
    image?: Record<string, unknown>; // AT-Proto blob reference - flexible typing for nested structure
  }

  function isCard(value: unknown): value is Card {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
      typeof v.name === 'string' &&
      typeof v.attack === 'number' &&
      typeof v.defense === 'number' &&
      typeof v.type === 'string' &&
      typeof v.rarity === 'string'
      // image, createdAt are optional, so we don't validate them
    );
  }

  // Helper function to safely extract CID from image blob reference
  function extractImageCid(image: Record<string, unknown> | undefined): string | undefined {
    if (!image) return undefined;
    
    // Try the nested structure: image.ref.ref.$link
    const nestedRef = image.ref as Record<string, unknown> | undefined;
    if (nestedRef?.ref) {
      let cid = nestedRef.ref;
      
      // Handle CID objects like CID(bafkreiea4oobveruklpjcelbtascvf2ama27oqt4gbhubzc7ilgilhqc2a)
      if (cid && typeof cid === 'object' && 'toString' in cid) {
        cid = (cid as { toString(): string }).toString();
      }
      
      if (typeof cid === 'string') {
        // Remove CID() wrapper if present
        return cid.replace(/^CID\((.+)\)$/, '$1');
      }
    }
    
    return undefined;
  }

  const cards = Array.isArray(res.data.records)
    ? res.data.records
        .map((r) => r.value)
        .filter(isCard)
        .map((card) => ({
          name: card.name,
          attack: card.attack,
          defense: card.defense,
          type: card.type,
          rarity: card.rarity,
          createdAt: card.createdAt,
          imageCid: extractImageCid(card.image as Record<string, unknown> | undefined)
        }))
    : [];
    console.table(cards);
    return NextResponse.json({ cards });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch cards';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
