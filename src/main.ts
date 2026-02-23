import * as core from '@actions/core'
import * as fs from 'fs'
import {
  validateExtensions,
  validateTasks,
  validateFeatures
} from './validators.js'
import { isDevcontainerContent, stripJsonComments } from './utils.js'
import { DevcontainerContent, VSCodeCustomizations } from './types.js'

/**
 * Main execution function for the Dev Container validator action
 * Coordinates the validation workflow and handles errors
 * @throws Error if validation fails or if configuration is invalid
 */
export async function run(): Promise<void> {
  try {
    // Initialize validation parameters
    const {
      extensionsList,
      devcontainerPath,
      shouldValidateTasks,
      featuresListInput
    } = getInputParameters()

    // Read and parse devcontainer.json
    const devcontainerContent = await parseDevcontainerFile(devcontainerPath)

    // Perform validations
    validateConfiguration(
      devcontainerContent,
      extensionsList,
      shouldValidateTasks,
      featuresListInput
    )

    core.info('All validations passed successfully')
  } catch (error: unknown) {
    handleValidationError(error)
  }
}

/**
 * Retrieves and validates all GitHub Action input parameters
 * @returns Object containing validated input parameters
 * @throws Never - Invalid inputs are handled by @actions/core
 */
function getInputParameters(): {
  extensionsList: string
  devcontainerPath: string
  shouldValidateTasks: boolean
  featuresListInput: string
} {
  const extensionsList = core.getInput('required-extensions', {
    required: true
  })
  const devcontainerPath =
    core.getInput('devcontainer-path') || '.devcontainer/devcontainer.json'
  const shouldValidateTasks = core.getInput('validate-tasks') === 'true'
  const featuresListInput = core.getInput('required-features')

  core.debug(`Configuration:
    - Required extensions: ${extensionsList}
    - Devcontainer path: ${devcontainerPath}
    - Validate tasks: ${shouldValidateTasks}
    - Required features: ${featuresListInput || 'none'}
  `)

  return {
    extensionsList,
    devcontainerPath,
    shouldValidateTasks,
    featuresListInput
  }
}

/**
 * Parses and validates the devcontainer.json file
 * @param devcontainerPath - Path to the devcontainer.json file
 * @returns Parsed and validated DevcontainerContent object
 * @throws Error if file is not found, invalid JSON, or invalid structure
 */
async function parseDevcontainerFile(
  devcontainerPath: string
): Promise<DevcontainerContent> {
  try {
    await fs.promises.access(devcontainerPath)
    core.debug('Successfully located devcontainer.json file')
  } catch {
    throw new Error(`devcontainer.json not found at ${devcontainerPath}`)
  }

  const fileContent = await fs.promises.readFile(devcontainerPath, 'utf8')
  core.debug('Successfully read devcontainer.json content')

  let parsedContent: unknown
  try {
    const cleanJson = stripJsonComments(fileContent)
    core.debug('Stripped comments from JSON content')
    parsedContent = JSON.parse(cleanJson) as unknown
    core.debug('Successfully parsed JSON content')
  } catch (error) {
    throw new Error(
      `Invalid JSON in devcontainer.json: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error }
    )
  }

  if (!isDevcontainerContent(parsedContent)) {
    throw new Error('Invalid devcontainer.json structure')
  }

  return parsedContent
}

/**
 * Performs all validation checks on the devcontainer configuration
 * @param devcontainerContent - The parsed devcontainer configuration
 * @param extensionsList - Comma-separated list of required extensions
 * @param shouldValidateTasks - Whether to validate required tasks
 * @param featuresListInput - Optional comma-separated list of required features
 * @throws Error if any validation check fails
 */
function validateConfiguration(
  devcontainerContent: DevcontainerContent,
  extensionsList: string,
  shouldValidateTasks: boolean,
  featuresListInput?: string
): void {
  const requiredExtensions = extensionsList.split(',').map(ext => ext.trim())
  const missingExtensions = validateExtensions(
    devcontainerContent,
    requiredExtensions
  )

  if (missingExtensions.length > 0) {
    throw new Error(
      `Missing required extensions: ${missingExtensions.join(', ')}`
    )
  }

  if (shouldValidateTasks) {
    const tasksError = validateTasks(devcontainerContent)
    if (tasksError) {
      throw new Error(tasksError)
    }
  }

  if (featuresListInput) {
    const requiredFeatures = featuresListInput
      .split(',')
      .map(feature => feature.trim())
    const missingFeatures = validateFeatures(
      devcontainerContent,
      requiredFeatures
    )

    if (missingFeatures.length > 0) {
      throw new Error(
        `Missing required features: ${missingFeatures.join(', ')}`
      )
    }
  }
}

/**
 * Handles and formats validation errors for GitHub Actions output
 * @param error - The error to handle and report
 */
function handleValidationError(error: unknown): void {
  core.debug('An error occurred during validation')
  let errorMessage: string
  if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    errorMessage = 'An unknown error occurred'
  }
  core.setFailed(errorMessage)
}

export { validateExtensions, validateTasks, validateFeatures }
export type { DevcontainerContent, VSCodeCustomizations }
