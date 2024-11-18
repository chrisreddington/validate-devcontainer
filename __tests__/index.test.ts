import { run } from '../src/main'

jest.mock('../src/main', () => ({
  run: jest.fn()
}))

/**
 * Test suite for the GitHub Action's entry point.
 * Validates that the action is properly initialized and the main run function is called.
 */
describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index')
    expect(run).toHaveBeenCalled()
  })
})
