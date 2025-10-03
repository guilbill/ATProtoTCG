"use client";
import React from "react";
import { Edit, SimpleForm, TextField } from "react-admin";

const RepostEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="value.subject.uri" label="Reposted" />
    </SimpleForm>
  </Edit>
);

export default RepostEdit;
