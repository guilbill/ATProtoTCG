import { DataProvider, RaRecord, GetListParams, GetOneParams, Identifier, GetListResult, GetOneResult } from "react-admin";

export interface ATProtoRecord extends RaRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
  createdAt?: string;
}

const atprotoDataProvider: DataProvider = {
  async getList(resource, _params) {
    // resource is the collection name
    const res = await fetch(`/api/records?collection=${encodeURIComponent(resource)}`);
    const data = await res.json();
    const records: ATProtoRecord[] = (data.records as ATProtoRecord[]).map((record) => ({ ...record, id: record.uri }));
    return {
      data: records,
      total: records.length,
    } as GetListResult<RaRecord>;
  },
  async getOne(resource, params) {
    // resource is the collection name
    const id = typeof params.id === 'string' ? params.id : String(params.id);
    const res = await fetch(`/api/records/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!data.record) throw new Error("Record not found");
    const record: ATProtoRecord = { ...data.record, id: data.record.uri };
    return { data: record } as GetOneResult<RaRecord>;
  },
  create: () => Promise.reject("Not implemented"),
  update: () => Promise.reject("Not implemented"),
  delete: () => Promise.reject("Not implemented"),
  getMany: () => Promise.reject("Not implemented"),
  getManyReference: () => Promise.reject("Not implemented"),
  updateMany: () => Promise.reject("Not implemented"),
  deleteMany: () => Promise.reject("Not implemented"),
};

export default atprotoDataProvider;
