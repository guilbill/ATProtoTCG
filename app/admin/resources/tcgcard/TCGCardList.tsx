"use client";
import React from "react";
import Image from "next/image";
import { List, Datagrid, TextField, NumberField, FunctionField } from "react-admin";

const ImageField = ({ record }: { record: { value?: { name?: string; image?: { ref?: { $link?: string } } } } }) => {
  const imageCid = record?.value?.image?.ref?.$link;
  if (!imageCid) return <span>No image</span>;
  
  return (
    <Image
      src={`/api/blob?cid=${imageCid}`}
      alt={`${record.value?.name || 'Card'} artwork`}
      width={60}
      height={60}
      style={{
        objectFit: 'contain',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}
      unoptimized
    />
  );
};

const TCGCardList = () => (
  <List>
    <Datagrid rowClick="edit">
      <FunctionField label="Image" render={(record) => <ImageField record={record} />} />
      <TextField source="value.name" label="Name" />
      <NumberField source="value.attack" label="Attack" />
      <NumberField source="value.defense" label="Defense" />
      <TextField source="value.type" label="Type" />
      <TextField source="value.rarity" label="Rarity" />
    </Datagrid>
  </List>
);

export default TCGCardList;
