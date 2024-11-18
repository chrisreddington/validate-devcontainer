import * as core from '@actions/core'
import * as fs from 'fs'
import {
  validateExtensions,
  validateTasks,
  validateFeatures
} from './validators'
import { isDevcontainerContent, stripJsonComments } from './utils'
import { DevcontainerContent, VSCodeCustomizations } from './types'

export async function run(): Promise<void> {
  try {
    core.debug('Starting devcontainer validation')
    const extensionsList = core.getInput('required-extensions', {
      required: true
    })
    core.debug(`Required extensions input: ${extensionsList}`)

    const devcontainerPath =
      core.getInput('devcontainer-path', { required: false }) ||
      '.devcontainer/devcontainer.json'
    core.debug(`Using devcontainer path: ${devcontainerPath}`)

    const shouldValidateTasks = core.getInput('validate-tasks') === 'true'
    core.debug(`Task validation enabled: ${shouldValidateTasks}`)

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
        }`
      )
    }

    if (!isDevcontainerContent(parsedContent)) {
      throw new Error('Invalid devcontainer.json structure')
    }

    // Now parsedContent is safely typed as DevcontainerContent
    const devcontainerContent: DevcontainerContent = parsedContent

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

    const featuresListInput = core.getInput('required-features', {
      required: false
    })
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

    core.info('All validations passed successfully')
  } catch (error: unknown) {
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
}

export {
  validateExtensions,
  validateTasks,
  validateFeatures,
  DevcontainerContent,
  VSCodeCustomizations
}
