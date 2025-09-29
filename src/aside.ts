// 어사이드
import {Setting} from "./Setting"

let mdcmSettingWindow: HTMLDivElement

export function addMoreDCMSetting(): void {
    if (location.pathname === '/aside') {
        addSettingEntry()
        addResetEntry()
        addSettingWindow()
    }
}

function addSettingEntry(): void {
    const lst = document.getElementsByClassName('all-setting-lst').item(0)

    if (!lst) {
        throw Error("설정 리스트를 찾을 수 없습니다.")
    }

    const li = document.createElement('li')

    const tit = document.createElement('span')
    tit.className = 'tit'
    tit.textContent = 'MoreDCM 설정'

    const txt = document.createElement('span')
    txt.className = 'txt'
    txt.textContent = 'MoreDCM 설정을 변경합니다.'

    const rt = document.createElement('div')
    rt.className = 'rt'

    const button = document.createElement('button')
    button.classList.add('btn-all-setting', 'btn-line-blue')
    button.textContent = '설정'
    button.addEventListener('click', showMdcmSettingWindow)

    rt.appendChild(button)

    li.appendChild(tit)
    li.appendChild(txt)
    li.appendChild(rt)

    lst.appendChild(li)
}

function addResetEntry(): void {
    const lst = document.getElementsByClassName('all-setting-lst').item(0)

    if (!lst) {
        throw Error("설정 리스트를 찾을 수 없습니다.")
    }

    const li = document.createElement('li')

    const tit = document.createElement('span')
    tit.className = 'tit'
    tit.textContent = 'MoreDCM 설정 초기화'

    const txt = document.createElement('span')
    txt.className = 'txt'
    txt.textContent = 'MoreDCM 설정을 초기화합니다.'

    const rt = document.createElement('div')
    rt.className = 'rt'

    const button = document.createElement('button')
    button.classList.add('btn-all-setting', 'btn-line-blue')
    button.textContent = '초기화'
    button.addEventListener('click', resetSetting)

    rt.appendChild(button)

    li.appendChild(tit)
    li.appendChild(txt)
    li.appendChild(rt)

    lst.appendChild(li)
}

function addSettingWindow(): void {
    mdcmSettingWindow = document.createElement('div')
    mdcmSettingWindow.id = 'mdcm-setting'
    mdcmSettingWindow.classList.add('layer-center-popup', 'full')
    mdcmSettingWindow.style = 'display: none'

    const layerPopupInner = document.createElement('div')
    layerPopupInner.className = 'layer-popup-inner'

    layerPopupInner.appendChild(createLyTitBox())
    layerPopupInner.appendChild(createMdcmsetLst())
    layerPopupInner.appendChild(createBtmBtnsCtr())

    mdcmSettingWindow.appendChild(layerPopupInner)

    document.body.appendChild(mdcmSettingWindow)
}

function createLyTitBox(): HTMLDivElement {
    const lyTitBox = document.createElement('div')
    lyTitBox.className = 'ly-tit-box'

    const tit = document.createElement('h3')
    tit.className = 'tit'
    tit.textContent = 'MoreDCM 설정'

    const rt = document.createElement('div')
    rt.className = 'rt'

    const closeButton = document.createElement('a')
    closeButton.className = 'btn-x-close'
    closeButton.href = "javascript:hideWindow('mdcm-setting')"

    const blind = document.createElement('span')
    blind.className = 'blind'
    blind.textContent = '닫기'

    closeButton.appendChild(blind)

    rt.appendChild(closeButton)

    lyTitBox.appendChild(tit)
    lyTitBox.appendChild(rt)

    return lyTitBox
}

function createMdcmsetLst(): HTMLUListElement {
    const mdcmsetLst = document.createElement('ul')
    mdcmsetLst.className = 'noticeset-lst'

    const li1 = document.createElement('li')

    const a1 = document.createElement('a')
    a1.className = 'noticeset-lnk'

    const topmenuSetting = document.createElement('span')
    topmenuSetting.className = 'ntc'
    topmenuSetting.textContent = '상단 메뉴 설정'

    a1.appendChild(topmenuSetting)

    li1.appendChild(a1)

    const li2 = document.createElement('li')

    const a2 = document.createElement('a')
    a2.className = 'noticeset-lnk'

    const mainpageSetting = document.createElement('span')
    mainpageSetting.className = 'ntc'
    mainpageSetting.textContent = '메인 화면 설정'

    a2.appendChild(mainpageSetting)

    li2.appendChild(a2)

    mdcmsetLst.appendChild(li1)
    Object.values(Setting.settings.topMenu).forEach(ts => mdcmsetLst.appendChild(createSettingEntryDepth(ts.id, ts.title, () => ts.value, v => ts.value = v)))
    mdcmsetLst.appendChild(li2)
    Object.values(Setting.settings.mainPage).forEach(ts => mdcmsetLst.appendChild(createSettingEntryDepth(ts.id, ts.title, () => ts.value, v => ts.value = v)))

    return mdcmsetLst
}

function createSettingEntryDepth(id: string, title: string, get: () => boolean, set: (value: boolean) => void): HTMLLIElement {
    const entry = document.createElement('li')
    entry.className = 'depth'

    const a = document.createElement('a')
    a.className = 'noticeset-lnk'

    const ntc = document.createElement('span')
    ntc.className = 'ntc'
    ntc.textContent = title

    a.appendChild(ntc)

    const rt = document.createElement('div')
    rt.className = 'rt'

    const bgm = document.createElement('span')
    bgm.className = 'bgm'

    const label = document.createElement('label')
    label.id = 'mdcm-' + id.toLowerCase()
    label.classList.add('bgm-control')

    if (get()) {
        label.classList.add('on')
    }

    label.addEventListener('click', () => updateToggle(label, get, set))

    const ball = document.createElement('span')
    ball.className = 'ball'

    label.appendChild(ball)

    bgm.appendChild(label)

    rt.appendChild(bgm)

    entry.appendChild(a)
    entry.appendChild(rt)

    return entry
}

function updateToggle(label: HTMLLabelElement, get: () => boolean, set: (value: boolean) => void): void {
    const value = !get()

    set(value)

    if (value) {
        label.classList.add('on')
    } else {
        label.classList.remove('on')
    }
}

function createBtmBtnsCtr(): HTMLDivElement {
    const btmBtnsCtr = document.createElement('div')
    btmBtnsCtr.className = 'btm-btns-ctr'

    const cancelButton = document.createElement('button')
    cancelButton.type = 'button'
    cancelButton.classList.add('btn-line', 'btn-line-gray')
    cancelButton.addEventListener('click', hideMdcmSettingWindow)
    cancelButton.textContent = '취소'

    const saveButton = document.createElement('button')
    saveButton.type = 'button'
    saveButton.classList.add('btn-line', 'btn-line-inblue')
    saveButton.addEventListener('click', saveMdcmSetting)
    saveButton.textContent = '저장'

    btmBtnsCtr.appendChild(cancelButton)
    btmBtnsCtr.appendChild(saveButton)

    return btmBtnsCtr
}

function showMdcmSettingWindow(): void {
    mdcmSettingWindow.style = 'display: block'
}

function hideMdcmSettingWindow(): void {
    mdcmSettingWindow.style = 'display: none'
}

function saveMdcmSetting(): void {
    Object.values(Setting.settings.topMenu).forEach(s => s.save())
    Object.values(Setting.settings.mainPage).forEach(s => s.save())
    hideMdcmSettingWindow()
}

function resetSetting(): void {
    if (confirm('정말로 초기화할까요?')) {
        Setting.settings.isDarkSet.reset()
        Object.values(Setting.settings.mainPage).forEach(s => s.reset())
        Object.values(Setting.settings.topMenu).forEach(s => s.reset())
        location.reload()
    }
}
