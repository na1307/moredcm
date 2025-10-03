// 게시글 목록
import {getPostList} from "@gurumnyang/dcinside.js";
import {Setting} from "./Setting";

// @ts-ignore
let oldLM: any
let currentPage: number

export function getPostAuthorIdOrIp(): void {
    if ((location.pathname.startsWith('/board/') || location.pathname.startsWith('/mini/'))
        && !location.href.includes('serval=') && document.getElementById('listMore')) {
        // @ts-ignore
        oldLM = list_more

        // @ts-ignore
        list_more = async function (): void {
            oldLM();
            await sleep(0.25)
            currentPage++
            getPostAuthorId()
        }

        currentPage = parseInt(location.href.split('page=')[1])

        if (isNaN(currentPage)) {
            currentPage = 1
        }

        getPostAuthorId()
    }
}

function getPostAuthorId(): void {
    if (!Setting.settings.postList.showPostListAuthorId.value) {
        return
    }

    Array.from(document.getElementsByClassName('gall-detail-lst')).forEach(async lst => {
        const gonickPosts = Array.from(lst.children).filter(e => !e.classList.contains('adv-inner'))
            .map(e => {
                const lnktb = Array.from(e.children).find(ce => ce.classList.contains('gall-detail-lnktb'))

                if (!lnktb) {
                    throw Error('gall-detail-lnktb')
                }

                const lt = Array.from(lnktb.children).find(ce => ce.classList.contains('lt'))

                if (!lt) {
                    throw Error('lt')
                }

                const ginfo = Array.from(lt.children).find(ce => ce.classList.contains('ginfo'))

                if (!ginfo) {
                    throw Error('ginfo')
                }

                const spnick = Array.from(ginfo.children).flatMap(ce => Array.from(ce.children)).find(ce => ce.classList.contains('sp-nick') || ce.classList.contains('icon_event'))

                return spnick ? {postId: (lt as HTMLAnchorElement).href.split('/')[5], spnick: spnick} : null
            })
            .filter(e => e) as { postId: string, spnick: Element }[]

        const pis = await getPostList({
            page: currentPage,
            galleryId: location.pathname.split('/')[2],
            boardType: location.href.includes('recommend=1') ? 'recommend' : 'all'
        })

        pis.forEach(pi => {
            const id = pi.id
            const userId = pi.author.userId

            if (userId.length === 0) {
                return
            }

            const spnicks = gonickPosts.filter(gp => gp.postId.startsWith(id)).map(gp => gp.spnick)

            spnicks.forEach(thisSpnick => {
                const parent = thisSpnick.parentElement

                if (!parent || Array.from(parent.children).some(ce => ce.classList.contains('mdcm-user-id'))) {
                    return
                }

                const span = document.createElement('span')
                span.className = 'mdcm-user-id'
                span.textContent = `(${userId})`

                parent.appendChild(span)
            })
        })
    })
}

function sleep(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}
