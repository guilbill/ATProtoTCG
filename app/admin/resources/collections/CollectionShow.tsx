import { Show, TabbedShowLayout, Tab, TextField, NumberField, ArrayField, SingleFieldList, ChipField } from 'react-admin';

export const CollectionShow = () => (
  <Show title="Collection Details">
    <TabbedShowLayout>
      <Tab label="Overview">
        <TextField source="name" label="Collection Name" />
        <TextField source="nsid" label="NSID" />
        <NumberField source="count" label="Record Count" />
      </Tab>
      <Tab label="Records">
        <ArrayField source="records" label="Records">
          <SingleFieldList>
            <ChipField source="uri" />
          </SingleFieldList>
        </ArrayField>
      </Tab>
    </TabbedShowLayout>
  </Show>
);