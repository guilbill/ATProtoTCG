"use client";
import React from "react";
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput } from "react-admin";

const TCGCardEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="value.name" label="Name" fullWidth />
      <NumberInput source="value.attack" label="Attack" />
      <NumberInput source="value.defense" label="Defense" />
      <SelectInput 
        source="value.type" 
        label="Type" 
        choices={[
          { id: 'creature', name: 'Creature' },
          { id: 'spell', name: 'Spell' },
          { id: 'artifact', name: 'Artifact' },
        ]} 
      />
      <SelectInput 
        source="value.rarity" 
        label="Rarity" 
        choices={[
          { id: 'common', name: 'Common' },
          { id: 'uncommon', name: 'Uncommon' },
          { id: 'rare', name: 'Rare' },
          { id: 'legendary', name: 'Legendary' },
        ]} 
      />
    </SimpleForm>
  </Edit>
);

export default TCGCardEdit;
