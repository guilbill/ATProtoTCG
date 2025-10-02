import { List, Datagrid, TextField, DateField, ShowButton, FilterList, FilterListItem } from 'react-admin';
import { Card, CardContent } from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';

export const RecordList = () => (
  <List
    title="AT-Proto Records"
    perPage={25}
    sort={{ field: 'indexedAt', order: 'DESC' }}
    aside={
      <Card sx={{ width: 300, marginTop: 1 }}>
        <CardContent>
          <FilterList label="Collection" icon={<CollectionsIcon />}>
            <FilterListItem label="Posts" value={{ collectionNsid: 'app.bsky.feed.post' }} />
            <FilterListItem label="Likes" value={{ collectionNsid: 'app.bsky.feed.like' }} />
            <FilterListItem label="Follows" value={{ collectionNsid: 'app.bsky.graph.follow' }} />
            <FilterListItem label="Profile" value={{ collectionNsid: 'app.bsky.actor.profile' }} />
          </FilterList>
        </CardContent>
      </Card>
    }
  >
    <Datagrid rowClick="show">
      <TextField source="uri" label="URI" />
      <TextField source="authorHandle" label="Author" />
      <TextField source="collectionName" label="Collection" />
      <DateField source="indexedAt" label="Indexed At" showTime />
      <ShowButton />
    </Datagrid>
  </List>
);