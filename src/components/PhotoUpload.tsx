import React, { useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PhotoCamera,
  Image as ImageIcon,
  Receipt,
  CameraAlt,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { isValidImage, formatFileSize, addTimestampToImage } from '../utils/helpers';

interface PhotoData {
  id: string;
  file: File;
  type: 'before' | 'during' | 'after' | 'receipt';
  preview: string;
}

interface PhotoUploadProps {
  photos: PhotoData[];
  onPhotoAdd: (file: File, type: PhotoData['type']) => void;
  onPhotoRemove: (photoId: string) => void;
}

interface PhotoTypeUploadCardProps {
  photoType: {
    type: 'before' | 'during' | 'after' | 'receipt';
    label: string;
    description: string;
    icon: React.ReactNode;
    required: boolean;
  };
  existingPhotos: PhotoData[];
  isUploading: boolean;
  onPhotoAdd: (file: File, type: PhotoData['type']) => void;
  onPhotoRemove: (photoId: string) => void;
  errors: string[];
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

const PhotoTypeUploadCard: React.FC<PhotoTypeUploadCardProps> = ({
  photoType,
  existingPhotos,
  isUploading,
  onPhotoAdd,
  onPhotoRemove,
  errors,
  setErrors,
}) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map((rejected: any) => 
        `${rejected.file.name}: ${rejected.errors.map((e: any) => e.message).join(', ')}`
      );
      setErrors(prev => [...prev, ...errorMessages]);
      return;
    }

    if (acceptedFiles.length > 0) {
      onPhotoAdd(acceptedFiles[0], photoType.type);
    }
  }, [photoType.type, onPhotoAdd, setErrors]);

  const dropzone = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <Grid item xs={12} md={6}>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {photoType.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {photoType.label}
              {photoType.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {photoType.description}
          </Typography>

          {existingPhotos.length === 0 ? (
            <Box
              {...dropzone.getRootProps()}
              sx={{
                border: 2,
                borderColor: dropzone.isDragActive ? 'primary.main' : 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dropzone.isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            >
              <input {...dropzone.getInputProps()} />
              
              {isUploading ? (
                <Box>
                  <CircularProgress size={24} sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    Processing photo...
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    {dropzone.isDragActive
                      ? 'Drop the photo here'
                      : 'Click or drag to upload photo'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supports JPEG, PNG, WebP (max 10MB)
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              {existingPhotos.map((photo) => (
                <Card key={photo.id} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={photo.preview}
                          alt={`${photoType.label}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4,
                            marginRight: 12,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" noWrap>
                            {photo.file.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatFileSize(photo.file.size)}
                          </Typography>
                          <br />
                          <Chip
                            label="Timestamp Added"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => onPhotoRemove(photo.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => dropzone.open()}
                startIcon={<CloudUpload />}
                fullWidth
              >
                Replace Photo
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotoAdd,
  onPhotoRemove,
}) => {
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  const photoTypes = [
    {
      type: 'before' as const,
      label: 'Before Delivery',
      description: 'Photo before starting the delivery',
      icon: <CameraAlt />,
      required: true,
    },
    {
      type: 'during' as const,
      label: 'During Delivery',
      description: 'Photo during the delivery process',
      icon: <PhotoCamera />,
      required: false,
    },
    {
      type: 'after' as const,
      label: 'After Delivery',
      description: 'Photo after completing the delivery',
      icon: <ImageIcon />,
      required: true,
    },
    {
      type: 'receipt' as const,
      label: 'Receipt/Documentation',
      description: 'Delivery receipt or other documentation',
      icon: <Receipt />,
      required: false,
    },
  ];

  const processAndAddPhoto = useCallback(async (file: File, type: PhotoData['type']) => {
    setUploading(type);
    setErrors([]);

    try {
      // Validate file
      if (!isValidImage(file)) {
        throw new Error('Please select a valid image file (JPEG, PNG, WebP) under 10MB');
      }

      // Add timestamp overlay to the image
      const processedFile = await addTimestampToImage(file);
      
      // Add photo to the list
      onPhotoAdd(processedFile, type);
    } catch (error) {
      console.error('Error processing photo:', error);
      setErrors(prev => [...prev, `Error uploading ${type} photo: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setUploading(null);
    }
  }, [onPhotoAdd]);

  const getPhotosByType = (type: PhotoData['type']) => {
    return photos.filter(photo => photo.type === type);
  };

  const handleRemovePhoto = (photoId: string) => {
    onPhotoRemove(photoId);
  };

  const requiredTypes = photoTypes.filter(type => type.required).map(type => type.type);
  const uploadedRequiredTypes = photos
    .filter(photo => requiredTypes.includes(photo.type))
    .map(photo => photo.type);
  const missingRequiredTypes = requiredTypes.filter(type => !uploadedRequiredTypes.includes(type));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Photo Documentation
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload photos for each stage of the delivery. Required photos are marked with *.
        All photos will automatically include a timestamp.
      </Typography>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors([])}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {missingRequiredTypes.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Missing required photos: {missingRequiredTypes.join(', ')}
        </Alert>
      )}

      <Grid container spacing={3}>
        {photoTypes.map((photoType) => {
          const existingPhotos = getPhotosByType(photoType.type);
          const isUploading = uploading === photoType.type;

          return (
            <PhotoTypeUploadCard
              key={photoType.type}
              photoType={photoType}
              existingPhotos={existingPhotos}
              isUploading={isUploading}
              onPhotoAdd={processAndAddPhoto}
              onPhotoRemove={handleRemovePhoto}
              errors={errors}
              setErrors={setErrors}
            />
          );
        })}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Total photos uploaded: {photos.length}
          {missingRequiredTypes.length > 0 && (
            <span style={{ color: 'red' }}>
              {' '}(Missing {missingRequiredTypes.length} required photo{missingRequiredTypes.length > 1 ? 's' : ''})
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default PhotoUpload;