"use client";
import atprotoDataProvider from "@/lib/dataProvider/atprotoDataProvider";
import React, { useEffect, useState } from "react";
import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";

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

  return (
    <Admin dataProvider={atprotoDataProvider}>
      {collections.map((col) => (
        <Resource key={col} name={col} list={ListGuesser} edit={EditGuesser} />
      ))}
    </Admin>
  );
}
