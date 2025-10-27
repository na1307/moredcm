import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { setDarkModeDefault } from '../src/darkmode'
import { Setting } from '../src/Setting'
import { GM_cookie } from 'vite-plugin-monkey/dist/client'

// Mock dependencies
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            isDarkSet: {
                value: false,
                save: vi.fn()
            }
        }
    }
}))

vi.mock('$', () => ({
    GM_cookie: {
        set: vi.fn()
    }
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

// Mock location.reload
Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, reload: vi.fn() }
})

describe('setDarkModeDefault', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should set dark mode and reload if not set and system is in dark mode', () => {
        // Arrange
        Setting.settings.isDarkSet.value = false
        ;(window.matchMedia as Mock).mockReturnValue({ matches: true })

        // Act
        setDarkModeDefault()

        // Assert
        expect(GM_cookie.set).toHaveBeenCalledTimes(2)
        expect(GM_cookie.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'm_dcinside_darkmode',
                value: 'done',
                domain: '.dcinside.com'
            })
        )
        expect(GM_cookie.set).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'm_dcinside_darkmode_info',
                value: 'done',
                domain: '.dcinside.com'
            })
        )
        expect(Setting.settings.isDarkSet.value).toBe(true)
        expect(Setting.settings.isDarkSet.save).toHaveBeenCalled()
        expect(window.location.reload).toHaveBeenCalled()
    })

    it('should not set dark mode if it is already set', () => {
        // Arrange
        Setting.settings.isDarkSet.value = true
        ;(window.matchMedia as Mock).mockReturnValue({ matches: true })

        // Act
        setDarkModeDefault()

        // Assert
        expect(GM_cookie.set).not.toHaveBeenCalled()
        expect(Setting.settings.isDarkSet.save).not.toHaveBeenCalled()
        expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should not set dark mode if system is not in dark mode', () => {
        // Arrange
        Setting.settings.isDarkSet.value = false
        ;(window.matchMedia as Mock).mockReturnValue({ matches: false })

        // Act
        setDarkModeDefault()

        // Assert
        expect(GM_cookie.set).not.toHaveBeenCalled()
        expect(Setting.settings.isDarkSet.save).not.toHaveBeenCalled()
        expect(window.location.reload).not.toHaveBeenCalled()
    })
})
