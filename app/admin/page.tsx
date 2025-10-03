"use client";
import atprotoDataProvider from "@/lib/dataProvider/atprotoDataProvider";
import React, { useEffect, useState } from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  Edit,
  SimpleForm,
  useRecordContext,
  TextField,
  NumberField,
  BooleanField,
  DateField,
} from "react-admin";
// ...existing code...

export default function AdminPage() {
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/collections");
        const data = await res.json();
        setCollections(data.collections || []);
      } catch {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  if (loading) return <div>Loading collections...</div>;

  // Generic Edit component for all collections
  const GenericEdit = () => (
    <Edit>
      <GenericEditForm />
    </Edit>
  );

  const GenericEditForm = () => {
    const record = useRecordContext();
    if (!record) return null;

    // Display each field in value, inferring the field type
  if (!record.value || typeof record.value !== 'object') return <SimpleForm>{null}</SimpleForm>;

    const inferField = (key: string, value: any) => {
  if (typeof value === 'string') {
        // Try to infer date
        if (/^\d{4}-\d{2}-\d{2}([Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|([+-]\d{2}:\d{2})))?$/.test(value)) {
          return <DateField key={key} source={`value.${key}`} label={key} />;
        }
        return <TextField key={key} source={`value.${key}`} label={key} />;
      }
  if (typeof value === 'number') {
        return <NumberField key={key} source={`value.${key}`} label={key} />;
      }
  if (typeof value === 'boolean') {
        return <BooleanField key={key} source={`value.${key}`} label={key} />;
      }
      // Fallback: display as string
      return <TextField key={key} source={`value.${key}`} label={key} />;
    };

    return (
      <SimpleForm>
        {Object.entries(record.value).map(([key, value]) => inferField(key, value as unknown))}
      </SimpleForm>
    );
  }

  return (
    <Admin dataProvider={atprotoDataProvider}>
      {collections.map((col) => {
        const parts = col.split('.');
        let displayName = parts[parts.length - 1];
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        return (
          <Resource key={col} name={col} options={{ label: displayName }} list={ListGuesser} edit={GenericEdit} />
        );
      })}
    </Admin>
  );
}
