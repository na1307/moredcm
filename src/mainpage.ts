// 메인 페이지
import { Setting } from "./Setting"

export function hideUnwantedContents(): void {
    if (location.pathname === '/') {
        noDctrend()
        jokkateunSilsiganBest()
        noDcnews()
        noDcmedia()
    }
}

function noDctrend(): void {
    if (Setting.settings.mainPage.hideTrend.value) {
        Array.from(document.getElementsByClassName('nh-group')).forEach(e => e.remove())
    }
}

function jokkateunSilsiganBest(): void {
    if (Setting.settings.mainPage.hideSilbe.value) {
        Array.from(document.getElementsByClassName('livebest-group')).forEach(e => e.remove())
    }
}

function noDcnews(): void {
    if (Setting.settings.mainPage.hideNews.value) {
        Array.from(document.getElementsByClassName('dna-group')).forEach(e => e.remove())
    }
}

function noDcmedia(): void {
    if (Setting.settings.mainPage.hideMedia.value) {
        Array.from(document.getElementsByClassName('media-group')).forEach(e => e.remove())
    }
}
