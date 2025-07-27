"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"

interface CarViewsTableProps {
  data: Array<{
    id: string
    name: string
    brand: string
    model: string
    image_url: string
    total_views: number
    views_last_7_days: number
    views_last_30_days: number
    last_viewed_at: string | null
  }>
}

export default function CarViewsTable({ data }: CarViewsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("total_views")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showAll, setShowAll] = useState(false)

  const filteredData = data
    .filter(
      (car) =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number
      const bValue = b[sortBy as keyof typeof b] as number
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue
    })

  const displayData = showAll ? filteredData : filteredData.slice(0, 10)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Car Views Details
            </CardTitle>
            <CardDescription>Detailed viewing statistics for all cars</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_views">Total Views</SelectItem>
                <SelectItem value="views_last_7_days">7 Days</SelectItem>
                <SelectItem value="views_last_30_days">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Car</th>
                  <th
                    className="text-right p-2 cursor-pointer hover:bg-muted/50 rounded"
                    onClick={() => handleSort("total_views")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Total Views
                      {sortBy === "total_views" &&
                        (sortOrder === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-right p-2 cursor-pointer hover:bg-muted/50 rounded"
                    onClick={() => handleSort("views_last_7_days")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      7 Days
                      {sortBy === "views_last_7_days" &&
                        (sortOrder === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-right p-2 cursor-pointer hover:bg-muted/50 rounded"
                    onClick={() => handleSort("views_last_30_days")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      30 Days
                      {sortBy === "views_last_30_days" &&
                        (sortOrder === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th className="text-left p-2">Last Viewed</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((car, index) => (
                  <tr key={car.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-2">
                      <Badge
                        variant={index < 3 ? "default" : "secondary"}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-8 flex-shrink-0">
                          <Image
                            src={car.image_url || "/placeholder.svg?width=48&height=32"}
                            alt={`${car.brand} ${car.name}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            {car.brand} {car.name}
                          </div>
                          {car.model && <div className="text-sm text-muted-foreground">{car.model}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-right font-bold">{car.total_views.toLocaleString()}</td>
                    <td className="p-2 text-right">{car.views_last_7_days}</td>
                    <td className="p-2 text-right">{car.views_last_30_days}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {car.last_viewed_at ? new Date(car.last_viewed_at).toLocaleDateString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {displayData.map((car, index) => (
            <div key={car.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Badge
                  variant={index < 3 ? "default" : "secondary"}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  {index + 1}
                </Badge>

                <div className="relative w-16 h-12 flex-shrink-0">
                  <Image
                    src={car.image_url || "/placeholder.svg?width=64&height=48"}
                    alt={`${car.brand} ${car.name}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-medium truncate">
                    {car.brand} {car.name}
                  </h4>
                  {car.model && <p className="text-sm text-muted-foreground truncate">{car.model}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{car.total_views.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{car.views_last_7_days}</div>
                  <div className="text-xs text-muted-foreground">7 Days</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{car.views_last_30_days}</div>
                  <div className="text-xs text-muted-foreground">30 Days</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Last viewed: {car.last_viewed_at ? new Date(car.last_viewed_at).toLocaleDateString() : "Never"}
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {filteredData.length > 10 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="w-full sm:w-auto">
              {showAll ? "Show Less" : `Show All ${filteredData.length} Cars`}
            </Button>
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No cars found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
