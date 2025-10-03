import React from "react";
import { List, Datagrid, TextField } from "react-admin";

function getUsefulFields(records: unknown[]): string[] {
  if (!records || records.length === 0) return [];
  const sample = (records[0]?.value || {}) as Record<string, unknown>;
  return Object.keys(sample).filter((key) => {
    const lower = key.toLowerCase();
    // Exclude technical fields
    if (/(cid|did|rkey|uri|repo|createdat|updatedat|indexedat|type|id)/.test(lower)) return false;
    // Include fields with 'name' or 'description'
    if (lower.includes('name') || lower.includes('description')) return true;
    // Include if not technical and not too long
    return lower.length < 30;
  });
}

const inferListField = (key: string) => (
  <TextField key={key} source={`value.${key}`} label={key} />
);

const GenericList = (props: object) => {
  // Use react-admin's useListContext to get records
  // @ts-expect-error: Accessing react-admin list context from window for generic list field inference
  const { data: records } = (window as unknown as { raListContext?: { data?: unknown[] } }).raListContext || {};
  const usefulFields = getUsefulFields(records || []);
  return (
    <List {...props}>
      <Datagrid rowClick="edit">
        {usefulFields.map((key) => inferListField(key))}
      </Datagrid>
    </List>
  );
};

export default GenericList;
