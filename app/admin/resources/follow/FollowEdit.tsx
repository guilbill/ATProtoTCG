"use client";
import React from "react";
import { Edit, SimpleForm, TextField } from "react-admin";

const FollowEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="value.subject" label="Following" />
    </SimpleForm>
  </Edit>
);

export default FollowEdit;
