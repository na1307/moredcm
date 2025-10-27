import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postFunction } from '../src/post'
import { Setting } from '../src/Setting'

// Mock Setting
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            post: {
                showPostAuthorId: { value: false },
                showCommentAuthorId: { value: false },
                hideBottomContents: { value: false }
            }
        }
    }
}))

// 전역 comment_list 함수 모의를 위한 변수
let mockOriginalCommentList: ReturnType<typeof vi.fn>

// Mock location.pathname
Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, pathname: '/board/galaxy/12345' }
})

describe('post.ts', () => {
    beforeEach(() => {
        // Reset mocks and DOM
        vi.clearAllMocks()
        document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          <a href="https://m.dcinside.com/gallog/unyeongja">
            Author
            <span class="sp-nick"></span>
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
        location.pathname = '/board/galaxy/12345'
        Setting.settings.post.showPostAuthorId.value = false
        Setting.settings.post.showCommentAuthorId.value = false
        Setting.settings.post.hideBottomContents.value = false

        // original comment_list 모의 초기화
        mockOriginalCommentList = vi.fn()
        global.comment_list = mockOriginalCommentList
    })

    describe('getPostAuthorId', () => {
        it('ginfo2 not found',()=>{
            document.body.innerHTML = `
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement).toBeNull()
        })

        it('li not found', () => {
            document.body.innerHTML = `
      <ul class="ginfo2"></ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement).toBeNull()
        })

        it('a not found', () => {
            document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          ㅇㅇ(127.0)
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement).toBeNull()
        })

        it('spnick not found', () => {
            document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          <a href="https://m.dcinside.com/gallog/unyeongja">
            Author
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement.innerHTML).not.toContain('(unyeongja)')
        })

        it('should add post author ID if setting is enabled', () => {
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement.innerHTML).toContain('(unyeongja)')
        })

        it('should add post author ID if setting is enabled (Silbe)', () => {
            document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          <a href="https://m.dcinside.com/gallog/unyeongja">
            Author
            <span class="sp-nick"></span>
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="icon_event"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section>
        <div class="view-btm-con"></div>
      </section>
    `
            Setting.settings.post.showPostAuthorId.value = true
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement.innerHTML).toContain('(unyeongja)')
        })

        it('should not add post author ID if setting is disabled', () => {
            postFunction()
            const authorElement = document.querySelector('.ginfo2 a')!
            expect(authorElement.textContent).not.toContain('(unyeongja)')
        })
    })

    describe('getCommentsAuthorId', () => {
        it('should add comment author IDs if setting is enabled', () => {
            Setting.settings.post.showCommentAuthorId.value = true
            postFunction()
            const commenter1 = document.querySelectorAll('a.nick')[0]
            const commenter2 = document.querySelectorAll('a.nick')[1]
            expect(commenter1.textContent).toContain('(di01)')
            expect(commenter2.textContent).not.toContain('(di01)')
        })

        it('should not add comment author IDs if setting is disabled', () => {
            postFunction()
            const commenter1 = document.querySelectorAll('a.nick')[0]
            expect(commenter1.textContent).not.toContain('(di01)')
        })

        it('should add comment author IDs when refresh clicked', () => {
            Setting.settings.post.showCommentAuthorId.value = true
            postFunction()
            const commenter1 = document.querySelectorAll('a.nick')[0]
            const commenter2 = document.querySelectorAll('a.nick')[1]
            expect(commenter1.textContent).toContain('(di01)')
            expect(commenter2.textContent).not.toContain('(di01)')
            // @ts-expect-error comment_list는 전역으로 모의됨
            global.comment_list()
            // originalCommentList가 호출되었는지 확인
            expect(mockOriginalCommentList).toHaveBeenCalledOnce()
        })
    })

    describe('hideUnwantedItems', () => {
        it('btmcon not found', () => {
            document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          <a href="https://m.dcinside.com/gallog/unyeongja">
            Author
            <span class="sp-nick"></span>
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
      <section></section>
    `
            Setting.settings.post.hideBottomContents.value = true
            postFunction()
            expect(document.querySelector('.view-btm-con')).toBeNull()
        })

        it('btmcon parent not found', () => {
            document.body.innerHTML = `
      <ul class="ginfo2">
        <li>
          <a href="https://m.dcinside.com/gallog/unyeongja">
            Author
            <span class="sp-nick"></span>
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="https://m.dcinside.com/gallog/di01" class="nick">
            Commenter1
            <span class="sp-nick"></span>
          </a>
        </li>
        <li>
          <a class="nick">
            ㅇㅇ
            <span class="ip">(127.0)</span>
          </a>
        </li>
      </ul>
    `
            Setting.settings.post.hideBottomContents.value = true
            postFunction()
            expect(document.querySelector('.view-btm-con')).toBeNull()
        })

        it('should hide bottom contents if setting is enabled', () => {
            Setting.settings.post.hideBottomContents.value = true
            postFunction()
            expect(document.querySelector('.view-btm-con')).toBeNull()
        })

        it('should not hide bottom contents if setting is disabled', () => {
            postFunction()
            expect(document.querySelector('.view-btm-con')).not.toBeNull()
        })
    })

    it('should not run if not on a post page', () => {
        location.pathname = '/board/galaxy'
        Setting.settings.post.showPostAuthorId.value = true
        Setting.settings.post.showCommentAuthorId.value = true
        Setting.settings.post.hideBottomContents.value = true

        postFunction()

        const authorElement = document.querySelector('.ginfo2 a')!
        expect(authorElement.textContent).not.toContain('(unyeonja)')
        const commenter1 = document.querySelectorAll('a.nick')[0]
        expect(commenter1.textContent).not.toContain('(di01)')
        expect(document.querySelector('.view-btm-con')).not.toBeNull()
    })
})
