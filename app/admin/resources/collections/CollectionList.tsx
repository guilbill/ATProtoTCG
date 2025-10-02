import { List, Datagrid, TextField, NumberField } from 'react-admin';

export const CollectionList = () => (
  <List
    title="AT-Proto Collections"
    perPage={25}
    sort={{ field: 'count', order: 'DESC' }}
  >
    <Datagrid rowClick="show">
      <TextField source="name" label="Name" />
      <TextField source="nsid" label="NSID" />
      <NumberField source="count" label="Record Count" />
    </Datagrid>
  </List>
);