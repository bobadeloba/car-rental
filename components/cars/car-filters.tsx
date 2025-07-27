"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useMediaQuery } from "react-responsive"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input" // Import Input component
import { formatCurrency } from "@/lib/utils"
import { FilterIcon, XIcon } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface CarFiltersProps {
  brands: string[]
  categories: Category[]
  selectedCategory?: string
  selectedBrand?: string
  minPrice?: number
  maxPrice?: number
  lowestPrice: number
  highestPrice: number
  sortBy?: string
}

export default function CarFilters({
  brands,
  categories,
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  lowestPrice,
  highestPrice,
  sortBy,
}: CarFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isSmallScreen = useMediaQuery({ query: "(max-width: 1023px)" })

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice || lowestPrice, maxPrice || highestPrice])
  const [localCategory, setLocalCategory] = useState<string>(selectedCategory || "all")
  const [localBrand, setLocalBrand] = useState<string>(selectedBrand || "all")
  const [localSortBy, setLocalSortBy] = useState<string>(sortBy || "name-asc")

  const [localMinPriceInput, setLocalMinPriceInput] = useState((minPrice || lowestPrice).toString())
  const [localMaxPriceInput, setLocalMaxPriceInput] = useState((maxPrice || highestPrice).toString())

  useEffect(() => {
    setLocalCategory(selectedCategory || "all")
    setLocalBrand("all")
    setPriceRange([minPrice || lowestPrice, maxPrice || highestPrice])
    setLocalSortBy(sortBy || "name-asc")
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, lowestPrice, highestPrice, sortBy])

  useEffect(() => {
    setLocalMinPriceInput(priceRange[0].toString())
    setLocalMaxPriceInput(priceRange[1].toString())
  }, [priceRange])

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })
    return newSearchParams.toString()
  }

  const applyFiltersInternal = () => {
    const queryString = createQueryString({
      category: localCategory && localCategory !== "all" ? localCategory : null,
      brand: localBrand && localBrand !== "all" ? localBrand : null,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      sortBy: localSortBy,
    })
    router.push(`${pathname}?${queryString}`)
  }

  const resetFiltersInternal = () => {
    setLocalCategory("all")
    setLocalBrand("all")
    setPriceRange([lowestPrice, highestPrice])
    setLocalSortBy("name-asc")
    router.push(pathname)
  }

  const handleApplyFilters = () => {
    applyFiltersInternal()
    if (isSmallScreen) {
      setIsMobileFiltersOpen(false)
    }
  }

  const handleResetFilters = () => {
    resetFiltersInternal()
    if (isSmallScreen) {
      setIsMobileFiltersOpen(false)
    }
  }

  const commitPriceInput = (index: 0 | 1) => {
    const rawValue = index === 0 ? localMinPriceInput : localMaxPriceInput
    let val = Number.parseInt(rawValue, 10)

    let newMin = priceRange[0]
    let newMax = priceRange[1]

    if (index === 0) {
      // Min input blurred
      val = isNaN(val) ? lowestPrice : Math.max(lowestPrice, Math.min(val, highestPrice))
      newMin = val
      if (newMin > newMax) {
        newMax = newMin // Max catches up to new Min, clamped by overall highest
        newMax = Math.min(newMax, highestPrice)
      }
    } else {
      // Max input blurred
      val = isNaN(val) ? highestPrice : Math.max(lowestPrice, Math.min(val, highestPrice))
      newMax = val
      if (newMax < newMin) {
        newMin = newMax // Min catches down to new Max, clamped by overall lowest
        newMin = Math.max(newMin, lowestPrice)
      }
    }
    setPriceRange([newMin, newMax])
  }

  const filterUI = (
    <>
      <Accordion
        type="multiple"
        defaultValue={["category", "brand", "price", "sort"]}
        className="space-y-2 sm:space-y-4"
      >
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm sm:text-base font-medium py-2 sm:py-3 hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <Select value={localCategory} onValueChange={setLocalCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger className="text-sm sm:text-base font-medium py-2 sm:py-3 hover:no-underline">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <Select value={localBrand} onValueChange={setLocalBrand}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brandName) => (
                  <SelectItem key={brandName} value={brandName}>
                    {brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm sm:text-base font-medium py-2 sm:py-3 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={lowestPrice}
                max={highestPrice}
                step={10} // Or your preferred step
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                <span>{formatCurrency(priceRange[0])}</span>
                <span>{formatCurrency(priceRange[1])}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
                <div>
                  <label htmlFor="minPriceInput" className="sr-only">
                    Minimum Price
                  </label>
                  <Input
                    id="minPriceInput"
                    type="number"
                    value={localMinPriceInput}
                    onChange={(e) => setLocalMinPriceInput(e.target.value)}
                    onBlur={() => commitPriceInput(0)}
                    min={lowestPrice}
                    max={highestPrice}
                    step={10}
                    className="w-full text-sm h-9"
                    placeholder={`Min: ${formatCurrency(lowestPrice)}`}
                  />
                </div>
                <span className="text-gray-500 dark:text-gray-400">–</span>
                <div>
                  <label htmlFor="maxPriceInput" className="sr-only">
                    Maximum Price
                  </label>
                  <Input
                    id="maxPriceInput"
                    type="number"
                    value={localMaxPriceInput}
                    onChange={(e) => setLocalMaxPriceInput(e.target.value)}
                    onBlur={() => commitPriceInput(1)}
                    min={lowestPrice}
                    max={highestPrice}
                    step={10}
                    className="w-full text-sm h-9"
                    placeholder={`Max: ${formatCurrency(highestPrice)}`}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger className="text-sm sm:text-base font-medium py-2 sm:py-3 hover:no-underline">
            Sort By
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={localSortBy}
              onValueChange={(value) => {
                setLocalSortBy(value)
                if (!isSmallScreen) {
                  const queryString = createQueryString({
                    category: localCategory && localCategory !== "all" ? localCategory : null,
                    brand: localBrand && localBrand !== "all" ? localBrand : null,
                    minPrice: priceRange[0].toString(),
                    maxPrice: priceRange[1].toString(),
                    sortBy: value,
                  })
                  router.push(`${pathname}?${queryString}`)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="brand-asc">Brand (A-Z)</SelectItem>
                <SelectItem value="brand-desc">Brand (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
        <Button onClick={handleApplyFilters} className="w-full text-sm sm:text-base py-2 sm:py-3">
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="w-full text-sm sm:text-base py-2 sm:py-3">
          Reset Filters
        </Button>
      </div>
    </>
  )

  if (isSmallScreen) {
    return (
      <>
        <Button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="fixed bottom-20 right-5 z-40 p-4 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 lg:hidden"
          size="icon"
          aria-label="Open filters"
        >
          <FilterIcon className="h-6 w-6" />
        </Button>

        {isMobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
          >
            <div
              className="fixed inset-x-0 bottom-0 w-full max-h-[85vh] bg-background p-5 shadow-xl rounded-t-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h2 id="filter-panel-title" className="text-xl font-semibold">
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {filterUI}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full lg:sticky lg:top-24 lg:max-w-sm mb-6 lg:mb-0 p-4 sm:p-6 hidden lg:block">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Filters</h2>
      </div>
      {filterUI}
    </div>
  )
}
