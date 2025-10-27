import { assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { addMoreDCMSetting } from '../src/aside'
import { Setting } from '../src/Setting'

// Mock Setting
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            isDarkSet: { value: false, save: vi.fn(), reset: vi.fn() },
            topMenu: { hidePr: { id: 'hidePr', title: '인물갤 숨기기', value: true, save: vi.fn(), reset: vi.fn() } },
            mainPage: {},
            postList: {},
            post: {},
            hideDaum: { value: false, save: vi.fn(), reset: vi.fn(), title: 'Daum 검색 숨기기', id: 'hideDaum' }
        }
    }
}))

// Mock location.reload
Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, pathname: '', reload: vi.fn() }
})

describe('aside.ts', () => {
    beforeEach(() => {
        // Reset mocks and DOM
        vi.clearAllMocks()
        document.body.innerHTML = '<ul class="all-setting-lst"></ul>'
        location.pathname = '/aside'
    })

    describe('addMoreDCMSetting', () => {
        it('should add setting entries and window if on /aside page', () => {
            // Act
            addMoreDCMSetting()

            // Assert
            const settingList = document.querySelector('.all-setting-lst')!
            expect(settingList.children.length).toBe(2)
            expect(settingList.textContent).toContain('MoreDCM 설정')
            expect(settingList.textContent).toContain('MoreDCM 설정 초기화')
            expect(document.getElementById('mdcm-setting')).not.toBeNull()
        })

        it('should not add setting entries and window if on /aside page but all-setting-lst not found', () => {
            document.body.innerHTML = ''

            // Act
            addMoreDCMSetting()

            // Assert
            expect(document.querySelector('.all-setting-lst')).toBeNull()
            expect(document.getElementById('mdcm-setting')).toBeNull()
        })

        it('should not add anything if not on /aside page', () => {
            // Arrange
            location.pathname = '/not-aside'

            // Act
            addMoreDCMSetting()

            // Assert
            const settingList = document.querySelector('.all-setting-lst')!
            expect(settingList.children.length).toBe(0)
            expect(document.getElementById('mdcm-setting')).toBeNull()
        })
    })

    describe('user interaction', () => {
        it('should show setting window when setting button is clicked', () => {
            addMoreDCMSetting()
            const settingButton = document.evaluate("//button[text()='설정']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement
            const settingWindow = document.getElementById('mdcm-setting')!

            settingButton.click()

            expect(settingWindow.style.display).toBe('block')
        })

        it('should hide setting window when cancel button is clicked', () => {
            addMoreDCMSetting()
            const settingButton = document.evaluate("//button[text()='설정']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement
            const settingWindow = document.getElementById('mdcm-setting')!
            settingButton.click()

            const cancelButton = document.evaluate("//button[text()='취소']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement

            cancelButton.click()

            expect(settingWindow.style.display).toBe('none')
        })

        it('should save settings when save button is clicked', () => {
            addMoreDCMSetting()
            const settingButton = document.evaluate("//button[text()='설정']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement
            const settingWindow = document.getElementById('mdcm-setting')!
            settingButton.click()

            const saveButton = document.evaluate("//button[text()='저장']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement

            saveButton.click()

            expect(Setting.settings.hideDaum.save).toHaveBeenCalled()
            expect(settingWindow.style.display).toBe('none')
        })

        it('should reset settings when reset button is clicked and ok is clicked', () => {
            addMoreDCMSetting()
            global.confirm = vi.fn(() => true)
            const resetButton = document.evaluate("//button[text()='초기화']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement

            resetButton.click()

            expect(global.confirm).toHaveBeenCalledWith('정말로 초기화할까요?')
            expect(Setting.settings.isDarkSet.reset).toHaveBeenCalled()
            expect(Setting.settings.hideDaum.reset).toHaveBeenCalled()
            expect(location.reload).toHaveBeenCalled()
        })

        it('should not reset settings when reset button is clicked and cancel is clicked', () => {
            addMoreDCMSetting()
            global.confirm = vi.fn(() => false)
            const resetButton = document.evaluate("//button[text()='초기화']", document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as HTMLButtonElement

            resetButton.click()

            expect(global.confirm).toHaveBeenCalledWith('정말로 초기화할까요?')
            expect(Setting.settings.isDarkSet.reset).not.toHaveBeenCalled()
            expect(Setting.settings.hideDaum.reset).not.toHaveBeenCalled()
            expect(location.reload).not.toHaveBeenCalled()
        })

        it('toggle clicked when enabled', ()=>{
            addMoreDCMSetting()

            document.getElementById('mdcm-hidepr')!.click()

            assert(!Setting.settings.topMenu.hidePr.value)
        })

        it('toggle clicked when disabled', () => {
            addMoreDCMSetting()

            document.getElementById('mdcm-hidedaum')!.click()

            assert(Setting.settings.hideDaum.value)
        })
    })
})
