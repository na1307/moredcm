import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { getPostList } from '@gurumnyang/dcinside.js'
import { postListFunction } from '../src/postlist'
import { Setting } from '../src/Setting'

// dcinside.js 모의
vi.mock('@gurumnyang/dcinside.js', () => ({
    getPostList: vi.fn()
}))

// Setting 모의
vi.mock('../src/Setting', () => ({
    Setting: {
        settings: {
            postList: {
                showPostListAuthorId: { value: true }
            }
        }
    }
}))

// 전역 list_more 함수 모의를 위한 변수
let mockOriginalListMore: ReturnType<typeof vi.fn>

const setupDOM = () => {
    document.body.innerHTML = `
        <ul class="gall-detail-lst">
            <li>
                <div class="gall-detail-lnktb">
                    <a href="/board/test/12345" class="lt">
                        <ul class="ginfo">
                            <li>
                                고정닉1
                                <span class="sp-nick"></span>
                            </li>
                        </ul>
                    </a>
                </div>
            </li>
            <li>
                <div class="gall-detail-lnktb">
                    <a href="/board/test/54321" class="lt">
                        <ul class="ginfo">
                            <li>유동닉(127.0)</li>
                        </ul>
                    </a>
                </div>
            </li>
        </ul>
        <button id="listMore"></button>
    `
}

describe('postListFunction', () => {
    beforeEach(() => {
        setupDOM()
        vi.stubGlobal('location', {
            href: 'https://m.dcinside.com/board/test?page=1',
            pathname: '/board/test'
        })

        // getPostList 모의 구현
        vi.mocked(getPostList).mockResolvedValue([
            // @ts-expect-error minimal
            { id: '12345', author: { nickname: '고정닉1', userId: 'user1', ip: '' } },
            // @ts-expect-error minimal
            { id: '54321', author: { nickname: '유동닉', userId: '', ip: '127.0' } }
        ])

        // 설정 초기화
        Setting.settings.postList.showPostListAuthorId.value = true

        // original list_more 모의 초기화
        mockOriginalListMore = vi.fn()
        global.list_more = mockOriginalListMore

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    test('lnktb 없음', async () => {
        document.body.innerHTML = `
            <ul class="gall-detail-lst">
                <li>
                    <div>
                        <a href="/board/test/12345" class="lt">
                            <ul class="ginfo">
                                <li>
                                    고정닉1
                                    <span class="sp-nick"></span>
                                </li>
                            </ul>
                        </a>
                    </div>
                </li>
                <li>
                    <div>
                        <a href="/board/test/54321" class="lt">
                            <ul class="ginfo">
                                <li>유동닉(127.0)</li>
                            </ul>
                        </a>
                    </div>
                </li>
            </ul>
            <button id="listMore"></button>
        `

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).toBeNull()
            expect(userIdSpan?.textContent).not.toBe('(user1)')
        })
    })

    test('lt 없음', async () => {
        document.body.innerHTML = `
            <ul class="gall-detail-lst">
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/12345">
                            <ul class="ginfo">
                                <li>
                                    고정닉1
                                    <span class="sp-nick"></span>
                                </li>
                            </ul>
                        </a>
                    </div>
                </li>
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/54321">
                            <ul class="ginfo">
                                <li>유동닉(127.0)</li>
                            </ul>
                        </a>
                    </div>
                </li>
            </ul>
            <button id="listMore"></button>
        `

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).toBeNull()
            expect(userIdSpan?.textContent).not.toBe('(user1)')
        })
    })

    test('ginfo 없음', async () => {
        document.body.innerHTML = `
            <ul class="gall-detail-lst">
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/12345" class="lt">
                            <ul>
                                <li>
                                    고정닉1
                                    <span class="sp-nick"></span>
                                </li>
                            </ul>
                        </a>
                    </div>
                </li>
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/54321" class="lt">
                            <ul>
                                <li>유동닉(127.0)</li>
                            </ul>
                        </a>
                    </div>
                </li>
            </ul>
            <button id="listMore"></button>
        `

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).toBeNull()
            expect(userIdSpan?.textContent).not.toBe('(user1)')
        })
    })

    test('페이지 로드 시 작성자 ID를 표시해야 함 (1페이지)', async () => {
        vi.stubGlobal('location', {
            href: 'https://m.dcinside.com/board/test',
            pathname: '/board/test'
        })

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).not.toBeNull()
            expect(userIdSpan?.textContent).toBe('(user1)')
        })
    })

    test('페이지 로드 시 작성자 ID를 표시해야 함', async () => {
        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).not.toBeNull()
            expect(userIdSpan?.textContent).toBe('(user1)')
        })
    })

    test('페이지 로드 시 작성자 ID를 표시해야 함 (실베 아이콘)', async () => {
        document.body.innerHTML = `
            <ul class="gall-detail-lst">
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/12345" class="lt">
                            <ul class="ginfo">
                                <li>
                                    고정닉1
                                    <span class="icon_event"></span>
                                </li>
                            </ul>
                        </a>
                    </div>
                </li>
                <li>
                    <div class="gall-detail-lnktb">
                        <a href="/board/test/54321" class="lt">
                            <ul class="ginfo">
                                <li>유동닉(127.0)</li>
                            </ul>
                        </a>
                    </div>
                </li>
            </ul>
            <button id="listMore"></button>
        `

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.icon_event')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).not.toBeNull()
            expect(userIdSpan?.textContent).toBe('(user1)')
        })
    })

    test('페이지 로드 시 작성자 ID를 표시해야 함 (개념글)', async () => {
        vi.stubGlobal('location', {
            href: 'https://m.dcinside.com/board/test?recommend=1',
            pathname: '/board/test'
        })

        await postListFunction()
        await vi.waitFor(() => {
            const fixedNickElement = document.querySelector('.sp-nick')
            const userIdSpan = fixedNickElement?.parentElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).not.toBeNull()
            expect(userIdSpan?.textContent).toBe('(user1)')
        })
    })

    test('설정이 비활성화된 경우 ID를 표시하지 않아야 함', async () => {
        Setting.settings.postList.showPostListAuthorId.value = false
        await postListFunction()
        const userIdSpan = document.querySelector('.mdcm-user-id')
        expect(userIdSpan).toBeNull()
    })

    test('더보기 버튼 클릭 시 새로 로드된 게시글에 ID를 표시해야 함', async () => {
        await postListFunction() // 초기화 및 list_more 후킹

        // 후킹된 list_more 호출
        // @ts-expect-error list_more는 전역으로 모의됨
        await global.list_more()
        await vi.waitFor(() => {
            // originalListMore가 호출되었는지 확인
            expect(mockOriginalListMore).toHaveBeenCalledOnce()
            // getPostList가 두 번 호출되었는지 확인 (초기 로드 + 더보기)
            expect(getPostList).toHaveBeenCalledTimes(2)
        })
    })

    test('검색 결과 페이지에서는 실행되지 않아야 함', async () => {
        vi.stubGlobal('location', {
            href: 'https://m.dcinside.com/board/test?serval=검색어',
            pathname: '/board/test'
        })
        // Reset getPostList mock before calling postListFunction for this specific test
        vi.mocked(getPostList).mockClear()
        await postListFunction()
        expect(getPostList).not.toHaveBeenCalled()
    })

    test('더보기 버튼이 없으면 실행되지 않아야 함', async () => {
        document.getElementById('listMore')?.remove()
        // Reset getPostList mock before calling postListFunction for this specific test
        vi.mocked(getPostList).mockClear()
        await postListFunction()
        expect(getPostList).not.toHaveBeenCalled()
    })

    test('유동닉 게시글에는 ID를 표시하지 않아야 함', async () => {
        await postListFunction()
        await vi.waitFor(() => {
            // 유동닉은 sp-nick 클래스를 가지지 않으므로, 직접 텍스트로 찾음
            const nonFixedNickElement = Array.from(document.querySelectorAll('.ginfo li')).find(el => el.textContent?.trim().includes('유동닉'))
            const userIdSpan = nonFixedNickElement?.querySelector('.mdcm-user-id')
            expect(userIdSpan).toBeNull()
        })
    })
})
