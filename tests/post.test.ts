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
    })

    describe('getPostAuthorId', () => {
        it('should add post author ID if setting is enabled', () => {
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
    })

    describe('hideUnwantedItems', () => {
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
