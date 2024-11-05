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
}

function validateExtensions(
  devcontainerContent: DevcontainerContent,
  requiredExtensions: string[]
): string[] {
  const configuredExtensions =
    devcontainerContent?.customizations?.vscode?.extensions || []
  const missingExtensions = requiredExtensions.filter(
    required =>
      !configuredExtensions.some(
        configured => configured.toLowerCase() === required.toLowerCase()
      )
  )
  return missingExtensions
}

function validateTasks(
  devcontainerContent: DevcontainerContent
): string | null {
  const tasks = devcontainerContent.tasks
  if (!tasks) {
    return "'tasks' property is missing"
  }

  const requiredTasks = ['build', 'test', 'run']
  const missingTasks = requiredTasks.filter(
    task => !tasks[task] || typeof tasks[task] !== 'string'
  )

  if (missingTasks.length > 0) {
    return `Missing or invalid required tasks: ${missingTasks.join(', ')}`
  }

  return null
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

  return true
}

export async function run(): Promise<void> {
  try {
    const extensionsList = core.getInput('extensions-list', { required: true })
    const devcontainerPath =
      core.getInput('devcontainer-path', { required: false }) ||
      '.devcontainer/devcontainer.json'
    const shouldValidateTasks = core.getInput('validate-tasks') === 'true'

    try {
      await fs.promises.access(devcontainerPath)
    } catch {
      throw new Error(`devcontainer.json not found at ${devcontainerPath}`)
    }

    // Update the JSON parse section with explicit type assertion
    const fileContent = await fs.promises.readFile(devcontainerPath, 'utf8')
    let parsedContent: unknown
    try {
      parsedContent = JSON.parse(fileContent) as unknown
    } catch (error) {
      throw new Error(
        `Invalid JSON in devcontainer.json: ${error instanceof Error ? error.message : String(error)}`
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

    core.info('All validations passed successfully')
  } catch (error: unknown) {
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
  DevcontainerContent,
  VSCodeCustomizations
}
