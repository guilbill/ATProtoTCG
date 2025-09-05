import { AtpAgent } from '@atproto/api';
export interface Card {
    name: string;
    attack: number;
    defense: number;
    type: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
export declare function createAndPublishCard(agent: AtpAgent, card: Card, repo: string): Promise<any>;
//# sourceMappingURL=card.d.ts.map