import { CarLoader } from "@/components/ui/car-loader"

export default function CarsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <CarLoader size="lg" />
      <p className="text-gray-500 animate-pulse">Finding the perfect car for you...</p>
    </div>
  )
}
