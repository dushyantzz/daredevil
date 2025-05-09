import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return only the WhatsApp numbers, not the sensitive credentials
    return NextResponse.json({
      twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
      twilioWhatsappTo: process.env.TWILIO_WHATSAPP_TO || ''
    })
  } catch (error) {
    console.error('Error getting Twilio config:', error)
    return NextResponse.json({ error: 'Failed to get Twilio configuration' }, { status: 500 })
  }
}
