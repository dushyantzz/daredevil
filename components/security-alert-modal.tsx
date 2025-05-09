import { useState, useEffect } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface SecurityAlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAlertComplete: () => void
  eventDescription?: string
}

export function SecurityAlertModal({
  open,
  onOpenChange,
  onAlertComplete,
  eventDescription = "Suspicious activity",
}: SecurityAlertModalProps) {
  const [status, setStatus] = useState<"calling" | "alerted">("calling")
  const [emailSent, setEmailSent] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)

  // Send WhatsApp alerts when modal is opened
  useEffect(() => {
    const sendAlerts = async () => {
      if (open && status === "calling") {
        const alertPayload = {
          title: "Security Alert: Immediate Attention Required",
          description: `Security personnel have been alerted about: ${eventDescription}`
        }

        // Send WhatsApp alert if not already sent (primary notification method)
        if (!whatsappSent) {
          try {
            console.log('Sending security alert WhatsApp message...')

            const whatsappResponse = await fetch("/api/send-whatsapp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(alertPayload)
            })

            const whatsappResult = await whatsappResponse.json()
            if (whatsappResult.error) {
              console.error('Failed to send WhatsApp alert:', whatsappResult.error)

              // Only try email as fallback if WhatsApp fails
              if (!emailSent) {
                try {
                  console.log('WhatsApp failed, trying email as fallback...')

                  const emailResponse = await fetch("/api/send-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json"
                    },
                    body: JSON.stringify(alertPayload)
                  })

                  const emailResult = await emailResponse.json()
                  if (emailResult.error) {
                    console.error('Failed to send email alert:', emailResult.error)
                  } else {
                    console.log('Email alert sent successfully as fallback')
                    setEmailSent(true)
                  }
                } catch (error) {
                  console.error('Error sending email alert:', error)
                }
              }
            } else {
              console.log('WhatsApp alert sent successfully')
              setWhatsappSent(true)
            }
          } catch (error) {
            console.error('Error sending WhatsApp alert:', error)
          }
        }
      }
    }

    sendAlerts()
  }, [open, status, emailSent, whatsappSent, eventDescription])

  useEffect(() => {
    if (open && status === "calling") {
      const timer = setTimeout(() => {
        setStatus("alerted")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [open, status])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "calling" ? "Calling Security..." : "Security Alerted!"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {status === "calling" ? (
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          ) : (
            <ShieldCheck className="h-12 w-12 text-green-500" />
          )}
        </div>
        <DialogFooter>
          {status === "alerted" && (
            <button
              onClick={() => {
                onAlertComplete()
                onOpenChange(false)
                setStatus("calling") // Reset for next time
              }}
              className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
