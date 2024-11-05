const core = require('@actions/core')
const main = require('../src/main')
const fs = require('fs')

// Mock fs module with constants and promises
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    access: jest.fn(),
    appendFile: jest.fn(),
    writeFile: jest.fn()
  },
  constants: {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    S_IFMT: 0o170000,
    S_IFREG: 0o100000,
    S_IFDIR: 0o040000,
    S_IFCHR: 0o020000,
    S_IFBLK: 0o060000,
    S_IFIFO: 0o010000,
    S_IFLNK: 0o120000,
    S_IFSOCK: 0o140000,
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1
  }
}))

const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const infoMock = jest.spyOn(core, 'info').mockImplementation()

describe('devcontainer-validator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateExtensions', () => {
    it('should return empty array when all extensions are present', () => {
      const devcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['ext1', 'ext2', 'ext3']
          }
        }
      }
      const requiredExtensions = ['ext1', 'ext2']

      const result = main.validateExtensions(
        devcontainerContent,
        requiredExtensions
      )
      expect(result).toEqual([])
    })

    it('should return missing extensions when some are not configured', () => {
      const devcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        }
      }
      const requiredExtensions = ['ext1', 'ext2', 'ext3']
      const result = main.validateExtensions(
        devcontainerContent,
        requiredExtensions
      )
      expect(result).toEqual(['ext2', 'ext3'])
    })

    it('should handle empty extensions configuration', () => {
      const devcontainerContent = {
        customizations: {
          vscode: {
            extensions: []
          }
        }
      }
      const requiredExtensions = ['ext1', 'ext2']

      const result = main.validateExtensions(
        devcontainerContent,
        requiredExtensions
      )
      expect(result).toEqual(['ext1', 'ext2'])
    })

    it('should match extensions case insensitively', () => {
      const devcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['EXT1', 'eXt2', 'ExT3']
          }
        }
      }
      const requiredExtensions = ['ext1', 'EXT2', 'exT3']

      const result = main.validateExtensions(
        devcontainerContent,
        requiredExtensions
      )
      expect(result).toEqual([])
    })

    it('should report missing extensions case insensitively', () => {
      const devcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['EXT1']
          }
        }
      }
      const requiredExtensions = ['ext1', 'EXT2', 'exT3']
      const result = main.validateExtensions(
        devcontainerContent,
        requiredExtensions
      )
      expect(result).toEqual(['EXT2', 'exT3'])
    })
  })

  describe('validateTasks', () => {
    it('should return null when all required tasks are present', () => {
      const devcontainerContent = {
        tasks: {
          build: 'go build .',
          test: 'go test ./...',
          run: 'go run .'
        }
      }

      const result = main.validateTasks(devcontainerContent)
      expect(result).toBeNull()
    })

    it('should return error when tasks property is missing', () => {
      const devcontainerContent = {}

      const result = main.validateTasks(devcontainerContent)
      expect(result).toBe("'tasks' property is missing")
    })

    it('should return error when required tasks are missing', () => {
      const devcontainerContent = {
        tasks: {
          build: 'go build .',
          test: 'go test ./...'
        }
      }

      const result = main.validateTasks(devcontainerContent)
      expect(result).toBe('Missing or invalid required tasks: run')
    })

    it('should return error when tasks are not strings', () => {
      const devcontainerContent = {
        tasks: {
          build: ['go build .'],
          test: 'go test ./...',
          run: 'go run .'
        }
      }

      const result = main.validateTasks(devcontainerContent)
      expect(result).toBe('Missing or invalid required tasks: build')
    })
  })

  describe('run', () => {
    it('should pass when all extensions are present', async () => {
      const mockDevcontainer = {
        customizations: {
          vscode: {
            extensions: ['ext1', 'ext2']
          }
        }
      }

      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'extensions-list':
            return 'ext1,ext2'
          case 'validate-tasks':
            return 'false'
          default:
            return '.devcontainer/devcontainer.json'
        }
      })

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockDevcontainer))

      await main.run()
      expect(infoMock).toHaveBeenCalledWith(
        'All validations passed successfully'
      )
    })

    it('should fail when devcontainer.json is not found', async () => {
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'extensions-list':
            return 'ext1,ext2'
          case 'validate-tasks':
            return 'false'
          default:
            return '.devcontainer/devcontainer.json'
        }
      })

      fs.existsSync.mockReturnValue(false)

      await main.run()
      expect(setFailedMock).toHaveBeenCalledWith(
        expect.stringContaining('devcontainer.json not found')
      )
    })

    it('should fail when required extensions are missing', async () => {
      const mockDevcontainer = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        }
      }

      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'extensions-list':
            return 'ext1,ext2'
          case 'validate-tasks':
            return 'false'
          default:
            return '.devcontainer/devcontainer.json'
        }
      })

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockDevcontainer))

      await main.run()
      expect(setFailedMock).toHaveBeenCalledWith(
        expect.stringContaining('Missing required extensions: ext2')
      )
    })

    it('should validate tasks when validate-tasks is true', async () => {
      const mockDevcontainer = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        },
        tasks: {
          build: 'build cmd',
          test: 'test cmd',
          run: 'run cmd'
        }
      }

      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'extensions-list':
            return 'ext1'
          case 'validate-tasks':
            return 'true'
          default:
            return '.devcontainer/devcontainer.json'
        }
      })

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockDevcontainer))

      await main.run()
      expect(infoMock).toHaveBeenCalledWith(
        'All validations passed successfully'
      )
    })

    it('should fail when tasks validation fails', async () => {
      const mockDevcontainer = {
        customizations: {
          vscode: {
            extensions: ['ext1']
          }
        },
        tasks: {
          build: 'build cmd'
        }
      }

      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'extensions-list':
            return 'ext1'
          case 'validate-tasks':
            return 'true'
          default:
            return '.devcontainer/devcontainer.json'
        }
      })

      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockDevcontainer))

      await main.run()
      expect(setFailedMock).toHaveBeenCalledWith(
        expect.stringContaining('Missing or invalid required tasks: test, run')
      )
    })
  })
})
