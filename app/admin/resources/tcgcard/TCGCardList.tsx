"use client";
import React from "react";
import { List, Datagrid, TextField, NumberField } from "react-admin";

const TCGCardList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="value.name" label="Name" />
      <NumberField source="value.attack" label="Attack" />
      <NumberField source="value.defense" label="Defense" />
      <TextField source="value.type" label="Type" />
      <TextField source="value.rarity" label="Rarity" />
    </Datagrid>
  </List>
);

export default TCGCardList;
