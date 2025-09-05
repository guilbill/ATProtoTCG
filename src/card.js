// Card model and AT-Proto publishing logic
import { AtpAgent } from '@atproto/api';
export async function createAndPublishCard(agent, card, repo) {
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
//# sourceMappingURL=card.js.map