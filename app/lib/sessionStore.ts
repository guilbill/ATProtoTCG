import type { AtpAgent, AtpSessionData } from '@atproto/api';

// In-memory session store. Suitable for development/hackday.
// sessions -> stores AtpSessionData produced by the SDK's persistSession callback
export const sessions = new Map<string, AtpSessionData>();
export const agents = new Map<string, AtpAgent>();

export function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  // fallback
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function storeSession(sessionId: string, sess: AtpSessionData) {
  sessions.set(sessionId, sess);
}

export function getSession(sessionId: string) {
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
