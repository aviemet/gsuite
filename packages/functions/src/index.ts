/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger"
import { onRequest } from "firebase-functions/v2/https"
import { getFirestore } from "firebase-admin/firestore"

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Test function to verify Firebase connectivity
export const testConnection = onRequest(async (req, res) => {
  try {
    const db = getFirestore();
    // Try to read a document to verify Firestore connection
    const testDoc = await db.collection('test').doc('connection').get();
    
    logger.info("Firebase connection test successful", { 
      exists: testDoc.exists,
      projectId: process.env.GCLOUD_PROJECT 
    });
    
    res.json({ 
      success: true, 
      message: "Firebase connection successful",
      projectId: process.env.GCLOUD_PROJECT
    });
  } catch (error) {
    logger.error("Firebase connection test failed", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to connect to Firebase",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
