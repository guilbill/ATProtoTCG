import { Box, Button } from '@mui/material';
import { BlobRecord } from '../types';

interface BlobActionsProps {
  record: BlobRecord;
}

export const BlobActions = ({ record }: BlobActionsProps) => {
  if (!record) return null;
  
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        variant="outlined"
        href={`/api/blobs/${record.cid}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View
      </Button>
      <Button
        size="small"
        variant="contained"
        href={`/api/blobs/${record.cid}?download=true`}
        download
      >
        Download
      </Button>
    </Box>
  );
};