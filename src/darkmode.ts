// 다크 모드
import {Setting} from "./Setting";
import {GM_cookie} from "$";

export function setDarkModeDefault(): void {
    const ids = Setting.settings.isDarkSet

    if (!ids.value && matchMedia("(prefers-color-scheme: dark)").matches) {
        GM_cookie.set({
            name: 'm_dcinside_darkmode',
            value: 'done',
            domain: '.dcinside.com',
            path: '/',
            expirationDate: new Date().getTime() + 60 * 60 * 24 * 365
        })

        GM_cookie.set({
            name: 'm_dcinside_darkmode_info',
            value: 'done',
            domain: '.dcinside.com',
            path: '/',
            expirationDate: new Date().getTime() + 60 * 60 * 24 * 365
        })

        ids.value = true
        ids.save()
        location.reload()
    }
}
