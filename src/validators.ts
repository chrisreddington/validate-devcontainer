import * as core from '@actions/core'
import { DevcontainerContent } from './types'

export function validateExtensions(
  devcontainerContent: DevcontainerContent,
  requiredExtensions: string[]
): string[] {
  core.debug(
    `Validating extensions (required input: ${requiredExtensions.join(', ')})`
  )
  const configuredExtensions =
    devcontainerContent?.customizations?.vscode?.extensions || []
  core.debug(
    `Extensions found in devcontainer: ${configuredExtensions.join(', ')}`
  )
  const missingExtensions = requiredExtensions.filter(
    required =>
      !configuredExtensions.some(
        configured => configured.toLowerCase() === required.toLowerCase()
      )
  )
  core.debug(
    `Required extensions missing from devcontainer: ${missingExtensions.length > 0 ? missingExtensions.join(', ') : 'none'}`
  )
  return missingExtensions
}

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

export function validateFeatures(
  devcontainerContent: DevcontainerContent,
  requiredFeatures: string[]
): string[] {
  core.debug(
    `Validating features (required input: ${requiredFeatures.join(', ')})`
  )
  if (!requiredFeatures || requiredFeatures.length === 0) {
    core.debug('No features specified in required-features input')
    return []
  }
  const configuredFeatures = devcontainerContent.features || {}
  core.debug(
    `Features found in devcontainer: ${Object.keys(configuredFeatures).join(', ')}`
  )
  const missingFeatures = requiredFeatures.filter(
    required => !(required in configuredFeatures)
  )
  return missingFeatures
}
