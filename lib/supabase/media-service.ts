import { createClientComponentClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Function to get a Supabase client for media operations
export const getMediaClient = () => {
  return createClientComponentClient()
}

export interface MediaMetadata {
  name?: string
  alt_text?: string
  category?: string
  width?: number
  height?: number
  position?: string
  is_active?: boolean
}

// Function to upload a media file
export async function uploadMedia(file: File, metadata: MediaMetadata = {}): Promise<{ url: string; media: any }> {
  const supabase = getMediaClient()

  // Generate a unique file name to avoid collisions
  const fileExt = file.name.split(".").pop()
  const uniqueId = uuidv4().substring(0, 8)
  const fileName = `${uniqueId}-${Date.now()}.${fileExt}`

  // Upload the file to the 'media' bucket
  const { data: uploadData, error: uploadError } = await supabase.storage.from("media").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })

  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName)

  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded file")
  }

  // Create image dimensions detector (for images only)
  let dimensions = {}
  if (file.type.startsWith("image/")) {
    try {
      const img = new Image()
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })

      await loadPromise
      dimensions = {
        width: img.width,
        height: img.height,
      }
      URL.revokeObjectURL(img.src)
    } catch (error) {
      console.warn("Could not determine image dimensions:", error)
    }
  }

  // Insert the media record into the database
  const { data: mediaData, error: dbError } = await supabase
    .from("media")
    .insert({
      name: metadata.name || file.name,
      file_path: publicUrlData.publicUrl,
      file_type: file.type,
      size: file.size,
      alt_text: metadata.alt_text || "",
      category: metadata.category || "general",
      is_active: metadata.is_active !== undefined ? metadata.is_active : true,
      position: metadata.position || null,
      ...dimensions,
    })
    .select()
    .single()

  if (dbError) {
    // If database insert fails, try to clean up the uploaded file
    console.error("Database error when inserting media record:", dbError)
    try {
      await supabase.storage.from("media").remove([fileName])
    } catch (cleanupError) {
      console.error("Failed to clean up orphaned file:", cleanupError)
    }
    throw new Error(`Failed to create media record: ${dbError.message}`)
  }

  return {
    url: publicUrlData.publicUrl,
    media: mediaData,
  }
}

// Function to delete a media file
export async function deleteMedia(id: string): Promise<{ success: boolean }> {
  const supabase = getMediaClient()

  // Get the file path first
  const { data: mediaData, error: fetchError } = await supabase.from("media").select("file_path").eq("id", id).single()

  if (fetchError) {
    throw new Error(`Media not found: ${fetchError.message}`)
  }

  // Extract the filename from the complete URL
  const url = new URL(mediaData.file_path)
  const pathParts = url.pathname.split("/")
  const filename = pathParts[pathParts.length - 1]

  // Delete from storage
  if (filename) {
    const { error: storageError } = await supabase.storage.from("media").remove([filename])

    if (storageError) {
      console.warn("Warning: Could not delete file from storage:", storageError)
    }
  }

  // Delete from database
  const { error: dbError } = await supabase.from("media").delete().eq("id", id)

  if (dbError) {
    throw new Error(`Failed to delete media record: ${dbError.message}`)
  }

  return { success: true }
}

// Function to get media by ID
export async function getMediaById(id: string) {
  const supabase = getMediaClient()

  const { data, error } = await supabase.from("media").select("*").eq("id", id).single()

  if (error) {
    throw error
  }

  return data
}

// Function to get all media with pagination and filtering
export async function getMedia({
  category = null,
  search = null,
  page = 1,
  limit = 20,
  sortBy = "created_at",
  sortOrder = "desc",
} = {}) {
  const supabase = getMediaClient()

  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from("media")
    .select("*", { count: "exact" })
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 0,
    },
  }
}

// Function to update media metadata
export async function updateMedia(id: string, updates: MediaMetadata) {
  const supabase = getMediaClient()

  const { data, error } = await supabase
    .from("media")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Function to get media categories
export async function getMediaCategories() {
  const supabase = getMediaClient()

  const { data, error } = await supabase.from("media_categories").select("*").order("name")

  if (error) {
    throw error
  }

  return data
}
