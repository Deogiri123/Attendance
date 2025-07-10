import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import os from 'os';

class WorkingWhatsAppBot {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.currentQR = null;
        this.authenticationStatus = 'disconnected';
        this.isInitializing = false;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 3;
        this.platform = os.platform();
        
        console.log(`🚀 Starting Working WhatsApp Bot on ${this.platform}...`);
        this.initializeBot();
    }

    getPuppeteerConfig() {
        const baseArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ];

        // Windows-specific arguments
        if (this.platform === 'win32') {
            baseArgs.push(
                '--disable-features=TranslateUI',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-background-networking',
                '--disable-sync',
                '--disable-default-apps',
                '--no-default-browser-check',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            );
        }

        // macOS-specific arguments
        if (this.platform === 'darwin') {
            baseArgs.push(
                '--disable-features=TranslateUI'
            );
        }

        // Linux-specific arguments  
        if (this.platform === 'linux') {
            baseArgs.push(
                '--disable-features=TranslateUI',
                '--single-process'
            );
        }

        return {
            headless: true,
            args: baseArgs,
            defaultViewport: null,
            ignoreDefaultArgs: ['--disable-extensions'],
            ...(this.platform === 'win32' && {
                executablePath: undefined, // Let puppeteer find Chrome automatically on Windows
                ignoreHTTPSErrors: true,
                timeout: 60000
            })
        };
    }

    async checkSystemRequirements() {
        console.log(`🔍 Checking system requirements for ${this.platform}...`);
        
        if (this.platform === 'win32') {
            console.log('📋 Windows system detected');
            console.log('   - Checking Chrome installation...');
            
            try {
                // Try to detect Chrome installation on Windows
                const { execSync } = await import('child_process');
                try {
                    execSync('reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version', { stdio: 'ignore' });
                    console.log('   ✅ Chrome detected via registry');
                } catch {
                    try {
                        execSync('where chrome', { stdio: 'ignore' });
                        console.log('   ✅ Chrome detected via PATH');
                    } catch {
                        console.log('   ⚠️  Chrome not found - please install Google Chrome');
                        console.log('   📥 Download from: https://www.google.com/chrome/');
                    }
                }
            } catch (error) {
                console.log('   ⚠️  Could not check Chrome installation');
            }
            
            console.log('   - Windows Defender/Antivirus: Make sure Node.js is allowed');
            console.log('   - Firewall: Ensure ports are not blocked');
        } else if (this.platform === 'darwin') {
            console.log('📋 macOS system detected - should work out of the box');
        } else if (this.platform === 'linux') {
            console.log('📋 Linux system detected');
            console.log('   - Additional dependencies may be required');
        }
        
        console.log('✅ System check completed');
    }

    async initializeBot() {
        if (this.isInitializing) return;
        
        this.isInitializing = true;
        this.initializationAttempts++;
        this.authenticationStatus = 'initializing';
        
        console.log(`🔄 Initializing WhatsApp Bot (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})...`);
        
        // Run system check on first attempt
        if (this.initializationAttempts === 1) {
            await this.checkSystemRequirements();
        }
        
        try {
            // Cross-platform configuration
            const puppeteerConfig = this.getPuppeteerConfig();
            console.log(`🔧 Using ${this.platform} specific configuration`);
            
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './.wwebjs_auth',
                    clientId: `hod-classes-${this.platform}`
                }),
                puppeteer: puppeteerConfig
            });
            
            this.setupEventHandlers();
            
            // Initialize with timeout (longer for Windows)
            const timeoutDuration = this.platform === 'win32' ? 180000 : 120000; // 3 minutes for Windows, 2 for others
            const initTimeout = setTimeout(() => {
                if (this.isInitializing) {
                    console.log(`⏰ Initialization timeout after ${timeoutDuration/1000}s`);
                    this.handleInitializationFailure('Timeout - this may be due to slow Chrome startup on Windows');
                }
            }, timeoutDuration);

            this.client.initialize().then(() => {
                clearTimeout(initTimeout);
                console.log('✅ WhatsApp client initialized successfully');
            }).catch((error) => {
                clearTimeout(initTimeout);
                this.handleInitializationFailure(error);
            });
            
        } catch (error) {
            this.handleInitializationFailure(error);
        }
    }

    setupEventHandlers() {
        this.client.on('qr', qr => {
            console.log('📱 QR Code Generated!');
            this.currentQR = qr;
            this.authenticationStatus = 'qr_ready';
            this.isInitializing = false;
            
            // Display QR in terminal for debugging
            qrcode.generate(qr, { small: true });
            console.log('✅ QR Code ready for scanning');
        });

        this.client.on('loading_screen', (percent, message) => {
            console.log(`⏳ Loading WhatsApp Web... ${percent}% - ${message}`);
        });

        this.client.on('authenticated', () => {
            console.log('✅ Authentication successful!');
            this.currentQR = null;
            this.authenticationStatus = 'authenticating';
        });

        this.client.on('ready', () => {
            console.log(`🎉 WhatsApp bot is ready for messaging on ${this.platform}!`);
            this.isReady = true;
            this.authenticationStatus = 'authenticated';
            this.currentQR = null;
            this.isInitializing = false;
            this.initializationAttempts = 0;
            
            // Log connected phone number
            if (this.client.info && this.client.info.wid && this.client.info.wid.user) {
                console.log(`📞 Connected WhatsApp: +${this.client.info.wid.user}`);
            }
            
            if (this.platform === 'win32') {
                console.log('✅ Windows compatibility mode active');
            }
            
            console.log('🚀 System ready for attendance notifications!');
        });

        this.client.on('auth_failure', msg => {
            console.log('❌ Authentication failed:', msg);
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isReady = false;
            this.isInitializing = false;
            
            setTimeout(() => {
                console.log('🔄 Retrying after auth failure...');
                this.initializeBot();
            }, 10000);
        });

        this.client.on('disconnected', reason => {
            console.log('❌ Disconnected:', reason);
            this.isReady = false;
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isInitializing = false;
            
            setTimeout(() => {
                console.log('🔄 Reconnecting...');
                this.initializeBot();
            }, 10000);
        });

        this.client.on('error', error => {
            console.error('❌ WhatsApp error:', error.message);
        });
    }

    handleInitializationFailure(error) {
        console.error('❌ Initialization failed:', error.message || error);
        
        // Windows-specific error messages
        if (this.platform === 'win32' && error.message) {
            if (error.message.includes('Could not find expected browser')) {
                console.error('💡 Windows Tip: Make sure Chrome is installed. You can download it from https://www.google.com/chrome/');
            } else if (error.message.includes('spawn')) {
                console.error('💡 Windows Tip: Try running as administrator or check Windows Defender settings');
            } else if (error.message.includes('ECONNREFUSED')) {
                console.error('💡 Windows Tip: Check if Windows Firewall is blocking the connection');
            }
        }
        
        this.isInitializing = false;
        this.authenticationStatus = 'disconnected';
        this.currentQR = null;
        this.isReady = false;
        
        if (this.initializationAttempts < this.maxInitializationAttempts) {
            const retryDelay = this.platform === 'win32' ? 15000 : 10000; // Longer delay for Windows
            console.log(`🔄 Retrying in ${retryDelay/1000}s...`);
            
            setTimeout(() => {
                this.initializeBot();
            }, retryDelay);
        } else {
            console.error('❌ Max attempts reached. Bot failed to start.');
            this.authenticationStatus = 'failed';
            
            if (this.platform === 'win32') {
                console.log('💡 Windows troubleshooting tips:');
                console.log('   1. Make sure Chrome is installed and updated');
                console.log('   2. Try running the application as administrator');
                console.log('   3. Check Windows Defender/Antivirus settings');
                console.log('   4. Ensure no other WhatsApp Web sessions are running');
            }
        }
    }

    // API Methods
    async getAuthStatus() {
        let status = this.authenticationStatus;
        
        if (this.isInitializing) {
            status = 'initializing';
        } else if (this.currentQR) {
            status = 'qr_ready';
        } else if (this.authenticationStatus === 'authenticating') {
            status = 'authenticating';
        } else if (this.isReady) {
            status = 'authenticated';
        }
        
        return {
            isReady: this.isReady,
            status: status,
            hasQR: !!this.currentQR,
            timestamp: new Date().toISOString(),
            isInitializing: this.isInitializing,
            initializationAttempts: this.initializationAttempts,
            maxAttempts: this.maxInitializationAttempts,
            connectionInfo: this.isReady ? await this.getConnectionInfo() : {}
        };
    }

    getCurrentQR() {
        return this.currentQR;
    }

    async generateQR() {
        if (this.isReady) {
            return { success: false, message: 'Already authenticated' };
        }
        
        if (this.authenticationStatus === 'failed') {
            return { success: false, message: 'Bot failed. Please restart server.' };
        }
        
        if (this.currentQR) {
            return { success: true, qr: this.currentQR };
        }
        
        if (!this.isInitializing && this.initializationAttempts < this.maxInitializationAttempts) {
            this.initializeBot();
        }
        
        return { 
            success: false, 
            message: this.isInitializing ? 
                `Initializing (${this.initializationAttempts}/${this.maxInitializationAttempts})...` : 
                'Starting initialization...' 
        };
    }

    async sendMessage(phoneNumber, message) {
        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp bot is not ready. Please authenticate first.');
        }

        // Check if client is actually connected
        const isConnected = await this.reconnectIfNeeded();
        if (!isConnected) {
            throw new Error('WhatsApp client is disconnected and reconnection is in progress. Please try again in a few moments.');
        }

        try {
            // Clean and validate phone number
            const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
            if (!cleanPhone || cleanPhone.length < 10) {
                throw new Error(`Invalid phone number format: ${phoneNumber}`);
            }

            const chatId = `${cleanPhone}@c.us`;
            console.log(`[WHATSAPP WEB] Attempting to send message to: ${cleanPhone}`);
            
            // Check if the number exists on WhatsApp first
            try {
                const numberId = await this.client.getNumberId(chatId);
                if (!numberId) {
                    throw new Error(`Phone number ${cleanPhone} is not registered on WhatsApp`);
                }
                console.log(`[WHATSAPP WEB] Number verified: ${cleanPhone}`);
            } catch (verifyError) {
                console.warn(`[WHATSAPP WEB] Could not verify number ${cleanPhone}:`, verifyError.message);
                // Continue anyway as getNumberId might fail even for valid numbers
            }

            // Add a small delay to ensure client is fully ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const result = await this.client.sendMessage(chatId, message);
            console.log(`✅ Message sent to ${cleanPhone}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to send message to ${phoneNumber}:`, error);
            
            // If it's the getChat error, provide more context
            if (error.message.includes('getChat') || error.message.includes('Cannot read properties of undefined')) {
                throw new Error(`Failed to send message: WhatsApp session may have expired or the number ${phoneNumber} may not be valid. Please restart the WhatsApp bot or scan QR code again. Original error: ${error.message}`);
            }
            
            throw error;
        }
    }

    async sendBulkMessages(phoneNumbers, message, options = {}) {
        const { batchSize = 3, batchDelay = 600000, messageDelay = 25000 } = options;
        
        if (!this.isReady) {
            throw new Error('WhatsApp bot is not ready');
        }

        const results = [];
        const errors = [];
        
        console.log(`📤 Sending bulk messages to ${phoneNumbers.length} numbers`);
        
        for (let i = 0; i < phoneNumbers.length; i += batchSize) {
            const batch = phoneNumbers.slice(i, i + batchSize);
            
            for (const phoneNumber of batch) {
                try {
                    await this.sendMessage(phoneNumber, message);
                    results.push({ phone: phoneNumber, status: 'sent' });
                    
                    // Wait between messages
                    if (results.length < phoneNumbers.length) {
                        await new Promise(resolve => setTimeout(resolve, messageDelay));
                    }
                } catch (error) {
                    errors.push({ phone: phoneNumber, error: error.message });
                }
            }
            
            // Wait between batches
            if (i + batchSize < phoneNumbers.length) {
                console.log(`⏳ Waiting ${batchDelay/1000}s before next batch...`);
                await new Promise(resolve => setTimeout(resolve, batchDelay));
            }
        }
        
        return { successful: results, failed: errors };
    }

    async logout() {
        try {
            console.log('🔄 Logging out...');
            if (this.client) {
                await this.client.logout();
            }
            this.isReady = false;
            this.authenticationStatus = 'disconnected';
            this.currentQR = null;
            this.isInitializing = false;
            this.initializationAttempts = 0;
            
            setTimeout(() => {
                this.initializeBot();
            }, 3000);
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    }

    async getConnectionInfo() {
        if (!this.isReady || !this.client) {
            return null;
        }
        
        try {
            // Try to get client info
            if (this.client.info && this.client.info.wid && this.client.info.wid.user) {
                return {
                    phoneNumber: `+${this.client.info.wid.user}`,
                    platform: 'WhatsApp Web',
                    connected: true
                };
            }
            
            // Fallback: return basic connection info if client.info is not available
            return {
                phoneNumber: 'Connected',
                platform: 'WhatsApp Web',
                connected: true
            };
        } catch (error) {
            // Return basic info if error
            return {
                phoneNumber: 'Connected',
                platform: 'WhatsApp Web', 
                connected: true
            };
        }
    }

    async isClientReady() {
        if (!this.isReady || !this.client) {
            console.log(`[isClientReady] Not ready - isReady: ${this.isReady}, client exists: ${!!this.client}`);
            return false;
        }
        
        try {
            // Try to get the client's state
            const state = await this.client.getState();
            console.log(`[isClientReady] Client state: ${state}`);
            const isConnected = state === 'CONNECTED';
            
            if (!isConnected) {
                console.warn(`[isClientReady] Client state is ${state}, not CONNECTED`);
            }
            
            return isConnected;
        } catch (error) {
            console.warn(`[isClientReady] State check failed: ${error.message}`);
            // If we can't check state but isReady is true, assume it's ready
            // This prevents false negatives when state check temporarily fails
            console.log(`[isClientReady] Falling back to isReady status: ${this.isReady}`);
            return this.isReady;
        }
    }

    async reconnectIfNeeded() {
        try {
            const clientReady = await this.isClientReady();
            if (!clientReady && this.isReady) {
                console.log('🔄 Client seems disconnected, attempting to reconnect...');
                this.isReady = false;
                this.authenticationStatus = 'disconnected';
                this.initializeBot();
                return false;
            }
            return clientReady;
        } catch (error) {
            console.error('Reconnection check failed:', error);
            return false;
        }
    }

    getClient() {
        return this.client;
    }
}

// Export the working bot instance
const workingBot = new WorkingWhatsAppBot();
export default workingBot; 