import { DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult, GetManyParams, GetManyResult, GetManyReferenceParams, GetManyReferenceResult, CreateResult, UpdateResult, DeleteResult, DeleteManyResult, UpdateManyResult } from 'react-admin';
import { getSortableValue } from './utils';

// AT-Proto specific types
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

// Custom data provider that implements react-admin interface
export const atprotoDataProvider: DataProvider = {
  getList: async (resource: string, params: GetListParams): Promise<GetListResult> => {
    const page = params.pagination?.page || 1;
    const perPage = params.pagination?.perPage || 10;
    const field = params.sort?.field;
    const order = params.sort?.order || 'ASC';
    const { filter } = params;

    switch (resource) {
      case 'blobs': {
        const response = await fetch('/api/blobs');
        if (!response.ok) {
          throw new Error('Failed to fetch blobs');
        }
        const data: ATProtoBlob[] = await response.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Blobs API returned non-array data:', data);
          return { data: [], total: 0 };
        }
        
        // Apply filters
        let filteredData = data;
        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          filteredData = data.filter(blob => 
            blob.description?.toLowerCase().includes(searchTerm) ||
            blob.alt?.toLowerCase().includes(searchTerm) ||
            blob.mimeType.toLowerCase().includes(searchTerm) ||
            blob.recordType?.toLowerCase().includes(searchTerm)
          );
        }
        if (filter.mimeType) {
          filteredData = filteredData.filter(blob => blob.mimeType.includes(filter.mimeType));
        }
        if (filter.recordType) {
          filteredData = filteredData.filter(blob => blob.recordType === filter.recordType);
        }

        // Apply sorting
        if (field) {
          filteredData.sort((a, b) => {
            const aVal = getSortableValue(a, field);
            const bVal = getSortableValue(b, field);
            
            if (order === 'ASC') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }

        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedData = filteredData.slice(start, end);

        return {
          data: paginatedData.map(blob => ({ ...blob, id: blob.cid })),
          total: filteredData.length,
        };
      }

      case 'collections': {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        
        const collections: ATProtoCollection[] = profileData.collections || [];
        
        // Ensure collections is an array
        if (!Array.isArray(collections)) {
          console.error('Profile API returned non-array collections:', collections);
          return { data: [], total: 0 };
        }
        
        // Apply filters
        let filteredData = collections;
        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          filteredData = collections.filter(collection => 
            collection.name.toLowerCase().includes(searchTerm) ||
            collection.nsid.toLowerCase().includes(searchTerm)
          );
        }

        // Apply sorting
        if (field) {
          filteredData.sort((a, b) => {
            const aVal = getSortableValue(a, field);
            const bVal = getSortableValue(b, field);
            
            if (order === 'ASC') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }

        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedData = filteredData.slice(start, end);

        return {
          data: paginatedData.map(collection => ({ ...collection, id: collection.nsid })),
          total: filteredData.length,
        };
      }

      case 'records': {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        
        // Flatten all records from all collections
        const allRecords: ATProtoRecord[] = [];
        if (profileData.collections && Array.isArray(profileData.collections)) {
          profileData.collections.forEach((collection: ATProtoCollection) => {
            if (collection.records && Array.isArray(collection.records)) {
              collection.records.forEach(record => {
                allRecords.push({
                  ...record,
                  collectionName: collection.name,
                  collectionNsid: collection.nsid,
                });
              });
            }
          });
        }

        // Apply filters
        let filteredData = allRecords;
        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          filteredData = allRecords.filter(record => 
            record.uri.toLowerCase().includes(searchTerm) ||
            JSON.stringify(record.value).toLowerCase().includes(searchTerm) ||
            record.author.handle.toLowerCase().includes(searchTerm) ||
            record.author.displayName?.toLowerCase().includes(searchTerm)
          );
        }
        if (filter.collectionNsid) {
          filteredData = filteredData.filter(record => 
            record.collectionNsid === filter.collectionNsid
          );
        }

        // Apply sorting
        if (field) {
          filteredData.sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;
            
            if (field === 'author') {
              aVal = a.author.handle.toLowerCase();
              bVal = b.author.handle.toLowerCase();
            } else {
              aVal = getSortableValue(a, field);
              bVal = getSortableValue(b, field);
            }
            
            if (order === 'ASC') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }

        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedData = filteredData.slice(start, end);

        return {
          data: paginatedData.map(record => ({ 
            ...record, 
            id: record.uri,
            // Flatten nested objects for easier display
            authorHandle: record.author.handle,
            authorDisplayName: record.author.displayName,
            authorDid: record.author.did,
          })),
          total: filteredData.length,
        };
      }

      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  },

  getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
    switch (resource) {
      case 'blobs': {
        // Get blob metadata from the list
        const listResult = await atprotoDataProvider.getList(resource, {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'cid', order: 'ASC' },
          filter: {},
        });
        
        const blob = listResult.data.find(item => item.id === params.id);
        if (!blob) {
          throw new Error(`Blob with CID ${params.id} not found`);
        }
        
        return { data: blob };
      }

      case 'collections': {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        
        const collection = profileData.collections?.find(
          (c: ATProtoCollection) => c.nsid === params.id
        );
        
        if (!collection) {
          throw new Error(`Collection with NSID ${params.id} not found`);
        }
        
        return { data: { ...collection, id: collection.nsid } };
      }

      case 'records': {
        const listResult = await atprotoDataProvider.getList(resource, {
          pagination: { page: 1, perPage: 10000 },
          sort: { field: 'uri', order: 'ASC' },
          filter: {},
        });
        
        const record = listResult.data.find(item => item.id === params.id);
        if (!record) {
          throw new Error(`Record with URI ${params.id} not found`);
        }
        
        return { data: record };
      }

      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  },

  getMany: async (resource: string, params: GetManyParams): Promise<GetManyResult> => {
    const promises = params.ids.map(id =>
      atprotoDataProvider.getOne(resource, { id: id.toString() })
    );
    
    const results = await Promise.all(promises);
    return {
      data: results.map(result => result.data),
    };
  },

  getManyReference: async (resource: string, params: GetManyReferenceParams): Promise<GetManyReferenceResult> => {
    // For AT-Proto, we can implement this by filtering the main list
    const { target, id } = params;
    
    const listResult = await atprotoDataProvider.getList(resource, {
      ...params,
      filter: { ...params.filter, [target]: id },
    });
    
    return {
      data: listResult.data,
      total: listResult.total,
    };
  },

  // Read-only implementation - AT-Proto doesn't support direct mutations through this interface
  create: async (resource: string): Promise<CreateResult> => {
    throw new Error(`Create operation not supported for AT-Proto resource: ${resource}`);
  },

  update: async (resource: string): Promise<UpdateResult> => {
    throw new Error(`Update operation not supported for AT-Proto resource: ${resource}`);
  },

  updateMany: async (resource: string): Promise<UpdateManyResult> => {
    throw new Error(`UpdateMany operation not supported for AT-Proto resource: ${resource}`);
  },

  delete: async (resource: string): Promise<DeleteResult> => {
    throw new Error(`Delete operation not supported for AT-Proto resource: ${resource}`);
  },

  deleteMany: async (resource: string): Promise<DeleteManyResult> => {
    throw new Error(`DeleteMany operation not supported for AT-Proto resource: ${resource}`);
  },
};

export default atprotoDataProvider;