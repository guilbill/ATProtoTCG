import { NextRequest, NextResponse } from 'next/server';

// Simple proxy that redirects to a public IPFS gateway using a blob CID.
// The client can call /api/blob?cid=<cid> to get an image URL.

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cid = url.searchParams.get('cid');
  if (!cid) return NextResponse.json({ error: 'Missing cid' }, { status: 400 });

  // Use a trustworthy public gateway (Cloudflare) which supports IPFS CIDs.
  const gateway = `https://cloudflare-ipfs.com/ipfs/${encodeURIComponent(cid)}`;
  return NextResponse.redirect(gateway);
}
