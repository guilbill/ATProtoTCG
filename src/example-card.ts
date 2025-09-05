import { AtpAgent } from '@atproto/api';
import { createAndPublishCard } from './card.js';
import type { Card } from './card.js';

async function main() {
  // Replace with your PDS service URL, handle, and app password
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_PASSWORD;
  if (!identifier || !password) {
    throw new Error('BLUESKY_IDENTIFIER and BLUESKY_PASSWORD must be set in the environment.');
  }
  await agent.login({
    identifier,
    password,
  });

  const card: Card = {
    name: 'Dragon Knight',
    attack: 8,
    defense: 6,
    type: 'fire',
    rarity: 'epic',
  };

  const result = await createAndPublishCard(agent, card, agent.session?.did || '');
  console.log('Card published:', result);
}

main().catch(console.error);
