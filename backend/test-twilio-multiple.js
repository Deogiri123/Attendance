// Test script to verify Twilio can send multiple messages
import 'dotenv/config';
import twilio from 'twilio';

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Send multiple WhatsApp messages
async function testMultipleWhatsAppMessages() {
  try {
    console.log('Starting Twilio WhatsApp multiple messages test...');
    console.log('');
    
    // Initialize Twilio client with credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    // Check if Twilio credentials are configured
    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.error('❌ Twilio credentials or WhatsApp number not configured');
      console.error('Please set the following environment variables:');
      console.error('- TWILIO_ACCOUNT_SID');
      console.error('- TWILIO_AUTH_TOKEN');
      console.error('- TWILIO_WHATSAPP_NUMBER');
      return;
    }
    
    // Get the test phone number
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER;
    if (!testPhoneNumber) {
      console.error('❌ No test phone number provided');
      console.error('Please set TEST_PHONE_NUMBER environment variable');
      return;
    }
    
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    console.log('✅ Twilio client initialized');
    console.log(`📞 Using WhatsApp number: ${twilioWhatsAppNumber}`);
    console.log(`📱 Sending test messages to: ${testPhoneNumber}`);
    console.log('');
    
    // Format WhatsApp numbers
    const cleanToNumber = testPhoneNumber.replace(/\s+/g, '');
    const cleanFromNumber = twilioWhatsAppNumber.replace(/\s+/g, '');
    
    const formattedToNumber = `whatsapp:${cleanToNumber.startsWith('+') ? cleanToNumber : `+${cleanToNumber}`}`;
    const formattedFromNumber = `whatsapp:${cleanFromNumber.startsWith('+') ? cleanFromNumber : `+${cleanFromNumber}`}`;
    
    console.log(`From: ${formattedFromNumber}`);
    console.log(`To: ${formattedToNumber}`);
    console.log('');
    
    // Send 3 test messages with delays
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Sending message ${i + 1} of 3...`);
        
        const message = await client.messages.create({
          body: `Test WhatsApp message ${i + 1} of 3 from HOD Classes app [${new Date().toISOString()}]`,
          from: formattedFromNumber,
          to: formattedToNumber
        });
        
        console.log(`✅ Message ${i + 1} sent! SID: ${message.sid}`);
        
        // Add a delay between messages (2 seconds)
        if (i < 2) {
          console.log('Waiting 2 seconds before sending next message...');
          await delay(2000);
        }
      } catch (error) {
        console.error(`❌ Error sending message ${i + 1}:`, error.message);
        console.error('Error details:', JSON.stringify({
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.moreInfo || error.details || 'No additional details'
        }, null, 2));
      }
    }
    
    console.log('');
    console.log('✅ Test completed! Check your WhatsApp messages.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testMultipleWhatsAppMessages();
