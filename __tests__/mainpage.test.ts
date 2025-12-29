import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hideUnwantedContents } from '../src/mainpage'
import { Setting } from '../src/Setting'

// Mock Setting
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            mainPage: {
                hideTrend: { value: false },
                hideSilbe: { value: false },
                hideNews: { value: false },
                hideRecommend: { value: false },
                hideMedia: { value: false }
            }
        }
    }
}))

// Mock location.pathname
Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, pathname: '/' }
})

describe('mainpage.ts', () => {
    beforeEach(() => {
        // Reset mocks and DOM
        vi.clearAllMocks()
        document.body.innerHTML = `
      <div class="nh-group"></div>
      <div class="livebest-group"></div>
      <div class="dna-group"></div>
      <div class="media-group"></div>
    `
        location.pathname = '/'
        Setting.settings.mainPage.hideTrend.value = false
        Setting.settings.mainPage.hideSilbe.value = false
        Setting.settings.mainPage.hideNews.value = false
        Setting.settings.mainPage.hideMedia.value = false
    })

    it('should hide trend section if setting is enabled', () => {
        // Arrange
        Setting.settings.mainPage.hideTrend.value = true

        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.nh-group')).toBeNull()
    })

    it('should hide silbe section if setting is enabled', () => {
        // Arrange
        Setting.settings.mainPage.hideSilbe.value = true

        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.livebest-group')).toBeNull()
    })

    it('should hide news section if setting is enabled', () => {
        // Arrange
        Setting.settings.mainPage.hideNews.value = true

        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.dna-group')).toBeNull()
    })

    it('should hide media section if setting is enabled', () => {
        // Arrange
        Setting.settings.mainPage.hideMedia.value = true

        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.media-group')).toBeNull()
    })

    it('should not hide any sections if settings are disabled', () => {
        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.nh-group')).not.toBeNull()
        expect(document.querySelector('.livebest-group')).not.toBeNull()
        expect(document.querySelector('.dna-group')).not.toBeNull()
        expect(document.querySelector('.media-group')).not.toBeNull()
    })

    it('should not hide any sections if not on the main page', () => {
        // Arrange
        location.pathname = '/some-other-page'
        Setting.settings.mainPage.hideTrend.value = true
        Setting.settings.mainPage.hideSilbe.value = true
        Setting.settings.mainPage.hideNews.value = true
        Setting.settings.mainPage.hideMedia.value = true

        // Act
        hideUnwantedContents()

        // Assert
        expect(document.querySelector('.nh-group')).not.toBeNull()
        expect(document.querySelector('.livebest-group')).not.toBeNull()
        expect(document.querySelector('.dna-group')).not.toBeNull()
        expect(document.querySelector('.media-group')).not.toBeNull()
    })
})
