import { DevcontainerContent } from '../src/types.js'

/**
 * Creates a mock devcontainer configuration for testing purposes.
 * Provides a default configuration with common settings that can be overridden.
 *
 * Default configuration includes:
 * - Empty VS Code extensions list
 * - Standard npm-based tasks (build, test, run)
 * - Empty features object
 *
 * @param options - Partial devcontainer content to override default values
 * @returns A complete DevcontainerContent object with merged default and custom values
 */
export function createMockDevcontainer(
  options: Partial<DevcontainerContent> = {}
): DevcontainerContent {
  return {
    customizations: {
      vscode: {
        extensions: []
      }
    },
    tasks: {
      build: 'npm run build',
      test: 'npm test',
      run: 'npm start'
    },
    features: {},
    ...options
  }
}
