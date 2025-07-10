import express from 'express';
// import whatsappBot from '../whatsapp-bot.js';
// import whatsappBot from '../whatsapp-bot-mac.js';
import whatsappBot from '../whatsapp-bot-working.js';

const router = express.Router();

/**
 * Send a WhatsApp message using authenticated teacher's WhatsApp
 * POST /api/whatsapp/send
 * Body: { phone: "917709094875", message: "Your message here" }
 */
router.post('/send', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message are required'
            });
        }

        // Check if bot is ready
        if (!whatsappBot.isReady) {
            return res.status(503).json({
                success: false,
                message: 'WhatsApp bot is not authenticated. Please scan QR code first.',
                needsAuth: true
            });
        }

        // Send the message
        const result = await whatsappBot.sendMessage(phone, message);
        
        return res.status(200).json({
            success: true,
            message: 'WhatsApp message sent successfully',
            data: {
                phone: phone,
                message: message,
                timestamp: new Date().toISOString(),
                messageId: result.id._serialized
            }
        });

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return res.status(500).json({
            success: false,
            message: `Failed to send WhatsApp message: ${error.message}`
        });
    }
});

/**
 * Get current WhatsApp bot status for debugging
 * GET /api/whatsapp/status
 */
router.get('/status', async (req, res) => {
    try {
        const status = await whatsappBot.getAuthStatus();
        const connectionInfo = whatsappBot.isReady ? await whatsappBot.getConnectionInfo() : null;
        
        return res.status(200).json({
            success: true,
            data: {
                isReady: whatsappBot.isReady,
                authenticationStatus: whatsappBot.authenticationStatus,
                isInitializing: whatsappBot.isInitializing,
                currentQR: !!whatsappBot.currentQR,
                fullStatus: status,
                connectionInfo: connectionInfo,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error getting WhatsApp status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp status',
            error: error.message
        });
    }
});

/**
 * Get QR code for frontend display
 * GET /api/whatsapp/qr
 */
router.get('/qr', async (req, res) => {
    try {
        console.log('📱 QR Code request received');
        
        const currentQR = whatsappBot.getCurrentQR();
        const status = await whatsappBot.getAuthStatus();
        
        console.log('Current status:', status);
        
        if (status.isReady) {
            return res.status(200).json({
                success: true,
                authenticated: true,
                message: "WhatsApp is already authenticated",
                data: {
                    authenticated: true,
                    qrCode: null,
                    status: status
                }
            });
        }
        
        if (currentQR) {
            console.log('✅ QR Code available');
            return res.status(200).json({
                success: true,
                authenticated: false,
                message: "QR code ready for scanning",
                data: {
                    authenticated: false,
                    qrCode: currentQR,
                    status: status
                }
            });
        }
        
        // Try to force QR generation
        console.log('🔄 Attempting to generate QR code...');
        const generateResult = await whatsappBot.generateQR();
        
        if (generateResult.success && generateResult.qr) {
            return res.status(200).json({
                success: true,
                authenticated: false,
                message: "QR code generated successfully",
                data: {
                    authenticated: false,
                    qrCode: generateResult.qr,
                    status: await whatsappBot.getAuthStatus()
                }
            });
        }
        
        // If still no QR, return current status
        return res.status(202).json({
            success: true,
            message: generateResult.message || "QR code generation in progress...",
            data: {
                authenticated: false,
                qrCode: null,
                status: status,
                isInitializing: status.isInitializing
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
});

/**
 * Get WhatsApp bot status
 * GET /api/whatsapp/status
 */
router.get('/status', async (req, res) => {
    try {
        const status = await whatsappBot.getAuthStatus();
        
        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('❌ Error getting status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get status',
            error: error.message
        });
    }
});

/**
 * Send test WhatsApp message
 * POST /api/whatsapp/test
 */
router.post('/test', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }
        
        const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
        const testMessage = `🤖 Test message from HOD Classes Attendance System\n\nTime: ${new Date().toLocaleString()}\n\nThis is a test to verify WhatsApp messaging is working correctly.`;
        
        const result = await whatsappBot.sendMessage(cleanPhone, testMessage);
        
        res.status(200).json({
            success: true,
            message: 'Test message sent successfully',
            data: {
                phoneNumber: cleanPhone,
                messageId: result.id ? result.id.id : 'sent',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error sending test WhatsApp message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test message',
            error: error.message
        });
    }
});

/**
 * Send bulk WhatsApp messages with anti-ban protection
 * POST /api/whatsapp/send-bulk
 */
router.post('/send-bulk', async (req, res) => {
    try {
        const { phoneNumbers, message, options } = req.body;
        
        if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Phone numbers array is required'
            });
        }
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }
        
        // Clean phone numbers
        const cleanPhones = phoneNumbers.map(phone => 
            phone.replace(/\s+/g, '').replace(/^\+/, '')
        );
        
        console.log(`📤 Bulk message request for ${cleanPhones.length} numbers`);
        
        // Use bulk messaging with safety measures
        const result = await whatsappBot.sendBulkMessages(cleanPhones, message, options);
        
        res.status(200).json({
            success: true,
            message: `Bulk messaging completed: ${result.sent} sent, ${result.failedCount} failed`,
            data: result
        });
        
    } catch (error) {
        console.error('Error in bulk messaging:', error);
        res.status(500).json({
            success: false,
            message: 'Bulk messaging failed',
            error: error.message,
            suggestion: error.message.includes('Daily limit') ? 
                'Reduce the number of recipients or try again tomorrow' :
                'Please check your WhatsApp connection and try again'
        });
    }
});

/**
 * Logout current WhatsApp session (for teacher switching)
 * POST /api/whatsapp/logout
 */
router.post('/logout', async (req, res) => {
    try {
        await whatsappBot.logout();
        
        res.status(200).json({
            success: true,
            message: 'Successfully logged out WhatsApp session. You can now authenticate with a different account.'
        });
        
    } catch (error) {
        console.error('❌ Error logging out:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: error.message
        });
    }
});

export default router; 