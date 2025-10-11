// 다크 모드 자동 설정 기능
import {Setting} from "./Setting";
import {GM_cookie} from "$";

/**
 * 사용자의 시스템 다크 모드 설정에 따라 디시인사이드 다크 모드를 자동으로 설정하는 함수
 * 한 번만 실행되며, 이후에는 사용자가 직접 설정한 값이 유지됨
 */
export function setDarkModeDefault(): void {
    const ids = Setting.settings.isDarkSet

    // 다크 모드를 설정한 적이 없고, 시스템이 다크 모드인 경우
    if (!ids.value && matchMedia("(prefers-color-scheme: dark)").matches) {
        // 디시인사이드 다크 모드 쿠키 설정
        GM_cookie.set({
            name: 'm_dcinside_darkmode',
            value: 'done',
            domain: '.dcinside.com',
            path: '/',
            expirationDate: new Date().getTime() + 60 * 60 * 24 * 365 // 1년
        })

        // 디시인사이드 다크 모드 정보 쿠키 설정
        GM_cookie.set({
            name: 'm_dcinside_darkmode_info',
            value: 'done',
            domain: '.dcinside.com',
            path: '/',
            expirationDate: new Date().getTime() + 60 * 60 * 24 * 365 // 1년
        })

        // 다크 모드 설정 완료 플래그 저장
        ids.value = true
        ids.save()
        // 페이지 새로고침하여 다크 모드 적용
        location.reload()
    }
}
