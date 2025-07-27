import { CarSpinner } from "@/components/ui/car-spinner"

export default function CarDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CarSpinner size="lg" />
        <p className="text-gray-500 animate-pulse">Preparing your luxury car details...</p>
      </div>
    </div>
  )
}
