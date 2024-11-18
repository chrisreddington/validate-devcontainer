import { DevcontainerContent } from '../src/types'

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
