// 게시글 목록 페이지 기능
import { getPostList } from '@gurumnyang/dcinside.js'
import { Setting } from './Setting'

// 기존 list_more 함수를 저장할 변수
let oldLM: () => void
// 현재 페이지 번호
let currentPage: number

/**
 * 게시글 목록 페이지에서 작성자 ID를 표시하는 함수
 * "더보기" 기능을 후킹하여 새로 로드된 게시글에도 ID를 표시함
 */
export async function postListFunction(): Promise<void> {
    // 게시판 또는 미니갤러리이고, 검색 결과가 아니며, "더보기" 버튼이 있는 경우
    if (
        (location.pathname.startsWith('/board/') || location.pathname.startsWith('/mini/')) &&
        !location.href.includes('serval=') &&
        document.getElementById('listMore')
    ) {
        // 기존 list_more 함수 백업
        // @ts-expect-error backup
        oldLM = list_more

        // list_more 함수를 새로운 함수로 교체 (더보기 버튼 클릭 시 실행됨)
        // @ts-expect-error replace
        list_more = function (): void {
            oldLM() // 기존 함수 실행
            sleep(0.15).then(() => {
                currentPage++ // 페이지 증가
                getPostAuthorId() // 새로 로드된 게시글에 ID 표시
            })
        }

        // URL에서 현재 페이지 번호 추출
        currentPage = Number.parseInt(location.href.split('page=')[1])

        if (Number.isNaN(currentPage)) {
            currentPage = 1 // 페이지 번호가 없으면 1로 설정
        }

        await getPostAuthorId()
    }
}

/**
 * 게시글 목록의 작성자 ID를 가져와서 표시하는 함수
 */
async function getPostAuthorId(): Promise<void> {
    if (!Setting.settings.postList.showPostListAuthorId.value) {
        return
    }

    // 모든 게시글 목록 요소를 가져와서 처리
    for (const lst of Array.from(document.getElementsByClassName('gall-detail-lst'))) {
        // 고정닉 게시글 정보를 추출 (광고 제외)
        const gonickPosts = Array.from(lst.children)
            .filter(e => !e.classList.contains('adv-inner'))
            .map(e => {
                // 게시글 링크 테이블 찾기
                const lnktb = Array.from(e.children).find(ce => ce.classList.contains('gall-detail-lnktb'))

                if (!lnktb) {
                    console.warn('gall-detail-lnktb not found')

                    return null
                }

                // 게시글 링크 요소 찾기
                const lt = Array.from(lnktb.children).find(ce => ce.classList.contains('lt'))

                if (!lt) {
                    console.warn('lt not found')

                    return null
                }

                // 작성자 정보 영역 찾기
                const ginfo = Array.from(lt.children).find(ce => ce.classList.contains('ginfo'))

                if (!ginfo) {
                    console.warn('ginfo not found')

                    return null
                }

                // 닉네임 요소 찾기 (고정닉만 해당)
                const spnick = Array.from(ginfo.children)
                    .flatMap(ce => Array.from(ce.children))
                    .find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

                // 게시글 ID와 닉네임 요소를 반환 (고정닉인 경우만)
                return spnick ? { postId: (lt as HTMLAnchorElement).href.split('/')[5], spnick: spnick } : null
            })
            .filter(e => e !== null)

        // API를 통해 게시글 목록 정보 가져오기
        const pis = await getPostList({
            page: currentPage,
            galleryId: location.pathname.split('/')[2],
            boardType: location.href.includes('recommend=1') ? 'recommend' : 'all'
        })

        // 각 게시글에 작성자 ID 표시
        pis.forEach(pi => {
            const id = pi.id
            const userId = pi.author.userId

            if (userId.length === 0) {
                return // 유동닉인 경우 ID가 없음
            }

            // 현재 게시글의 닉네임 요소들 찾기
            const spnicks = gonickPosts.filter(gp => gp.postId.startsWith(id)).map(gp => gp.spnick)

            spnicks.forEach(thisSpnick => {
                const parent = thisSpnick.parentElement

                // 이미 ID가 표시되어 있는 경우 건너뛰기
                if (!parent || Array.from(parent.children).some(ce => ce.classList.contains('mdcm-user-id'))) {
                    return
                }

                // 작성자 ID를 표시할 span 요소 생성
                const span = document.createElement('span')
                span.className = 'mdcm-user-id'
                span.textContent = `(${userId})`

                parent.appendChild(span)
            })
        })
    }
}

/**
 * 지정된 시간(초) 동안 대기하는 함수
 * @param sec 대기할 시간(초)
 */
function sleep(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}
