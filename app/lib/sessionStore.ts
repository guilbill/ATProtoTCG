import { AtpAgent } from '@atproto/api';

type Creds = { identifier: string; password: string };

// In-memory session store. Suitable for development/hackday.
export const sessions = new Map<string, Creds>();
export const agents = new Map<string, AtpAgent>();

export function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  // fallback
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function storeCreds(sessionId: string, creds: Creds) {
  sessions.set(sessionId, creds);
}

export function getCreds(sessionId: string) {
  return sessions.get(sessionId);
}

export function storeAgent(sessionId: string, agent: AtpAgent) {
  agents.set(sessionId, agent);
}

export function getAgent(sessionId: string) {
  return agents.get(sessionId);
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
  agents.delete(sessionId);
}
