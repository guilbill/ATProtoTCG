import { List, Datagrid, TextField, FunctionField, ShowButton, FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import { BlobPreview } from '../../components/BlobPreview';
import { BlobActions } from '../../components/BlobActions';
import { FileSizeField } from '../../components/FileSizeField';
import { BlobRecord } from '../../types';

export const BlobList = () => (
  <List
    title="AT-Proto Blobs"
    perPage={25}
    sort={{ field: 'size', order: 'DESC' }}
    aside={
      <Card sx={{ width: 300, marginTop: 1 }}>
        <CardContent>
          <FilterList label="MIME Type" icon={<CloudIcon />}>
            <FilterListItem label="Images" value={{ mimeType: 'image/' }} />
            <FilterListItem label="Videos" value={{ mimeType: 'video/' }} />
            <FilterListItem label="Audio" value={{ mimeType: 'audio/' }} />
            <FilterListItem label="Documents" value={{ mimeType: 'application/' }} />
          </FilterList>
        </CardContent>
      </Card>
    }
  >
    <Datagrid rowClick="show">
      <FunctionField
        label="Preview"
        render={(record: BlobRecord) => <BlobPreview record={record} />}
      />
      <TextField source="cid" label="CID" />
      <TextField source="mimeType" label="MIME Type" />
      <FunctionField
        label="Size"
        render={(record: BlobRecord) => <FileSizeField record={record} />}
      />
      <TextField source="recordType" label="Record Type" />
      <TextField source="description" label="Description" />
      <FunctionField
        label="Actions"
        render={(record: BlobRecord) => <BlobActions record={record} />}
      />
      <ShowButton />
    </Datagrid>
  </List>
);