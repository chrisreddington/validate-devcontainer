import { DevcontainerContent } from './types.js'

/**
 * Type guard to validate the structure of a devcontainer.json file
 * Ensures the object conforms to the DevcontainerContent interface
 * @param obj - The object to validate
 * @returns Boolean indicating if the object is a valid DevcontainerContent
 * @throws Never - This function only returns boolean
 */
export function isDevcontainerContent(
  obj: unknown
): obj is DevcontainerContent {
  // Basic type checks
  if (typeof obj !== 'object' || obj === null) return false
  const candidate = obj as Partial<DevcontainerContent>

  // Validate VS Code customizations structure
  const hasValidCustomizations =
    !candidate.customizations ||
    (typeof candidate.customizations === 'object' &&
      Array.isArray(candidate.customizations.vscode?.extensions))
  if (!hasValidCustomizations) return false

  // Validate tasks structure
  const hasValidTasks =
    !candidate.tasks ||
    (typeof candidate.tasks === 'object' &&
      Object.values(candidate.tasks).every(value => typeof value === 'string'))
  if (!hasValidTasks) return false

  // Validate features structure
  const hasValidFeatures =
    !candidate.features ||
    (typeof candidate.features === 'object' &&
      Object.values(candidate.features).every(
        value => typeof value === 'object'
      ))
  if (!hasValidFeatures) return false

  return true
}

/**
 * Sanitizes JSON string by removing JavaScript-style comments
 * Handles single-line comments only (// style)
 * @param jsonString - Raw JSON string that may contain comments
 * @returns Clean JSON string with all comments removed
 * @throws Never - This function performs string manipulation only
 */
export function stripJsonComments(jsonString: string): string {
  return jsonString.replace(/\/\/.*$/gm, '')
}
