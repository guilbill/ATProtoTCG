"use client";
import atprotoDataProvider from "@/lib/dataProvider/atprotoDataProvider";
import React, { useEffect, useState } from "react";
import { Admin, Resource } from "react-admin";

// Import dedicated components
import ProfileList from "./resources/profile/ProfileList";
import ProfileEdit from "./resources/profile/ProfileEdit";
import PostList from "./resources/post/PostList";
import PostEdit from "./resources/post/PostEdit";
import LikeList from "./resources/like/LikeList";
import LikeEdit from "./resources/like/LikeEdit";
import RepostList from "./resources/repost/RepostList";
import RepostEdit from "./resources/repost/RepostEdit";
import BlockList from "./resources/block/BlockList";
import BlockEdit from "./resources/block/BlockEdit";
import FollowList from "./resources/follow/FollowList";
import FollowEdit from "./resources/follow/FollowEdit";
import TCGCardList from "./resources/tcgcard/TCGCardList";
import TCGCardEdit from "./resources/tcgcard/TCGCardEdit";

export default function AdminPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading admin interface...</div>;
  }

  return (
    <Admin dataProvider={atprotoDataProvider}>
      <Resource name="app.bsky.actor.profile" options={{ label: "Profile" }} list={ProfileList} edit={ProfileEdit} />
      <Resource name="app.bsky.feed.like" options={{ label: "Like" }} list={LikeList} edit={LikeEdit} />
      <Resource name="app.bsky.feed.post" options={{ label: "Post" }} list={PostList} edit={PostEdit} />
      <Resource name="app.bsky.feed.repost" options={{ label: "Repost" }} list={RepostList} edit={RepostEdit} />
      <Resource name="app.bsky.graph.block" options={{ label: "Block" }} list={BlockList} edit={BlockEdit} />
      <Resource name="app.bsky.graph.follow" options={{ label: "Follow" }} list={FollowList} edit={FollowEdit} />
      <Resource name="app.tcg.card" options={{ label: "Card" }} list={TCGCardList} edit={TCGCardEdit} />
    </Admin>
  );
}
