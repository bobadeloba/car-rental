// Helper functions for Meta Pixel events
type PixelEvent = {
  [key: string]: any
}

// Define window.fbq for TypeScript
declare global {
  interface Window {
    fbq: (type: string, eventName: string, params?: PixelEvent) => void
  }
}

// Track a standard event
const trackEvent = (eventName: string, params?: PixelEvent) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params)
  }
}

// Track a custom event
const trackCustomEvent = (eventName: string, params?: PixelEvent) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params)
  }
}

// Common events for car rental
export const pixelEvents = {
  // Standard events
  viewCar: (car: any) => {
    trackEvent("ViewContent", {
      content_type: "car",
      content_ids: [car.id],
      content_name: `${car.brand} ${car.name}`,
      content_category: car.category,
      value: car.price_per_day,
      currency: "USD",
    })
  },

  addToCart: (car: any, rentalDays: number) => {
    trackEvent("AddToCart", {
      content_type: "car",
      content_ids: [car.id],
      content_name: `${car.brand} ${car.name}`,
      value: car.price_per_day * rentalDays,
      currency: "USD",
      rental_days: rentalDays,
    })
  },

  initiateCheckout: (booking: any) => {
    trackEvent("InitiateCheckout", {
      content_type: "car",
      content_ids: [booking.car_id],
      value: booking.total_price,
      currency: "USD",
      num_items: 1,
    })
  },

  purchase: (booking: any) => {
    trackEvent("Purchase", {
      content_type: "car",
      content_ids: [booking.car_id],
      value: booking.total_price,
      currency: "USD",
      transaction_id: booking.id,
    })
  },

  // Custom events for car rental
  searchCars: (searchParams: any) => {
    trackCustomEvent("SearchCars", searchParams)
  },

  filterCars: (filters: any) => {
    trackCustomEvent("FilterCars", filters)
  },

  contactFormSubmit: () => {
    trackCustomEvent("ContactFormSubmit")
  },

  bookingStarted: (carId: string) => {
    trackCustomEvent("BookingStarted", { car_id: carId })
  },
}
