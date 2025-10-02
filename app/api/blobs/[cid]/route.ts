import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAgent } from '../../../../app/lib/sessionStore';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cid: string }> }
) {
  const { cid } = await context.params;

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

    console.log(`Fetching blob with CID: ${cid} for DID: ${did}`);

    // Call the com.atproto.sync.getBlob API
    const response = await agent.com.atproto.sync.getBlob({
      did: did,
      cid: cid
    });

    if (!response.success) {
      console.error('Failed to fetch blob:', response);
      return NextResponse.json({ error: 'Failed to fetch blob' }, { status: 404 });
    }

    // The response.data should be the blob content
    const blobData = response.data;
    
    // Try to determine content type from the blob or default to application/octet-stream
    let contentType = 'application/octet-stream';
    
    // Check if we can infer the content type from the blob data
    if (blobData instanceof Uint8Array) {
      // Check for common file signatures
      const header = Array.from(blobData.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (header.startsWith('89504e47')) {
        contentType = 'image/png';
      } else if (header.startsWith('ffd8ff')) {
        contentType = 'image/jpeg';
      } else if (header.startsWith('47494638')) {
        contentType = 'image/gif';
      } else if (header.startsWith('52494646') && header.includes('57454250')) {
        contentType = 'image/webp';
      } else if (header.startsWith('25504446')) {
        contentType = 'application/pdf';
      }
    }

    // Create response with the blob data
    // Convert to a proper ArrayBuffer for the Response
    const uint8Data = blobData instanceof Uint8Array 
      ? blobData 
      : new Uint8Array(blobData as ArrayBufferLike);
    
    // Create a new ArrayBuffer with the correct data
    const arrayBuffer = new ArrayBuffer(uint8Data.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(uint8Data);
    
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="${cid}"`
      }
    });

  } catch (error) {
    console.error('Error in blob download API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}