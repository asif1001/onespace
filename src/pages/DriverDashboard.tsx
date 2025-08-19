import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  LocalShipping,
  CheckCircle,
  Schedule,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Delivery } from '../types';
import { formatDisplayDate } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with Firebase queries
  useEffect(() => {
    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        transactionId: 'TXN-123456',
        driverId: user?.uid || '',
        driverName: user?.name || '',
        customerName: 'John Smith',
        customerPhone: '+1234567890',
        customerAddress: '123 Main St, City, State 12345',
        oilType: 'Premium Diesel',
        quantity: 500,
        scheduledDate: new Date('2024-08-20T10:00:00'),
        status: 'pending',
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        transactionId: 'TXN-123457',
        driverId: user?.uid || '',
        driverName: user?.name || '',
        customerName: 'Jane Doe',
        customerPhone: '+1234567891',
        customerAddress: '456 Oak Ave, City, State 12345',
        oilType: 'Regular Gasoline',
        quantity: 300,
        scheduledDate: new Date('2024-08-19T14:30:00'),
        status: 'in_progress',
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setDeliveries(mockDeliveries);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return <Schedule />;
      case 'in_progress':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  const handleStartDelivery = (deliveryId: string) => {
    navigate(`/driver/delivery/${deliveryId}`);
  };

  const handleNewDelivery = () => {
    navigate('/driver/delivery/new');
  };

  const todaysDeliveries = deliveries.filter(
    delivery => new Date(delivery.scheduledDate).toDateString() === new Date().toDateString()
  );

  const pendingDeliveries = deliveries.filter(
    delivery => delivery.status === 'pending'
  );

  const completedDeliveries = deliveries.filter(
    delivery => delivery.status === 'delivered'
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Driver Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewDelivery}
        >
          New Delivery
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Deliveries
              </Typography>
              <Typography variant="h4">
                {todaysDeliveries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingDeliveries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {completedDeliveries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Deliveries
              </Typography>
              <Typography variant="h4">
                {deliveries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deliveries List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Deliveries
          </Typography>
          
          {deliveries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No deliveries assigned yet.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleNewDelivery}
                sx={{ mt: 2 }}
              >
                Create New Delivery
              </Button>
            </Box>
          ) : (
            <List>
              {deliveries.map((delivery) => (
                <ListItem
                  key={delivery.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getStatusIcon(delivery.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {delivery.customerName}
                        </Typography>
                        <Chip
                          label={delivery.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(delivery.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {delivery.customerAddress}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <Phone fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {delivery.customerPhone}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {delivery.oilType} - {delivery.quantity}L
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Scheduled: {formatDisplayDate(delivery.scheduledDate)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleStartDelivery(delivery.id)}
                      disabled={delivery.status === 'delivered' || delivery.status === 'cancelled'}
                    >
                      {delivery.status === 'pending' ? 'Start' : 'View'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DriverDashboard;