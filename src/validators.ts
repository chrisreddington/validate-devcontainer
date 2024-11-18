import * as core from '@actions/core'
import { DevcontainerContent } from './types'

/**
 * Validates the presence of required VS Code extensions in the devcontainer configuration
 * @param devcontainerContent - The parsed devcontainer.json content
 * @param requiredExtensions - Array of extension IDs that must be present
 * @returns Array of extension IDs that are missing from the configuration
 */
export function validateExtensions(
  devcontainerContent: DevcontainerContent,
  requiredExtensions: string[]
): string[] {
  // Extract configured extensions with fallback to empty array
  const configuredExtensions =
    devcontainerContent?.customizations?.vscode?.extensions || []

  // Log validation context
  core.debug(
    `Validating against required extensions: ${requiredExtensions.join(', ')}`
  )
  core.debug(`Found configured extensions: ${configuredExtensions.join(', ')}`)

  // Perform case-insensitive comparison to find missing extensions
  const missingExtensions = requiredExtensions.filter(required => {
    const requiredLower = required.toLowerCase()
    return !configuredExtensions.some(
      configured => configured.toLowerCase() === requiredLower
    )
  })

  // Log validation results
  const resultMessage =
    missingExtensions.length > 0
      ? `Missing: ${missingExtensions.join(', ')}`
      : 'All required extensions present'
  core.debug(resultMessage)

  return missingExtensions
}

/**
 * Validates the presence and configuration of required development tasks
 * Checks for 'build', 'test', and 'run' tasks with proper string commands
 * @param devcontainerContent - The parsed devcontainer.json content
 * @returns Error message if validation fails, null if successful
 */
export function validateTasks(
  devcontainerContent: DevcontainerContent
): string | null {
  core.debug('Validating required tasks (build, test, run)')
  const tasks = devcontainerContent.tasks
  if (!tasks) {
    core.debug('No tasks section found in devcontainer')
    return "'tasks' property is missing"
  }

  core.debug(
    `Tasks configured in devcontainer: ${Object.keys(tasks).join(', ')}`
  )
  const requiredTasks = ['build', 'test', 'run']
  const missingTasks = requiredTasks.filter(
    task => !tasks[task] || typeof tasks[task] !== 'string'
  )

  if (missingTasks.length > 0) {
    return `Missing or invalid required tasks: ${missingTasks.join(', ')}`
  }

  return null
}

/**
 * Validates the presence of required Dev Container features
 * @param devcontainerContent - The parsed devcontainer.json content
 * @param requiredFeatures - Array of feature identifiers that must be present
 * @returns Array of feature identifiers that are missing from the configuration
 */
export function validateFeatures(
  devcontainerContent: DevcontainerContent,
  requiredFeatures: string[]
): string[] {
  if (!requiredFeatures || requiredFeatures.length === 0) {
    core.debug('No features specified in required-features input')
    return []
  }

  core.debug(
    `Validating features (required input: ${requiredFeatures.join(', ')})`
  )
  const configuredFeatures = devcontainerContent.features || {}
  core.debug(
    `Features found in devcontainer: ${Object.keys(configuredFeatures).join(', ')}`
  )
  const missingFeatures = requiredFeatures.filter(
    required => !(required in configuredFeatures)
  )
  return missingFeatures
}
