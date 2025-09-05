// Card model and AT-Proto publishing logic

import { AtpAgent } from '@atproto/api';

export interface Card {
  name: string;
  attack: number;
  defense: number;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export async function createAndPublishCard(
  agent: AtpAgent,
  card: Card,
  repo: string
): Promise<any> {
  const record = {
    ...card,
    createdAt: new Date().toISOString(),
  };
  return agent.com.atproto.repo.createRecord({
    repo,
    collection: 'app.tcg.card',
    record,
  });
}
