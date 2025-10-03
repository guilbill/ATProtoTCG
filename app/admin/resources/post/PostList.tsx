"use client";
import React from "react";
import { List, Datagrid, TextField, BooleanField } from "react-admin";

const PostList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.text" label="Text" />
      <BooleanField source="value.reply" label="Is Reply" />
      <BooleanField source="value.embed" label="Has Embed" />
    </Datagrid>
  </List>
);

export default PostList;
