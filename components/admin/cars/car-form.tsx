"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { createCarSlug } from "@/lib/slug-utils"

// First, let's fetch the actual car data to see what columns exist
async function fetchCarColumns() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("cars").select().limit(1)
    if (error) {
      console.error("Error fetching car columns:", error)
      return null
    }
    if (data && data.length > 0) {
      return Object.keys(data[0])
    }
    return null
  } catch (error) {
    console.error("Error in fetchCarColumns:", error)
    return null
  }
}

interface Car {
  id: string
  name: string
  brand: string
  slug?: string
  details?: string
  price_per_day: number
  specs?: {
    fuel?: string
    power?: string
    seats?: number
    speed?: string
    engine?: string
    bodystyle?: string
    drivetrain?: string
    navigation?: boolean
    acceleration?: string
    transmission?: string
    engine_volume?: string
    optional_equipment?: string[]
  }
  status?: string
  images?: string[]
}

interface Category {
  id: string
  name: string
}

// Define a less strict Zod schema for car data
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  slug: z.string().optional(),
  details: z.string().optional(),
  price_per_day: z.coerce.number().nonnegative().default(0),
  specs: z
    .object({
      fuel: z.string().optional(),
      power: z.string().optional(),
      seats: z.coerce.number().int().nonnegative().optional(),
      speed: z.string().optional(),
      engine: z.string().optional(),
      bodystyle: z.string().optional(),
      drivetrain: z.string().optional(),
      navigation: z.boolean().optional().default(false),
      acceleration: z.string().optional(),
      transmission: z.string().optional(),
      engine_volume: z.string().optional(),
      optional_equipment: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
  status: z.string().optional().default("available"),
  images: z.array(z.string()).optional().default([]),
})

type FormValues = z.infer<typeof formSchema>

interface CarFormProps {
  car?: Car
}

// Export as default instead of named export
export default function CarForm({ car }: CarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEquipment, setNewEquipment] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [carColumns, setCarColumns] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [generatedSlug, setGeneratedSlug] = useState("")
  const { toast } = useToast()

  // Get Supabase client once for the component
  const supabase = getSupabaseClient()

  // Debug log to check if car prop is received correctly
  useEffect(() => {
    console.log("Car prop received:", car)
  }, [car])

  // Bodystyle options
  const bodystyleOptions = [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Coupe", label: "Coupe" },
    { value: "Convertible", label: "Convertible" },
    { value: "Hatchback", label: "Hatchback" },
    { value: "Wagon", label: "Wagon" },
    { value: "Van", label: "Van" },
    { value: "Truck", label: "Truck" },
  ]

  // Drivetrain options
  const drivetrainOptions = [
    { value: "Front-wheel drive", label: "Front-wheel drive" },
    { value: "Rear-wheel drive", label: "Rear-wheel drive" },
    { value: "All-wheel drive", label: "All-wheel drive" },
    { value: "Four-wheel drive", label: "Four-wheel drive" },
  ]

  // Fetch car columns to determine what fields actually exist
  useEffect(() => {
    async function getCarColumns() {
      try {
        const columns = await fetchCarColumns()
        if (columns) {
          setCarColumns(columns)
        }
      } catch (error) {
        console.error("Error fetching car columns:", error)
      }
    }

    getCarColumns()
  }, [])

  // Fetch categories and the car's current categories
  useEffect(() => {
    async function fetchCategoriesAndCarCategories() {
      setIsLoadingCategories(true)
      try {
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("id, name")

        if (categoriesError) {
          throw categoriesError
        }

        setCategories(categoriesData || [])

        // If we have a car, fetch its categories
        if (car?.id) {
          const { data: carCategoriesData, error: carCategoriesError } = await supabase
            .from("car_categories")
            .select("category_id")
            .eq("car_id", car.id)

          if (carCategoriesError) {
            console.error("Error fetching car categories:", carCategoriesError)
          } else if (carCategoriesData && carCategoriesData.length > 0) {
            const categoryIds = carCategoriesData.map((item) => item.category_id)
            setSelectedCategoryIds(categoryIds)
          }
        }
      } catch (error) {
        console.error("Error in fetchCategoriesAndCarCategories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Using default values.",
          variant: "destructive",
        })
        // Provide default categories as fallback
        setCategories([
          { id: "economy", name: "Economy" },
          { id: "compact", name: "Compact" },
          { id: "midsize", name: "Midsize" },
          { id: "suv", name: "SUV" },
          { id: "luxury", name: "Luxury" },
          { id: "van", name: "Van" },
          { id: "truck", name: "Truck" },
        ])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategoriesAndCarCategories()
  }, [car, toast, supabase])

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: car?.name ?? "",
      brand: car?.brand ?? "",
      slug: car?.slug ?? "",
      details: car?.details ?? "",
      price_per_day: car?.price_per_day ?? 0,
      specs: {
        fuel: car?.specs?.fuel ?? "",
        power: car?.specs?.power ?? "",
        seats: car?.specs?.seats ?? 0,
        speed: car?.specs?.speed ?? "",
        engine: car?.specs?.engine ?? "",
        bodystyle: car?.specs?.bodystyle ?? "",
        drivetrain: car?.specs?.drivetrain ?? "",
        navigation: car?.specs?.navigation ?? false,
        acceleration: car?.specs?.acceleration ?? "",
        transmission: car?.specs?.transmission ?? "",
        engine_volume: car?.specs?.engine_volume ?? "",
        optional_equipment: car?.specs?.optional_equipment ?? [],
      },
      status: car?.status ?? "available",
      images: car?.images ?? [],
    },
  })

  // Watch brand and name changes to generate slug
  const watchedBrand = form.watch("brand")
  const watchedName = form.watch("name")

  useEffect(() => {
    if (watchedBrand && watchedName && !car?.id) {
      const newSlug = createCarSlug(watchedBrand, watchedName)
      setGeneratedSlug(newSlug)
      form.setValue("slug", newSlug)
    }
  }, [watchedBrand, watchedName, car?.id, form])

  // Ensure form is properly reset with car data
  useEffect(() => {
    if (car) {
      form.reset({
        name: car.name ?? "",
        brand: car.brand ?? "",
        slug: car.slug ?? "",
        details: car.details ?? "",
        price_per_day: car.price_per_day ?? 0,
        specs: {
          fuel: car.specs?.fuel ?? "",
          power: car.specs?.power ?? "",
          seats: car.specs?.seats ?? 0,
          speed: car.specs?.speed ?? "",
          engine: car.specs?.engine ?? "",
          bodystyle: car.specs?.bodystyle ?? "",
          drivetrain: car.specs?.drivetrain ?? "",
          navigation: car.specs?.navigation ?? false,
          acceleration: car.specs?.acceleration ?? "",
          transmission: car.specs?.transmission ?? "",
          engine_volume: car.specs?.engine_volume ?? "",
          optional_equipment: car.specs?.optional_equipment ?? [],
        },
        status: car.status ?? "available",
        images: car.images ?? [],
      })
    }
  }, [car, form])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const addEquipment = () => {
    if (newEquipment.trim()) {
      const currentEquipment = form.getValues("specs.optional_equipment") || []
      form.setValue("specs.optional_equipment", [...currentEquipment, newEquipment.trim()], {
        shouldValidate: false,
      })
      setNewEquipment("")
    }
  }

  const removeEquipment = (index: number) => {
    const currentEquipment = form.getValues("specs.optional_equipment") || []
    const newEquipment = [...currentEquipment]
    newEquipment.splice(index, 1)
    form.setValue("specs.optional_equipment", newEquipment, {
      shouldValidate: false,
    })
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      const currentImages = form.getValues("images") || []
      form.setValue("images", [...currentImages, newImageUrl.trim()], {
        shouldValidate: false,
      })
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    const newImages = [...currentImages]
    newImages.splice(index, 1)
    form.setValue("images", newImages, {
      shouldValidate: false,
    })
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Only include fields that exist in the database
      const dataToSubmit: Record<string, any> = {}

      // Always include these required fields
      dataToSubmit.name = values.name
      dataToSubmit.brand = values.brand
      dataToSubmit.price_per_day = values.price_per_day

      // Generate slug if not provided
      if (!values.slug && values.brand && values.name) {
        values.slug = createCarSlug(values.brand, values.name)
      }

      // Only include optional fields if they exist in the database
      if (carColumns.includes("slug")) dataToSubmit.slug = values.slug
      if (carColumns.includes("details")) dataToSubmit.details = values.details
      if (carColumns.includes("specs")) dataToSubmit.specs = values.specs
      if (carColumns.includes("status")) dataToSubmit.status = values.status
      if (carColumns.includes("images")) dataToSubmit.images = values.images || []

      let carId: string

      if (car?.id) {
        // Update existing car
        const { error } = await supabase.from("cars").update(dataToSubmit).eq("id", car.id)

        if (error) {
          throw error
        }

        carId = car.id
      } else {
        // Create new car
        const { data, error } = await supabase.from("cars").insert([dataToSubmit]).select()

        if (error) {
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error("Failed to create car")
        }

        carId = data[0].id
      }

      // Handle category relationships
      if (selectedCategoryIds.length > 0) {
        // First, remove any existing category relationships for this car
        if (car?.id) {
          const { error: deleteError } = await supabase.from("car_categories").delete().eq("car_id", carId)

          if (deleteError) {
            console.error("Error deleting existing categories:", deleteError)
          }
        }

        // Then add the new category relationships
        const categoryRelationships = selectedCategoryIds.map((categoryId) => ({
          car_id: carId,
          category_id: categoryId,
        }))

        const { error: categoryError } = await supabase.from("car_categories").insert(categoryRelationships)

        if (categoryError) {
          console.error("Error updating car categories:", categoryError)
          toast({
            title: "Warning",
            description: "Car saved but categories could not be updated.",
            variant: "destructive",
          })
        }
      } else if (car?.id) {
        // If no categories are selected, remove any existing category relationships
        await supabase.from("car_categories").delete().eq("car_id", carId)
      }

      toast({
        title: car ? "Car updated" : "Car added",
        description: car ? "The car has been successfully updated." : "The new car has been successfully added.",
      })

      router.push("/admin/cars")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving car:", error)
      setFormError(error.message || "Failed to save car. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to save car. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formError && (
          <Card className="border-red-500">
            <CardContent className="pt-6 text-red-500">
              <p>{formError}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. toyota-camry"
                      {...field}
                      disabled={!car?.id} // Only allow editing for existing cars
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    {!car?.id && generatedSlug && `Auto-generated: ${generatedSlug}`}
                    {car?.id && "Edit carefully - changing this will change the car's URL"}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the car..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <Label>Categories (Select multiple)</Label>
                <div className="mt-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategoryIds.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="price_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specs Section */}
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Car Specifications</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specs.fuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gasoline">Gasoline</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 770 hp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="specs.seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Speed</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 350 km/h" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="specs.engine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. V12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.engine_volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Volume</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 6.5L" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="specs.bodystyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bodystyleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.drivetrain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drivetrain</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drivetrain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivetrainOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="specs.acceleration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceleration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2.8s 0-100 km/h" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specs.transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 7-speed automatic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="specs.navigation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Navigation System</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="specs.optional_equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional Equipment</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Carbon fiber interior"
                            value={newEquipment}
                            onChange={(e) => setNewEquipment(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addEquipment()
                              }
                            }}
                          />
                          <Button type="button" onClick={addEquipment} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-2">
                          {(field.value || []).map((equipment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2"
                            >
                              <span>{equipment}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeEquipment(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "available"}
                    defaultValue={field.value || "available"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Car Images</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addImage()
                          }
                        }}
                      />
                      <Button type="button" onClick={addImage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2">
                      {(field.value || []).map((image, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2"
                        >
                          <span className="text-sm truncate max-w-[300px]">{image}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview section for images */}
            {form.watch("images")?.length > 0 && (
              <div className="space-y-2">
                <Label>Image Previews</Label>
                <div className="grid grid-cols-2 gap-4">
                  {form.watch("images").map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Car image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
                          ;(e.target as HTMLImageElement).alt = "Image failed to load"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/cars")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {car ? "Update Car" : "Add Car"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
