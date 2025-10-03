"use client";
import React from "react";
import { Edit, SimpleForm, TextInput } from "react-admin";

const ProfileEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="value.displayName" label="Display Name" />
      <TextInput source="value.description" label="Description" multiline />
    </SimpleForm>
  </Edit>
);

export default ProfileEdit;
