// This is a utility script to find files with both metadata exports
// You can run it with: npx ts-node scripts/find-metadata-conflicts.ts

import fs from "fs"
import path from "path"

function findFilesWithBothMetadataExports(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findFilesWithBothMetadataExports(filePath, fileList)
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(filePath, "utf8")

      // Use regex instead of direct string matching to avoid triggering Next.js checks
      const hasStaticMetadata = /export\s+const\s+metadata/.test(content)
      const hasDynamicMetadata = /export\s+async\s+function\s+generateMetadata/.test(content)

      if (hasStaticMetadata && hasDynamicMetadata) {
        console.warn(`Conflict: ${filePath} has both static and dynamic metadata exports. Please remove one.`)
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

const appDir = path.join(process.cwd(), "app")
const files = findFilesWithBothMetadataExports(appDir)

console.log("Files with both metadata exports:")
if (files.length === 0) {
  console.log("No conflicts found!")
} else {
  files.forEach((file) => console.log(file))
}
