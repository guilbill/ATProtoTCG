"use client";
import atprotoDataProvider from "@/lib/dataProvider/atprotoDataProvider";
import React from "react";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser
} from "react-admin";

export default function AdminPage() {
  return (
    <Admin dataProvider={atprotoDataProvider}>
      <Resource name="app.bsky.actor.profile" options={{ label: "Profile" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.bsky.feed.like" options={{ label: "Like" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.bsky.feed.post" options={{ label: "Post" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.bsky.feed.repost" options={{ label: "Repost" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.bsky.graph.block" options={{ label: "Block" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.bsky.graph.follow" options={{ label: "Follow" }} list={ListGuesser} edit={EditGuesser} />
      <Resource name="app.tcg.card" options={{ label: "Card" }} list={ListGuesser} edit={EditGuesser} />
    </Admin>
  );
}
