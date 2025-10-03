"use client";
import React from "react";
import { Edit, SimpleForm, TextInput, TextField, useRecordContext } from "react-admin";

const PostEditForm = () => {
  const record = useRecordContext();
  if (!record?.value) return null;
  
  return (
    <SimpleForm>
      <TextInput source="value.text" label="Text" multiline fullWidth />
      {record.value.reply && (
        <TextField source="value.reply.parent.uri" label="Reply to" />
      )}
      {record.value.embed && (
        <TextField source="value.embed.$type" label="Embed Type" />
      )}
    </SimpleForm>
  );
};

const PostEdit = () => (
  <Edit>
    <PostEditForm />
  </Edit>
);

export default PostEdit;
