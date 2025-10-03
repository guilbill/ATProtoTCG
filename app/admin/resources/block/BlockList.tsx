"use client";
import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const BlockList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.subject" label="Blocked" />
    </Datagrid>
  </List>
);

export default BlockList;
