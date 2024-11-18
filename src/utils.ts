import { DevcontainerContent } from './types'

export function isDevcontainerContent(
  obj: unknown
): obj is DevcontainerContent {
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

export function stripJsonComments(jsonString: string): string {
  return jsonString.replace(/\/\/.*$/gm, '')
}
