import { NextRequest, NextResponse } from 'next/server';

// Helper to fetch a random card from Scryfall
async function fetchRandomScryfallCard() {
  const res = await fetch('https://api.scryfall.com/cards/random');
  if (!res.ok) throw new Error('Failed to fetch random card from Scryfall');
  const card = await res.json();
  return card;
}


export async function POST(req: NextRequest) {
  try {
    // Parse body for manual card creation
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { card: manualCard } = (body as { card?: any }) || {};

    let card;
    let imageBuffer;
    let image;
    let scryfall_uri = undefined;
    let mana_cost = undefined;

    if (manualCard) {
      // Manual card creation (no image upload)
      card = manualCard;
      image = manualCard.image || null;
      scryfall_uri = manualCard.scryfall_uri || undefined;
      mana_cost = manualCard.mana_cost || undefined;
    } else {
      // Get a random card from Scryfall
      card = await fetchRandomScryfallCard();
      // Prefer large image, fallback to normal
      const imageUrl = card.image_uris?.large || card.image_uris?.normal || null;
      if (!imageUrl) {
        return NextResponse.json({ error: 'No image found for card.' }, { status: 400 });
      }
      // Download image as ArrayBuffer
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) {
        return NextResponse.json({ error: 'Failed to download card image.' }, { status: 400 });
      }
      imageBuffer = await imageRes.arrayBuffer();
      scryfall_uri = card.scryfall_uri;
      mana_cost = card.mana_cost;
    }

    // Get session cookie from request
    const { AtpAgent } = await import('@atproto/api');
    const { getSession, getAgent, storeAgent } = await import('../../lib/sessionStore');
    const sid = req.cookies.get('atp_session')?.value;
    if (!sid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    let agent = getAgent(sid);
    if (!agent) {
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
    if (!did) {
      return NextResponse.json({ error: 'No DID in session' }, { status: 401 });
    }

    // If random card, upload image to AT-Proto blob store
    if (!manualCard && imageBuffer) {
      const blobRes = await agent.com.atproto.repo.uploadBlob(new Uint8Array(imageBuffer));
      image = blobRes.data.blob;
      if (!image) {
        return NextResponse.json({ error: 'Failed to upload image to blob store.' }, { status: 500 });
      }
    }

    // Save card to AT-Proto collection
    await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: 'app.tcg.card',
      record: {
        name: card.name,
        attack: card.attack,
        defense: card.defense,
        type: card.type,
        rarity: card.rarity,
        image,
        createdAt: new Date().toISOString(),
        scryfall_uri,
        mana_cost,
      }
    });

    // Return card info and image
    return NextResponse.json({
      name: card.name,
      attack: card.attack,
      defense: card.defense,
      type: card.type,
      rarity: card.rarity,
      image,
      scryfall_uri,
      mana_cost,
      saved: true
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
