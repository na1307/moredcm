// 설정
import {GM_deleteValue, GM_getValue, GM_setValue} from "$";

export class Setting {
    static readonly settings = {
        isDarkSet: new Setting('isDarkSet', 'Placeholder', false),
        topMenu: {
            hidePr: new Setting('hidePr', '인물갤 숨기기'),
            hideBj: new Setting('hideBj', 'BJ방송 숨기기'),
            hideGame: new Setting('hideGame', '게임 숨기기'),
            hideEvent: new Setting('hideEvent', '이벤트 숨기기'),
        },
        mainPage: {
            hideTrend: new Setting('hideTrendMain', '디시트렌드/신설갤 숨기기'),
            hideSilbe: new Setting('hideSilbe', '실베 숨기기'),
            hideNews: new Setting('hideNews', '뉴스 숨기기'),
            hideMedia: new Setting('hideMedia', '미디어 숨기기')
        },
        postList: {
            showPostListAuthorId: new Setting('showPostListAuthorId', '게시글 작성자 식별 코드 보이기')
        },
        post: {
            showPostAuthorId: new Setting('showPostAuthorId', '게시글 작성자 식별 코드 보이기'),
            showCommentAuthorId: new Setting('showCommentAuthorId', '댓글 작성자 식별 코드 보이기'),
            hideBottomContents: new Setting('hideBottomContents', '하단 콘텐츠(실베, 뉴스 등) 숨기기')
        },
        hideDaum: new Setting('hideDaum', '게시글/검색 화면에서 다음 검색 숨기기')
    }

    readonly id: string
    readonly title: string
    value: boolean

    constructor(id: string, title: string, defaultValue: boolean = true) {
        this.id = id
        this.title = title
        this.value = GM_getValue(id, defaultValue)
    }

    save(): void {
        GM_setValue(this.id, this.value)
    }

    reset(): void {
        GM_deleteValue(this.id)
    }
}
