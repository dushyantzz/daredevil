'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SecurityAlertModal } from '@/components/security-alert-modal'

export default function SecurityAlertTestPage() {
  const [showModal, setShowModal] = useState(false)
  const [alertDescription, setAlertDescription] = useState('Suspicious person detected near the entrance')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Security Alert Test</h1>
      
      <div className="space-y-8">
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Security Alert</h2>
          <p className="mb-4">This will trigger the security alert modal which will send a WhatsApp message to your configured number.</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Alert Description
              </label>
              <Textarea
                id="description"
                value={alertDescription}
                onChange={(e) => setAlertDescription(e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Trigger Security Alert
            </Button>
          </div>
          
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
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
          setMessage('Security alert completed! Check your WhatsApp for the notification.')
        }}
        eventDescription={alertDescription}
      />
    </div>
  )
}
