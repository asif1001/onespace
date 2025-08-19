import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MoreVert,
  Download,
  Dashboard as DashboardIcon,
  People,
  LocalShipping,
  ReportProblem,
  TrendingUp,
} from '@mui/icons-material';
import { Delivery, User, Complaint, DashboardStats } from '../types';
import { formatDisplayDate } from '../utils/helpers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    activeDrivers: 0,
    openComplaints: 0,
    todaysDeliveries: 0,
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data - will be replaced with Firebase queries
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalDeliveries: 150,
      pendingDeliveries: 12,
      completedDeliveries: 138,
      activeDrivers: 8,
      openComplaints: 3,
      todaysDeliveries: 5,
    };

    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        transactionId: 'TXN-123456',
        driverId: 'driver1',
        driverName: 'John Driver',
        customerName: 'ABC Company',
        customerPhone: '+1234567890',
        customerAddress: '123 Business St, City, State',
        oilType: 'Premium Diesel',
        quantity: 1000,
        scheduledDate: new Date('2024-08-20T10:00:00'),
        status: 'pending',
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        transactionId: 'TXN-123457',
        driverId: 'driver2',
        driverName: 'Jane Smith',
        customerName: 'XYZ Corporation',
        customerPhone: '+1234567891',
        customerAddress: '456 Industrial Ave, City, State',
        oilType: 'Regular Gasoline',
        quantity: 750,
        scheduledDate: new Date('2024-08-19T14:30:00'),
        status: 'delivered',
        deliveredDate: new Date('2024-08-19T15:45:00'),
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockDrivers: User[] = [
      {
        uid: 'driver1',
        email: 'john@company.com',
        name: 'John Driver',
        role: 'driver',
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      },
      {
        uid: 'driver2',
        email: 'jane@company.com',
        name: 'Jane Smith',
        role: 'driver',
        phoneNumber: '+1234567891',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
    ];

    const mockComplaints: Complaint[] = [
      {
        id: 'comp1',
        deliveryId: '2',
        transactionId: 'TXN-123457',
        customerName: 'XYZ Corporation',
        customerPhone: '+1234567891',
        complaintType: 'quality',
        description: 'Oil quality was not as expected',
        status: 'open',
        priority: 'high',
        createdAt: new Date('2024-08-19T16:00:00'),
        updatedAt: new Date('2024-08-19T16:00:00'),
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setStats(mockStats);
      setDeliveries(mockDeliveries);
      setDrivers(mockDrivers);
      setComplaints(mockComplaints);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deliveryId: string) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportCSV = () => {
    // This would trigger the CSV export Cloud Function
    console.log('Exporting CSV...');
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'open':
        return 'error';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportCSV}
        >
          Export Data
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DashboardIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Today's Deliveries
                  </Typography>
                  <Typography variant="h5">
                    {stats.todaysDeliveries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {stats.pendingDeliveries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {stats.completedDeliveries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Active Drivers
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {stats.activeDrivers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReportProblem color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Open Complaints
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {stats.openComplaints}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Deliveries
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalDeliveries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Deliveries" />
            <Tab label="Drivers" />
            <Tab label="Complaints" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Oil Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.transactionId}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{delivery.customerName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {delivery.customerPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{delivery.driverName}</TableCell>
                    <TableCell>{delivery.oilType}</TableCell>
                    <TableCell>{delivery.quantity}L</TableCell>
                    <TableCell>
                      <Chip
                        label={delivery.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(delivery.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDisplayDate(delivery.scheduledDate)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, delivery.id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.uid}>
                    <TableCell>{driver.name}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={driver.isActive ? 'ACTIVE' : 'INACTIVE'}
                        color={driver.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDisplayDate(driver.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{complaint.transactionId}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{complaint.customerName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {complaint.customerPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.complaintType.toUpperCase()}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.priority.toUpperCase()}
                        color={getPriorityColor(complaint.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.status.toUpperCase()}
                        color={getStatusColor(complaint.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDisplayDate(complaint.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('View details')}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => console.log('Edit delivery')}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleExportCSV}>
          Export
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AdminDashboard;