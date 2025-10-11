// 상단 메뉴
import {Setting} from "./Setting";

export function hideUnwantedMenuItems(): void {
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

    const entries = [...Array.from(topmenuUl.children), ...Array.from(depthbox.children)]
    entries.forEach(entry => entry.classList.remove('swiper-slide'))

    if (Setting.settings.topMenu.hidePr.value) {
        removeEntryByName(entries, '인물갤')
    }

    if (Setting.settings.topMenu.hideBj.value) {
        removeEntryByName(entries, 'BJ방송')
    }

    if (Setting.settings.topMenu.hideGame.value) {
        removeEntryByName(entries, '게임')
    }

    if (Setting.settings.topMenu.hideEvent.value) {
        removeEntryByName(entries, '이벤트')
    }

    entries.forEach((entry, index) => {
        if (index <= 5) {
            entry.classList.add('swiper-slide')

            if (entry.parentElement === depthbox) {
                depthbox.removeChild(entry)
                topmenuUl.appendChild(entry)
            }
        } else {
            if (entry.parentElement === topmenuUl) {
                topmenuUl.removeChild(entry)
                depthbox.appendChild(entry)
            }
        }
    })

    if (entries.length <= 6) {
        topmenu.classList.remove('swiper-container')
        topmenu.style.paddingRight = '12px'
        topmenu.style.marginRight = '0'
        toggleBtn.remove()
        depthbox.remove()
    }
}

function removeEntryByName(elements: Element[], name: string): void {
    const element = elements.find(c => c.children.item(0)?.textContent === name);

    if (!element) {
        console.warn(`${name} 상단 메뉴 항목을 찾을 수 없습니다!`)

        return
    }

    element.remove()
    elements.splice(elements.indexOf(element), 1)
}
