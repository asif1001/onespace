import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as csvWriter from 'csv-writer';
import * as path from 'path';
import * as os from 'os';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function to generate unique transaction IDs
 */
export const generateTransactionId = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const timestamp = Date.now().toString(36);
    const randomStr = uuidv4().substring(0, 8).toUpperCase();
    const transactionId = `TXN-${timestamp}-${randomStr}`;

    return { transactionId };
  } catch (error) {
    console.error('Error generating transaction ID:', error);
    throw new functions.https.HttpsError('internal', 'Error generating transaction ID');
  }
});

/**
 * Cloud Function to export deliveries as CSV
 */
export const exportDeliveriesCSV = functions.https.onCall(async (data, context) => {
  // Verify authentication and admin role
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user role from custom claims or Firestore
    const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can export data');
    }

    const { filters } = data;
    
    // Build query based on filters
    let query = admin.firestore().collection('deliveries') as any;
    
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters?.driverId) {
      query = query.where('driverId', '==', filters.driverId);
    }
    
    if (filters?.dateFrom) {
      query = query.where('scheduledDate', '>=', new Date(filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      query = query.where('scheduledDate', '<=', new Date(filters.dateTo));
    }

    const deliveriesSnapshot = await query.get();
    const deliveries = deliveriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create CSV file
    const fileName = `deliveries-export-${Date.now()}.csv`;
    const tempFilePath = path.join(os.tmpdir(), fileName);
    
    const writer = csvWriter.createObjectCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'driverName', title: 'Driver Name' },
        { id: 'customerName', title: 'Customer Name' },
        { id: 'customerPhone', title: 'Phone' },
        { id: 'customerAddress', title: 'Address' },
        { id: 'oilType', title: 'Oil Type' },
        { id: 'quantity', title: 'Quantity (L)' },
        { id: 'status', title: 'Status' },
        { id: 'scheduledDate', title: 'Scheduled Date' },
        { id: 'deliveredDate', title: 'Delivered Date' },
        { id: 'createdAt', title: 'Created At' },
      ],
    });

    // Format data for CSV
    const csvData = deliveries.map((delivery: any) => ({
      ...delivery,
      scheduledDate: delivery.scheduledDate?.toDate?.()?.toISOString() || delivery.scheduledDate,
      deliveredDate: delivery.deliveredDate?.toDate?.()?.toISOString() || delivery.deliveredDate || '',
      createdAt: delivery.createdAt?.toDate?.()?.toISOString() || delivery.createdAt,
    }));

    await writer.writeRecords(csvData);

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const destination = `exports/${fileName}`;
    
    await bucket.upload(tempFilePath, {
      destination,
      metadata: {
        contentType: 'text/csv',
        metadata: {
          exportedBy: context.auth.uid,
          exportedAt: new Date().toISOString(),
          filters: JSON.stringify(filters),
        },
      },
    });

    // Generate signed URL for download
    const file = bucket.file(destination);
    const [downloadURL] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      downloadURL,
      fileName,
      recordCount: deliveries.length,
    };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new functions.https.HttpsError('internal', 'Error exporting data');
  }
});

/**
 * Cloud Function to export complaints as CSV
 */
export const exportComplaintsCSV = functions.https.onCall(async (data, context) => {
  // Verify authentication and admin role
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user role from Firestore
    const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can export data');
    }

    const { filters } = data;
    
    // Build query based on filters
    let query = admin.firestore().collection('complaints') as any;
    
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters?.type) {
      query = query.where('complaintType', '==', filters.type);
    }
    
    if (filters?.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    const complaintsSnapshot = await query.get();
    const complaints = complaintsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create CSV file
    const fileName = `complaints-export-${Date.now()}.csv`;
    const tempFilePath = path.join(os.tmpdir(), fileName);
    
    const writer = csvWriter.createObjectCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'customerName', title: 'Customer Name' },
        { id: 'customerPhone', title: 'Phone' },
        { id: 'complaintType', title: 'Type' },
        { id: 'priority', title: 'Priority' },
        { id: 'status', title: 'Status' },
        { id: 'description', title: 'Description' },
        { id: 'resolution', title: 'Resolution' },
        { id: 'assignedTo', title: 'Assigned To' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ],
    });

    // Format data for CSV
    const csvData = complaints.map((complaint: any) => ({
      ...complaint,
      createdAt: complaint.createdAt?.toDate?.()?.toISOString() || complaint.createdAt,
      updatedAt: complaint.updatedAt?.toDate?.()?.toISOString() || complaint.updatedAt,
      resolution: complaint.resolution || '',
      assignedTo: complaint.assignedTo || '',
    }));

    await writer.writeRecords(csvData);

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const destination = `exports/${fileName}`;
    
    await bucket.upload(tempFilePath, {
      destination,
      metadata: {
        contentType: 'text/csv',
        metadata: {
          exportedBy: context.auth.uid,
          exportedAt: new Date().toISOString(),
          filters: JSON.stringify(filters),
        },
      },
    });

    // Generate signed URL for download
    const file = bucket.file(destination);
    const [downloadURL] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      downloadURL,
      fileName,
      recordCount: complaints.length,
    };
  } catch (error) {
    console.error('Error exporting complaints CSV:', error);
    throw new functions.https.HttpsError('internal', 'Error exporting data');
  }
});

/**
 * Trigger to create user document when new user is created
 */
export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc = {
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || '',
      role: 'driver', // Default role
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().doc(`users/${user.uid}`).set(userDoc);
    console.log(`User document created for ${user.uid}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

/**
 * Trigger to clean up user data when user is deleted
 */
export const cleanupUserData = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document
    await admin.firestore().doc(`users/${user.uid}`).delete();
    
    // Update deliveries to remove driver reference
    const deliveriesSnapshot = await admin.firestore()
      .collection('deliveries')
      .where('driverId', '==', user.uid)
      .get();

    const batch = admin.firestore().batch();
    deliveriesSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        driverId: '',
        driverName: 'Deleted User',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`Cleanup completed for user ${user.uid}`);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});