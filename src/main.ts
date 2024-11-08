import * as core from '@actions/core'
import * as fs from 'fs'

interface VSCodeCustomizations {
  vscode: {
    extensions: string[]
  }
}

interface DevcontainerContent {
  customizations?: VSCodeCustomizations
  tasks?: {
    [key: string]: string
  }
  features?: {
    [key: string]: object
  }
}

function validateExtensions(
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
    `Required extensions missing from devcontainer: ${
      missingExtensions.length > 0 ? missingExtensions.join(', ') : 'none'
    }`
  )
  return missingExtensions
}

function validateTasks(
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

function validateFeatures(
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

// Add this type guard function before the run() function
function isDevcontainerContent(obj: unknown): obj is DevcontainerContent {
  if (typeof obj !== 'object' || obj === null) return false

  const candidate = obj as Partial<DevcontainerContent>

  if (candidate.customizations !== undefined) {
    if (
      typeof candidate.customizations !== 'object' ||
      !candidate.customizations.vscode?.extensions
    ) {
      return false
    }
    if (!Array.isArray(candidate.customizations.vscode.extensions)) {
      return false
    }
  }

  if (candidate.tasks !== undefined) {
    if (typeof candidate.tasks !== 'object') return false
    for (const [, value] of Object.entries(candidate.tasks)) {
      if (typeof value !== 'string') return false
    }
  }

  if (candidate.features !== undefined) {
    if (typeof candidate.features !== 'object') return false
    for (const [, value] of Object.entries(candidate.features)) {
      if (typeof value !== 'object') return false
    }
  }

  return true
}

// Add this helper function to strip comments
function stripJsonComments(jsonString: string): string {
  // Remove single line comments (// ...)
  return jsonString.replace(/\/\/.*$/gm, '')
}

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

    // Strengthen type checking before using parsed content
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
