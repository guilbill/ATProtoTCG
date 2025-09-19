import { NextRequest, NextResponse } from 'next/server';
import { AtpAgent } from '@atproto/api';
import { getSession, getAgent, storeAgent } from '../../lib/sessionStore';

export async function GET(req: NextRequest) {
  try {
    let agent: AtpAgent | undefined;
    const sid = req.cookies.get('atp_session')?.value;
    
    if (sid) agent = getAgent(sid);
    
    // If no cached agent, but we have stored session data, resume it
    if (!agent && sid) {
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
    if (!did) throw new Error('No DID after authentication');
    
    // Get all collections in the repository
    const collections = [
      'app.bsky.feed.post',
      'app.bsky.feed.like',
      'app.bsky.feed.repost',
      'app.bsky.graph.follow',
      'app.bsky.graph.block',
      'app.bsky.actor.profile',
      'app.tcg.card', // Our custom collection
    ];
    
    const allRecords: Record<string, any[]> = {};
    
    for (const collection of collections) {
      try {
        const res = await agent.com.atproto.repo.listRecords({
          repo: did,
          collection: collection,
          limit: 100, // Limit per collection
        });
        
        if (res.data.records && res.data.records.length > 0) {
          allRecords[collection] = res.data.records.map(record => ({
            uri: record.uri,
            cid: record.cid,
            value: record.value,
            createdAt: record.value?.createdAt || null,
          }));
        }
      } catch (error) {
        // Collection might not exist for this user, continue
        console.log(`No records found for collection: ${collection}`);
      }
    }
    
    // Get profile information
    let profile = null;
    try {
      const profileRes = await agent.getProfile({ actor: did });
      profile = profileRes.data;
    } catch (error) {
      console.log('Could not fetch profile:', error);
    }
    
    return NextResponse.json({ 
      did,
      profile,
      records: allRecords,
      totalCollections: Object.keys(allRecords).length,
      totalRecords: Object.values(allRecords).reduce((sum, records) => sum + records.length, 0)
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch profile data';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}