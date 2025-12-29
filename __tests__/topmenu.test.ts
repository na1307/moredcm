import { beforeEach, describe, expect, test, vi } from 'vitest'
import { hideUnwantedMenuItems } from '../src/topmenu'
import { Setting } from '../src/Setting'

// Setting 모의(mock)
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            topMenu: {
                hidePr: { value: false },
                hideShopping: { value: false },
                hideGame: { value: false },
                hideEvent: { value: false }
            }
        }
    }
}))

// DOM 구조 생성 함수
const setupDOM = () => {
    document.body.innerHTML = `
        <div id="topmenu">
            <ul>
                ${['갤러리', '최신', '실시간', '인기', '개념', '인물갤'].map(name => `<li><a>${name}</a></li>`).join('')}
            </ul>
        </div>
        <button id="topmenu_toggle_btn"></button>
        <div id="topmenu_depthbox">
            ${['게임', '이벤트', '뉴스', '만화', 'HIT'].map(name => `<li><a>${name}</a></li>`).join('')}
        </div>
    `
}

describe('hideUnwantedMenuItems', () => {
    beforeEach(() => {
        // 각 테스트 전에 DOM과 설정을 초기화
        setupDOM()
        Setting.settings.topMenu.hidePr.value = false
        Setting.settings.topMenu.hideGame.value = false
        Setting.settings.topMenu.hideEvent.value = false
    })

    test('topmenu 없음', () => {
        document.body.innerHTML = `
            <button id="topmenu_toggle_btn"></button>
            <div id="topmenu_depthbox">
                ${['게임', '이벤트', '뉴스', '만화', 'HIT'].map(name => `<li><a>${name}</a></li>`).join('')}
            </div>
        `
        hideUnwantedMenuItems()
        expect(document.getElementById('topmenu')).toBeNull()
    })

    test('topmenuUl 없음', () => {
        document.body.innerHTML = `
            <div id="topmenu"></div>
            <button id="topmenu_toggle_btn"></button>
            <div id="topmenu_depthbox">
                ${['게임', '이벤트', '뉴스', '만화', 'HIT'].map(name => `<li><a>${name}</a></li>`).join('')}
            </div>
        `
        hideUnwantedMenuItems()
        expect(document.querySelector('#topmenu > ul')).toBeNull()
    })

    test('아무것도 숨기지 않아야 함', () => {
        hideUnwantedMenuItems()
        const topmenuUl = document.querySelector('#topmenu > ul')!
        const depthbox = document.getElementById('topmenu_depthbox')!
        expect(topmenuUl.children.length + depthbox.children.length).toBe(11)
    })

    test('인물갤 메뉴를 숨겨야 함', () => {
        Setting.settings.topMenu.hidePr.value = true
        hideUnwantedMenuItems()
        const menuTexts = Array.from(document.querySelectorAll('#topmenu a, #topmenu_depthbox a')).map(a => a.textContent)
        expect(menuTexts).not.toContain('인물갤')
    })

    test('게임 메뉴를 숨겨야 함', () => {
        Setting.settings.topMenu.hideGame.value = true
        hideUnwantedMenuItems()
        const menuTexts = Array.from(document.querySelectorAll('#topmenu a, #topmenu_depthbox a')).map(a => a.textContent)
        expect(menuTexts).not.toContain('게임')
    })

    test('이벤트 메뉴를 숨겨야 함', () => {
        Setting.settings.topMenu.hideEvent.value = true
        hideUnwantedMenuItems()
        const menuTexts = Array.from(document.querySelectorAll('#topmenu a, #topmenu_depthbox a')).map(a => a.textContent)
        expect(menuTexts).not.toContain('이벤트')
    })

    test('여러 메뉴 항목을 숨겨야 함', () => {
        Setting.settings.topMenu.hidePr.value = true
        Setting.settings.topMenu.hideGame.value = true
        hideUnwantedMenuItems()
        const menuTexts = Array.from(document.querySelectorAll('#topmenu a, #topmenu_depthbox a')).map(a => a.textContent)
        expect(menuTexts).not.toContain('인물갤')
        expect(menuTexts).not.toContain('게임')
        expect(menuTexts.length).toBe(9)
    })

    test('메뉴가 4개 이하일 때 더보기 버튼을 제거해야 함', () => {
        // 5개 항목을 숨겨 총 4개 항목만 남김
        document.body.innerHTML = `
            <div id="topmenu">
                <ul>
                    ${['갤러리', '마이너갤', '미니갤', '인물갤', '게임'].map(name => `<li><a>${name}</a></li>`).join('')}
                </ul>
            </div>
            <button id="topmenu_toggle_btn"></button>
            <div id="topmenu_depthbox">
                ${['게임'].map(name => `<li><a>${name}</a></li>`).join('')}
            </div>
        `
        Setting.settings.topMenu.hidePr.value = true
        Setting.settings.topMenu.hideGame.value = true
        hideUnwantedMenuItems()

        expect(document.getElementById('topmenu_toggle_btn')).toBeNull()
        expect(document.getElementById('topmenu_depthbox')).toBeNull()
        const topmenuUl = document.querySelector('#topmenu > ul')!
        expect(topmenuUl.children.length).toBe(4)
    })

    test('메뉴가 4개를 초과하면 더보기 버튼을 유지해야 함', () => {
        hideUnwantedMenuItems() // 기본 12개 항목
        expect(document.getElementById('topmenu_toggle_btn')).not.toBeNull()
        expect(document.getElementById('topmenu_depthbox')).not.toBeNull()
    })
})
