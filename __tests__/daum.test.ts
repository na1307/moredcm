import { describe, it, expect, vi, beforeEach, assert } from 'vitest'
import { hideDaum } from '../src/daum'
import { Setting } from '../src/Setting'

// Mock Setting
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            hideDaum: { value: false }
        }
    }
}))

describe('daum.ts', () => {
    beforeEach(() => {
        // Reset mocks and DOM
        vi.clearAllMocks()
        document.body.innerHTML = `
      <div>
        <div class="md-tit">다른 검색</div>
        <div class="md-tit-box">
          <div class="md-tit">다음 검색</div>
        </div>
      </div>
    `
    })

    it('should hide Daum search section if setting is enabled', () => {
        // Arrange
        Setting.settings.hideDaum.value = true

        // Act
        hideDaum()

        // Assert
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')
        expect(daumTit).toBeUndefined()
    })

    it('should not hide Daum search section if setting is disabled', () => {
        // Arrange
        Setting.settings.hideDaum.value = false

        // Act
        hideDaum()

        // Assert
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')
        expect(daumTit).not.toBeUndefined()
    })

    it('Daum search not found', () => {
        const org = `
      <div>
        <div class="md-tit">다른 검색</div>
        <div class="md-tit-box"></div>
      </div>
    `

        document.body.innerHTML = org

        hideDaum()

        assert(document.body.innerHTML === org)
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')
        expect(daumTit).toBeUndefined()
    })

    it('Daum search parent not found', () => {
        const org = `
      <div>
        <div class="md-tit">다른 검색</div>
      </div>
    `

        document.body.innerHTML = org

        hideDaum()

        assert(document.body.innerHTML === org)
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')
        expect(daumTit).toBeUndefined()
    })
})
