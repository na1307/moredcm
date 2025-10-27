// 게시글 상세 페이지 기능
import { Setting } from './Setting'

/**
 * 게시글 상세 페이지에서 작성자 ID를 표시하고 원하지 않는 콘텐츠를 숨기는 함수
 */
export function postFunction(): void {
    // 게시글 상세 페이지인지 확인 (경로가 4개 부분으로 나뉨)
    if (location.pathname.split('/').length === 4) {
        getPostAuthorId()
        getCommentsAuthorId()
        hideUnwantedItems()
    }
}

/**
 * 게시글 작성자의 ID를 가져와서 표시하는 함수
 */
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
        // 유동닉일 가능성 (고정닉이 아님)
        return
    }

    // 닉네임 요소 찾기
    const spnick = Array.from(a.children).find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

    if (!spnick) {
        console.warn('sp-nick not found')

        return
    }

    // 작성자 ID를 표시할 span 요소 생성
    const span = document.createElement('span')
    span.className = 'mdcm-user-id'
    span.textContent = `(${a.href.split('/').pop()})`

    a.appendChild(span)
}

/**
 * 댓글 작성자들의 ID를 가져와서 표시하는 함수
 */
function getCommentsAuthorId(): void {
    if (!Setting.settings.post.showCommentAuthorId.value) {
        return
    }

    // 모든 댓글 작성자 닉네임 요소 가져오기
    const nicks = Array.from(document.getElementsByClassName('nick'))

    nicks.forEach(nick => {
        const a = nick as HTMLAnchorElement
        // 닉네임 요소 찾기
        const spnick = Array.from(a.children).find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

        if (!spnick) {
            // 유동닉일 가능성 (고정닉이 아님)
            return
        }

        // 작성자 ID를 표시할 span 요소 생성
        const span = document.createElement('span')
        span.className = 'mdcm-user-id'
        span.textContent = `(${a.href.split('/').pop()})`

        a.appendChild(span)
    })
}

/**
 * 게시글 하단의 원하지 않는 콘텐츠를 숨기는 함수
 * (실시간 베스트, 뉴스 등)
 */
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
