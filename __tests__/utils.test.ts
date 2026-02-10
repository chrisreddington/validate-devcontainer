import { describe, test, expect } from 'vitest'
import { isDevcontainerContent, stripJsonComments } from '../src/utils.js'

/**
 * Test suite for utility functions used in devcontainer validation.
 */
describe('utils', () => {
  /**
   * Tests for isDevcontainerContent type guard.
   * Validates the structure of devcontainer.json contents against the expected schema.
   * Key validations:
   * - Customizations (VS Code extensions)
   * - Tasks configuration
   * - Features configuration
   */
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

    test('should return false for invalid customizations structure', () => {
      const invalidContent = {
        customizations: {
          vscode: {
            extensions: 'not-an-array'
          }
        }
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })

    test('should return false for invalid tasks structure', () => {
      const invalidContent = {
        tasks: {
          build: 123 // Should be string
        }
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })

    test('should return false for invalid features structure', () => {
      const invalidContent = {
        features: {
          feature1: 'not-an-object'
        }
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })

    test('should return false when customizations is not an object', () => {
      const invalidContent = {
        customizations: 'not-an-object'
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })

    test('should return false when tasks is not an object', () => {
      const invalidContent = {
        tasks: 'not-an-object'
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })

    test('should return false when features is not an object', () => {
      const invalidContent = {
        features: 'not-an-object'
      }
      expect(isDevcontainerContent(invalidContent)).toBeFalsy()
    })
  })

  /**
   * Tests for stripJsonComments utility.
   * Ensures proper handling of JSON files with comments, including:
   * - Single-line comments
   * - Multiple comments
   * - End-of-line comments
   */
  describe('stripJsonComments', () => {
    test('should remove single line comments', () => {
      const input = '{\n// comment\n"key": "value"\n}'
      expect(stripJsonComments(input)).toBe('{\n\n"key": "value"\n}')
    })

    test('should handle multiple comments', () => {
      const input =
        '{\n// comment 1\n"key": "value",\n// comment 2\n"key2": "value2"\n}'
      expect(stripJsonComments(input)).toBe(
        '{\n\n"key": "value",\n\n"key2": "value2"\n}'
      )
    })

    test('should handle comments at the end of lines', () => {
      const input = '{"key": "value" // comment\n}'
      expect(stripJsonComments(input)).toBe('{"key": "value" \n}')
    })
  })
})
