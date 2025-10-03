"use client";
import React from "react";
import { Edit, SimpleForm, TextField } from "react-admin";

const LikeEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="value.subject.uri" label="Liked Post" />
    </SimpleForm>
  </Edit>
);

export default LikeEdit;
