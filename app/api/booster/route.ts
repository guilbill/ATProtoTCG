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
    let imageBuffer;
    let image;

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

    // Fetch a random card from Scryfall
    const randomCard = await fetchRandomScryfallCard();
    if (!randomCard) {
      return NextResponse.json({ error: 'Failed to get card from Scryfall' }, { status: 500 });
    }
    const card = {
      name: randomCard.name,
      attack: randomCard.power ? parseInt(randomCard.power) : 0,
      defense: randomCard.toughness ? parseInt(randomCard.toughness) : 0,
      type: randomCard.type_line || 'Unknown',
        rarity: randomCard.rarity || 'common',
    };
    const scryfall_uri = randomCard.scryfall_uri || '';
    const mana_cost = randomCard.mana_cost || '';
    
    // Fetch image data if available
    if (randomCard.image_uris && randomCard.image_uris.normal) {
      const imgRes = await fetch(randomCard.image_uris.normal);
      if (imgRes.ok) {
        imageBuffer = await imgRes.arrayBuffer();
      }
    }

    // If random card, upload image to AT-Proto blob store
    if (imageBuffer) {
      const blobRes = await agent.com.atproto.repo.uploadBlob(new Uint8Array(imageBuffer));
      image = blobRes.data.blob;
      if (!image) {
        return NextResponse.json({ error: 'Failed to upload image to blob store.' }, { status: 500 });
      }
    }
    // Save card to AT-Proto collection
    const newRecord = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: 'app.tcg.card',
      record: {
        name: card.name,
        attack: card.attack,
        defense: card.defense,
        type: card.type,
        rarity: card.rarity,
        image: image,
        createdAt: new Date().toISOString(),
        scryfall_uri,
        mana_cost,
      }
    });

    console.log('Created card record:', JSON.stringify({
        name: card.name,
        attack: card.attack,
        defense: card.defense,
        type: card.type,
        rarity: card.rarity,
        imageCid: image?.ref.$link,
        createdAt: new Date().toISOString(),
        scryfall_uri,
        mana_cost,
      }, null, 2));
    // Return card info and image
    return NextResponse.json(newRecord.data, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
