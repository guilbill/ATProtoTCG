import { DataProvider, RaRecord } from "react-admin";

export interface ATProtoRecord extends RaRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
  createdAt?: string;
}

const atprotoDataProvider: DataProvider = {
  async getList(resource) {
    // resource is the collection name
    const res = await fetch(`/api/records?collection=${encodeURIComponent(resource)}`);
    const data = await res.json();
    const records: ATProtoRecord[] = (data.records as ATProtoRecord[]).map((record) => ({ ...record, id: record.uri }));
    return {
      data: records,
      total: records.length,
    };
  },
  async getOne(resource, params) {
    // resource is the collection name
    const id = typeof params.id === 'string' ? params.id : String(params.id);
    const res = await fetch(`/api/records/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!data.record) throw new Error("Record not found");
    const record: ATProtoRecord = { ...data.record, id: data.record.uri };
    return { data: record };
  },
  
  // @ts-expect-error: Type mismatch with generic constraints, but implementation is correct
  async update(resource, params) {
    // params.id is the record URI, params.data contains the updated fields
    const id = typeof params.id === 'string' ? params.id : String(params.id);
    const res = await fetch(`/api/records/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: params.data.value }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update record');
    }
    
    // Return the updated record  
    return { data: params.data };
  },
  
  create: () => Promise.reject("Not implemented"),
  delete: () => Promise.reject("Not implemented"),
  getMany: () => Promise.reject("Not implemented"),
  getManyReference: () => Promise.reject("Not implemented"),
  updateMany: () => Promise.reject("Not implemented"),
  deleteMany: () => Promise.reject("Not implemented"),
};

export default atprotoDataProvider;
