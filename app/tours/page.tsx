import TourCard, { type Tour } from "@/components/tours/tour-card"
import { generatePageMetadata } from "@/lib/metadata"
import Image from "next/image"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return generatePageMetadata(
    "Dubai Tours & Adventures",
    "Explore exciting tours and adventures in Dubai. Book your desert safari, city tours, and more.",
  )
}


const toursData: Tour[] = [
  {
    id: "1",
    title: "Sunset Safari With Premium Camp",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2024/03/sunset-desert-safari-dubai-with-live-bbq.png",
    pricePerPerson: "250 AED/Person",
    originalPrice: "300 AED",
    discountPercentage: 16,
    features: ["Pickup & Drop Off with 4x4 vehicle", "Sandboarding", "Modern Bedouin Camp", "Water and Soft Drinks"],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink:
      "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Sunset%20Safari%20With%20Premium%20Camp",
  },
  {
    id: "2",
    title: "Morning Adventure Safari (Private)",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2023/09/morning-min.jpg",
    pricePerPerson: "799 AED (1 to 6 Persons Same Price)",
    originalPrice: "900 AED",
    discountPercentage: 10,
    features: [
      "Pickup & Drop Off with 4x4 vehicle",
      "Amazing Photo Spots",
      "Try Sand Boarding in the Dunes",
      "Drive to the Big Red Dunes",
    ],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink: "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Morning%20Adventure%20Safari",
  },
  {
    id: "3",
    title: "Arabian Dune Buggy Adventure",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2023/11/IMG_6455-scaled.jpeg",
    pricePerPerson: "500 AED/Person",
    originalPrice: "800 AED",
    discountPercentage: 38,
    features: [
      "Self Drive to Meeting Point",
      "For Pickup & Drop (400 AED Extra)",
      "30 Minutes Dune Buggy",
      "Professional Guide",
    ],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink: "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Arabian%20Dune%20Buggy%20Adventure",
  },
  {
    id: "4",
    title: "Quad Bike Adventure",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2023/09/quad-bike-min.png",
    pricePerPerson: "299 AED/Person",
    originalPrice: "350 AED",
    discountPercentage: 5, // Estimated, image shows 5%
    features: ["Pickup & Drop Off with 4x4 vehicle", "30 Minutes Quad Bike", "Sandboarding", "Professional Guide"],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink: "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Quad%20Bike%20Adventure",
  },
  {
    id: "5",
    title: "Half Day Desert Experience",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2023/09/half-day-desert-min.png",
    pricePerPerson: "799 AED (1 to 6 Persons Same Price)",
    originalPrice: "900 AED",
    discountPercentage: 10,
    features: ["Pickup & Drop Off with 4x4 vehicle", "Sandboarding", "Camel Riding", "Water and Soft Drinks"],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink: "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Half%20Day%20Desert%20Experience",
  },
  {
    id: "6",
    title: "Camel Caravan Experience",
    imageSrc: "https://arabianluxurytours.com/wp-content/uploads/2023/12/Untitled-design-32.png",
    pricePerPerson: "299 AED/Person",
    originalPrice: "350 AED",
    discountPercentage: 5, // Estimated, image shows 5%
    features: [
      "Pickup & Drop Off with 4x4 vehicle",
      "45 Minutes Camel Ride",
      "Water and Soft Drinks",
      "Photo and Video (With your phone)",
    ],
    partnerLink: "https://arabianluxurytours.com/",
    whatsappLink: "https://wa.me/971566926653?text=I'm%20interested%20in%20the%20Camel%20Caravan%20Experience",
  },
]

export default function ToursPage() {
  const heroImageUrl = "https://arabianluxurytours.com/wp-content/uploads/2023/09/premumu-1-scaled.webp" // Generic tours hero

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="relative w-full h-64 md:h-80 mb-8">
        <Image
          src={heroImageUrl || "/placeholder.svg"}
          alt="Explore Dubai Tours and Adventures"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Dubai Tours & Adventures</h1>
            <p className="text-xl text-white max-w-2xl mx-auto px-4">
              Discover unforgettable experiences with our curated selection of tours.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
          Our Premier Tour Packages
        </h2>
        {toursData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toursData.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No tours available at the moment. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
