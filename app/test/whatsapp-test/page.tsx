'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SecurityAlertModal } from '@/components/security-alert-modal'

export default function WhatsAppTestPage() {
  const [showModal, setShowModal] = useState(false)
  const [testDescription, setTestDescription] = useState('Test security alert from the WhatsApp test page')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleTestDirectApi = async () => {
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
        setMessage('WhatsApp message sent successfully!')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Alert Test Page</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Alert Modal</h2>
          <p className="mb-4">This will open the security alert modal which should trigger both email and WhatsApp alerts.</p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Open Alert Modal
          </Button>
        </div>
        
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Direct WhatsApp API</h2>
          <p className="mb-4">This will directly call the WhatsApp API without using the modal.</p>
          
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
              onClick={handleTestDirectApi}
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

      <SecurityAlertModal
        open={showModal}
        onOpenChange={setShowModal}
        onAlertComplete={() => {
          setStatus('success')
          setMessage('Alert completed and notifications should have been sent!')
        }}
        eventDescription={testDescription}
      />
    </div>
  )
}
