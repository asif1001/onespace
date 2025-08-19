import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DeliveryFormData } from '../types';
import { isValidPhoneNumber, generateTransactionId } from '../utils/helpers';
import PhotoUpload from '../components/PhotoUpload';

const steps = ['Delivery Details', 'Customer Information', 'Photos & Documentation', 'Review & Submit'];

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  oilType?: string;
  quantity?: string;
  scheduledDate?: string;
  notes?: string;
}

interface PhotoData {
  id: string;
  file: File;
  type: 'before' | 'during' | 'after' | 'receipt';
  preview: string;
}

const DeliveryWizard: React.FC = () => {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const isNew = deliveryId === 'new';
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<DeliveryFormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    oilType: '',
    quantity: 0,
    scheduledDate: '',
    notes: '',
  });
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oilTypes = [
    'Premium Diesel',
    'Regular Diesel',
    'Premium Gasoline',
    'Regular Gasoline',
    'Heating Oil',
    'Lubricating Oil',
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0: // Delivery Details
        if (!formData.oilType) newErrors.oilType = 'Oil type is required';
        if (!formData.quantity || formData.quantity <= 0) {
          newErrors.quantity = 'Quantity must be greater than 0';
        }
        if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
        break;

      case 1: // Customer Information
        if (!formData.customerName.trim()) {
          newErrors.customerName = 'Customer name is required';
        }
        if (!formData.customerPhone.trim()) {
          newErrors.customerPhone = 'Phone number is required';
        } else if (!isValidPhoneNumber(formData.customerPhone)) {
          newErrors.customerPhone = 'Please enter a valid phone number';
        }
        if (!formData.customerAddress.trim()) {
          newErrors.customerAddress = 'Address is required';
        }
        break;

      case 2: // Photos & Documentation
        const requiredPhotoTypes = ['before', 'after'];
        const uploadedTypes = photos.map(photo => photo.type);
        const missingTypes = requiredPhotoTypes.filter(type => !uploadedTypes.includes(type as 'before' | 'after'));
        
        if (missingTypes.length > 0) {
          // This will be handled by the PhotoUpload component
          return false;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof DeliveryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhotoAdd = (file: File, type: PhotoData['type']) => {
    const newPhoto: PhotoData = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      type,
      preview: URL.createObjectURL(file),
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handlePhotoRemove = (photoId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    
    try {
      // Generate transaction ID
      const transactionId = generateTransactionId();
      
      // Here you would normally upload photos and save to Firebase
      console.log('Submitting delivery:', {
        ...formData,
        transactionId,
        photos: photos.map(p => ({ type: p.type, file: p.file })),
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to dashboard
      navigate('/driver');
    } catch (error) {
      console.error('Error submitting delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.oilType}>
                <InputLabel>Oil Type</InputLabel>
                <Select
                  value={formData.oilType}
                  label="Oil Type"
                  onChange={(e) => handleInputChange('oilType', e.target.value)}
                >
                  {oilTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.oilType && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.oilType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity (Liters)"
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scheduled Date & Time"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                error={!!errors.scheduledDate}
                helperText={errors.scheduledDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this delivery..."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                error={!!errors.customerName}
                helperText={errors.customerName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                error={!!errors.customerPhone}
                helperText={errors.customerPhone}
                placeholder="+1234567890"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                multiline
                rows={3}
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                error={!!errors.customerAddress}
                helperText={errors.customerAddress}
                placeholder="Enter complete delivery address..."
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <PhotoUpload
            photos={photos}
            onPhotoAdd={handlePhotoAdd}
            onPhotoRemove={handlePhotoRemove}
          />
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Delivery Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Oil Type
                    </Typography>
                    <Typography variant="body1">{formData.oilType}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1">{formData.quantity} Liters</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Scheduled Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(formData.scheduledDate).toLocaleDateString()} at{' '}
                      {new Date(formData.scheduledDate).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  {formData.notes && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">{formData.notes}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{formData.customerName}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{formData.customerPhone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body1">{formData.customerAddress}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Photos ({photos.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {photos.map((photo) => (
                      <Chip
                        key={photo.id}
                        label={photo.type.replace('_', ' ').toUpperCase()}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/driver')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1">
          {isNew ? 'New Delivery' : 'Update Delivery'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={<Save />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Delivery'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default DeliveryWizard;