// MoreDCM 설정 관리 클래스
import { GM_deleteValue, GM_getValue, GM_setValue } from '$'

/**
 * MoreDCM의 설정을 관리하는 클래스
 * GM_setValue, GM_getValue를 사용하여 설정을 저장하고 불러옴
 */
export class Setting {
    /**
     * 모든 설정 항목들을 정의
     * 각 설정은 카테고리별로 그룹화되어 있음
     */
    static readonly settings = {
        // 다크 모드 설정 여부 플래그 (내부 사용)
        isDarkSet: new Setting('isDarkSet', 'Placeholder', false),
        // 상단 메뉴 설정
        topMenu: {
            hidePr: new Setting('hidePr', '인물갤 숨기기'),
            hideBj: new Setting('hideBj', 'BJ방송 숨기기'),
            hideGame: new Setting('hideGame', '게임 숨기기'),
            hideEvent: new Setting('hideEvent', '이벤트 숨기기')
        },
        // 메인 페이지 설정
        mainPage: {
            hideTrend: new Setting('hideTrendMain', '디시트렌드/신설갤 숨기기'),
            hideSilbe: new Setting('hideSilbe', '실베 숨기기'),
            hideNews: new Setting('hideNews', '뉴스 숨기기'),
            hideMedia: new Setting('hideMedia', '미디어 숨기기')
        },
        // 게시글 목록 설정
        postList: {
            showPostListAuthorId: new Setting('showPostListAuthorId', '게시글 작성자 식별 코드 보이기')
        },
        // 게시글 상세 설정
        post: {
            showPostAuthorId: new Setting('showPostAuthorId', '게시글 작성자 식별 코드 보이기'),
            showCommentAuthorId: new Setting('showCommentAuthorId', '댓글 작성자 식별 코드 보이기'),
            hideBottomContents: new Setting('hideBottomContents', '하단 콘텐츠(실베, 뉴스 등) 숨기기')
        },
        // 다음 검색 숨기기 설정
        hideDaum: new Setting('hideDaum', '게시글/검색 화면에서 다음 검색 숨기기')
    } as const

    readonly id: string // 설정 ID (저장소 키)
    readonly title: string // 설정 제목 (UI에 표시)
    value: boolean // 설정 값

    /**
     * Setting 클래스 생성자
     * @param id 설정 ID (저장소 키로 사용)
     * @param title 설정 제목 (UI에 표시될 이름)
     * @param defaultValue 기본값 (기본값: true)
     */
    constructor(id: string, title: string, defaultValue: boolean = true) {
        this.id = id
        this.title = title
        // GM 저장소에서 값을 불러오거나 기본값 사용
        this.value = GM_getValue(id, defaultValue)
    }

    /**
     * 현재 설정 값을 GM 저장소에 저장
     */
    save(): void {
        GM_setValue(this.id, this.value)
    }

    /**
     * 설정 값을 GM 저장소에서 삭제 (기본값으로 리셋)
     */
    reset(): void {
        GM_deleteValue(this.id)
    }
}
