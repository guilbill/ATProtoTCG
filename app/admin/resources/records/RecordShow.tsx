import { Show, TabbedShowLayout, Tab, TextField, DateField, FunctionField } from 'react-admin';
import { RecordData } from '../../types';

export const RecordShow = () => (
  <Show title="Record Details">
    <TabbedShowLayout>
      <Tab label="Metadata">
        <TextField source="uri" label="URI" />
        <TextField source="cid" label="CID" />
        <TextField source="authorHandle" label="Author Handle" />
        <TextField source="authorDisplayName" label="Author Name" />
        <TextField source="authorDid" label="Author DID" />
        <TextField source="collectionName" label="Collection" />
        <TextField source="collectionNsid" label="Collection NSID" />
        <DateField source="indexedAt" label="Indexed At" showTime />
      </Tab>
      <Tab label="Content">
        <FunctionField
          label="Record Value"
          render={(record: RecordData) => (
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              overflow: 'auto' 
            }}>
              {JSON.stringify(record.value, null, 2)}
            </pre>
          )}
        />
      </Tab>
    </TabbedShowLayout>
  </Show>
);