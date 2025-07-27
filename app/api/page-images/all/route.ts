import { NextResponse } from "next/server"
import { getAllPageImages } from "@/lib/page-images"

export async function GET() {
  try {
    const images = await getAllPageImages()
    return NextResponse.json(images)
  } catch (error: any) {
    console.error("Error fetching all page images:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
