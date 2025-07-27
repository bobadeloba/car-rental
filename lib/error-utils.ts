/**
 * Safely executes a function and returns a default value if it fails
 * @param fn Function to execute
 * @param defaultValue Default value to return if the function fails
 * @returns Result of the function or default value
 */
export async function safeExecute<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error("Error executing function:", error)
    return defaultValue
  }
}

/**
 * Safely parses JSON and returns a default value if parsing fails
 * @param jsonString JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed JSON or default value
 */
export function safeParseJSON<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return defaultValue
  }
}
