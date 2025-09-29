// ==UserScript==
// @name         MoreDCM
// @namespace    npm/vite-plugin-monkey
// @version      1.0-alpha.0
// @author       Bluehill
// @description  dcinside mobile web enhancer
// @license      MIT
// @icon         https://vitejs.dev/logo.svg
// @match        https://m.dcinside.com/*
// @grant        GM_cookie
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  var _GM_cookie = (() => typeof GM_cookie != "undefined" ? GM_cookie : void 0)();
  var _GM_deleteValue = (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0)();
  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  class Setting {
    static settings = {
      isDarkSet: new Setting("isDarkSet", "Placeholder", false),
      topMenu: {
        hidePr: new Setting("hidePr", "인물갤 숨기기"),
        hideBj: new Setting("hideBj", "BJ방송 숨기기"),
        hideTrend: new Setting("hideTrendMenu", "트렌드 숨기기"),
        hideGame: new Setting("hideGame", "게임 숨기기"),
        hideEvent: new Setting("hideEvent", "이벤트 숨기기")
      },
      mainPage: {
        hideTrend: new Setting("hideTrendMain", "디시트렌드/신설갤 숨기기"),
        hideSilbe: new Setting("hideSilbe", "실베 숨기기"),
        hideNews: new Setting("hideNews", "뉴스 숨기기"),
        hideMedia: new Setting("hideMedia", "미디어 숨기기")
      }
    };
    id;
    title;
    value;
    constructor(id, title, defaultValue = true) {
      this.id = id;
      this.title = title;
      this.value = _GM_getValue(id, defaultValue);
    }
    save() {
      _GM_setValue(this.id, this.value);
    }
    reset() {
      _GM_deleteValue(this.id);
    }
  }
  function setDarkModeDefault() {
    const ids = Setting.settings.isDarkSet;
    if (!ids.value && matchMedia("(prefers-color-scheme: dark)").matches) {
      _GM_cookie.set({
        name: "m_dcinside_darkmode",
        value: "done",
        domain: ".dcinside.com",
        path: "/",
        expirationDate: ( new Date()).getTime() + 60 * 60 * 24 * 365
      });
      _GM_cookie.set({
        name: "m_dcinside_darkmode_info",
        value: "done",
        domain: ".dcinside.com",
        path: "/",
        expirationDate: ( new Date()).getTime() + 60 * 60 * 24 * 365
      });
      ids.value = true;
      ids.save();
      location.reload();
    }
  }
  function hideUnwantedMenuItems() {
    const topmenu = document.getElementById("topmenu");
    const toggleBtn = document.getElementById("topmenu_toggle_btn");
    const depthbox = document.getElementById("topmenu_depthbox");
    if (!topmenu || !toggleBtn || !depthbox) {
      return;
    }
    const topmenuUl = topmenu.children.item(0);
    if (!topmenuUl) {
      return;
    }
    const entries = [...Array.from(topmenuUl.children), ...Array.from(depthbox.children)];
    entries.forEach((entry) => entry.classList.remove("swiper-slide"));
    if (Setting.settings.topMenu.hidePr.value) {
      removeEntryByName(entries, "인물갤");
    }
    if (Setting.settings.topMenu.hideBj.value) {
      removeEntryByName(entries, "BJ방송");
    }
    if (Setting.settings.topMenu.hideTrend.value) {
      removeEntryByName(entries, "트렌드");
    }
    if (Setting.settings.topMenu.hideGame.value) {
      removeEntryByName(entries, "게임");
    }
    if (Setting.settings.topMenu.hideEvent.value) {
      removeEntryByName(entries, "이벤트");
    }
    entries.forEach((entry, index) => {
      if (index <= 5) {
        entry.classList.add("swiper-slide");
        if (entry.parentElement === depthbox) {
          depthbox.removeChild(entry);
          topmenuUl.appendChild(entry);
        }
      } else {
        if (entry.parentElement === topmenuUl) {
          topmenuUl.removeChild(entry);
          depthbox.appendChild(entry);
        }
      }
    });
    if (entries.length <= 6) {
      topmenu.classList.remove("swiper-container");
      topmenu.style.paddingRight = "12px";
      topmenu.style.marginRight = "0";
      toggleBtn.remove();
      depthbox.remove();
    }
  }
  function removeEntryByName(elements, name) {
    const element = elements.find((c) => c.children.item(0)?.textContent === name);
    if (!element) {
      throw new Error(`Element ${name} not found`);
    }
    element.remove();
    elements.splice(elements.indexOf(element), 1);
  }
  function hideUnwantedContents() {
    if (location.pathname === "/") {
      noDctrend();
      jokkateunSilsiganBest();
      noDcnews();
      noDcmedia();
    }
  }
  function noDctrend() {
    if (Setting.settings.mainPage.hideTrend.value) {
      Array.from(document.getElementsByClassName("nh-group")).forEach((e) => e.remove());
    }
  }
  function jokkateunSilsiganBest() {
    if (Setting.settings.mainPage.hideSilbe.value) {
      Array.from(document.getElementsByClassName("livebest-group")).forEach((e) => e.remove());
    }
  }
  function noDcnews() {
    if (Setting.settings.mainPage.hideNews.value) {
      Array.from(document.getElementsByClassName("dna-group")).forEach((e) => e.remove());
    }
  }
  function noDcmedia() {
    if (Setting.settings.mainPage.hideMedia.value) {
      Array.from(document.getElementsByClassName("media-group")).forEach((e) => e.remove());
    }
  }
  let mdcmSettingWindow;
  function addMoreDCMSetting() {
    if (location.pathname === "/aside") {
      addSettingEntry();
      addResetEntry();
      addSettingWindow();
    }
  }
  function addSettingEntry() {
    const lst = document.getElementsByClassName("all-setting-lst").item(0);
    if (!lst) {
      throw Error("설정 리스트를 찾을 수 없습니다.");
    }
    const li = document.createElement("li");
    const tit = document.createElement("span");
    tit.className = "tit";
    tit.textContent = "MoreDCM 설정";
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = "MoreDCM 설정을 변경합니다.";
    const rt = document.createElement("div");
    rt.className = "rt";
    const button = document.createElement("button");
    button.classList.add("btn-all-setting", "btn-line-blue");
    button.textContent = "설정";
    button.addEventListener("click", showMdcmSettingWindow);
    rt.appendChild(button);
    li.appendChild(tit);
    li.appendChild(txt);
    li.appendChild(rt);
    lst.appendChild(li);
  }
  function addResetEntry() {
    const lst = document.getElementsByClassName("all-setting-lst").item(0);
    if (!lst) {
      throw Error("설정 리스트를 찾을 수 없습니다.");
    }
    const li = document.createElement("li");
    const tit = document.createElement("span");
    tit.className = "tit";
    tit.textContent = "MoreDCM 설정 초기화";
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.textContent = "MoreDCM 설정을 초기화합니다.";
    const rt = document.createElement("div");
    rt.className = "rt";
    const button = document.createElement("button");
    button.classList.add("btn-all-setting", "btn-line-blue");
    button.textContent = "초기화";
    button.addEventListener("click", resetSetting);
    rt.appendChild(button);
    li.appendChild(tit);
    li.appendChild(txt);
    li.appendChild(rt);
    lst.appendChild(li);
  }
  function addSettingWindow() {
    mdcmSettingWindow = document.createElement("div");
    mdcmSettingWindow.id = "mdcm-setting";
    mdcmSettingWindow.classList.add("layer-center-popup", "full");
    mdcmSettingWindow.style = "display: none";
    const layerPopupInner = document.createElement("div");
    layerPopupInner.className = "layer-popup-inner";
    layerPopupInner.appendChild(createLyTitBox());
    layerPopupInner.appendChild(createMdcmsetLst());
    layerPopupInner.appendChild(createBtmBtnsCtr());
    mdcmSettingWindow.appendChild(layerPopupInner);
    document.body.appendChild(mdcmSettingWindow);
  }
  function createLyTitBox() {
    const lyTitBox = document.createElement("div");
    lyTitBox.className = "ly-tit-box";
    const tit = document.createElement("h3");
    tit.className = "tit";
    tit.textContent = "MoreDCM 설정";
    const rt = document.createElement("div");
    rt.className = "rt";
    const closeButton = document.createElement("a");
    closeButton.className = "btn-x-close";
    closeButton.href = "javascript:hideWindow('mdcm-setting')";
    const blind = document.createElement("span");
    blind.className = "blind";
    blind.textContent = "닫기";
    closeButton.appendChild(blind);
    rt.appendChild(closeButton);
    lyTitBox.appendChild(tit);
    lyTitBox.appendChild(rt);
    return lyTitBox;
  }
  function createMdcmsetLst() {
    const mdcmsetLst = document.createElement("ul");
    mdcmsetLst.className = "noticeset-lst";
    const li1 = document.createElement("li");
    const a1 = document.createElement("a");
    a1.className = "noticeset-lnk";
    const topmenuSetting = document.createElement("span");
    topmenuSetting.className = "ntc";
    topmenuSetting.textContent = "상단 메뉴 설정";
    a1.appendChild(topmenuSetting);
    li1.appendChild(a1);
    const li2 = document.createElement("li");
    const a2 = document.createElement("a");
    a2.className = "noticeset-lnk";
    const mainpageSetting = document.createElement("span");
    mainpageSetting.className = "ntc";
    mainpageSetting.textContent = "메인 화면 설정";
    a2.appendChild(mainpageSetting);
    li2.appendChild(a2);
    mdcmsetLst.appendChild(li1);
    Object.values(Setting.settings.topMenu).forEach((ts) => mdcmsetLst.appendChild(createSettingEntryDepth(ts.id, ts.title, () => ts.value, (v) => ts.value = v)));
    mdcmsetLst.appendChild(li2);
    Object.values(Setting.settings.mainPage).forEach((ts) => mdcmsetLst.appendChild(createSettingEntryDepth(ts.id, ts.title, () => ts.value, (v) => ts.value = v)));
    return mdcmsetLst;
  }
  function createSettingEntryDepth(id, title, get, set) {
    const entry = document.createElement("li");
    entry.className = "depth";
    const a = document.createElement("a");
    a.className = "noticeset-lnk";
    const ntc = document.createElement("span");
    ntc.className = "ntc";
    ntc.textContent = title;
    a.appendChild(ntc);
    const rt = document.createElement("div");
    rt.className = "rt";
    const bgm = document.createElement("span");
    bgm.className = "bgm";
    const label = document.createElement("label");
    label.id = "mdcm-" + id.toLowerCase();
    label.classList.add("bgm-control");
    if (get()) {
      label.classList.add("on");
    }
    label.addEventListener("click", () => updateToggle(label, get, set));
    const ball = document.createElement("span");
    ball.className = "ball";
    label.appendChild(ball);
    bgm.appendChild(label);
    rt.appendChild(bgm);
    entry.appendChild(a);
    entry.appendChild(rt);
    return entry;
  }
  function updateToggle(label, get, set) {
    const value = !get();
    set(value);
    if (value) {
      label.classList.add("on");
    } else {
      label.classList.remove("on");
    }
  }
  function createBtmBtnsCtr() {
    const btmBtnsCtr = document.createElement("div");
    btmBtnsCtr.className = "btm-btns-ctr";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("btn-line", "btn-line-gray");
    cancelButton.addEventListener("click", hideMdcmSettingWindow);
    cancelButton.textContent = "취소";
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.classList.add("btn-line", "btn-line-inblue");
    saveButton.addEventListener("click", saveMdcmSetting);
    saveButton.textContent = "저장";
    btmBtnsCtr.appendChild(cancelButton);
    btmBtnsCtr.appendChild(saveButton);
    return btmBtnsCtr;
  }
  function showMdcmSettingWindow() {
    mdcmSettingWindow.style = "display: block";
  }
  function hideMdcmSettingWindow() {
    mdcmSettingWindow.style = "display: none";
  }
  function saveMdcmSetting() {
    Object.values(Setting.settings.topMenu).forEach((s) => s.save());
    Object.values(Setting.settings.mainPage).forEach((s) => s.save());
    hideMdcmSettingWindow();
  }
  function resetSetting() {
    if (confirm("정말로 초기화할까요?")) {
      Setting.settings.isDarkSet.reset();
      Object.values(Setting.settings.mainPage).forEach((s) => s.reset());
      Object.values(Setting.settings.topMenu).forEach((s) => s.reset());
      location.reload();
    }
  }
  setDarkModeDefault();
  hideUnwantedMenuItems();
  hideUnwantedContents();
  addMoreDCMSetting();

})();