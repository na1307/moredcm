// 상단 메뉴 숨기기 기능
import { Setting } from './Setting'

/**
 * 상단 메뉴에서 원하지 않는 항목을 숨기는 함수
 * 인물갤, BJ방송, 게임, 이벤트 메뉴를 설정에 따라 숨김
 */
export function hideUnwantedMenuItems(): void {
    // 상단 메뉴 관련 요소들 가져오기
    const topmenu = document.getElementById('topmenu')
    const toggleBtn = document.getElementById('topmenu_toggle_btn')
    const depthbox = document.getElementById('topmenu_depthbox')

    if (!topmenu || !toggleBtn || !depthbox) {
        return
    }

    const topmenuUl = topmenu.children.item(0)

    if (!topmenuUl) {
        return
    }

    // 메인 메뉴와 더보기 메뉴의 모든 항목들을 하나의 배열로 합침
    const entries = [...Array.from(topmenuUl.children), ...Array.from(depthbox.children)]
    // swiper-slide 클래스 제거 (재배치를 위해)
    entries.forEach(entry => entry.classList.remove('swiper-slide'))

    // 설정에 따라 메뉴 항목 제거
    if (Setting.settings.topMenu.hidePr.value) {
        removeEntryByName(entries, '인물갤')
    }

    if (Setting.settings.topMenu.hideShopping.value) {
        removeEntryByName(entries, '도끼쇼핑')
    }
    
    if (Setting.settings.topMenu.hideGame.value) {
        removeEntryByName(entries, '게임')
    }

    if (Setting.settings.topMenu.hideEvent.value) {
        removeEntryByName(entries, '이벤트')
    }

    // 남은 메뉴 항목들을 재배치
    entries.forEach((entry, index) => {
        if (index <= 3) {
            // 처음 4개는 메인 메뉴에 표시
            entry.classList.add('swiper-slide')

            if (entry.parentElement === depthbox) {
                entry.remove()
                topmenuUl.appendChild(entry)
            }
        }
    })

    // 메뉴가 4개 이하면 더보기 버튼 제거
    if (entries.length <= 4) {
        topmenu.classList.remove('swiper-container')
        topmenu.style.paddingRight = '12px'
        topmenu.style.marginRight = '0'
        toggleBtn.remove()
        depthbox.remove()
    }
}

/**
 * 메뉴 항목 배열에서 특정 이름의 항목을 찾아 제거하는 함수
 * @param elements 메뉴 항목 배열
 * @param name 제거할 메뉴 이름
 */
function removeEntryByName(elements: Element[], name: string): void {
    const element = elements.find(c => c.children.item(0)?.textContent === name)

    if (!element) {
        console.warn(`${name} 상단 메뉴 항목을 찾을 수 없습니다!`)

        return
    }

    element.remove()
    elements.splice(elements.indexOf(element), 1)
}
