import { isDevcontainerContent, stripJsonComments } from '../src/utils'

describe('utils', () => {
  describe('isDevcontainerContent', () => {
    test('should return false for null', () => {
      expect(isDevcontainerContent(null)).toBeFalsy()
    })

    test('should return true for valid devcontainer content', () => {
      const validContent = {
        customizations: {
          vscode: {
            extensions: ['ext1', 'ext2']
          }
        },
        tasks: {
          build: 'npm run build',
          test: 'npm test'
        },
        features: {
          feature1: {}
        }
      }
      expect(isDevcontainerContent(validContent)).toBeTruthy()
    })
  })

  describe('stripJsonComments', () => {
    test('should remove single line comments', () => {
      const input = '{\n// comment\n"key": "value"\n}'
      expect(stripJsonComments(input)).toBe('{\n\n"key": "value"\n}')
    })
  })
})
