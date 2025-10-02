import { Typography } from '@mui/material';
import { BlobRecord } from '../types';

interface FileSizeFieldProps {
  record: BlobRecord;
}

export const FileSizeField = ({ record }: FileSizeFieldProps) => {
  if (!record || !record.size) return null;
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return <Typography variant="body2">{formatBytes(record.size)}</Typography>;
};