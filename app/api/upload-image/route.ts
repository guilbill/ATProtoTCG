import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAgent } from '../../lib/sessionStore';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('atp_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    const agent = getAgent(sessionId);
    if (!sessionData || !agent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to array buffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload the blob to AT Proto
    const blobRes = await agent.uploadBlob(uint8Array, {
      encoding: file.type,
    });

    if (!blobRes.success) {
      throw new Error('Failed to upload blob to AT Proto');
    }

    // Return the blob reference that can be used in records
    const blobRef = {
      $type: 'blob',
      ref: blobRes.data.blob,
      mimeType: file.type,
      size: file.size,
    };

    return NextResponse.json({ 
      success: true, 
      blob: blobRef,
      cid: blobRes.data.blob.ref.$link 
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}