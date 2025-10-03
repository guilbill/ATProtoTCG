import React from "react";
import { Edit, SimpleForm, useRecordContext, TextField, NumberField, BooleanField, DateField } from "react-admin";

const inferField = (key: string, value: unknown) => {
  if (typeof value === "string") {
    // Try to infer date
    if (/^\d{4}-\d{2}-\d{2}([Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|([+-]\d{2}:\d{2})))?$/.test(value)) {
      return <DateField key={key} source={`value.${key}`} label={key} />;
    }
    return <TextField key={key} source={`value.${key}`} label={key} />;
  }
  if (typeof value === "number") {
    return <NumberField key={key} source={`value.${key}`} label={key} />;
  }
  if (typeof value === "boolean") {
    return <BooleanField key={key} source={`value.${key}`} label={key} />;
  }
  // Fallback: display as string
  return <TextField key={key} source={`value.${key}`} label={key} />;
};

export const GenericEditForm = () => {
  const record = useRecordContext();
  if (!record || !record.value || typeof record.value !== "object") return <SimpleForm>{null}</SimpleForm>;
  return (
    <SimpleForm>
      {Object.entries(record.value).map(([key, value]) => inferField(key, value))}
    </SimpleForm>
  );
};

const GenericEdit = () => (
  <Edit>
    <GenericEditForm />
  </Edit>
);

export default GenericEdit;
