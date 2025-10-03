"use client";
import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const RepostList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.subject.uri" label="Reposted" />
    </Datagrid>
  </List>
);

export default RepostList;
