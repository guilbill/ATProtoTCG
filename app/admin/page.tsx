"use client";
import atprotoDataProvider from "@/lib/dataProvider/atprotoDataProvider";
import React, { useEffect, useState } from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  Edit,
  SimpleForm,
  TextField,
  useRecordContext,
} from "react-admin";
import { JsonField } from "react-admin-json-view";

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

    return (
      <SimpleForm>
        {Object.keys(record).map((key) =>
          key === "value" ? (
            <JsonField key={key} source={key} label={key} />
          ) : (
            <TextField key={key} source={key} label={key} />
          )
        )}
      </SimpleForm>
    );
  }

  return (
    <Admin dataProvider={atprotoDataProvider}>
      {collections.map((col) => (
        <Resource key={col} name={col} list={ListGuesser} edit={GenericEdit} />
      ))}
    </Admin>
  );
}
