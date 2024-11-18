import * as core from '@actions/core'
import * as fs from 'fs'
import { run } from '../src/main'

jest.mock('@actions/core')
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn()
  },
  constants: {
    O_RDONLY: 0
  }
}))

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should validate successfully with valid devcontainer.json', async () => {
    const mockContent = {
      customizations: {
        vscode: {
          extensions: ['required-ext']
        }
      },
      tasks: {
        build: 'npm run build',
        test: 'npm test',
        run: 'npm start'
      }
    }

    // Mock inputs and file operations
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'required-extensions':
          return 'required-ext'
        case 'validate-tasks':
          return 'true'
        default:
          return ''
      }
    })
    ;(fs.promises.access as jest.Mock).mockResolvedValue(undefined)
    ;(fs.promises.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify(mockContent)
    )

    await run()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  // Add more integration tests as needed
})
