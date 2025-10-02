// Shared type definitions for AT-Proto Admin interface

export interface BlobRecord {
  cid: string;
  mimeType: string;
  size: number;
  alt?: string;
  description?: string;
  recordType?: string;
  recordUri?: string;
  ref?: string;
}

export interface CollectionRecord {
  nsid: string;
  name: string;
  count: number;
  records: Record<string, unknown>[];
}

export interface RecordData {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
  authorHandle: string;
  authorDisplayName?: string;
  authorDid: string;
  collectionName?: string;
  collectionNsid?: string;
  indexedAt: string;
}

export interface ProfileInfo {
  did: string;
  profile?: {
    displayName?: string;
    handle: string;
    description?: string;
    avatar?: string;
    banner?: string;
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
  };
  totalCollections: number;
  totalRecords: number;
}