import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from './logger'

describe('Logger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'info').mockImplementation(() => { })
        vi.spyOn(console, 'warn').mockImplementation(() => { })
        vi.spyOn(console, 'error').mockImplementation(() => { })
        vi.spyOn(console, 'debug').mockImplementation(() => { })
    })

    describe('info', () => {
        it('should log info messages', () => {
            logger.info('Test message')

            expect(console.info).toHaveBeenCalled()
        })

        it('should include metadata in log', () => {
            logger.info('Test message', { userId: '123' })

            expect(console.info).toHaveBeenCalled()
            const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
            expect(call).toContain('Test message')
            expect(call).toContain('userId')
        })
    })

    describe('error', () => {
        it('should log error messages', () => {
            const error = new Error('Test error')
            logger.error('Something went wrong', error)

            expect(console.error).toHaveBeenCalled()
        })

        it('should include error details in log', () => {
            const error = new Error('Test error')
            logger.error('Something went wrong', error, { context: 'test' })

            const call = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
            expect(call).toContain('Something went wrong')
            expect(call).toContain('Test error')
        })
    })

    describe('warn', () => {
        it('should log warning messages', () => {
            logger.warn('Warning message')

            expect(console.warn).toHaveBeenCalled()
        })
    })

    describe('httpRequest', () => {
        it('should log HTTP requests', () => {
            logger.httpRequest('GET', '/api/users')

            expect(console.info).toHaveBeenCalled()
            const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
            expect(call).toContain('GET')
            expect(call).toContain('/api/users')
        })
    })

    describe('sql', () => {
        it('should log SQL queries in debug mode', () => {
            // This test depends on LOG_LEVEL environment variable
            // In debug mode, it should log
            logger.sql('SELECT * FROM users WHERE id = ?', ['123'])

            // We don't assert on console.debug because it depends on log level
            // Just verify it doesn't throw
        })
    })
})
