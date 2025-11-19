import * as core from '@actions/core'
import * as fs from 'fs'
import { run } from '../src/main'
import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  type MockInstance
} from 'vitest'

vi.mock('@actions/core')
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn()
  },
  constants: {
    O_RDONLY: 0
  }
}))

// Mock types
let mockGetInput: MockInstance<typeof core.getInput>

/**
 * Test suite for the GitHub Action's main functionality.
 * Tests the complete validation workflow including:
 * - File operations
 * - JSON parsing
 * - Configuration validation
 * - Error handling
 */
describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetInput = vi.spyOn(core, 'getInput')
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})
  })

  /**
   * Positive test cases for successful validation scenarios
   */
  describe('successful validation', () => {
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
      mockGetInput.mockImplementation(name => {
        switch (name) {
          case 'required-extensions':
            return 'required-ext'
          case 'validate-tasks':
            return 'true'
          default:
            return ''
        }
      })
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(mockContent)
      )

      await run()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })

  /**
   * Tests for file system related error handling
   */
  describe('file handling errors', () => {
    test('should throw error when devcontainer.json is not found', async () => {
      mockGetInput.mockImplementation(name => {
        if (name === 'required-extensions') return 'ext1'
        return ''
      })
      vi.spyOn(fs.promises, 'access').mockRejectedValue(
        new Error('File not found')
      )

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('devcontainer.json not found')
      )
    })

    test('should throw error when JSON is invalid', async () => {
      mockGetInput.mockReturnValue('ext1')
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue('invalid json')

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Invalid JSON')
      )
    })
  })

  /**
   * Tests for validation error scenarios
   */
  describe('validation errors', () => {
    test('should throw error when devcontainer structure is invalid', async () => {
      const invalidContent = {
        customizations: {
          vscode: {
            extensions: 'not-an-array'
          }
        }
      }

      mockGetInput.mockReturnValue('ext1')
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(invalidContent)
      )

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        'Invalid devcontainer.json structure'
      )
    })

    test('should throw error when required extensions are missing', async () => {
      const content = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        }
      }

      mockGetInput.mockImplementation(name => {
        if (name === 'required-extensions') return 'ext1,ext2'
        return ''
      })
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(content)
      )

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Missing required extensions')
      )
    })
  })

  /**
   * Tests for feature validation functionality
   */
  describe('feature validation', () => {
    test('should validate features when required-features input is provided', async () => {
      const content = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        },
        features: {
          feature1: {}
        }
      }

      mockGetInput.mockImplementation(name => {
        if (name === 'required-extensions') return 'ext1'
        if (name === 'required-features') return 'feature1,feature2'
        return ''
      })
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(content)
      )

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Missing required features')
      )
    })

    test('should skip feature validation when required-features input is empty', async () => {
      const content = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        }
      }

      mockGetInput.mockImplementation(name => {
        if (name === 'required-extensions') return 'ext1'
        if (name === 'required-features') return ''
        return ''
      })
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(content)
      )

      await run()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })

  /**
   * Tests for task validation functionality
   */
  describe('task validation', () => {
    test('should handle task validation when enabled', async () => {
      const content = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        },
        tasks: {
          build: 'npm build'
          // missing test and run tasks
        }
      }

      mockGetInput.mockImplementation(name => {
        if (name === 'required-extensions') return 'ext1'
        if (name === 'validate-tasks') return 'true'
        return ''
      })
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(content)
      )

      await run()
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('Missing or invalid required tasks')
      )
    })
  })

  /**
   * Tests for general error handling scenarios
   */
  describe('error handling', () => {
    test('should handle unknown errors correctly', async () => {
      // Create an object that matches Error interface but isn't an Error instance
      const errorLike = {
        name: 'CustomError',
        message: 'Custom error message',
        toString(): string {
          return this.message
        }
      } as Error

      mockGetInput.mockImplementation(() => {
        throw errorLike
      })

      await run()
      expect(core.setFailed).toHaveBeenCalledWith('An unknown error occurred')
    })

    test('should handle string errors correctly', async () => {
      mockGetInput.mockReturnValue('ext1')
      vi.spyOn(fs.promises, 'access').mockResolvedValue(undefined)
      vi.spyOn(fs.promises, 'readFile').mockRejectedValue(
        'String error message'
      )

      await run()

      expect(core.setFailed).toHaveBeenCalledWith('String error message')
    })
  })
})
