import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"

// This is a simplified payment service for demonstration
// In a real application, you would integrate with a payment provider like Stripe

export interface PaymentDetails {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
  amount: number
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

export async function processPayment(
  bookingId: string,
  userId: string,
  paymentDetails: PaymentDetails,
): Promise<PaymentResult> {
  const supabase = createClientComponentClient()

  try {
    // Validate payment details (simplified)
    if (!validateCardNumber(paymentDetails.cardNumber)) {
      return { success: false, error: "Invalid card number" }
    }

    if (!validateExpiryDate(paymentDetails.expiryDate)) {
      return { success: false, error: "Invalid expiry date" }
    }

    if (!validateCVV(paymentDetails.cvv)) {
      return { success: false, error: "Invalid CVV" }
    }

    // In a real application, you would call your payment provider's API here
    // For demo purposes, we'll simulate a successful payment
    const transactionId = uuidv4()

    // Record the payment in the database
    const { error } = await supabase.from("payments").insert({
      booking_id: bookingId,
      payment_method: "credit_card",
      payment_status: "completed",
      transaction_id: transactionId,
      amount: paymentDetails.amount,
    })

    if (error) throw error

    // Update booking status
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId)

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Payment Successful",
      message: `Your payment of $${paymentDetails.amount.toFixed(2)} has been processed successfully.`,
      read: false,
    })

    return {
      success: true,
      transactionId,
    }
  } catch (error) {
    console.error("Payment processing error:", error)
    return {
      success: false,
      error: "An error occurred while processing your payment. Please try again.",
    }
  }
}

// Validation helpers
function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, "")
  // Basic validation: check length (most cards are 13-19 digits)
  return cleaned.length >= 13 && cleaned.length <= 19
}

function validateExpiryDate(expiryDate: string): boolean {
  // Format should be MM/YY
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
  if (!regex.test(expiryDate)) return false

  const [month, year] = expiryDate.split("/")
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100 // Get last two digits of year
  const currentMonth = currentDate.getMonth() + 1 // getMonth() is 0-indexed

  const expiryYear = Number.parseInt(year, 10)
  const expiryMonth = Number.parseInt(month, 10)

  // Check if card is expired
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return false
  }

  return true
}

function validateCVV(cvv: string): boolean {
  // CVV is typically 3-4 digits
  const cleaned = cvv.replace(/\D/g, "")
  return cleaned.length >= 3 && cleaned.length <= 4
}
