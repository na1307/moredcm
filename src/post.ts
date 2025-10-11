// 게시글
import {Setting} from "./Setting";

export function getPostAuthorIdOrIpInPost(): void {
    if (location.pathname.split('/').length === 4) {
        getPostAuthorId()
        getCommentsAuthorId()
        hideUnwantedItems()
    }
}

function getPostAuthorId(): void {
    if (!Setting.settings.post.showPostAuthorId.value) {
        return
    }

    const ginfo2 = document.getElementsByClassName('ginfo2').item(0)

    if (!ginfo2) {
        console.warn('ginfo2 not found')
        
        return
    }

    const li = ginfo2.children.item(0) as HTMLLIElement | null

    if (!li) {
        console.warn('li not found')

        return
    }

    const a = li.children.item(0) as HTMLAnchorElement | null

    if (!a) {
        // 유동닉일 가능성
        return
    }

    const spnick = Array.from(a.children).find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

    if (!spnick) {
        console.warn('sp-nick not found')

        return
    }

    const span = document.createElement('span')
    span.className = 'mdcm-user-id'
    span.textContent = `(${a.href.split('/').pop()})`

    a.appendChild(span)
}

function getCommentsAuthorId(): void {
    if (!Setting.settings.post.showCommentAuthorId.value) {
        return
    }

    const nicks = Array.from(document.getElementsByClassName('nick'))

    nicks.forEach(nick => {
        const a = nick as HTMLAnchorElement
        const spnick = Array.from(a.children).find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

        if (!spnick) {
            // 유동닉일 가능성
            return
        }

        const span = document.createElement('span')
        span.className = 'mdcm-user-id'
        span.textContent = `(${a.href.split('/').pop()})`

        a.appendChild(span)
    })
}

function hideUnwantedItems(): void {
    if (Setting.settings.post.hideBottomContents.value) {
        const btmcon = document.getElementsByClassName('view-btm-con').item(0)

        if (!btmcon) {
            console.warn('하단 콘텐츠를 찾을 수 없습니다.')

            return
        }

        const container = btmcon.parentElement

        if (!container) {
            console.warn('btmcon parent')

            return
        }

        container.remove()
    }
}
