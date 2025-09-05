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
    const cards = res.data.records.map((r: any) => r.value);
    return NextResponse.json({ cards });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch cards' }, { status: 500 });
  }
}
