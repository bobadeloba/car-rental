import { createSafeClient } from "@/lib/safe-supabase"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { generatePageMetadata } from "@/lib/metadata"
import { PageTracker } from "@/components/analytics/page-tracker"

// Mark this page as explicitly dynamic
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return generatePageMetadata("FAQ", "Frequently asked questions about our car rental service")
}

// Helper function to parse FAQ content from HTML
function parseFaqContent(htmlContent: string): { question: string; answer: string }[] {
  // This is a simple parser that assumes a specific structure
  const faqItems: { question: string; answer: string }[] = []

  // Extract FAQ items using regex
  const faqItemRegex = /<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs
  let match

  while ((match = faqItemRegex.exec(htmlContent)) !== null) {
    faqItems.push({
      question: match[1],
      answer: match[2],
    })
  }

  return faqItems
}

// Sample FAQ items to use as fallback
const sampleFaqItems = [
  {
    question: "What documents do I need to rent a car?",
    answer:
      "You'll need a valid driver's license, a credit card in your name, and a form of identification such as a passport.",
  },
  {
    question: "Is there a security deposit required?",
    answer:
      "Yes, we require a security deposit which is refundable upon return of the vehicle in its original condition.",
  },
  {
    question: "Can I add an additional driver?",
    answer:
      "Yes, additional drivers can be added to your rental agreement for a small fee. They must be present with their driver's license at the time of rental.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Cancellations made 48 hours before the rental start time receive a full refund. Cancellations within 48 hours may be subject to a fee.",
  },
  {
    question: "Do you offer roadside assistance?",
    answer: "Yes, all our rentals include 24/7 roadside assistance for your peace of mind.",
  },
]

export default async function FaqPage() {
  let faqItems = sampleFaqItems
  let pageTitle = "Frequently Asked Questions"

  try {
    // Use the safe client that doesn't rely on cookies
    const supabase = createSafeClient()

    // Fetch FAQ page content
    const { data: content, error } = await supabase
      .from("content")
      .select("*")
      .eq("type", "faq")
      .eq("language", "en")
      .single()

    if (!error && content) {
      pageTitle = content.title || pageTitle
      // Parse FAQ items from the HTML content
      if (content.content) {
        const parsedItems = parseFaqContent(content.content)
        if (parsedItems.length > 0) {
          faqItems = parsedItems
        }
      }
    }
  } catch (error) {
    console.error("Error fetching FAQ content:", error)
    // Fall back to sample FAQ items
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <PageTracker pageTitle="FAQ - Frequently Asked Questions" />
      <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
