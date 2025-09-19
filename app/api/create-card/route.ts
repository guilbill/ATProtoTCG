import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { getSession, getAgent, storeAgent } from '../../lib/sessionStore';

// Node buffer is available in the Next.js server runtime

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { identifier, password, card } = body as {
    identifier?: string;
    password?: string;
    card?: {
      name: string;
      attack: number;
      defense: number;
      type: string;
      rarity: string;
      imageBase64?: string;
    };
  };

  // If no credentials provided, try session cookie and resume stored session
  if (!card) {
    return NextResponse.json({ error: 'Missing card data' }, { status: 400 });
  }

  try {
    // Reuse agent if cached for session
    let agent: AtpAgent | undefined;
    const sid = req.cookies.get('atp_session')?.value;
    if (sid) agent = getAgent(sid);
    // If no cached agent, try to restore session data
    if (!agent && sid) {
      const sess = getSession(sid);
      if (sess) {
        agent = new AtpAgent({ service: 'https://bsky.social' });
        await agent.resumeSession(sess);
        storeAgent(sid, agent);
      }
    }
    // If still no agent, fallback to credentials in body
    if (!agent) {
      if (!identifier || !password) {
        return NextResponse.json({ error: 'Missing credentials or session' }, { status: 400 });
      }
      agent = new AtpAgent({ service: 'https://bsky.social' });
      await agent.login({ identifier, password });
      if (sid) storeAgent(sid, agent);
    }

    const did = agent.session?.did;
    if (!did) throw new Error('No DID after login');

    // If an imageBase64 is provided, upload as blob first
    let imageCid: string | undefined;
    if (card.imageBase64) {
      const buf = Buffer.from(card.imageBase64, 'base64');
      const uploadRes = await agent.uploadBlob(buf);
      // Try several possible response shapes safely
      const u = uploadRes as unknown;
      if (typeof u === 'object' && u !== null) {
        const up = u as Record<string, unknown>;
        if (up['blob'] && typeof up['blob'] === 'object') {
          const b = up['blob'] as Record<string, unknown>;
          if (typeof b['ref'] === 'string') imageCid = b['ref'];
          else if (typeof b['cid'] === 'string') imageCid = b['cid'];
        }
        if (!imageCid && typeof up['cid'] === 'string') imageCid = up['cid'];
        if (!imageCid && up['data'] && typeof up['data'] === 'object') {
          const d = up['data'] as Record<string, unknown>;
          if (typeof d['cid'] === 'string') imageCid = d['cid'];
        }
      }
    }

    const record: Record<string, unknown> = {
      name: card.name,
      attack: card.attack,
      defense: card.defense,
      type: card.type,
      rarity: card.rarity,
      createdAt: new Date().toISOString(),
    };
    if (imageCid) record.imageCid = imageCid;

    const res = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: 'app.tcg.card',
      record,
    });

    return NextResponse.json({ success: true, data: res.data });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create card';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
