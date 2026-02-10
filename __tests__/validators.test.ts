import { describe, test, expect } from 'vitest'
import {
  validateExtensions,
  validateTasks,
  validateFeatures
} from '../src/validators.js'
import { DevcontainerContent } from '../src/types.js'

/**
 * Test suite for devcontainer.json validation functions.
 * Covers extension, task, and feature validation functionality.
 */
describe('validators', () => {
  /**
   * Tests for validateExtensions function.
   * Validates the presence of required VS Code extensions in devcontainer configuration.
   */
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

    test('should handle undefined extensions', () => {
      const content: DevcontainerContent = {}
      const required = ['ext1']
      expect(validateExtensions(content, required)).toEqual(['ext1'])
    })

    test('should match extensions case-insensitively', () => {
      const content: DevcontainerContent = {
        customizations: {
          vscode: {
            extensions: ['Ext1', 'EXT2']
          }
        }
      }
      const required = ['ext1', 'ext2']
      expect(validateExtensions(content, required)).toEqual([])
    })
  })

  /**
   * Tests for validateTasks function.
   * Ensures required build/test/run tasks are properly configured.
   * Required tasks:
   * - build: For building the project
   * - test: For running tests
   * - run: For starting the application
   */
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

    test('should handle missing tasks section', () => {
      const content: DevcontainerContent = {}
      expect(validateTasks(content)).toBe("'tasks' property is missing")
    })

    test('should return null when all required tasks are present', () => {
      const content: DevcontainerContent = {
        tasks: {
          build: 'npm run build',
          test: 'npm test',
          run: 'npm start'
        }
      }
      expect(validateTasks(content)).toBeNull()
    })

    test('should return error when tasks are not strings', () => {
      const content: DevcontainerContent = {
        tasks: {
          build: 'npm run build',
          test: {},
          run: 'npm start'
        }
      } as unknown as DevcontainerContent
      expect(validateTasks(content)).toBe(
        'Missing or invalid required tasks: test'
      )
    })
  })

  /**
   * Tests for validateFeatures function.
   * Verifies the presence of required devcontainer features.
   */
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

    test('should handle empty required features', () => {
      const content: DevcontainerContent = {}
      expect(validateFeatures(content, [])).toEqual([])
    })

    test('should handle undefined required features', () => {
      const content: DevcontainerContent = {}
      const required: string[] = undefined as unknown as string[]
      expect(validateFeatures(content, required)).toEqual([])
    })

    test('should handle undefined features section', () => {
      const content: DevcontainerContent = {}
      const required = ['feature1']
      expect(validateFeatures(content, required)).toEqual(['feature1'])
    })
  })
})
