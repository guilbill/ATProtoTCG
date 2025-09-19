import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAgent } from '../../../app/lib/sessionStore';

interface BlobInfo {
  cid: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  recordUri?: string;
}

interface BlobRecord {
  cid: string;
  recordUri?: string;
}

interface AtpRecord {
  uri: string;
  value: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = request.cookies.get('atp_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Get session data and agent
    const sessionData = getSession(sessionId);
    const agent = getAgent(sessionId);
    
    if (!sessionData || !agent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const did = sessionData.did;

    if (!did) {
      return NextResponse.json({ error: 'User DID not found' }, { status: 400 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500);
    const cursor = url.searchParams.get('cursor') || undefined;

    console.log(`Fetching blobs for DID: ${did}`);

    // Call the com.atproto.sync.listBlobs API
    const response = await agent.com.atproto.sync.listBlobs({
      did: did,
      limit: limit,
      cursor: cursor
    });

    if (!response.success) {
      console.error('Failed to fetch blobs:', response);
      return NextResponse.json({ error: 'Failed to fetch blobs' }, { status: 500 });
    }

    const { data } = response;
    const blobCids = data.cids || [];

    console.log(`Found ${blobCids.length} blob CIDs`);

    // For each blob CID, try to get additional metadata by finding associated records
    const blobsWithMetadata: BlobInfo[] = [];
    
    // First, add all blobs with basic info
    for (const cid of blobCids) {
      blobsWithMetadata.push({
        cid: cid,
        mimeType: 'unknown',
        size: 0
      });
    }

    // Try to get missing blobs info which might have more metadata
    try {
      const missingBlobsResponse = await agent.com.atproto.repo.listMissingBlobs({
        limit: 500
      });

      if (missingBlobsResponse.success && missingBlobsResponse.data.blobs) {
        const missingBlobsMap = new Map<string, BlobRecord>();
        missingBlobsResponse.data.blobs.forEach((blob: BlobRecord) => {
          missingBlobsMap.set(blob.cid, blob);
        });

        // Update blobs with record URI information from missing blobs
        blobsWithMetadata.forEach(blob => {
          const missingBlobInfo = missingBlobsMap.get(blob.cid);
          if (missingBlobInfo && missingBlobInfo.recordUri) {
            blob.recordUri = missingBlobInfo.recordUri;
          }
        });
      }
    } catch (missingBlobsError) {
      console.warn('Could not fetch missing blobs info:', missingBlobsError);
      // Continue without missing blobs metadata
    }

    // Try to get blob info by checking common collections for blob references
    const collections = [
      'app.bsky.feed.post',
      'app.bsky.actor.profile',
      'app.tcg.card'
    ];

    for (const collection of collections) {
      try {
        const recordsResponse = await agent.com.atproto.repo.listRecords({
          repo: did,
          collection: collection,
          limit: 100
        });

        if (recordsResponse.success && recordsResponse.data.records) {
          recordsResponse.data.records.forEach((record: AtpRecord) => {
            // Look for blob references in the record
            const recordValue = record.value;
            if (recordValue) {
              // Check for blob in different possible locations
              const checkForBlobs = (obj: Record<string, unknown>, path: string = '') => {
                if (obj && typeof obj === 'object') {
                  if (obj.$type === 'blob' && obj.ref && typeof obj.ref === 'object' && obj.ref !== null) {
                    const refObj = obj.ref as Record<string, unknown>;
                    if (refObj.$link && typeof refObj.$link === 'string') {
                      const blobCid = refObj.$link;
                      const existingBlob = blobsWithMetadata.find(b => b.cid === blobCid);
                      if (existingBlob) {
                        existingBlob.recordUri = record.uri;
                        existingBlob.mimeType = (typeof obj.mimeType === 'string' ? obj.mimeType : existingBlob.mimeType) || 'unknown';
                        existingBlob.size = (typeof obj.size === 'number' ? obj.size : existingBlob.size) || 0;
                        existingBlob.createdAt = (typeof record.value.createdAt === 'string' ? record.value.createdAt : existingBlob.createdAt);
                      }
                    }
                  }
                  // Recursively check nested objects
                  for (const key in obj) {
                    if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
                      checkForBlobs(obj[key] as Record<string, unknown>, path ? `${path}.${key}` : key);
                    }
                  }
                }
              };

              checkForBlobs(recordValue);
            }
          });
        }
      } catch (error) {
        console.warn(`Error checking collection ${collection}:`, error);
        // Continue with other collections
      }
    }

    return NextResponse.json({
      blobs: blobsWithMetadata,
      cursor: data.cursor,
      totalBlobs: blobsWithMetadata.length,
      hasMore: !!data.cursor
    });

  } catch (error) {
    console.error('Error in blobs API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}