import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();
  if (!identifier || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }
  try {
    const agent = new AtpAgent({ service: 'https://bsky.social' });
    await agent.login({ identifier, password });
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
    );
  }

  const cards = Array.isArray(res.data.records)
    ? res.data.records.map((r) => r.value).filter(isCard)
    : [];
    return NextResponse.json({ cards });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch cards';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
