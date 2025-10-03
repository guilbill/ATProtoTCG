"use client";
import React from "react";
import { Edit, SimpleForm, TextField } from "react-admin";

const BlockEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="value.subject" label="Blocked" />
    </SimpleForm>
  </Edit>
);

export default BlockEdit;
