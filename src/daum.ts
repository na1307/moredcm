// 다음 검색 영역 숨기기 기능
import {Setting} from "./Setting";

/**
 * 디시인사이드 페이지에서 다음 검색 영역을 숨기는 함수
 */
export function hideDaum(): void {
    if (Setting.settings.hideDaum.value) {
        // '다음 검색' 제목 요소 찾기
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')

        if (!daumTit) {
            return
        }

        // 다음 검색 컨테이너(부모의 부모 요소) 찾기
        const container = daumTit.parentElement?.parentElement

        if (!container) {
            console.warn('daum parent')

            return
        }

        // 다음 검색 영역 제거
        container.remove()
    }
}
