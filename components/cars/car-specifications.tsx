import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

interface CarSpecificationsProps {
  car?: any
  features?: any[]
  specs?: any
}

export default function CarSpecifications({ car, features = [], specs }: CarSpecificationsProps) {
  // Use either the provided specs or the car.specs if available
  const carSpecs = specs || car?.specs || {}

  // Define the specifications to display and their labels
  const specDefinitions = [
    { key: "bodystyle", label: "Body Style" },
    { key: "engine", label: "Engine" },
    { key: "engineVolume", label: "Engine Volume" },
    { key: "power", label: "Power" },
    { key: "transmission", label: "Transmission" },
    { key: "drivetrain", label: "Drivetrain" },
    { key: "seats", label: "Seats" },
    { key: "fuel", label: "Fuel Type" },
    { key: "acceleration", label: "Acceleration (0-100 km/h)" },
    { key: "topSpeed", label: "Top Speed" },
    { key: "speed", label: "Speed" },
  ]

  const getAllSpecs = (carSpecs) => {
    if (!carSpecs) return []

    // Get all predefined specs
    const predefinedSpecs = specDefinitions.filter((spec) => carSpecs[spec.key])

    // Get any additional specs from the car that aren't in our predefined list
    const additionalSpecs = Object.entries(carSpecs)
      .filter(
        ([key]) =>
          // Only include if it's not already in predefinedSpecs and not in our exclusion list
          !specDefinitions.some((spec) => spec.key === key) && !["optionalEquipment", "features", "id"].includes(key),
      )
      .map(([key, value]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        value,
      }))

    return [...predefinedSpecs, ...additionalSpecs]
  }

  // Process optional equipment to ensure it's in the right format
  const processOptionalEquipment = () => {
    if (!carSpecs?.optionalEquipment) return []

    // If it's already an array, return it
    if (Array.isArray(carSpecs.optionalEquipment)) {
      return carSpecs.optionalEquipment
    }

    // If it's a string, try to split it into an array
    if (typeof carSpecs.optionalEquipment === "string") {
      // Split by common separators that might be in the data
      return carSpecs.optionalEquipment
        .split(/[,;:]/)
        .map((item) => item.trim())
        .filter((item) => item) // Remove empty items
    }

    // If it's an object, convert to array of key-value pairs
    if (typeof carSpecs.optionalEquipment === "object") {
      return Object.entries(carSpecs.optionalEquipment).map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`)
    }

    return []
  }

  // Filter out specs that don't exist
  const availableSpecs = getAllSpecs(carSpecs)
  const optionalEquipment = processOptionalEquipment()

  // If no specs are available, show a message
  if (availableSpecs.length === 0 && (!features || features.length === 0) && optionalEquipment.length === 0) {
    return (
      <div className="py-4">
        <h2 className="text-lg font-semibold mb-4">Specifications</h2>
        <p className="text-gray-500">Specifications for this car are not available.</p>
      </div>
    )
  }

  // Split into two columns for better display
  const midpoint = Math.ceil(availableSpecs.length / 2)
  const leftColumnSpecs = availableSpecs.slice(0, midpoint)
  const rightColumnSpecs = availableSpecs.slice(midpoint)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Specifications</h2>

      {availableSpecs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Table>
            <TableBody>
              {leftColumnSpecs.map((spec) => (
                <TableRow key={spec.key} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="font-medium py-3">{spec.label}</TableCell>
                  <TableCell className="py-3 px-4">{spec.value || carSpecs[spec.key]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rightColumnSpecs.length > 0 && (
            <Table>
              <TableBody>
                {rightColumnSpecs.map((spec) => (
                  <TableRow key={spec.key} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="font-medium py-3">{spec.label}</TableCell>
                    <TableCell className="py-3 px-4">{spec.value || carSpecs[spec.key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Features/Optional Equipment */}
      {features && features.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature.name || feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional Equipment from specs if available */}
      {optionalEquipment.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Optional Equipment</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {optionalEquipment.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
