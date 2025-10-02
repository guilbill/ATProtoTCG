import type { AtpAgent, AtpSessionData } from '@atproto/api';

// Use global to persist sessions across module reloads in development
declare global {
  var __sessions: Map<string, AtpSessionData> | undefined;
  var __agents: Map<string, AtpAgent> | undefined;
}

// In-memory session store. Suitable for development/hackday.
// Use global variables to persist across HMR reloads
export const sessions = globalThis.__sessions ?? (globalThis.__sessions = new Map<string, AtpSessionData>());
export const agents = globalThis.__agents ?? (globalThis.__agents = new Map<string, AtpAgent>());

export function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as Crypto).randomUUID === 'function') {
    return (crypto as Crypto).randomUUID();
  }
  // fallback
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function storeSession(sessionId: string, sess: AtpSessionData) {
  console.log('SessionStore - Storing session for ID:', sessionId);
  console.log('SessionStore - Session data:', !!sess);
  console.log('SessionStore - Sessions map size before:', sessions.size);
  sessions.set(sessionId, sess);
  console.log('SessionStore - Sessions map size after:', sessions.size);
}

export function getSession(sessionId: string) {
  console.log('SessionStore - Getting session for ID:', sessionId);
  console.log('SessionStore - Sessions map size:', sessions.size);
  console.log('SessionStore - All session IDs:', Array.from(sessions.keys()));
  const session = sessions.get(sessionId);
  console.log('SessionStore - Found session:', !!session);
  return session;
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
