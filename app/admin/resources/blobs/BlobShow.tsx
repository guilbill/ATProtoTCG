import { Show, SimpleShowLayout, TextField, FunctionField } from 'react-admin';
import { BlobPreview } from '../../components/BlobPreview';
import { BlobActions } from '../../components/BlobActions';
import { FileSizeField } from '../../components/FileSizeField';
import { BlobRecord } from '../../types';

export const BlobShow = () => (
  <Show title="Blob Details">
    <SimpleShowLayout>
      <TextField source="cid" label="Content ID" />
      <TextField source="mimeType" label="MIME Type" />
      <FunctionField
        label="Size"
        render={(record: BlobRecord) => <FileSizeField record={record} />}
      />
      <TextField source="recordType" label="Record Type" />
      <TextField source="recordUri" label="Record URI" />
      <TextField source="description" label="Description" />
      <TextField source="alt" label="Alt Text" />
      <FunctionField
        label="Preview"
        render={(record: BlobRecord) => <BlobPreview record={record} />}
      />
      <FunctionField
        label="Actions"
        render={(record: BlobRecord) => <BlobActions record={record} />}
      />
    </SimpleShowLayout>
  </Show>
);