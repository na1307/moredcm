// 다음 검색 숨기기
import {Setting} from "./Setting";

export function hideDaum(): void {
    if (Setting.settings.hideDaum.value) {
        const daumTit = Array.from(document.getElementsByClassName('md-tit')).find(e => e.textContent === '다음 검색')

        if (!daumTit) {
            return
        }

        const container = daumTit.parentElement?.parentElement

        if (!container) {
            throw Error('daum parent')
        }

        container.remove()
    }
}
