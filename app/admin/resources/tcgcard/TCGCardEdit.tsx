"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, useRecordContext, useNotify, useRefresh } from "react-admin";
import { useFormContext } from "react-hook-form";

const ImageUploadField = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { setValue } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get existing image CID if present
  const existingImageCid = record?.value?.image?.ref?.$link;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Update the form value with the new image blob reference
      setValue('value.image', result.blob, { shouldDirty: true });

      notify('Image uploaded successfully', { type: 'success' });
      refresh();
    } catch (error) {
      notify(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { type: 'error' });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const displayImageUrl = previewUrl || (existingImageCid ? `/api/blobs/${existingImageCid}` : null);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Card Artwork
      </label>
      
      {displayImageUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <Image
            src={displayImageUrl}
            alt="Card artwork"
            width={200}
            height={200}
            style={{
              objectFit: 'contain',
              border: '2px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}
            unoptimized
          />
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: uploading ? '#f5f5f5' : 'white'
        }}
      />
      
      {uploading && (
        <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '14px' }}>
          Uploading...
        </div>
      )}
      
      {existingImageCid && (
        <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
          Current image CID: {existingImageCid}
        </div>
      )}
    </div>
  );
};

const TCGCardEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="value.name" label="Name" fullWidth />
      <ImageUploadField />
      <NumberInput source="value.attack" label="Attack" />
      <NumberInput source="value.defense" label="Defense" />
      <SelectInput 
        source="value.type" 
        label="Type" 
        choices={[
          { id: 'creature', name: 'Creature' },
          { id: 'spell', name: 'Spell' },
          { id: 'artifact', name: 'Artifact' },
        ]} 
      />
      <SelectInput 
        source="value.rarity" 
        label="Rarity" 
        choices={[
          { id: 'common', name: 'Common' },
          { id: 'uncommon', name: 'Uncommon' },
          { id: 'rare', name: 'Rare' },
          { id: 'legendary', name: 'Legendary' },
        ]} 
      />
    </SimpleForm>
  </Edit>
);

export default TCGCardEdit;
