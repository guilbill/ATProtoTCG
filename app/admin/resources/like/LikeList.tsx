"use client";
import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const LikeList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.subject.uri" label="Liked Post" />
    </Datagrid>
  </List>
);

export default LikeList;
