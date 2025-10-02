// AT-Proto specific types for data provider
export interface ATProtoRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  indexedAt: string;
  collectionName?: string;
  collectionNsid?: string;
}

export interface ATProtoBlob {
  cid: string;
  size: number;
  mimeType: string;
  ref?: string;
  recordUri?: string;
  recordType?: string;
  description?: string;
  alt?: string;
}

export interface ATProtoProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followsCount?: number;
  followersCount?: number;
  postsCount?: number;
}

export interface ATProtoCollection {
  nsid: string;
  name: string;
  count: number;
  records: ATProtoRecord[];
}