import studentModel from "../models/studentModel.js";
import subjectModel from "../models/subjectModel.js";
import attendanceModel from "../models/attendanceModel.js";
import whatsappBot from '../whatsapp-bot-working.js';

/**
 * Send WhatsApp message using WhatsApp Web bot (Teacher's WhatsApp account)
 * This uses the whatsapp-web.js library for free WhatsApp messaging
 */
const sendWhatsAppWebMessage = async (phoneNumber, message) => {
  try {
    console.log(`[WHATSAPP WEB] Attempting to send message to: ${phoneNumber}`);
    
    // Check if bot is ready
    if (!whatsappBot.isReady) {
      console.error('[WHATSAPP WEB] Bot is not ready. Please scan QR code first.');
      return {
        success: false,
        error: 'WhatsApp Web bot is not ready. Please scan QR code to authenticate.',
        timestamp: new Date()
      };
    }
    
    // Clean the phone number (remove spaces, ensure proper format)
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    
    // Send the message using the WhatsApp Web bot
    const result = await whatsappBot.sendMessage(cleanPhoneNumber, message);
    
    console.log(`[WHATSAPP WEB] Message sent successfully to: ${phoneNumber}`);
    
    return {
      success: true,
      messageId: result.id._serialized,
      timestamp: new Date(),
      method: 'WhatsApp Web',
      details: result
    };
  } catch (error) {
    console.error(`[WHATSAPP WEB] Error sending message to ${phoneNumber}:`, error);
    
    // Determine error type and provide helpful messages
    let errorMessage = error.message;
    let errorType = 'unknown';
    
    if (error.message.includes('getChat') || error.message.includes('Cannot read properties of undefined')) {
      errorType = 'connection';
      errorMessage = 'WhatsApp session may have expired. Please restart the bot or scan QR code again.';
    } else if (error.message.includes('not registered on WhatsApp')) {
      errorType = 'invalid_number';
      errorMessage = `Phone number ${phoneNumber} is not registered on WhatsApp`;
    } else if (error.message.includes('not ready') || error.message.includes('disconnected')) {
      errorType = 'not_ready';
      errorMessage = 'WhatsApp bot is not ready or disconnected';
    } else if (error.message.includes('Invalid phone number')) {
      errorType = 'invalid_format';
      errorMessage = `Invalid phone number format: ${phoneNumber}`;
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType: errorType,
      originalError: error.message,
      timestamp: new Date(),
      method: 'WhatsApp Web'
    };
  }
};

/**
 * Send notifications to parents of absent students using teacher's WhatsApp
 */
const notifyAbsentStudents = async (req, res) => {
  try {
    console.log("\n\n=== NOTIFY ABSENT STUDENTS REQUEST ===\n");
    console.log("Request body:", req.body);
    
    const { subjectId, subjectName, date, year, absentStudentIds, teacherName } = req.body;

    // Validate required fields
    if (!subjectId || !date || !year || !absentStudentIds || !Array.isArray(absentStudentIds)) {
      return res.status(400).json({ 
        success: false,
        message: "Subject ID, date, year, and absent student IDs array are required fields." 
      });
    }

    // Check if WhatsApp bot is ready and connected
    console.log(`[DEBUG] WhatsApp Bot Status Check:`);
    console.log(`- isReady: ${whatsappBot.isReady}`);
    console.log(`- authenticationStatus: ${whatsappBot.authenticationStatus}`);
    console.log(`- isInitializing: ${whatsappBot.isInitializing}`);
    
    // Get full status for debugging
    const fullStatus = await whatsappBot.getAuthStatus();
    console.log(`- Full Status:`, fullStatus);
    
    if (!whatsappBot.isReady) {
      console.warn(`[NOTIFICATION] WhatsApp bot not ready. Status: ${whatsappBot.authenticationStatus}`);
      
      // TEMPORARY FIX: Check if status says authenticated but isReady is false
      if (whatsappBot.authenticationStatus === 'authenticated') {
        console.log(`[TEMP FIX] Status shows authenticated but isReady is false, forcing isReady to true`);
        whatsappBot.isReady = true;
      } else {
        return res.status(503).json({
          success: false,
          message: "WhatsApp bot is not ready. Please scan QR code first to authenticate your WhatsApp account.",
          debug: {
            isReady: whatsappBot.isReady,
            status: whatsappBot.authenticationStatus,
            isInitializing: whatsappBot.isInitializing,
            fullStatus: fullStatus
          }
        });
      }
    }

    // Additional connection check (non-blocking)
    try {
      const isConnected = await whatsappBot.isClientReady();
      console.log(`[DEBUG] Client ready check result: ${isConnected}`);
      
      if (!isConnected) {
        console.warn(`[WARNING] Client connection check failed, but proceeding since isReady=true`);
        console.warn(`[WARNING] This might be a temporary state check issue`);
        // Don't block execution - let the sendMessage method handle any real connection issues
      }
    } catch (error) {
      console.warn('Connection check failed:', error.message);
      // Continue anyway, the sendMessage method will handle reconnection
    }

    // Check if subject exists
    const subject = await subjectModel.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: "Subject not found." 
      });
    }

    // Debug subject information
    console.log(`[DEBUG SUBJECT] Subject ID: ${subjectId}`);
    console.log(`[DEBUG SUBJECT] Subject from DB:`, subject);
    console.log(`[DEBUG SUBJECT] Subject name from request: ${subjectName}`);
    console.log(`[DEBUG SUBJECT] Subject name from DB: ${subject.name}`);
    
    // Get the subject name - prefer database lookup over frontend provided name
    let subjectNameToUse = subject.name || subjectName || 'Unknown Subject';
    console.log(`[DEBUG SUBJECT] Initial subject name: "${subjectNameToUse}"`);
    
    // Clean up subject name - remove asterisks and extra spaces
    subjectNameToUse = subjectNameToUse.replace(/\*/g, '').trim();
    console.log(`[DEBUG SUBJECT] After cleaning: "${subjectNameToUse}"`);
    
    // Only use fallback if we really can't find the subject name
    if (!subjectNameToUse || subjectNameToUse === '') {
      console.warn(`⚠️ Subject name completely missing - Using fallback. Original: "${subjectName}", DB: "${subject.name}"`);
      subjectNameToUse = 'the scheduled class';
    }
    
    console.log(`[DEBUG SUBJECT] Final subject name: "${subjectNameToUse}"`);;

    // Format date for message
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get student details for each absent student
    const absentStudents = await studentModel.find({
      _id: { $in: absentStudentIds }
    });

    if (absentStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No absent students found with the provided IDs."
      });
    }

    // Filter students with valid parent phone numbers
    const studentsWithPhone = absentStudents.filter(student => student.parentsPhone);
    const studentsWithoutPhone = absentStudents.filter(student => !student.parentsPhone);

    if (studentsWithPhone.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students have parent phone numbers available for notifications."
      });
    }

    if (studentsWithoutPhone.length > 0) {
      console.log(`⚠️ ${studentsWithoutPhone.length} students have no parent phone numbers:`, 
        studentsWithoutPhone.map(s => s.name));
    }

    // Check if this is a bulk operation (more than 10 messages)
    const isBulkOperation = studentsWithPhone.length > 10;
    
    if (isBulkOperation) {
      console.log(`📦 Bulk operation detected: ${studentsWithPhone.length} messages`);
      
      // For bulk operations, we need to send individual messages with student names
      // Using individual messaging with batching for personalization
      const notificationLogs = [];
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      let batchCount = 0;
      
      for (const student of studentsWithPhone) {
        const parentPhone = student.parentsPhone.replace(/\s+/g, '').replace(/^\+/, '');
        
        // Create personalized message for each student
        const teacherInfo = teacherName ? `from ${teacherName}` : 'from your child\'s teacher';
        const message = `Dear Parent/Guardian,

This is to inform you that your child *${student.name}* was absent for *${subjectNameToUse}* class on *${formattedDate}*.

Please ensure regular attendance for better academic performance.

Message sent ${teacherInfo}
Thank you.`;
        
        try {
          const result = await sendWhatsAppWebMessage(parentPhone, message);
          
          notificationLogs.push({
            studentName: student.name,
            studentId: student._id,
            parentPhone: student.parentsPhone,
            message,
            delivered: result.success,
            messageId: result.messageId,
            error: result.success ? null : result.error,
            timestamp: new Date()
          });
          
          batchCount++;
          
          // Add delays for bulk operations (longer delays to avoid being flagged)
          if (batchCount % 3 === 0) {
            console.log(`⏳ Batch of 3 sent, waiting 30 seconds...`);
            await delay(30000); // 30 seconds between batches
          } else {
            await delay(10000); // 10 seconds between individual messages
          }
          
        } catch (error) {
          console.error(`Failed to send WhatsApp message to ${parentPhone}:`, error);
          notificationLogs.push({
            studentName: student.name,
            studentId: student._id,
            parentPhone: student.parentsPhone,
            message,
            delivered: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }

      try {

        // Add logs for students without phone numbers
        studentsWithoutPhone.forEach(student => {
          notificationLogs.push({
            studentName: student.name,
            studentId: student._id,
            parentPhone: 'Not available',
            message: 'Parent phone not available',
            delivered: false,
            error: 'No parent phone number found',
            timestamp: new Date()
          });
        });

        // Count successful deliveries
        const successfulDeliveries = notificationLogs.filter(log => log.delivered).length;
        const failedDeliveries = notificationLogs.filter(log => !log.delivered).length;

        return res.status(200).json({
          success: true,
          message: `Bulk notifications completed: ${successfulDeliveries} sent successfully, ${failedDeliveries} failed out of ${notificationLogs.length} total`,
          data: {
            total: notificationLogs.length,
            successful: successfulDeliveries,
            failed: failedDeliveries,
            notifications: notificationLogs,
            bulkSettings: {
              batchSize: 3,
              batchDelay: '30 seconds',
              messageDelay: '10 seconds',
              personalizedMessages: true
            }
          }
        });

      } catch (bulkError) {
        console.error('❌ Bulk messaging process failed:', bulkError);
        return res.status(500).json({
          success: false,
          message: `Bulk messaging process failed: ${bulkError.message}`,
          suggestion: 'Please try again later or check the notification logs for details.'
        });
      }

    } else {
      // For smaller groups (≤10), use individual messaging
      console.log(`📤 Individual messaging for ${studentsWithPhone.length} students`);
      
      const notificationLogs = [];
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Send individual messages with delays
      for (const student of studentsWithPhone) {
        const parentPhone = student.parentsPhone.replace(/\s+/g, '').replace(/^\+/, '');
        
        // Create personalized message
        const teacherInfo = teacherName ? `from ${teacherName}` : 'from your child\'s teacher';
        const message = `Dear Parent/Guardian,

This is to inform you that your child *${student.name}* was absent for *${subjectNameToUse}* class on *${formattedDate}*.

Please ensure regular attendance for better academic performance.

Message sent ${teacherInfo}
Thank you.`;
        
        try {
          const result = await sendWhatsAppWebMessage(parentPhone, message);
          
          notificationLogs.push({
            studentName: student.name,
            studentId: student._id,
            parentPhone: student.parentsPhone,
            message,
            delivered: result.success,
            messageId: result.messageId,
            error: result.success ? null : result.error,
            timestamp: new Date()
          });
          
          // Add delay between individual messages (5-10 seconds)
          const randomDelay = 5000 + Math.random() * 5000;
          await delay(randomDelay);
          
        } catch (error) {
          console.error(`Failed to send WhatsApp message to ${parentPhone}:`, error);
          notificationLogs.push({
            studentName: student.name,
            studentId: student._id,
            parentPhone: student.parentsPhone,
            message,
            delivered: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }

      // Add logs for students without phone numbers
      studentsWithoutPhone.forEach(student => {
        notificationLogs.push({
          studentName: student.name,
          studentId: student._id,
          parentPhone: 'Not available',
          message: 'Parent phone not available',
          delivered: false,
          error: 'No parent phone number found',
          timestamp: new Date()
        });
      });

      // Count successful deliveries
      const successfulDeliveries = notificationLogs.filter(log => log.delivered).length;
      const failedDeliveries = notificationLogs.filter(log => !log.delivered).length;

      return res.status(200).json({
        success: true,
        message: `Notifications processed: ${successfulDeliveries} sent successfully, ${failedDeliveries} failed`,
        data: {
          total: notificationLogs.length,
          successful: successfulDeliveries,
          failed: failedDeliveries,
          notifications: notificationLogs
        }
      });
    }

  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message
    });
  }
};

/**
 * Get notification channel options (simplified - only WhatsApp Web)
 */
const getNotificationChannels = async (req, res) => {
  try {
    // Check WhatsApp Web bot status
    const whatsappWebAvailable = whatsappBot.isReady;
    
    const availableChannels = [
      { 
        id: 'whatsapp-web', 
        name: '📱 WhatsApp (Teacher Account)', 
        available: whatsappWebAvailable, 
        description: whatsappWebAvailable 
          ? 'Send WhatsApp messages using your authenticated WhatsApp account' 
          : 'Scan QR code to authenticate your WhatsApp account',
        priority: 1,
        cost: 'Free',
        method: 'WhatsApp Web'
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: availableChannels,
      recommended: 'whatsapp-web',
      status: {
        whatsappWeb: whatsappWebAvailable,
        requiresAuth: !whatsappWebAvailable
      }
    });
  } catch (error) {
    console.error("Error getting notification channels:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get notification channels",
      error: error.message
    });
  }
};

export { notifyAbsentStudents, getNotificationChannels };
