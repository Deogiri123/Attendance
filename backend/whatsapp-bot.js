import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

class WhatsAppBot {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.currentQR = null;
        this.authenticationStatus = 'disconnected'; // disconnected, qr_ready, authenticating, authenticated
        this.isInitializing = false;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.browserProcess = null;
        
        // Add polling mechanism for authentication detection
        this.statusPoller = null;
        this.pollInterval = 5000; // Check every 5 seconds
        
        this.initializeBot();
    }

    // Clean up corrupted session data
    cleanupSession() {
        try {
            const authPath = './.wwebjs_auth';
            const cachePath = './.wwebjs_cache';
            
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log('🧹 Cleaned up corrupted auth session');
            }
            
            if (fs.existsSync(cachePath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
                console.log('🧹 Cleaned up corrupted cache session');
            }
        } catch (error) {
            console.error('❌ Error cleaning session:', error);
        }
    }

    // Get Chrome executable path for macOS
    getChromeExecutablePath() {
        const chromePaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/snap/bin/chromium'
        ];
        
        for (const chromePath of chromePaths) {
            if (fs.existsSync(chromePath)) {
                console.log(`🔍 Found Chrome at: ${chromePath}`);
                return chromePath;
            }
        }
        
        console.log('⚠️ No Chrome executable found, using default');
        return null;
    }

    initializeBot() {
        if (this.isInitializing) return;
        
        this.isInitializing = true;
        this.initializationAttempts++;
        
        // Reset all status flags properly during initialization
        this.isReady = false;
        this.currentQR = null;
        this.authenticationStatus = 'disconnected';
        
        console.log(`🚀 Initializing WhatsApp Bot (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})...`);
        
        try {
            // Clean up any existing client
            if (this.client) {
                try {
                    this.client.removeAllListeners();
                    if (this.client.pupBrowser) {
                        this.client.pupBrowser.close();
                    }
                    this.client.destroy();
                } catch (error) {
                    console.log('🔄 Cleaned up previous client instance');
                }
            }

            // Simplified Puppeteer configuration for better macOS compatibility
            const puppeteerOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--no-first-run',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--memory-pressure-off',
                    '--max_old_space_size=4096'
                ],
                timeout: 90000, // Increased timeout
                protocolTimeout: 90000,
                defaultViewport: null,
                slowMo: 100, // Slower for stability
            };

            // Try to use system Chrome if available
            const chromeExecutable = this.getChromeExecutablePath();
            if (chromeExecutable) {
                puppeteerOptions.executablePath = chromeExecutable;
                console.log(`🔧 Using Chrome at: ${chromeExecutable}`);
            } else {
                console.log('🔧 Using bundled Chromium');
            }

            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './.wwebjs_auth',
                    clientId: 'hod-classes-bot'
                }),
                puppeteer: puppeteerOptions,
                // Simplified configuration - let WhatsApp Web use its default version
                webVersionCache: {
                    type: 'local', // Use local caching instead of remote
                },
                restartOnAuthFail: true,
                takeoverOnConflict: true,
                takeoverTimeoutMs: 60000, // Increased timeout
            });
            
            this.setupEventHandlers();
            
            // Initialize with comprehensive error handling
            const initTimeout = setTimeout(() => {
                console.log('⏰ Initialization timeout (3 minutes), retrying...');
                this.handleInitializationFailure('Initialization timeout after 3 minutes');
            }, 180000); // 3 minutes timeout

            this.client.initialize().then(() => {
                clearTimeout(initTimeout);
                console.log('✅ WhatsApp client initialized successfully');
            }).catch((error) => {
                clearTimeout(initTimeout);
                console.error('❌ Client initialization failed:', error);
                this.handleInitializationFailure(error);
            });
            
        } catch (error) {
            console.error('❌ Error initializing WhatsApp bot:', error);
            this.handleInitializationFailure(error);
        }
    }

    handleInitializationFailure(error) {
        console.error('❌ WhatsApp bot initialization failed:', error);
        
        // Properly reset all status flags
        this.isInitializing = false;
        this.isReady = false;
        this.currentQR = null;
        this.authenticationStatus = 'disconnected';

        // Clean up any browser processes
        if (this.client && this.client.pupBrowser) {
            try {
                this.client.pupBrowser.close();
            } catch (e) {
                console.log('🔄 Browser cleanup attempted');
            }
        }

        if (this.initializationAttempts < this.maxInitializationAttempts) {
            // Clean session and retry with exponential backoff
            const retryDelay = Math.min(30000, 5000 * this.initializationAttempts); // Max 30 seconds
            console.log(`🔄 Retrying initialization in ${retryDelay/1000}s (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})...`);
            
            // Clean up more aggressively
            this.cleanupSession();
            
            setTimeout(() => {
                this.initializeBot();
            }, retryDelay);
        } else {
            console.error('❌ Max initialization attempts reached. WhatsApp bot failed to start.');
            console.log('💡 Possible solutions:');
            console.log('   - Check internet connection');
            console.log('   - Restart the server');
            console.log('   - Update Chrome browser');
            console.log('   - Check system resources (RAM/CPU)');
            
            // Set a flag to indicate permanent failure
            this.authenticationStatus = 'failed';
        }
    }

    setupEventHandlers() {
        if (!this.client) return;

        // Remove any existing listeners first
        this.client.removeAllListeners();

        this.client.on('qr', qr => {
            console.log('📱 New QR code generated for WhatsApp authentication');
            try {
                qrcode.generate(qr, { small: true });
            } catch (error) {
                console.log('⚠️ QR terminal display failed, but QR code is available');
            }
            
            // Store QR code for frontend access
            this.currentQR = qr;
            this.authenticationStatus = 'qr_ready';
            this.isInitializing = false;
            
            console.log('🔗 QR Code available for teacher authentication');
            console.log('📋 Teachers can now scan this QR code with their WhatsApp to authenticate');
            console.log('⏰ QR code is valid for 20 seconds - please scan quickly');
            
            // QR code will automatically refresh by WhatsApp Web after ~20 seconds
            console.log('⏰ QR code will automatically refresh if not scanned within 20 seconds');
        });

        this.client.on('loading_screen', (percent, message) => {
            console.log(`⏳ Loading WhatsApp... ${percent}% - ${message}`);
        });

        this.client.on('authenticated', () => {
            console.log('✅ WhatsApp authentication successful - waiting for ready state...');
            console.log('📊 Auth Status Update: Authentication completed, waiting for ready event');
            // Don't set status to authenticated yet - wait for 'ready' event
            this.currentQR = null;
            this.authenticationStatus = 'authenticating'; // New intermediate state
            
            // Start polling to detect ready state
            this.startStatusPolling();
            
            // Fallback timeout in case ready event doesn't fire within 60 seconds
            setTimeout(() => {
                if (!this.isReady && this.authenticationStatus === 'authenticating') {
                    console.log('⚠️ Ready event timeout, forcing ready state...');
                    this.isReady = true;
                    this.authenticationStatus = 'authenticated';
                    this.isInitializing = false;
                    this.stopStatusPolling();
                    console.log('🎉 WhatsApp bot is now ready (via timeout)');
                }
            }, 60000); // Increased to 60 seconds
        });

        this.client.on('auth_failure', (msg) => {
            console.log('❌ WhatsApp authentication failed:', msg);
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isReady = false;
            this.isInitializing = false;
            
            // Clean session on auth failure
            this.cleanupSession();
            
            // Retry initialization after failure
            setTimeout(() => {
                console.log('🔄 Reinitializing after auth failure...');
                this.initializeBot();
            }, 10000);
        });

        this.client.on('ready', () => {
            console.log('🎉 WhatsApp bot is ready for messaging!');
            console.log('📊 Final Status Update: Bot is now fully ready');
            this.isReady = true;
            this.authenticationStatus = 'authenticated';
            this.currentQR = null;
            this.isInitializing = false;
            this.initializationAttempts = 0; // Reset counter on success
            
            // Stop polling since we're ready
            this.stopStatusPolling();
            
            // Log the connected WhatsApp number
            if (this.client.info && this.client.info.wid && this.client.info.wid.user) {
                console.log(`📞 Connected WhatsApp: +${this.client.info.wid.user}`);
                console.log(`🔗 WhatsApp Web connected successfully!`);
            }
            
            // Additional connection info
            console.log('🚀 System ready for sending attendance notifications');
        });

        this.client.on('message', msg => {
            this.handleIncomingMessage(msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp bot was disconnected:', reason);
            this.isReady = false;
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isInitializing = false;
            
            // Clean session on disconnection
            if (reason === 'LOGOUT' || reason === 'CONFLICT') {
                this.cleanupSession();
            }
            
            // Auto-reconnect after disconnection
            setTimeout(() => {
                console.log('🔄 Reconnecting WhatsApp bot...');
                this.initializeBot();
            }, 10000);
        });

        this.client.on('change_state', state => {
            console.log('🔄 WhatsApp state changed:', state);
            
            // Handle state changes that might affect QR code
            if (state === 'CONFLICT' || state === 'UNPAIRED' || state === 'TIMEOUT') {
                console.log('⚠️ Connection state requires new QR code');
                this.currentQR = null;
                this.authenticationStatus = 'disconnected';
            }
        });

        // Enhanced error handling to prevent crashes
        this.client.on('error', (error) => {
            console.error('❌ WhatsApp client error:', error);
            
            // Handle different types of errors
            if (error.message.includes('Protocol error') || 
                error.message.includes('Target closed') ||
                error.message.includes('Execution context was destroyed') ||
                error.message.includes('Session closed')) {
                
                console.log('🧹 Critical error detected, cleaning session and reinitializing...');
                this.isReady = false;
                this.authenticationStatus = 'disconnected';
                this.currentQR = null;
                this.isInitializing = false;
                
                // Clean up browser process
                if (this.client && this.client.pupBrowser) {
                    try {
                        this.client.pupBrowser.close();
                    } catch (e) {
                        console.log('🔄 Browser cleanup attempted');
                    }
                }
                
                this.cleanupSession();
                
                setTimeout(() => {
                    this.initializeBot();
                }, 15000); // Wait longer for cleanup
            }
        });

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('🔄 Gracefully shutting down WhatsApp bot...');
            if (this.client) {
                this.client.destroy();
            }
            process.exit(0);
        });
    }

    async handleIncomingMessage(msg) {
        try {
            const messageBody = msg.body.toLowerCase();
            const from = msg.from;
            
            console.log(`📨 Message received from ${from}: ${msg.body}`);
            
            // Auto-reply logic for teachers/parents
            if (messageBody === 'hi' || messageBody === 'hello') {
                await msg.reply("👋 Hello! This is the HOD Classes notification system.\n\n📚 You'll receive attendance notifications through this WhatsApp account.\n\nFor any queries, please contact your teacher directly.");
            } else if (messageBody === 'status') {
                await msg.reply(`🤖 HOD Classes Bot Status: Active ✅\nTime: ${new Date().toLocaleString()}\n\n📖 This account is used for sending attendance notifications to parents.`);
            } else if (messageBody === 'help') {
                await msg.reply("📚 HOD Classes Attendance Bot\n\n🎯 Purpose: Send attendance notifications to parents\n\n📋 What you'll receive:\n• Daily attendance alerts\n• Subject-wise absence notifications\n• Important class announcements\n\n👨‍🏫 Messages are sent by your child's teachers using their authenticated WhatsApp accounts.");
            }
        } catch (error) {
            console.error('❌ Error handling incoming message:', error);
        }
    }

    async sendMessage(phoneNumber, message) {
        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp bot is not ready. Please authenticate first by scanning the QR code.');
        }

        try {
            // Format phone number for WhatsApp
            const chatId = `${phoneNumber}@c.us`;
            const result = await this.client.sendMessage(chatId, message);
            console.log(`✅ Message sent to ${phoneNumber}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to send message to ${phoneNumber}:`, error);
            
            // If session closed, mark as disconnected and clean session
            if (error.message.includes('Session closed') || 
                error.message.includes('Target closed') || 
                error.message.includes('Protocol error') ||
                error.message.includes('Execution context was destroyed')) {
                
                this.isReady = false;
                this.authenticationStatus = 'disconnected';
                console.log('🔄 Session lost, cleaning up and will need to reauthenticate');
                
                this.cleanupSession();
                
                setTimeout(() => {
                    this.initializeBot();
                }, 5000);
            }
            
            throw error;
        }
    }

    // Send bulk messages with WhatsApp ban prevention
    async sendBulkMessages(phoneNumbers, message, options = {}) {
        const {
            batchSize = 3,           // Smaller batches for stability
            batchDelay = 600000,     // 10 minutes between batches
            messageDelay = 25000,    // 25 seconds between individual messages
            maxDaily = 50           // Maximum messages per day
        } = options;

        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp bot is not ready for bulk messaging');
        }

        if (phoneNumbers.length > maxDaily) {
            throw new Error(`Cannot send to ${phoneNumbers.length} numbers. Daily limit is ${maxDaily} messages to prevent WhatsApp ban.`);
        }

        const results = [];
        const errors = [];
        let totalSent = 0;

        console.log(`📤 Starting bulk message sending to ${phoneNumbers.length} numbers`);
        console.log(`⚙️ Settings: ${batchSize} per batch, ${batchDelay/1000}s batch delay, ${messageDelay/1000}s message delay`);

        // Split into batches
        for (let i = 0; i < phoneNumbers.length; i += batchSize) {
            const batch = phoneNumbers.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(phoneNumbers.length / batchSize);

            console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} numbers)`);

            // Process each message in the batch
            for (const phoneNumber of batch) {
                try {
                    // Add random delay variation (±30%) to avoid pattern detection
                    const randomDelay = messageDelay + (Math.random() - 0.5) * messageDelay * 0.6;
                    
                    await this.sendMessage(phoneNumber, message);
                    results.push({
                        phone: phoneNumber,
                        status: 'sent',
                        timestamp: new Date().toISOString()
                    });
                    totalSent++;

                    console.log(`✅ Sent ${totalSent}/${phoneNumbers.length} to ${phoneNumber}`);

                    // Wait before next message (except for last message in last batch)
                    if (totalSent < phoneNumbers.length) {
                        console.log(`⏳ Waiting ${Math.round(randomDelay/1000)}s before next message...`);
                        await new Promise(resolve => setTimeout(resolve, randomDelay));
                    }

                } catch (error) {
                    console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
                    errors.push({
                        phone: phoneNumber,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });

                    // If we get a rate limit error, increase delays
                    if (error.message.includes('rate limit') || error.message.includes('blocked')) {
                        console.log('⚠️ Rate limit detected, increasing delays...');
                        await new Promise(resolve => setTimeout(resolve, 120000)); // Wait 2 minutes
                    }
                }
            }

            // Wait between batches (except after last batch)
            if (i + batchSize < phoneNumbers.length) {
                console.log(`⏳ Batch ${batchNumber} complete. Waiting ${batchDelay/1000}s before next batch...`);
                await new Promise(resolve => setTimeout(resolve, batchDelay));
            }
        }

        console.log(`🎉 Bulk messaging complete: ${results.length} sent, ${errors.length} failed`);

        return {
            successful: results,
            failed: errors,
            total: phoneNumbers.length,
            sent: results.length,
            failedCount: errors.length
        };
    }

    // Get current QR code for frontend display
    getCurrentQR() {
        return this.currentQR;
    }

    // Get authentication status
    getAuthStatus() {
        // Determine correct status based on current state
        let status = this.authenticationStatus;
        
        // If we're initializing, show appropriate status
        if (this.isInitializing) {
            status = 'initializing';
        } else if (this.currentQR && this.authenticationStatus === 'qr_ready') {
            status = 'qr_ready';
        } else if (this.authenticationStatus === 'authenticating') {
            status = 'authenticating';
        } else if (this.isReady) {
            status = 'authenticated';
        } else if (this.authenticationStatus === 'failed') {
            status = 'failed';
        } else {
            status = 'disconnected';
        }
        
        return {
            isReady: this.isReady,
            status: status,
            hasQR: !!this.currentQR,
            timestamp: new Date().toISOString(),
            isInitializing: this.isInitializing,
            initializationAttempts: this.initializationAttempts,
            maxAttempts: this.maxInitializationAttempts
        };
    }

    // Get connected phone number info
    async getConnectionInfo() {
        if (!this.isReady || !this.client || !this.client.info) {
            return null;
        }
        
        try {
            return {
                phoneNumber: this.client.info.wid.user ? `+${this.client.info.wid.user}` : 'Unknown',
                platform: this.client.info.platform || 'WhatsApp Web',
                connected: true
            };
        } catch (error) {
            return null;
        }
    }

    // Force logout (for teacher switching)
    async logout() {
        try {
            console.log('🔄 Logging out current WhatsApp session...');
            if (this.client) {
                await this.client.logout();
            }
            this.isReady = false;
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isInitializing = false;
            this.initializationAttempts = 0;
            
            // Clean session data
            this.cleanupSession();
            console.log('✅ Successfully logged out');
            
            // Reinitialize for new authentication
            setTimeout(() => {
                this.initializeBot();
            }, 3000);
        } catch (error) {
            console.error('❌ Error during logout:', error);
            throw error;
        }
    }

    // Force QR generation
    async generateQR() {
        // Check if already fully authenticated and ready
        if (this.isReady && this.authenticationStatus === 'authenticated') {
            return { success: false, message: 'Already authenticated and ready' };
        }

        // Check if initialization failed permanently
        if (this.authenticationStatus === 'failed') {
            return { success: false, message: 'Bot initialization failed permanently. Please restart the server.' };
        }

        // If we have a current QR code, return it
        if (this.currentQR && this.authenticationStatus === 'qr_ready') {
            return { success: true, qr: this.currentQR };
        }

        // If not initializing and we have attempts left, start initialization
        if (!this.isInitializing && this.initializationAttempts < this.maxInitializationAttempts) {
            console.log('🔄 Forcing QR generation by starting initialization...');
            this.initializeBot();
        }

        // Determine the appropriate message based on current state
        if (this.isInitializing) {
            return { success: false, message: `Bot initializing (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})...` };
        } else {
            return { success: false, message: 'QR generation in progress...' };
        }
    }

    getClient() {
        return this.client;
    }

    // Start polling for authentication status
    startStatusPolling() {
        if (this.statusPoller) {
            clearInterval(this.statusPoller);
        }
        
        this.statusPoller = setInterval(() => {
            this.checkClientStatus();
        }, this.pollInterval);
        
        console.log('🔍 Started authentication status polling');
    }
    
    // Stop polling
    stopStatusPolling() {
        if (this.statusPoller) {
            clearInterval(this.statusPoller);
            this.statusPoller = null;
            console.log('⏹️ Stopped authentication status polling');
        }
    }
    
    // Check client status manually
    async checkClientStatus() {
        if (!this.client) return;
        
        try {
            // Try to get client info to check if it's ready
            const state = await this.client.getState();
            
            if (state === 'CONNECTED' && !this.isReady) {
                console.log('🎉 Detected authentication via polling! Client is connected.');
                this.isReady = true;
                this.authenticationStatus = 'authenticated';
                this.currentQR = null;
                this.isInitializing = false;
                this.initializationAttempts = 0;
                this.stopStatusPolling();
                
                // Get phone number info
                try {
                    const info = this.client.info;
                    if (info && info.wid && info.wid.user) {
                        console.log(`📞 Connected WhatsApp: +${info.wid.user}`);
                    }
                } catch (e) {
                    console.log('📞 WhatsApp connected (phone number detection failed)');
                }
                
                console.log('🚀 System ready for sending attendance notifications');
            }
        } catch (error) {
            // Client not ready yet, continue polling
            // console.log('🔍 Polling... client not ready yet');
        }
    }
}

// Create and export the bot instance
const whatsappBot = new WhatsAppBot();

// Export for use in other modules
export default whatsappBot;
