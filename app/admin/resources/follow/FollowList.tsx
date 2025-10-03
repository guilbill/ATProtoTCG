"use client";
import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const FollowList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.subject" label="Following" />
    </Datagrid>
  </List>
);

export default FollowList;
