# AT-Proto Admin Interface

This directory contains the modular react-admin interface for managing AT-Proto data.

## Structure

```
app/admin/
├── page.tsx                 # Main admin app component
├── index.ts                 # Public exports
├── types.ts                 # Shared type definitions
├── components/              # Shared UI components
│   ├── BlobPreview.tsx      # Image/blob preview component
│   ├── BlobActions.tsx      # Blob action buttons
│   └── FileSizeField.tsx    # File size display component
└── resources/               # Resource-specific components
    ├── blobs/               # Blob management
    │   ├── index.ts         # Blob resource exports
    │   ├── BlobList.tsx     # Blob listing component
    │   └── BlobShow.tsx     # Blob detail view
    ├── collections/         # Collection management
    │   ├── index.ts         # Collection resource exports
    │   ├── CollectionList.tsx # Collection listing
    │   └── CollectionShow.tsx # Collection detail view
    └── records/             # Record management
        ├── index.ts         # Record resource exports
        ├── RecordList.tsx   # Record listing
        └── RecordShow.tsx   # Record detail view

lib/dataProvider/
├── index.ts                 # Main data provider implementation
├── types.ts                 # AT-Proto type definitions
├── utils.ts                 # Helper functions
└── dataProvider.ts          # Re-exports
```

## Features

### Data Provider
- **Custom AT-Proto Integration**: Connects react-admin to existing AT-Proto APIs
- **Filtering & Search**: Support for text search and field-specific filters
- **Sorting**: Sortable by all major fields
- **Pagination**: Efficient data loading with pagination
- **Read-only Mode**: Safe browsing without mutation capabilities

### Resources
1. **Blobs**: View and manage AT-Proto blobs with image previews
2. **Collections**: Browse AT-Proto collections and their metadata
3. **Records**: Explore individual records with author information

### Components
- **BlobPreview**: Shows image thumbnails with proper fallbacks
- **BlobActions**: Download and view actions for blobs
- **FileSizeField**: Human-readable file size display

## Usage

The admin interface is available at `/admin` and provides:
- Professional UI powered by Material-UI
- Responsive design for mobile and desktop
- Real-time data from AT-Proto APIs
- Comprehensive filtering and search capabilities

## Integration

To use components from this admin interface:

```typescript
import { AdminApp, BlobPreview, FileSizeField } from './admin';
import { atprotoDataProvider } from '../lib/dataProvider';
```

The data provider can be used independently:

```typescript
import { atprotoDataProvider } from '../lib/dataProvider';

// Use with react-admin
<Admin dataProvider={atprotoDataProvider}>
  {/* resources */}
</Admin>
```