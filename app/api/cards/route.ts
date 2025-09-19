import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { getSession, getAgent, storeAgent } from '../../lib/sessionStore';

export async function POST(req: NextRequest) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch (e) {
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
        return NextResponse.json({ error: 'Missing credentials or session' }, { status: 400 });
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
    imageCid?: string;
    createdAt?: string;
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
      // imageCid and createdAt are optional, so we don't validate them
    );
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
          imageCid: card.imageCid, // Explicitly preserve imageCid
          createdAt: card.createdAt // Explicitly preserve createdAt
        }))
    : [];
    return NextResponse.json({ cards });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch cards';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
