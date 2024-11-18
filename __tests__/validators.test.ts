import {
  validateExtensions,
  validateTasks,
  validateFeatures
} from '../src/validators'
import { DevcontainerContent } from '../src/types'

describe('validators', () => {
  describe('validateExtensions', () => {
    test('should return missing extensions', () => {
      const content: DevcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['ext1', 'ext2']
          }
        }
      }
      const required = ['ext1', 'ext3']
      expect(validateExtensions(content, required)).toEqual(['ext3'])
    })
  })

  describe('validateTasks', () => {
    test('should return error when required tasks are missing', () => {
      const content: DevcontainerContent = {
        tasks: {
          build: 'npm run build'
        }
      }
      expect(validateTasks(content)).toBe(
        'Missing or invalid required tasks: test, run'
      )
    })
  })

  describe('validateFeatures', () => {
    test('should return missing features', () => {
      const content: DevcontainerContent = {
        features: {
          feature1: {}
        }
      }
      const required = ['feature1', 'feature2']
      expect(validateFeatures(content, required)).toEqual(['feature2'])
    })
  })
})
