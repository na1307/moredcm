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
        console.warn("설정 리스트를 찾을 수 없습니다.")

        return
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
        console.warn("설정 리스트를 찾을 수 없습니다.")

        return
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

    const li3 = document.createElement('li')

    const a3 = document.createElement('a')
    a3.className = 'noticeset-lnk'

    const postListSetting = document.createElement('span')
    postListSetting.className = 'ntc'
    postListSetting.textContent = '게시글 목록 설정'

    a3.appendChild(postListSetting)

    li3.appendChild(a3)

    const li4 = document.createElement('li')

    const a4 = document.createElement('a')
    a4.className = 'noticeset-lnk'

    const postSetting = document.createElement('span')
    postSetting.className = 'ntc'
    postSetting.textContent = '게시글 목록 설정'

    a4.appendChild(postSetting)

    li4.appendChild(a4)

    mdcmsetLst.appendChild(li1)
    Object.values(Setting.settings.topMenu).forEach(ts => mdcmsetLst.appendChild(createSettingEntry(ts, true)))
    mdcmsetLst.appendChild(li2)
    Object.values(Setting.settings.mainPage).forEach(ts => mdcmsetLst.appendChild(createSettingEntry(ts, true)))
    mdcmsetLst.appendChild(li3)
    Object.values(Setting.settings.postList).forEach(ts => mdcmsetLst.appendChild(createSettingEntry(ts, true)))
    mdcmsetLst.appendChild(li4)
    Object.values(Setting.settings.post).forEach(ts => mdcmsetLst.appendChild(createSettingEntry(ts, true)))
    mdcmsetLst.appendChild(createSettingEntry(Setting.settings.hideDaum, false))

    return mdcmsetLst
}

function createSettingEntry(ts: Setting, depth: boolean): HTMLLIElement {
    const entry = document.createElement('li')

    if (depth) {
        entry.className = 'depth'
    }

    const a = document.createElement('a')
    a.className = 'noticeset-lnk'

    const ntc = document.createElement('span')
    ntc.className = 'ntc'
    ntc.textContent = ts.title

    a.appendChild(ntc)

    const rt = document.createElement('div')
    rt.className = 'rt'

    const bgm = document.createElement('span')
    bgm.className = 'bgm'

    const label = document.createElement('label')
    label.id = 'mdcm-' + ts.id.toLowerCase()
    label.classList.add('bgm-control')

    if (ts.value) {
        label.classList.add('on')
    }

    label.addEventListener('click', () => updateToggle(label, ts))

    const ball = document.createElement('span')
    ball.className = 'ball'

    label.appendChild(ball)

    bgm.appendChild(label)

    rt.appendChild(bgm)

    entry.appendChild(a)
    entry.appendChild(rt)

    return entry
}

function updateToggle(label: HTMLLabelElement, ts: Setting): void {
    const value = !ts.value

    ts.value = value

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
    Object.values(Setting.settings.postList).forEach(s => s.save())
    Object.values(Setting.settings.post).forEach(s => s.save())
    Setting.settings.hideDaum.save()
    hideMdcmSettingWindow()
}

function resetSetting(): void {
    if (confirm('정말로 초기화할까요?')) {
        Setting.settings.isDarkSet.reset()
        Object.values(Setting.settings.mainPage).forEach(s => s.reset())
        Object.values(Setting.settings.topMenu).forEach(s => s.reset())
        Object.values(Setting.settings.postList).forEach(s => s.reset())
        Object.values(Setting.settings.post).forEach(s => s.reset())
        Setting.settings.hideDaum.reset()
        location.reload()
    }
}
