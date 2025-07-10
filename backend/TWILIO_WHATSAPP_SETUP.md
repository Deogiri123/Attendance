# Setting Up Twilio WhatsApp Integration

This guide will help you set up and test the Twilio WhatsApp integration for sending real WhatsApp messages to parents of absent students.

## Prerequisites

1. A Twilio account with:
   - Account SID
   - Auth Token
   - WhatsApp-enabled phone number (Twilio Sandbox for WhatsApp)

## Environment Variables

Add the following environment variables to your `.env` file:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Testing with ngrok

1. Install ngrok (already added as a dev dependency)
2. Start the server with ngrok:

```bash
npm run ngrok
```

3. Copy the ngrok URL provided in the console (e.g., `https://abc123.ngrok.io`)
4. Configure your Twilio WhatsApp Sandbox:
   - Go to the Twilio Console > Messaging > Try it Out > WhatsApp
   - Set the "When a message comes in" webhook URL to:
     `https://your-ngrok-url/api/twilio-webhook/incoming`
   - Set the "Status callback URL" to:
     `https://your-ngrok-url/api/twilio-webhook/status`

## Joining the WhatsApp Sandbox

To test the WhatsApp integration:

1. Send a WhatsApp message to your Twilio WhatsApp number with the sandbox code
2. Once connected, you can test the integration by marking students absent

## Production Setup

For production use, you'll need to:

1. Apply for Twilio WhatsApp Business API access
2. Set up a permanent server with proper SSL certificates
3. Update the webhook URLs in the Twilio Console

## Troubleshooting

- Check the server logs for detailed error messages
- Verify that your Twilio account has sufficient credits
- Ensure phone numbers are in the correct format (with country code)
- For WhatsApp, make sure recipients have joined your sandbox
