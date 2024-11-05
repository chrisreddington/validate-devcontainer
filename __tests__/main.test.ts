import * as core from '@actions/core'
import {
  DevcontainerContent,
  validateExtensions,
  validateTasks,
  run
} from '../src/main'

// Mock fs module with constants and promises
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    access: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(
      JSON.stringify({
        customizations: {
          vscode: {
            extensions: ['ext1', 'ext2']
          }
        },
        tasks: {
          build: 'npm run build',
          test: 'npm test',
          run: 'npm start'
        }
      })
    ),
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

const mockDevcontainer: DevcontainerContent = {
  customizations: {
    vscode: {
      extensions: ['ext1', 'ext2']
    }
  },
  tasks: {
    build: 'npm run build',
    test: 'npm test',
    run: 'npm start'
  }
}

describe('validate-devcontainer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('validates extensions', () => {
    const requiredExtensions = ['ext1', 'ext3']
    const result = validateExtensions(mockDevcontainer, requiredExtensions)
    expect(result).toBeDefined()
  })

  test('validates tasks', () => {
    const result = validateTasks(mockDevcontainer)
    expect(result).toBeDefined()
  })

  test('runs validation', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'extensions-list':
          return 'ext1,ext2'
        case 'devcontainer-path':
          return 'path/to/devcontainer.json'
        case 'validate-tasks':
          return 'true'
        default:
          return ''
      }
    })

    await run()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(infoMock).toHaveBeenCalledWith('All validations passed successfully')
  })
})
