import { Box, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import DescriptionIcon from '@mui/icons-material/Description';
import Image from 'next/image';
import { BlobRecord } from '../types';

interface BlobPreviewProps {
  record: BlobRecord;
}

export const BlobPreview = ({ record }: BlobPreviewProps) => {
  if (!record || !record.mimeType) return null;
  
  const isImage = record.mimeType.startsWith('image/');
  const isVideo = record.mimeType.startsWith('video/');
  const isAudio = record.mimeType.startsWith('audio/');
  
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {isImage && (
        <>
          <ImageIcon color="primary" />
          <Image 
            src={`/api/blobs/${record.cid}`} 
            alt={record.alt || 'Blob preview'} 
            width={100}
            height={60}
            style={{ objectFit: 'cover' }}
          />
        </>
      )}
      {isVideo && (
        <>
          <VideoLibraryIcon color="secondary" />
          <Typography variant="body2">Video</Typography>
        </>
      )}
      {isAudio && (
        <>
          <AudioFileIcon color="success" />
          <Typography variant="body2">Audio</Typography>
        </>
      )}
      {!isImage && !isVideo && !isAudio && (
        <>
          <DescriptionIcon />
          <Typography variant="body2">File</Typography>
        </>
      )}
    </Box>
  );
};