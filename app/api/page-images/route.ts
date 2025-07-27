import { NextResponse } from "next/server"
import { getAllPageImages, getPageImage } from "@/lib/page-images"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")

    if (page) {
      const pageImage = await getPageImage(page)
      return NextResponse.json(pageImage)
    } else {
      const allImages = await getAllPageImages()
      return NextResponse.json(allImages)
    }
  } catch (error: any) {
    console.error("Error fetching page images:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
