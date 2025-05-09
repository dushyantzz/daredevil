'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function WhatsAppSetupPage() {
  const [twilioNumber, setTwilioNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [testDescription, setTestDescription] = useState('Test security alert from the WhatsApp setup page')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Load environment variables on component mount
  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const response = await fetch('/api/get-twilio-config')
        const data = await response.json()
        
        if (data.twilioWhatsappFrom) {
          setTwilioNumber(data.twilioWhatsappFrom)
        }
        
        if (data.twilioWhatsappTo) {
          setWhatsappNumber(data.twilioWhatsappTo)
        }
      } catch (error) {
        console.error('Error fetching Twilio config:', error)
      }
    }
    
    fetchEnvVars()
  }, [])

  const handleTestWhatsApp = async () => {
    try {
      setStatus('idle')
      setMessage('')
      
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Security Alert',
          description: testDescription
        })
      })
      
      const result = await response.json()
      
      if (result.error) {
        setStatus('error')
        setMessage(`Error: ${result.error}`)
      } else {
        setStatus('success')
        setMessage(`WhatsApp message sent successfully! SID: ${result.data?.sid || 'N/A'}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Setup Guide</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Your WhatsApp Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Twilio WhatsApp From Number:</p>
              <p className="p-2 bg-gray-200 dark:bg-gray-700 rounded">{twilioNumber || 'Not configured'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Your WhatsApp Number:</p>
              <p className="p-2 bg-gray-200 dark:bg-gray-700 rounded">{whatsappNumber || 'Not configured'}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          
          <ol className="list-decimal pl-5 space-y-4">
            <li>
              <p className="font-medium">Join the Twilio WhatsApp Sandbox</p>
              <div className="ml-5 mt-2">
                <p>Open WhatsApp on your phone and send the following message to <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{twilioNumber}</span>:</p>
                <p className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded font-mono">join anything</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">If "join anything" doesn't work, try "join hello" or check your Twilio console for the correct code.</p>
              </div>
            </li>
            
            <li className="pt-2">
              <p className="font-medium">Wait for Confirmation</p>
              <p className="ml-5 mt-2">You should receive a confirmation message from Twilio in WhatsApp.</p>
            </li>
            
            <li className="pt-2">
              <p className="font-medium">Test Your Setup</p>
              <p className="ml-5 mt-2">Once you've joined the sandbox, use the test button below to send a test message.</p>
            </li>
          </ol>
        </div>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Your WhatsApp Setup</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Alert Description
              </label>
              <Textarea
                id="description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleTestWhatsApp}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send Test WhatsApp
            </Button>
          </div>
          
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
              {message}
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
