// 메인 페이지 콘텐츠 숨기기 기능
import { Setting } from "./Setting"

/**
 * 메인 페이지에서 원하지 않는 콘텐츠를 숨기는 함수
 * 디시트렌드, 실시간 베스트, 뉴스, 미디어 등을 설정에 따라 숨김
 */
export function hideUnwantedContents(): void {
    // 메인 페이지('/')에서만 실행
    if (location.pathname === '/') {
        noDctrend()
        jokkateunSilsiganBest()
        noDcnews()
        noDcmedia()
    }
}

/**
 * 디시트렌드/신설갤 영역을 숨기는 함수
 */
function noDctrend(): void {
    if (Setting.settings.mainPage.hideTrend.value) {
        Array.from(document.getElementsByClassName('nh-group')).forEach(e => e.remove())
    }
}

/**
 * 실시간 베스트(실베) 영역을 숨기는 함수
 */
function jokkateunSilsiganBest(): void {
    if (Setting.settings.mainPage.hideSilbe.value) {
        Array.from(document.getElementsByClassName('livebest-group')).forEach(e => e.remove())
    }
}

/**
 * 디시 뉴스 영역을 숨기는 함수
 */
function noDcnews(): void {
    if (Setting.settings.mainPage.hideNews.value) {
        Array.from(document.getElementsByClassName('dna-group')).forEach(e => e.remove())
    }
}

/**
 * 디시 미디어 영역을 숨기는 함수
 */
function noDcmedia(): void {
    if (Setting.settings.mainPage.hideMedia.value) {
        Array.from(document.getElementsByClassName('media-group')).forEach(e => e.remove())
    }
}
