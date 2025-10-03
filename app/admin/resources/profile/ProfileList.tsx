"use client";
import React from "react";
import { List, Datagrid, TextField } from "react-admin";

const ProfileList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.displayName" label="Display Name" />
      <TextField source="value.description" label="Description" />
    </Datagrid>
  </List>
);

export default ProfileList;
