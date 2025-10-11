// ==UserScript==
// @name         MoreDCM
// @namespace    npm/vite-plugin-monkey
// @version      1.0-alpha.2
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
        hideGame: new Setting("hideGame", "게임 숨기기"),
        hideEvent: new Setting("hideEvent", "이벤트 숨기기")
      },
mainPage: {
        hideTrend: new Setting("hideTrendMain", "디시트렌드/신설갤 숨기기"),
        hideSilbe: new Setting("hideSilbe", "실베 숨기기"),
        hideNews: new Setting("hideNews", "뉴스 숨기기"),
        hideMedia: new Setting("hideMedia", "미디어 숨기기")
      },
postList: {
        showPostListAuthorId: new Setting("showPostListAuthorId", "게시글 작성자 식별 코드 보이기")
      },
post: {
        showPostAuthorId: new Setting("showPostAuthorId", "게시글 작성자 식별 코드 보이기"),
        showCommentAuthorId: new Setting("showCommentAuthorId", "댓글 작성자 식별 코드 보이기"),
        hideBottomContents: new Setting("hideBottomContents", "하단 콘텐츠(실베, 뉴스 등) 숨기기")
      },
hideDaum: new Setting("hideDaum", "게시글/검색 화면에서 다음 검색 숨기기")
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
        expirationDate: Date.now() + 60 * 60 * 24 * 365
});
      _GM_cookie.set({
        name: "m_dcinside_darkmode_info",
        value: "done",
        domain: ".dcinside.com",
        path: "/",
        expirationDate: Date.now() + 60 * 60 * 24 * 365
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
    if (Setting.settings.topMenu.hideGame.value) {
      removeEntryByName(entries, "게임");
    }
    if (Setting.settings.topMenu.hideEvent.value) {
      removeEntryByName(entries, "이벤트");
    }
    entries.forEach((entry, index2) => {
      if (index2 <= 5) {
        entry.classList.add("swiper-slide");
        if (entry.parentElement === depthbox) {
          entry.remove();
          topmenuUl.appendChild(entry);
        }
      } else if (entry.parentElement === topmenuUl) {
        entry.remove();
        depthbox.appendChild(entry);
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
      console.warn(`${name} 상단 메뉴 항목을 찾을 수 없습니다!`);
      return;
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
      console.warn("설정 리스트를 찾을 수 없습니다.");
      return;
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
      console.warn("설정 리스트를 찾을 수 없습니다.");
      return;
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
    const li3 = document.createElement("li");
    const a3 = document.createElement("a");
    a3.className = "noticeset-lnk";
    const postListSetting = document.createElement("span");
    postListSetting.className = "ntc";
    postListSetting.textContent = "게시글 목록 설정";
    a3.appendChild(postListSetting);
    li3.appendChild(a3);
    const li4 = document.createElement("li");
    const a4 = document.createElement("a");
    a4.className = "noticeset-lnk";
    const postSetting = document.createElement("span");
    postSetting.className = "ntc";
    postSetting.textContent = "게시글 목록 설정";
    a4.appendChild(postSetting);
    li4.appendChild(a4);
    mdcmsetLst.appendChild(li1);
    Object.values(Setting.settings.topMenu).forEach((ts) => mdcmsetLst.appendChild(createSettingEntry(ts, true)));
    mdcmsetLst.appendChild(li2);
    Object.values(Setting.settings.mainPage).forEach((ts) => mdcmsetLst.appendChild(createSettingEntry(ts, true)));
    mdcmsetLst.appendChild(li3);
    Object.values(Setting.settings.postList).forEach((ts) => mdcmsetLst.appendChild(createSettingEntry(ts, true)));
    mdcmsetLst.appendChild(li4);
    Object.values(Setting.settings.post).forEach((ts) => mdcmsetLst.appendChild(createSettingEntry(ts, true)));
    mdcmsetLst.appendChild(createSettingEntry(Setting.settings.hideDaum, false));
    return mdcmsetLst;
  }
  function createSettingEntry(ts, depth) {
    const entry = document.createElement("li");
    if (depth) {
      entry.className = "depth";
    }
    const a = document.createElement("a");
    a.className = "noticeset-lnk";
    const ntc = document.createElement("span");
    ntc.className = "ntc";
    ntc.textContent = ts.title;
    a.appendChild(ntc);
    const rt = document.createElement("div");
    rt.className = "rt";
    const bgm = document.createElement("span");
    bgm.className = "bgm";
    const label = document.createElement("label");
    label.id = "mdcm-" + ts.id.toLowerCase();
    label.classList.add("bgm-control");
    if (ts.value) {
      label.classList.add("on");
    }
    label.addEventListener("click", () => updateToggle(label, ts));
    const ball = document.createElement("span");
    ball.className = "ball";
    label.appendChild(ball);
    bgm.appendChild(label);
    rt.appendChild(bgm);
    entry.appendChild(a);
    entry.appendChild(rt);
    return entry;
  }
  function updateToggle(label, ts) {
    const value = !ts.value;
    ts.value = value;
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
    Object.values(Setting.settings.postList).forEach((s) => s.save());
    Object.values(Setting.settings.post).forEach((s) => s.save());
    Setting.settings.hideDaum.save();
    hideMdcmSettingWindow();
  }
  function resetSetting() {
    if (confirm("정말로 초기화할까요?")) {
      Setting.settings.isDarkSet.reset();
      Object.values(Setting.settings.mainPage).forEach((s) => s.reset());
      Object.values(Setting.settings.topMenu).forEach((s) => s.reset());
      Object.values(Setting.settings.postList).forEach((s) => s.reset());
      Object.values(Setting.settings.post).forEach((s) => s.reset());
      Setting.settings.hideDaum.reset();
      location.reload();
    }
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  function getAugmentedNamespace(n) {
    if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
    var f = n.default;
    if (typeof f == "function") {
      var a = function a2() {
        var isInstance = false;
        try {
          isInstance = this instanceof a2;
        } catch {
        }
        if (isInstance) {
          return Reflect.construct(f, arguments, this.constructor);
        }
        return f.apply(this, arguments);
      };
      a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, "__esModule", { value: true });
    Object.keys(n).forEach(function(k) {
      var d = Object.getOwnPropertyDescriptor(n, k);
      Object.defineProperty(a, k, d.get ? d : {
        enumerable: true,
        get: function() {
          return n[k];
        }
      });
    });
    return a;
  }
  var ElementType;
  (function(ElementType2) {
    ElementType2["Root"] = "root";
    ElementType2["Text"] = "text";
    ElementType2["Directive"] = "directive";
    ElementType2["Comment"] = "comment";
    ElementType2["Script"] = "script";
    ElementType2["Style"] = "style";
    ElementType2["Tag"] = "tag";
    ElementType2["CDATA"] = "cdata";
    ElementType2["Doctype"] = "doctype";
  })(ElementType || (ElementType = {}));
  function isTag$1(elem) {
    return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
  }
  const Root = ElementType.Root;
  const Text$1 = ElementType.Text;
  const Directive = ElementType.Directive;
  const Comment$1 = ElementType.Comment;
  const Script = ElementType.Script;
  const Style = ElementType.Style;
  const Tag = ElementType.Tag;
  const CDATA$1 = ElementType.CDATA;
  const Doctype = ElementType.Doctype;
  class Node {
    constructor() {
      this.parent = null;
      this.prev = null;
      this.next = null;
      this.startIndex = null;
      this.endIndex = null;
    }

get parentNode() {
      return this.parent;
    }
    set parentNode(parent2) {
      this.parent = parent2;
    }
get previousSibling() {
      return this.prev;
    }
    set previousSibling(prev2) {
      this.prev = prev2;
    }
get nextSibling() {
      return this.next;
    }
    set nextSibling(next2) {
      this.next = next2;
    }
cloneNode(recursive = false) {
      return cloneNode(this, recursive);
    }
  }
  class DataNode extends Node {
constructor(data2) {
      super();
      this.data = data2;
    }
get nodeValue() {
      return this.data;
    }
    set nodeValue(data2) {
      this.data = data2;
    }
  }
  class Text extends DataNode {
    constructor() {
      super(...arguments);
      this.type = ElementType.Text;
    }
    get nodeType() {
      return 3;
    }
  }
  class Comment extends DataNode {
    constructor() {
      super(...arguments);
      this.type = ElementType.Comment;
    }
    get nodeType() {
      return 8;
    }
  }
  class ProcessingInstruction extends DataNode {
    constructor(name, data2) {
      super(data2);
      this.name = name;
      this.type = ElementType.Directive;
    }
    get nodeType() {
      return 1;
    }
  }
  class NodeWithChildren extends Node {
constructor(children2) {
      super();
      this.children = children2;
    }

get firstChild() {
      var _a2;
      return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
    }
get lastChild() {
      return this.children.length > 0 ? this.children[this.children.length - 1] : null;
    }
get childNodes() {
      return this.children;
    }
    set childNodes(children2) {
      this.children = children2;
    }
  }
  class CDATA extends NodeWithChildren {
    constructor() {
      super(...arguments);
      this.type = ElementType.CDATA;
    }
    get nodeType() {
      return 4;
    }
  }
  class Document extends NodeWithChildren {
    constructor() {
      super(...arguments);
      this.type = ElementType.Root;
    }
    get nodeType() {
      return 9;
    }
  }
  class Element extends NodeWithChildren {
constructor(name, attribs, children2 = [], type = name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag) {
      super(children2);
      this.name = name;
      this.attribs = attribs;
      this.type = type;
    }
    get nodeType() {
      return 1;
    }

get tagName() {
      return this.name;
    }
    set tagName(name) {
      this.name = name;
    }
    get attributes() {
      return Object.keys(this.attribs).map((name) => {
        var _a2, _b;
        return {
          name,
          value: this.attribs[name],
          namespace: (_a2 = this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name],
          prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
        };
      });
    }
  }
  function isTag(node) {
    return isTag$1(node);
  }
  function isCDATA(node) {
    return node.type === ElementType.CDATA;
  }
  function isText(node) {
    return node.type === ElementType.Text;
  }
  function isComment(node) {
    return node.type === ElementType.Comment;
  }
  function isDirective(node) {
    return node.type === ElementType.Directive;
  }
  function isDocument(node) {
    return node.type === ElementType.Root;
  }
  function hasChildren(node) {
    return Object.prototype.hasOwnProperty.call(node, "children");
  }
  function cloneNode(node, recursive = false) {
    let result;
    if (isText(node)) {
      result = new Text(node.data);
    } else if (isComment(node)) {
      result = new Comment(node.data);
    } else if (isTag(node)) {
      const children2 = recursive ? cloneChildren(node.children) : [];
      const clone2 = new Element(node.name, { ...node.attribs }, children2);
      children2.forEach((child) => child.parent = clone2);
      if (node.namespace != null) {
        clone2.namespace = node.namespace;
      }
      if (node["x-attribsNamespace"]) {
        clone2["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
      }
      if (node["x-attribsPrefix"]) {
        clone2["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
      }
      result = clone2;
    } else if (isCDATA(node)) {
      const children2 = recursive ? cloneChildren(node.children) : [];
      const clone2 = new CDATA(children2);
      children2.forEach((child) => child.parent = clone2);
      result = clone2;
    } else if (isDocument(node)) {
      const children2 = recursive ? cloneChildren(node.children) : [];
      const clone2 = new Document(children2);
      children2.forEach((child) => child.parent = clone2);
      if (node["x-mode"]) {
        clone2["x-mode"] = node["x-mode"];
      }
      result = clone2;
    } else if (isDirective(node)) {
      const instruction = new ProcessingInstruction(node.name, node.data);
      if (node["x-name"] != null) {
        instruction["x-name"] = node["x-name"];
        instruction["x-publicId"] = node["x-publicId"];
        instruction["x-systemId"] = node["x-systemId"];
      }
      result = instruction;
    } else {
      throw new Error(`Not implemented yet: ${node.type}`);
    }
    result.startIndex = node.startIndex;
    result.endIndex = node.endIndex;
    if (node.sourceCodeLocation != null) {
      result.sourceCodeLocation = node.sourceCodeLocation;
    }
    return result;
  }
  function cloneChildren(childs) {
    const children2 = childs.map((child) => cloneNode(child, true));
    for (let i = 1; i < children2.length; i++) {
      children2[i].prev = children2[i - 1];
      children2[i - 1].next = children2[i];
    }
    return children2;
  }
  const defaultOpts$2 = {
    withStartIndices: false,
    withEndIndices: false,
    xmlMode: false
  };
  class DomHandler {
constructor(callback, options, elementCB) {
      this.dom = [];
      this.root = new Document(this.dom);
      this.done = false;
      this.tagStack = [this.root];
      this.lastNode = null;
      this.parser = null;
      if (typeof options === "function") {
        elementCB = options;
        options = defaultOpts$2;
      }
      if (typeof callback === "object") {
        options = callback;
        callback = void 0;
      }
      this.callback = callback !== null && callback !== void 0 ? callback : null;
      this.options = options !== null && options !== void 0 ? options : defaultOpts$2;
      this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
    }
    onparserinit(parser) {
      this.parser = parser;
    }
onreset() {
      this.dom = [];
      this.root = new Document(this.dom);
      this.done = false;
      this.tagStack = [this.root];
      this.lastNode = null;
      this.parser = null;
    }
onend() {
      if (this.done)
        return;
      this.done = true;
      this.parser = null;
      this.handleCallback(null);
    }
    onerror(error2) {
      this.handleCallback(error2);
    }
    onclosetag() {
      this.lastNode = null;
      const elem = this.tagStack.pop();
      if (this.options.withEndIndices) {
        elem.endIndex = this.parser.endIndex;
      }
      if (this.elementCB)
        this.elementCB(elem);
    }
    onopentag(name, attribs) {
      const type = this.options.xmlMode ? ElementType.Tag : void 0;
      const element = new Element(name, attribs, void 0, type);
      this.addNode(element);
      this.tagStack.push(element);
    }
    ontext(data2) {
      const { lastNode } = this;
      if (lastNode && lastNode.type === ElementType.Text) {
        lastNode.data += data2;
        if (this.options.withEndIndices) {
          lastNode.endIndex = this.parser.endIndex;
        }
      } else {
        const node = new Text(data2);
        this.addNode(node);
        this.lastNode = node;
      }
    }
    oncomment(data2) {
      if (this.lastNode && this.lastNode.type === ElementType.Comment) {
        this.lastNode.data += data2;
        return;
      }
      const node = new Comment(data2);
      this.addNode(node);
      this.lastNode = node;
    }
    oncommentend() {
      this.lastNode = null;
    }
    oncdatastart() {
      const text2 = new Text("");
      const node = new CDATA([text2]);
      this.addNode(node);
      text2.parent = node;
      this.lastNode = text2;
    }
    oncdataend() {
      this.lastNode = null;
    }
    onprocessinginstruction(name, data2) {
      const node = new ProcessingInstruction(name, data2);
      this.addNode(node);
    }
    handleCallback(error2) {
      if (typeof this.callback === "function") {
        this.callback(error2, this.dom);
      } else if (error2) {
        throw error2;
      }
    }
    addNode(node) {
      const parent2 = this.tagStack[this.tagStack.length - 1];
      const previousSibling = parent2.children[parent2.children.length - 1];
      if (this.options.withStartIndices) {
        node.startIndex = this.parser.startIndex;
      }
      if (this.options.withEndIndices) {
        node.endIndex = this.parser.endIndex;
      }
      parent2.children.push(node);
      if (previousSibling) {
        node.prev = previousSibling;
        previousSibling.next = node;
      }
      node.parent = parent2;
      this.lastNode = null;
    }
  }
  const xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
  const xmlCodeMap = new Map([
    [34, "&quot;"],
    [38, "&amp;"],
    [39, "&apos;"],
    [60, "&lt;"],
    [62, "&gt;"]
  ]);
  const getCodePoint = (
String.prototype.codePointAt != null ? (str, index2) => str.codePointAt(index2) : (
(c, index2) => (c.charCodeAt(index2) & 64512) === 55296 ? (c.charCodeAt(index2) - 55296) * 1024 + c.charCodeAt(index2 + 1) - 56320 + 65536 : c.charCodeAt(index2)
    )
  );
  function encodeXML(str) {
    let ret = "";
    let lastIdx = 0;
    let match;
    while ((match = xmlReplacer.exec(str)) !== null) {
      const i = match.index;
      const char = str.charCodeAt(i);
      const next2 = xmlCodeMap.get(char);
      if (next2 !== void 0) {
        ret += str.substring(lastIdx, i) + next2;
        lastIdx = i + 1;
      } else {
        ret += `${str.substring(lastIdx, i)}&#x${getCodePoint(str, i).toString(16)};`;
        lastIdx = xmlReplacer.lastIndex += Number((char & 64512) === 55296);
      }
    }
    return ret + str.substr(lastIdx);
  }
  function getEscaper$1(regex, map2) {
    return function escape(data2) {
      let match;
      let lastIdx = 0;
      let result = "";
      while (match = regex.exec(data2)) {
        if (lastIdx !== match.index) {
          result += data2.substring(lastIdx, match.index);
        }
        result += map2.get(match[0].charCodeAt(0));
        lastIdx = match.index + 1;
      }
      return result + data2.substring(lastIdx);
    };
  }
  const escapeAttribute$1 = getEscaper$1(/["&\u00A0]/g, new Map([
    [34, "&quot;"],
    [38, "&amp;"],
    [160, "&nbsp;"]
  ]));
  const escapeText$1 = getEscaper$1(/[&<>\u00A0]/g, new Map([
    [38, "&amp;"],
    [60, "&lt;"],
    [62, "&gt;"],
    [160, "&nbsp;"]
  ]));
  const elementNames = new Map([
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "clipPath",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "foreignObject",
    "glyphRef",
    "linearGradient",
    "radialGradient",
    "textPath"
  ].map((val2) => [val2.toLowerCase(), val2]));
  const attributeNames = new Map([
    "definitionURL",
    "attributeName",
    "attributeType",
    "baseFrequency",
    "baseProfile",
    "calcMode",
    "clipPathUnits",
    "diffuseConstant",
    "edgeMode",
    "filterUnits",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "kernelMatrix",
    "kernelUnitLength",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "limitingConeAngle",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "specularConstant",
    "specularExponent",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stitchTiles",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textLength",
    "viewBox",
    "viewTarget",
    "xChannelSelector",
    "yChannelSelector",
    "zoomAndPan"
  ].map((val2) => [val2.toLowerCase(), val2]));
  const unencodedElements = new Set([
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
  ]);
  function replaceQuotes(value) {
    return value.replace(/"/g, "&quot;");
  }
  function formatAttributes(attributes2, opts) {
    var _a2;
    if (!attributes2)
      return;
    const encode = ((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute$1;
    return Object.keys(attributes2).map((key) => {
      var _a3, _b;
      const value = (_a3 = attributes2[key]) !== null && _a3 !== void 0 ? _a3 : "";
      if (opts.xmlMode === "foreign") {
        key = (_b = attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
      }
      if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
        return key;
      }
      return `${key}="${encode(value)}"`;
    }).join(" ");
  }
  const singleTag = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  function render$1(node, options = {}) {
    const nodes = "length" in node ? node : [node];
    let output = "";
    for (let i = 0; i < nodes.length; i++) {
      output += renderNode(nodes[i], options);
    }
    return output;
  }
  function renderNode(node, options) {
    switch (node.type) {
      case Root:
        return render$1(node.children, options);
case Doctype:
      case Directive:
        return renderDirective(node);
      case Comment$1:
        return renderComment(node);
      case CDATA$1:
        return renderCdata(node);
      case Script:
      case Style:
      case Tag:
        return renderTag(node, options);
      case Text$1:
        return renderText(node, options);
    }
  }
  const foreignModeIntegrationPoints = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
  ]);
  const foreignElements = new Set(["svg", "math"]);
  function renderTag(elem, opts) {
    var _a2;
    if (opts.xmlMode === "foreign") {
      elem.name = (_a2 = elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
      if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
        opts = { ...opts, xmlMode: false };
      }
    }
    if (!opts.xmlMode && foreignElements.has(elem.name)) {
      opts = { ...opts, xmlMode: "foreign" };
    }
    let tag = `<${elem.name}`;
    const attribs = formatAttributes(elem.attribs, opts);
    if (attribs) {
      tag += ` ${attribs}`;
    }
    if (elem.children.length === 0 && (opts.xmlMode ? (
opts.selfClosingTags !== false
    ) : (
opts.selfClosingTags && singleTag.has(elem.name)
    ))) {
      if (!opts.xmlMode)
        tag += " ";
      tag += "/>";
    } else {
      tag += ">";
      if (elem.children.length > 0) {
        tag += render$1(elem.children, opts);
      }
      if (opts.xmlMode || !singleTag.has(elem.name)) {
        tag += `</${elem.name}>`;
      }
    }
    return tag;
  }
  function renderDirective(elem) {
    return `<${elem.data}>`;
  }
  function renderText(elem, opts) {
    var _a2;
    let data2 = elem.data || "";
    if (((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
      data2 = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data2) : escapeText$1(data2);
    }
    return data2;
  }
  function renderCdata(elem) {
    return `<![CDATA[${elem.children[0].data}]]>`;
  }
  function renderComment(elem) {
    return `<!--${elem.data}-->`;
  }
  function getOuterHTML(node, options) {
    return render$1(node, options);
  }
  function getInnerHTML(node, options) {
    return hasChildren(node) ? node.children.map((node2) => getOuterHTML(node2, options)).join("") : "";
  }
  function getText(node) {
    if (Array.isArray(node))
      return node.map(getText).join("");
    if (isTag(node))
      return node.name === "br" ? "\n" : getText(node.children);
    if (isCDATA(node))
      return getText(node.children);
    if (isText(node))
      return node.data;
    return "";
  }
  function textContent(node) {
    if (Array.isArray(node))
      return node.map(textContent).join("");
    if (hasChildren(node) && !isComment(node)) {
      return textContent(node.children);
    }
    if (isText(node))
      return node.data;
    return "";
  }
  function innerText(node) {
    if (Array.isArray(node))
      return node.map(innerText).join("");
    if (hasChildren(node) && (node.type === ElementType.Tag || isCDATA(node))) {
      return innerText(node.children);
    }
    if (isText(node))
      return node.data;
    return "";
  }
  function getChildren(elem) {
    return hasChildren(elem) ? elem.children : [];
  }
  function getParent(elem) {
    return elem.parent || null;
  }
  function getSiblings(elem) {
    const parent2 = getParent(elem);
    if (parent2 != null)
      return getChildren(parent2);
    const siblings2 = [elem];
    let { prev: prev2, next: next2 } = elem;
    while (prev2 != null) {
      siblings2.unshift(prev2);
      ({ prev: prev2 } = prev2);
    }
    while (next2 != null) {
      siblings2.push(next2);
      ({ next: next2 } = next2);
    }
    return siblings2;
  }
  function getAttributeValue(elem, name) {
    var _a2;
    return (_a2 = elem.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
  }
  function hasAttrib(elem, name) {
    return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
  }
  function getName(elem) {
    return elem.name;
  }
  function nextElementSibling(elem) {
    let { next: next2 } = elem;
    while (next2 !== null && !isTag(next2))
      ({ next: next2 } = next2);
    return next2;
  }
  function prevElementSibling(elem) {
    let { prev: prev2 } = elem;
    while (prev2 !== null && !isTag(prev2))
      ({ prev: prev2 } = prev2);
    return prev2;
  }
  function removeElement(elem) {
    if (elem.prev)
      elem.prev.next = elem.next;
    if (elem.next)
      elem.next.prev = elem.prev;
    if (elem.parent) {
      const childs = elem.parent.children;
      const childsIndex = childs.lastIndexOf(elem);
      if (childsIndex >= 0) {
        childs.splice(childsIndex, 1);
      }
    }
    elem.next = null;
    elem.prev = null;
    elem.parent = null;
  }
  function replaceElement(elem, replacement) {
    const prev2 = replacement.prev = elem.prev;
    if (prev2) {
      prev2.next = replacement;
    }
    const next2 = replacement.next = elem.next;
    if (next2) {
      next2.prev = replacement;
    }
    const parent2 = replacement.parent = elem.parent;
    if (parent2) {
      const childs = parent2.children;
      childs[childs.lastIndexOf(elem)] = replacement;
      elem.parent = null;
    }
  }
  function appendChild(parent2, child) {
    removeElement(child);
    child.next = null;
    child.parent = parent2;
    if (parent2.children.push(child) > 1) {
      const sibling = parent2.children[parent2.children.length - 2];
      sibling.next = child;
      child.prev = sibling;
    } else {
      child.prev = null;
    }
  }
  function append$1(elem, next2) {
    removeElement(next2);
    const { parent: parent2 } = elem;
    const currNext = elem.next;
    next2.next = currNext;
    next2.prev = elem;
    elem.next = next2;
    next2.parent = parent2;
    if (currNext) {
      currNext.prev = next2;
      if (parent2) {
        const childs = parent2.children;
        childs.splice(childs.lastIndexOf(currNext), 0, next2);
      }
    } else if (parent2) {
      parent2.children.push(next2);
    }
  }
  function prependChild(parent2, child) {
    removeElement(child);
    child.parent = parent2;
    child.prev = null;
    if (parent2.children.unshift(child) !== 1) {
      const sibling = parent2.children[1];
      sibling.prev = child;
      child.next = sibling;
    } else {
      child.next = null;
    }
  }
  function prepend$1(elem, prev2) {
    removeElement(prev2);
    const { parent: parent2 } = elem;
    if (parent2) {
      const childs = parent2.children;
      childs.splice(childs.indexOf(elem), 0, prev2);
    }
    if (elem.prev) {
      elem.prev.next = prev2;
    }
    prev2.parent = parent2;
    prev2.prev = elem.prev;
    prev2.next = elem;
    elem.prev = prev2;
  }
  function filter$2(test, node, recurse = true, limit = Infinity) {
    return find$2(test, Array.isArray(node) ? node : [node], recurse, limit);
  }
  function find$2(test, nodes, recurse, limit) {
    const result = [];
    const nodeStack = [Array.isArray(nodes) ? nodes : [nodes]];
    const indexStack = [0];
    for (; ; ) {
      if (indexStack[0] >= nodeStack[0].length) {
        if (indexStack.length === 1) {
          return result;
        }
        nodeStack.shift();
        indexStack.shift();
        continue;
      }
      const elem = nodeStack[0][indexStack[0]++];
      if (test(elem)) {
        result.push(elem);
        if (--limit <= 0)
          return result;
      }
      if (recurse && hasChildren(elem) && elem.children.length > 0) {
        indexStack.unshift(0);
        nodeStack.unshift(elem.children);
      }
    }
  }
  function findOneChild(test, nodes) {
    return nodes.find(test);
  }
  function findOne(test, nodes, recurse = true) {
    const searchedNodes = Array.isArray(nodes) ? nodes : [nodes];
    for (let i = 0; i < searchedNodes.length; i++) {
      const node = searchedNodes[i];
      if (isTag(node) && test(node)) {
        return node;
      }
      if (recurse && hasChildren(node) && node.children.length > 0) {
        const found = findOne(test, node.children, true);
        if (found)
          return found;
      }
    }
    return null;
  }
  function existsOne(test, nodes) {
    return (Array.isArray(nodes) ? nodes : [nodes]).some((node) => isTag(node) && test(node) || hasChildren(node) && existsOne(test, node.children));
  }
  function findAll(test, nodes) {
    const result = [];
    const nodeStack = [Array.isArray(nodes) ? nodes : [nodes]];
    const indexStack = [0];
    for (; ; ) {
      if (indexStack[0] >= nodeStack[0].length) {
        if (nodeStack.length === 1) {
          return result;
        }
        nodeStack.shift();
        indexStack.shift();
        continue;
      }
      const elem = nodeStack[0][indexStack[0]++];
      if (isTag(elem) && test(elem))
        result.push(elem);
      if (hasChildren(elem) && elem.children.length > 0) {
        indexStack.unshift(0);
        nodeStack.unshift(elem.children);
      }
    }
  }
  const Checks = {
    tag_name(name) {
      if (typeof name === "function") {
        return (elem) => isTag(elem) && name(elem.name);
      } else if (name === "*") {
        return isTag;
      }
      return (elem) => isTag(elem) && elem.name === name;
    },
    tag_type(type) {
      if (typeof type === "function") {
        return (elem) => type(elem.type);
      }
      return (elem) => elem.type === type;
    },
    tag_contains(data2) {
      if (typeof data2 === "function") {
        return (elem) => isText(elem) && data2(elem.data);
      }
      return (elem) => isText(elem) && elem.data === data2;
    }
  };
  function getAttribCheck(attrib, value) {
    if (typeof value === "function") {
      return (elem) => isTag(elem) && value(elem.attribs[attrib]);
    }
    return (elem) => isTag(elem) && elem.attribs[attrib] === value;
  }
  function combineFuncs(a, b) {
    return (elem) => a(elem) || b(elem);
  }
  function compileTest(options) {
    const funcs = Object.keys(options).map((key) => {
      const value = options[key];
      return Object.prototype.hasOwnProperty.call(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
    });
    return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
  }
  function testElement(options, node) {
    const test = compileTest(options);
    return test ? test(node) : true;
  }
  function getElements(options, nodes, recurse, limit = Infinity) {
    const test = compileTest(options);
    return test ? filter$2(test, nodes, recurse, limit) : [];
  }
  function getElementById(id, nodes, recurse = true) {
    if (!Array.isArray(nodes))
      nodes = [nodes];
    return findOne(getAttribCheck("id", id), nodes, recurse);
  }
  function getElementsByTagName(tagName, nodes, recurse = true, limit = Infinity) {
    return filter$2(Checks["tag_name"](tagName), nodes, recurse, limit);
  }
  function getElementsByClassName(className, nodes, recurse = true, limit = Infinity) {
    return filter$2(getAttribCheck("class", className), nodes, recurse, limit);
  }
  function getElementsByTagType(type, nodes, recurse = true, limit = Infinity) {
    return filter$2(Checks["tag_type"](type), nodes, recurse, limit);
  }
  function removeSubsets(nodes) {
    let idx = nodes.length;
    while (--idx >= 0) {
      const node = nodes[idx];
      if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
        nodes.splice(idx, 1);
        continue;
      }
      for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
        if (nodes.includes(ancestor)) {
          nodes.splice(idx, 1);
          break;
        }
      }
    }
    return nodes;
  }
  var DocumentPosition;
  (function(DocumentPosition2) {
    DocumentPosition2[DocumentPosition2["DISCONNECTED"] = 1] = "DISCONNECTED";
    DocumentPosition2[DocumentPosition2["PRECEDING"] = 2] = "PRECEDING";
    DocumentPosition2[DocumentPosition2["FOLLOWING"] = 4] = "FOLLOWING";
    DocumentPosition2[DocumentPosition2["CONTAINS"] = 8] = "CONTAINS";
    DocumentPosition2[DocumentPosition2["CONTAINED_BY"] = 16] = "CONTAINED_BY";
  })(DocumentPosition || (DocumentPosition = {}));
  function compareDocumentPosition(nodeA, nodeB) {
    const aParents = [];
    const bParents = [];
    if (nodeA === nodeB) {
      return 0;
    }
    let current = hasChildren(nodeA) ? nodeA : nodeA.parent;
    while (current) {
      aParents.unshift(current);
      current = current.parent;
    }
    current = hasChildren(nodeB) ? nodeB : nodeB.parent;
    while (current) {
      bParents.unshift(current);
      current = current.parent;
    }
    const maxIdx = Math.min(aParents.length, bParents.length);
    let idx = 0;
    while (idx < maxIdx && aParents[idx] === bParents[idx]) {
      idx++;
    }
    if (idx === 0) {
      return DocumentPosition.DISCONNECTED;
    }
    const sharedParent = aParents[idx - 1];
    const siblings2 = sharedParent.children;
    const aSibling = aParents[idx];
    const bSibling = bParents[idx];
    if (siblings2.indexOf(aSibling) > siblings2.indexOf(bSibling)) {
      if (sharedParent === nodeB) {
        return DocumentPosition.FOLLOWING | DocumentPosition.CONTAINED_BY;
      }
      return DocumentPosition.FOLLOWING;
    }
    if (sharedParent === nodeA) {
      return DocumentPosition.PRECEDING | DocumentPosition.CONTAINS;
    }
    return DocumentPosition.PRECEDING;
  }
  function uniqueSort(nodes) {
    nodes = nodes.filter((node, i, arr) => !arr.includes(node, i + 1));
    nodes.sort((a, b) => {
      const relative = compareDocumentPosition(a, b);
      if (relative & DocumentPosition.PRECEDING) {
        return -1;
      } else if (relative & DocumentPosition.FOLLOWING) {
        return 1;
      }
      return 0;
    });
    return nodes;
  }
  function getFeed(doc) {
    const feedRoot = getOneElement(isValidFeed, doc);
    return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
  }
  function getAtomFeed(feedRoot) {
    var _a2;
    const childs = feedRoot.children;
    const feed = {
      type: "atom",
      items: getElementsByTagName("entry", childs).map((item) => {
        var _a3;
        const { children: children2 } = item;
        const entry = { media: getMediaElements(children2) };
        addConditionally(entry, "id", "id", children2);
        addConditionally(entry, "title", "title", children2);
        const href2 = (_a3 = getOneElement("link", children2)) === null || _a3 === void 0 ? void 0 : _a3.attribs["href"];
        if (href2) {
          entry.link = href2;
        }
        const description = fetch$1("summary", children2) || fetch$1("content", children2);
        if (description) {
          entry.description = description;
        }
        const pubDate = fetch$1("updated", children2);
        if (pubDate) {
          entry.pubDate = new Date(pubDate);
        }
        return entry;
      })
    };
    addConditionally(feed, "id", "id", childs);
    addConditionally(feed, "title", "title", childs);
    const href = (_a2 = getOneElement("link", childs)) === null || _a2 === void 0 ? void 0 : _a2.attribs["href"];
    if (href) {
      feed.link = href;
    }
    addConditionally(feed, "description", "subtitle", childs);
    const updated = fetch$1("updated", childs);
    if (updated) {
      feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "email", childs, true);
    return feed;
  }
  function getRssFeed(feedRoot) {
    var _a2, _b;
    const childs = (_b = (_a2 = getOneElement("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b !== void 0 ? _b : [];
    const feed = {
      type: feedRoot.name.substr(0, 3),
      id: "",
      items: getElementsByTagName("item", feedRoot.children).map((item) => {
        const { children: children2 } = item;
        const entry = { media: getMediaElements(children2) };
        addConditionally(entry, "id", "guid", children2);
        addConditionally(entry, "title", "title", children2);
        addConditionally(entry, "link", "link", children2);
        addConditionally(entry, "description", "description", children2);
        const pubDate = fetch$1("pubDate", children2) || fetch$1("dc:date", children2);
        if (pubDate)
          entry.pubDate = new Date(pubDate);
        return entry;
      })
    };
    addConditionally(feed, "title", "title", childs);
    addConditionally(feed, "link", "link", childs);
    addConditionally(feed, "description", "description", childs);
    const updated = fetch$1("lastBuildDate", childs);
    if (updated) {
      feed.updated = new Date(updated);
    }
    addConditionally(feed, "author", "managingEditor", childs, true);
    return feed;
  }
  const MEDIA_KEYS_STRING = ["url", "type", "lang"];
  const MEDIA_KEYS_INT = [
    "fileSize",
    "bitrate",
    "framerate",
    "samplingrate",
    "channels",
    "duration",
    "height",
    "width"
  ];
  function getMediaElements(where) {
    return getElementsByTagName("media:content", where).map((elem) => {
      const { attribs } = elem;
      const media = {
        medium: attribs["medium"],
        isDefault: !!attribs["isDefault"]
      };
      for (const attrib of MEDIA_KEYS_STRING) {
        if (attribs[attrib]) {
          media[attrib] = attribs[attrib];
        }
      }
      for (const attrib of MEDIA_KEYS_INT) {
        if (attribs[attrib]) {
          media[attrib] = parseInt(attribs[attrib], 10);
        }
      }
      if (attribs["expression"]) {
        media.expression = attribs["expression"];
      }
      return media;
    });
  }
  function getOneElement(tagName, node) {
    return getElementsByTagName(tagName, node, true, 1)[0];
  }
  function fetch$1(tagName, where, recurse = false) {
    return textContent(getElementsByTagName(tagName, where, recurse, 1)).trim();
  }
  function addConditionally(obj, prop2, tagName, where, recurse = false) {
    const val2 = fetch$1(tagName, where, recurse);
    if (val2)
      obj[prop2] = val2;
  }
  function isValidFeed(value) {
    return value === "rss" || value === "feed" || value === "rdf:RDF";
  }
  const DomUtils = Object.freeze( Object.defineProperty({
    __proto__: null,
    get DocumentPosition() {
      return DocumentPosition;
    },
    append: append$1,
    appendChild,
    compareDocumentPosition,
    existsOne,
    filter: filter$2,
    find: find$2,
    findAll,
    findOne,
    findOneChild,
    getAttributeValue,
    getChildren,
    getElementById,
    getElements,
    getElementsByClassName,
    getElementsByTagName,
    getElementsByTagType,
    getFeed,
    getInnerHTML,
    getName,
    getOuterHTML,
    getParent,
    getSiblings,
    getText,
    hasAttrib,
    hasChildren,
    innerText,
    isCDATA,
    isComment,
    isDocument,
    isTag,
    isText,
    nextElementSibling,
    prepend: prepend$1,
    prependChild,
    prevElementSibling,
    removeElement,
    removeSubsets,
    replaceElement,
    testElement,
    textContent,
    uniqueSort
  }, Symbol.toStringTag, { value: "Module" }));
  const defaultOpts$1 = {
    _useHtmlParser2: false
  };
  function flattenOptions(options, baseOptions) {
    if (!options) {
      return baseOptions !== null && baseOptions !== void 0 ? baseOptions : defaultOpts$1;
    }
    const opts = {
      _useHtmlParser2: !!options.xmlMode,
      ...baseOptions,
      ...options
    };
    if (options.xml) {
      opts._useHtmlParser2 = true;
      opts.xmlMode = true;
      if (options.xml !== true) {
        Object.assign(opts, options.xml);
      }
    } else if (options.xmlMode) {
      opts._useHtmlParser2 = true;
    }
    return opts;
  }
  function render(that, dom, options) {
    if (!that)
      return "";
    return that(dom !== null && dom !== void 0 ? dom : that._root.children, null, void 0, options).toString();
  }
  function isOptions(dom, options) {
    return typeof dom === "object" && dom != null && !("length" in dom) && !("type" in dom);
  }
  function html$2(dom, options) {
    const toRender = isOptions(dom) ? (options = dom, void 0) : dom;
    const opts = {
      ...this === null || this === void 0 ? void 0 : this._options,
      ...flattenOptions(options)
    };
    return render(this, toRender, opts);
  }
  function xml(dom) {
    const options = { ...this._options, xmlMode: true };
    return render(this, dom, options);
  }
  function text$1(elements) {
    const elems = elements !== null && elements !== void 0 ? elements : this ? this.root() : [];
    let ret = "";
    for (let i = 0; i < elems.length; i++) {
      ret += textContent(elems[i]);
    }
    return ret;
  }
  function parseHTML(data2, context, keepScripts = typeof context === "boolean" ? context : false) {
    if (!data2 || typeof data2 !== "string") {
      return null;
    }
    if (typeof context === "boolean") {
      keepScripts = context;
    }
    const parsed = this.load(data2, this._options, false);
    if (!keepScripts) {
      parsed("script").remove();
    }
    return [...parsed.root()[0].children];
  }
  function root() {
    return this(this._root);
  }
  function contains(container, contained) {
    if (contained === container) {
      return false;
    }
    let next2 = contained;
    while (next2 && next2 !== next2.parent) {
      next2 = next2.parent;
      if (next2 === container) {
        return true;
      }
    }
    return false;
  }
  function extract$1(map2) {
    return this.root().extract(map2);
  }
  function merge(arr1, arr2) {
    if (!isArrayLike(arr1) || !isArrayLike(arr2)) {
      return;
    }
    let newLength = arr1.length;
    const len = +arr2.length;
    for (let i = 0; i < len; i++) {
      arr1[newLength++] = arr2[i];
    }
    arr1.length = newLength;
    return arr1;
  }
  function isArrayLike(item) {
    if (Array.isArray(item)) {
      return true;
    }
    if (typeof item !== "object" || item === null || !("length" in item) || typeof item.length !== "number" || item.length < 0) {
      return false;
    }
    for (let i = 0; i < item.length; i++) {
      if (!(i in item)) {
        return false;
      }
    }
    return true;
  }
  const staticMethods = Object.freeze( Object.defineProperty({
    __proto__: null,
    contains,
    extract: extract$1,
    html: html$2,
    merge,
    parseHTML,
    root,
    text: text$1,
    xml
  }, Symbol.toStringTag, { value: "Module" }));
  function isCheerio(maybeCheerio) {
    return maybeCheerio.cheerio != null;
  }
  function camelCase(str) {
    return str.replace(/[._-](\w|$)/g, (_, x) => x.toUpperCase());
  }
  function cssCase(str) {
    return str.replace(/[A-Z]/g, "-$&").toLowerCase();
  }
  function domEach(array, fn) {
    const len = array.length;
    for (let i = 0; i < len; i++)
      fn(array[i], i);
    return array;
  }
  var CharacterCode;
  (function(CharacterCode2) {
    CharacterCode2[CharacterCode2["LowerA"] = 97] = "LowerA";
    CharacterCode2[CharacterCode2["LowerZ"] = 122] = "LowerZ";
    CharacterCode2[CharacterCode2["UpperA"] = 65] = "UpperA";
    CharacterCode2[CharacterCode2["UpperZ"] = 90] = "UpperZ";
    CharacterCode2[CharacterCode2["Exclamation"] = 33] = "Exclamation";
  })(CharacterCode || (CharacterCode = {}));
  function isHtml(str) {
    const tagStart = str.indexOf("<");
    if (tagStart === -1 || tagStart > str.length - 3)
      return false;
    const tagChar = str.charCodeAt(tagStart + 1);
    return (tagChar >= CharacterCode.LowerA && tagChar <= CharacterCode.LowerZ || tagChar >= CharacterCode.UpperA && tagChar <= CharacterCode.UpperZ || tagChar === CharacterCode.Exclamation) && str.includes(">", tagStart + 2);
  }
  const htmlDecodeTree = new Uint16Array(

'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((c) => c.charCodeAt(0))
  );
  const xmlDecodeTree = new Uint16Array(

"Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((c) => c.charCodeAt(0))
  );
  var _a$1;
  const decodeMap = new Map([
    [0, 65533],
[128, 8364],
    [130, 8218],
    [131, 402],
    [132, 8222],
    [133, 8230],
    [134, 8224],
    [135, 8225],
    [136, 710],
    [137, 8240],
    [138, 352],
    [139, 8249],
    [140, 338],
    [142, 381],
    [145, 8216],
    [146, 8217],
    [147, 8220],
    [148, 8221],
    [149, 8226],
    [150, 8211],
    [151, 8212],
    [152, 732],
    [153, 8482],
    [154, 353],
    [155, 8250],
    [156, 339],
    [158, 382],
    [159, 376]
  ]);
  const fromCodePoint = (
(_a$1 = String.fromCodePoint) !== null && _a$1 !== void 0 ? _a$1 : function(codePoint) {
      let output = "";
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += String.fromCharCode(codePoint);
      return output;
    }
  );
  function replaceCodePoint(codePoint) {
    var _a2;
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return 65533;
    }
    return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
  }
  var CharCodes$1;
  (function(CharCodes2) {
    CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
    CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
    CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
    CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
    CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
    CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
    CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
    CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
    CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
    CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
    CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
    CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
  })(CharCodes$1 || (CharCodes$1 = {}));
  const TO_LOWER_BIT = 32;
  var BinTrieFlags;
  (function(BinTrieFlags2) {
    BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
    BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
  })(BinTrieFlags || (BinTrieFlags = {}));
  function isNumber(code) {
    return code >= CharCodes$1.ZERO && code <= CharCodes$1.NINE;
  }
  function isHexadecimalCharacter(code) {
    return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_F || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_F;
  }
  function isAsciiAlphaNumeric$1(code) {
    return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_Z || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_Z || isNumber(code);
  }
  function isEntityInAttributeInvalidEnd(code) {
    return code === CharCodes$1.EQUALS || isAsciiAlphaNumeric$1(code);
  }
  var EntityDecoderState;
  (function(EntityDecoderState2) {
    EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
    EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
    EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
    EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
    EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
  })(EntityDecoderState || (EntityDecoderState = {}));
  var DecodingMode;
  (function(DecodingMode2) {
    DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
    DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
    DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
  })(DecodingMode || (DecodingMode = {}));
  class EntityDecoder {
    constructor(decodeTree, emitCodePoint, errors) {
      this.decodeTree = decodeTree;
      this.emitCodePoint = emitCodePoint;
      this.errors = errors;
      this.state = EntityDecoderState.EntityStart;
      this.consumed = 1;
      this.result = 0;
      this.treeIndex = 0;
      this.excess = 1;
      this.decodeMode = DecodingMode.Strict;
    }
startEntity(decodeMode) {
      this.decodeMode = decodeMode;
      this.state = EntityDecoderState.EntityStart;
      this.result = 0;
      this.treeIndex = 0;
      this.excess = 1;
      this.consumed = 1;
    }
write(input, offset) {
      switch (this.state) {
        case EntityDecoderState.EntityStart: {
          if (input.charCodeAt(offset) === CharCodes$1.NUM) {
            this.state = EntityDecoderState.NumericStart;
            this.consumed += 1;
            return this.stateNumericStart(input, offset + 1);
          }
          this.state = EntityDecoderState.NamedEntity;
          return this.stateNamedEntity(input, offset);
        }
        case EntityDecoderState.NumericStart: {
          return this.stateNumericStart(input, offset);
        }
        case EntityDecoderState.NumericDecimal: {
          return this.stateNumericDecimal(input, offset);
        }
        case EntityDecoderState.NumericHex: {
          return this.stateNumericHex(input, offset);
        }
        case EntityDecoderState.NamedEntity: {
          return this.stateNamedEntity(input, offset);
        }
      }
    }
stateNumericStart(input, offset) {
      if (offset >= input.length) {
        return -1;
      }
      if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes$1.LOWER_X) {
        this.state = EntityDecoderState.NumericHex;
        this.consumed += 1;
        return this.stateNumericHex(input, offset + 1);
      }
      this.state = EntityDecoderState.NumericDecimal;
      return this.stateNumericDecimal(input, offset);
    }
    addToNumericResult(input, start, end2, base) {
      if (start !== end2) {
        const digitCount = end2 - start;
        this.result = this.result * Math.pow(base, digitCount) + Number.parseInt(input.substr(start, digitCount), base);
        this.consumed += digitCount;
      }
    }
stateNumericHex(input, offset) {
      const startIndex = offset;
      while (offset < input.length) {
        const char = input.charCodeAt(offset);
        if (isNumber(char) || isHexadecimalCharacter(char)) {
          offset += 1;
        } else {
          this.addToNumericResult(input, startIndex, offset, 16);
          return this.emitNumericEntity(char, 3);
        }
      }
      this.addToNumericResult(input, startIndex, offset, 16);
      return -1;
    }
stateNumericDecimal(input, offset) {
      const startIndex = offset;
      while (offset < input.length) {
        const char = input.charCodeAt(offset);
        if (isNumber(char)) {
          offset += 1;
        } else {
          this.addToNumericResult(input, startIndex, offset, 10);
          return this.emitNumericEntity(char, 2);
        }
      }
      this.addToNumericResult(input, startIndex, offset, 10);
      return -1;
    }
emitNumericEntity(lastCp, expectedLength) {
      var _a2;
      if (this.consumed <= expectedLength) {
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      if (lastCp === CharCodes$1.SEMI) {
        this.consumed += 1;
      } else if (this.decodeMode === DecodingMode.Strict) {
        return 0;
      }
      this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
      if (this.errors) {
        if (lastCp !== CharCodes$1.SEMI) {
          this.errors.missingSemicolonAfterCharacterReference();
        }
        this.errors.validateNumericCharacterReference(this.result);
      }
      return this.consumed;
    }
stateNamedEntity(input, offset) {
      const { decodeTree } = this;
      let current = decodeTree[this.treeIndex];
      let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      for (; offset < input.length; offset++, this.excess++) {
        const char = input.charCodeAt(offset);
        this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
        if (this.treeIndex < 0) {
          return this.result === 0 ||
this.decodeMode === DecodingMode.Attribute &&
(valueLength === 0 ||
isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
        }
        current = decodeTree[this.treeIndex];
        valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
        if (valueLength !== 0) {
          if (char === CharCodes$1.SEMI) {
            return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
          }
          if (this.decodeMode !== DecodingMode.Strict) {
            this.result = this.treeIndex;
            this.consumed += this.excess;
            this.excess = 0;
          }
        }
      }
      return -1;
    }
emitNotTerminatedNamedEntity() {
      var _a2;
      const { result, decodeTree } = this;
      const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
      this.emitNamedEntityData(result, valueLength, this.consumed);
      (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
      return this.consumed;
    }
emitNamedEntityData(result, valueLength, consumed) {
      const { decodeTree } = this;
      this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
      if (valueLength === 3) {
        this.emitCodePoint(decodeTree[result + 2], consumed);
      }
      return consumed;
    }
end() {
      var _a2;
      switch (this.state) {
        case EntityDecoderState.NamedEntity: {
          return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
        }
case EntityDecoderState.NumericDecimal: {
          return this.emitNumericEntity(0, 2);
        }
        case EntityDecoderState.NumericHex: {
          return this.emitNumericEntity(0, 3);
        }
        case EntityDecoderState.NumericStart: {
          (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
          return 0;
        }
        case EntityDecoderState.EntityStart: {
          return 0;
        }
      }
    }
  }
  function determineBranch(decodeTree, current, nodeIndex, char) {
    const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
    const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
    if (branchCount === 0) {
      return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
    }
    if (jumpOffset) {
      const value = char - jumpOffset;
      return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
    }
    let lo = nodeIndex;
    let hi = lo + branchCount - 1;
    while (lo <= hi) {
      const mid = lo + hi >>> 1;
      const midValue = decodeTree[mid];
      if (midValue < char) {
        lo = mid + 1;
      } else if (midValue > char) {
        hi = mid - 1;
      } else {
        return decodeTree[mid + branchCount];
      }
    }
    return -1;
  }
  var CharCodes;
  (function(CharCodes2) {
    CharCodes2[CharCodes2["Tab"] = 9] = "Tab";
    CharCodes2[CharCodes2["NewLine"] = 10] = "NewLine";
    CharCodes2[CharCodes2["FormFeed"] = 12] = "FormFeed";
    CharCodes2[CharCodes2["CarriageReturn"] = 13] = "CarriageReturn";
    CharCodes2[CharCodes2["Space"] = 32] = "Space";
    CharCodes2[CharCodes2["ExclamationMark"] = 33] = "ExclamationMark";
    CharCodes2[CharCodes2["Number"] = 35] = "Number";
    CharCodes2[CharCodes2["Amp"] = 38] = "Amp";
    CharCodes2[CharCodes2["SingleQuote"] = 39] = "SingleQuote";
    CharCodes2[CharCodes2["DoubleQuote"] = 34] = "DoubleQuote";
    CharCodes2[CharCodes2["Dash"] = 45] = "Dash";
    CharCodes2[CharCodes2["Slash"] = 47] = "Slash";
    CharCodes2[CharCodes2["Zero"] = 48] = "Zero";
    CharCodes2[CharCodes2["Nine"] = 57] = "Nine";
    CharCodes2[CharCodes2["Semi"] = 59] = "Semi";
    CharCodes2[CharCodes2["Lt"] = 60] = "Lt";
    CharCodes2[CharCodes2["Eq"] = 61] = "Eq";
    CharCodes2[CharCodes2["Gt"] = 62] = "Gt";
    CharCodes2[CharCodes2["Questionmark"] = 63] = "Questionmark";
    CharCodes2[CharCodes2["UpperA"] = 65] = "UpperA";
    CharCodes2[CharCodes2["LowerA"] = 97] = "LowerA";
    CharCodes2[CharCodes2["UpperF"] = 70] = "UpperF";
    CharCodes2[CharCodes2["LowerF"] = 102] = "LowerF";
    CharCodes2[CharCodes2["UpperZ"] = 90] = "UpperZ";
    CharCodes2[CharCodes2["LowerZ"] = 122] = "LowerZ";
    CharCodes2[CharCodes2["LowerX"] = 120] = "LowerX";
    CharCodes2[CharCodes2["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
  })(CharCodes || (CharCodes = {}));
  var State$1;
  (function(State2) {
    State2[State2["Text"] = 1] = "Text";
    State2[State2["BeforeTagName"] = 2] = "BeforeTagName";
    State2[State2["InTagName"] = 3] = "InTagName";
    State2[State2["InSelfClosingTag"] = 4] = "InSelfClosingTag";
    State2[State2["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
    State2[State2["InClosingTagName"] = 6] = "InClosingTagName";
    State2[State2["AfterClosingTagName"] = 7] = "AfterClosingTagName";
    State2[State2["BeforeAttributeName"] = 8] = "BeforeAttributeName";
    State2[State2["InAttributeName"] = 9] = "InAttributeName";
    State2[State2["AfterAttributeName"] = 10] = "AfterAttributeName";
    State2[State2["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
    State2[State2["InAttributeValueDq"] = 12] = "InAttributeValueDq";
    State2[State2["InAttributeValueSq"] = 13] = "InAttributeValueSq";
    State2[State2["InAttributeValueNq"] = 14] = "InAttributeValueNq";
    State2[State2["BeforeDeclaration"] = 15] = "BeforeDeclaration";
    State2[State2["InDeclaration"] = 16] = "InDeclaration";
    State2[State2["InProcessingInstruction"] = 17] = "InProcessingInstruction";
    State2[State2["BeforeComment"] = 18] = "BeforeComment";
    State2[State2["CDATASequence"] = 19] = "CDATASequence";
    State2[State2["InSpecialComment"] = 20] = "InSpecialComment";
    State2[State2["InCommentLike"] = 21] = "InCommentLike";
    State2[State2["BeforeSpecialS"] = 22] = "BeforeSpecialS";
    State2[State2["BeforeSpecialT"] = 23] = "BeforeSpecialT";
    State2[State2["SpecialStartSequence"] = 24] = "SpecialStartSequence";
    State2[State2["InSpecialTag"] = 25] = "InSpecialTag";
    State2[State2["InEntity"] = 26] = "InEntity";
  })(State$1 || (State$1 = {}));
  function isWhitespace$2(c) {
    return c === CharCodes.Space || c === CharCodes.NewLine || c === CharCodes.Tab || c === CharCodes.FormFeed || c === CharCodes.CarriageReturn;
  }
  function isEndOfTagSection(c) {
    return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace$2(c);
  }
  function isASCIIAlpha(c) {
    return c >= CharCodes.LowerA && c <= CharCodes.LowerZ || c >= CharCodes.UpperA && c <= CharCodes.UpperZ;
  }
  var QuoteType;
  (function(QuoteType2) {
    QuoteType2[QuoteType2["NoValue"] = 0] = "NoValue";
    QuoteType2[QuoteType2["Unquoted"] = 1] = "Unquoted";
    QuoteType2[QuoteType2["Single"] = 2] = "Single";
    QuoteType2[QuoteType2["Double"] = 3] = "Double";
  })(QuoteType || (QuoteType = {}));
  const Sequences = {
    Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
CdataEnd: new Uint8Array([93, 93, 62]),
CommentEnd: new Uint8Array([45, 45, 62]),
ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101]),
TextareaEnd: new Uint8Array([
      60,
      47,
      116,
      101,
      120,
      116,
      97,
      114,
      101,
      97
    ]),
XmpEnd: new Uint8Array([60, 47, 120, 109, 112])
};
  let Tokenizer$1 = class Tokenizer {
    constructor({ xmlMode = false, decodeEntities = true }, cbs) {
      this.cbs = cbs;
      this.state = State$1.Text;
      this.buffer = "";
      this.sectionStart = 0;
      this.index = 0;
      this.entityStart = 0;
      this.baseState = State$1.Text;
      this.isSpecial = false;
      this.running = true;
      this.offset = 0;
      this.currentSequence = void 0;
      this.sequenceIndex = 0;
      this.xmlMode = xmlMode;
      this.decodeEntities = decodeEntities;
      this.entityDecoder = new EntityDecoder(xmlMode ? xmlDecodeTree : htmlDecodeTree, (cp, consumed) => this.emitCodePoint(cp, consumed));
    }
    reset() {
      this.state = State$1.Text;
      this.buffer = "";
      this.sectionStart = 0;
      this.index = 0;
      this.baseState = State$1.Text;
      this.currentSequence = void 0;
      this.running = true;
      this.offset = 0;
    }
    write(chunk) {
      this.offset += this.buffer.length;
      this.buffer = chunk;
      this.parse();
    }
    end() {
      if (this.running)
        this.finish();
    }
    pause() {
      this.running = false;
    }
    resume() {
      this.running = true;
      if (this.index < this.buffer.length + this.offset) {
        this.parse();
      }
    }
    stateText(c) {
      if (c === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
        if (this.index > this.sectionStart) {
          this.cbs.ontext(this.sectionStart, this.index);
        }
        this.state = State$1.BeforeTagName;
        this.sectionStart = this.index;
      } else if (this.decodeEntities && c === CharCodes.Amp) {
        this.startEntity();
      }
    }
    stateSpecialStartSequence(c) {
      const isEnd = this.sequenceIndex === this.currentSequence.length;
      const isMatch = isEnd ? (
isEndOfTagSection(c)
      ) : (
(c | 32) === this.currentSequence[this.sequenceIndex]
      );
      if (!isMatch) {
        this.isSpecial = false;
      } else if (!isEnd) {
        this.sequenceIndex++;
        return;
      }
      this.sequenceIndex = 0;
      this.state = State$1.InTagName;
      this.stateInTagName(c);
    }
stateInSpecialTag(c) {
      if (this.sequenceIndex === this.currentSequence.length) {
        if (c === CharCodes.Gt || isWhitespace$2(c)) {
          const endOfText = this.index - this.currentSequence.length;
          if (this.sectionStart < endOfText) {
            const actualIndex = this.index;
            this.index = endOfText;
            this.cbs.ontext(this.sectionStart, endOfText);
            this.index = actualIndex;
          }
          this.isSpecial = false;
          this.sectionStart = endOfText + 2;
          this.stateInClosingTagName(c);
          return;
        }
        this.sequenceIndex = 0;
      }
      if ((c | 32) === this.currentSequence[this.sequenceIndex]) {
        this.sequenceIndex += 1;
      } else if (this.sequenceIndex === 0) {
        if (this.currentSequence === Sequences.TitleEnd) {
          if (this.decodeEntities && c === CharCodes.Amp) {
            this.startEntity();
          }
        } else if (this.fastForwardTo(CharCodes.Lt)) {
          this.sequenceIndex = 1;
        }
      } else {
        this.sequenceIndex = Number(c === CharCodes.Lt);
      }
    }
    stateCDATASequence(c) {
      if (c === Sequences.Cdata[this.sequenceIndex]) {
        if (++this.sequenceIndex === Sequences.Cdata.length) {
          this.state = State$1.InCommentLike;
          this.currentSequence = Sequences.CdataEnd;
          this.sequenceIndex = 0;
          this.sectionStart = this.index + 1;
        }
      } else {
        this.sequenceIndex = 0;
        this.state = State$1.InDeclaration;
        this.stateInDeclaration(c);
      }
    }
fastForwardTo(c) {
      while (++this.index < this.buffer.length + this.offset) {
        if (this.buffer.charCodeAt(this.index - this.offset) === c) {
          return true;
        }
      }
      this.index = this.buffer.length + this.offset - 1;
      return false;
    }
stateInCommentLike(c) {
      if (c === this.currentSequence[this.sequenceIndex]) {
        if (++this.sequenceIndex === this.currentSequence.length) {
          if (this.currentSequence === Sequences.CdataEnd) {
            this.cbs.oncdata(this.sectionStart, this.index, 2);
          } else {
            this.cbs.oncomment(this.sectionStart, this.index, 2);
          }
          this.sequenceIndex = 0;
          this.sectionStart = this.index + 1;
          this.state = State$1.Text;
        }
      } else if (this.sequenceIndex === 0) {
        if (this.fastForwardTo(this.currentSequence[0])) {
          this.sequenceIndex = 1;
        }
      } else if (c !== this.currentSequence[this.sequenceIndex - 1]) {
        this.sequenceIndex = 0;
      }
    }
isTagStartChar(c) {
      return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
    }
    startSpecial(sequence, offset) {
      this.isSpecial = true;
      this.currentSequence = sequence;
      this.sequenceIndex = offset;
      this.state = State$1.SpecialStartSequence;
    }
    stateBeforeTagName(c) {
      if (c === CharCodes.ExclamationMark) {
        this.state = State$1.BeforeDeclaration;
        this.sectionStart = this.index + 1;
      } else if (c === CharCodes.Questionmark) {
        this.state = State$1.InProcessingInstruction;
        this.sectionStart = this.index + 1;
      } else if (this.isTagStartChar(c)) {
        const lower = c | 32;
        this.sectionStart = this.index;
        if (this.xmlMode) {
          this.state = State$1.InTagName;
        } else if (lower === Sequences.ScriptEnd[2]) {
          this.state = State$1.BeforeSpecialS;
        } else if (lower === Sequences.TitleEnd[2] || lower === Sequences.XmpEnd[2]) {
          this.state = State$1.BeforeSpecialT;
        } else {
          this.state = State$1.InTagName;
        }
      } else if (c === CharCodes.Slash) {
        this.state = State$1.BeforeClosingTagName;
      } else {
        this.state = State$1.Text;
        this.stateText(c);
      }
    }
    stateInTagName(c) {
      if (isEndOfTagSection(c)) {
        this.cbs.onopentagname(this.sectionStart, this.index);
        this.sectionStart = -1;
        this.state = State$1.BeforeAttributeName;
        this.stateBeforeAttributeName(c);
      }
    }
    stateBeforeClosingTagName(c) {
      if (isWhitespace$2(c)) ;
      else if (c === CharCodes.Gt) {
        this.state = State$1.Text;
      } else {
        this.state = this.isTagStartChar(c) ? State$1.InClosingTagName : State$1.InSpecialComment;
        this.sectionStart = this.index;
      }
    }
    stateInClosingTagName(c) {
      if (c === CharCodes.Gt || isWhitespace$2(c)) {
        this.cbs.onclosetag(this.sectionStart, this.index);
        this.sectionStart = -1;
        this.state = State$1.AfterClosingTagName;
        this.stateAfterClosingTagName(c);
      }
    }
    stateAfterClosingTagName(c) {
      if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
        this.state = State$1.Text;
        this.sectionStart = this.index + 1;
      }
    }
    stateBeforeAttributeName(c) {
      if (c === CharCodes.Gt) {
        this.cbs.onopentagend(this.index);
        if (this.isSpecial) {
          this.state = State$1.InSpecialTag;
          this.sequenceIndex = 0;
        } else {
          this.state = State$1.Text;
        }
        this.sectionStart = this.index + 1;
      } else if (c === CharCodes.Slash) {
        this.state = State$1.InSelfClosingTag;
      } else if (!isWhitespace$2(c)) {
        this.state = State$1.InAttributeName;
        this.sectionStart = this.index;
      }
    }
    stateInSelfClosingTag(c) {
      if (c === CharCodes.Gt) {
        this.cbs.onselfclosingtag(this.index);
        this.state = State$1.Text;
        this.sectionStart = this.index + 1;
        this.isSpecial = false;
      } else if (!isWhitespace$2(c)) {
        this.state = State$1.BeforeAttributeName;
        this.stateBeforeAttributeName(c);
      }
    }
    stateInAttributeName(c) {
      if (c === CharCodes.Eq || isEndOfTagSection(c)) {
        this.cbs.onattribname(this.sectionStart, this.index);
        this.sectionStart = this.index;
        this.state = State$1.AfterAttributeName;
        this.stateAfterAttributeName(c);
      }
    }
    stateAfterAttributeName(c) {
      if (c === CharCodes.Eq) {
        this.state = State$1.BeforeAttributeValue;
      } else if (c === CharCodes.Slash || c === CharCodes.Gt) {
        this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
        this.sectionStart = -1;
        this.state = State$1.BeforeAttributeName;
        this.stateBeforeAttributeName(c);
      } else if (!isWhitespace$2(c)) {
        this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
        this.state = State$1.InAttributeName;
        this.sectionStart = this.index;
      }
    }
    stateBeforeAttributeValue(c) {
      if (c === CharCodes.DoubleQuote) {
        this.state = State$1.InAttributeValueDq;
        this.sectionStart = this.index + 1;
      } else if (c === CharCodes.SingleQuote) {
        this.state = State$1.InAttributeValueSq;
        this.sectionStart = this.index + 1;
      } else if (!isWhitespace$2(c)) {
        this.sectionStart = this.index;
        this.state = State$1.InAttributeValueNq;
        this.stateInAttributeValueNoQuotes(c);
      }
    }
    handleInAttributeValue(c, quote) {
      if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
        this.cbs.onattribdata(this.sectionStart, this.index);
        this.sectionStart = -1;
        this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index + 1);
        this.state = State$1.BeforeAttributeName;
      } else if (this.decodeEntities && c === CharCodes.Amp) {
        this.startEntity();
      }
    }
    stateInAttributeValueDoubleQuotes(c) {
      this.handleInAttributeValue(c, CharCodes.DoubleQuote);
    }
    stateInAttributeValueSingleQuotes(c) {
      this.handleInAttributeValue(c, CharCodes.SingleQuote);
    }
    stateInAttributeValueNoQuotes(c) {
      if (isWhitespace$2(c) || c === CharCodes.Gt) {
        this.cbs.onattribdata(this.sectionStart, this.index);
        this.sectionStart = -1;
        this.cbs.onattribend(QuoteType.Unquoted, this.index);
        this.state = State$1.BeforeAttributeName;
        this.stateBeforeAttributeName(c);
      } else if (this.decodeEntities && c === CharCodes.Amp) {
        this.startEntity();
      }
    }
    stateBeforeDeclaration(c) {
      if (c === CharCodes.OpeningSquareBracket) {
        this.state = State$1.CDATASequence;
        this.sequenceIndex = 0;
      } else {
        this.state = c === CharCodes.Dash ? State$1.BeforeComment : State$1.InDeclaration;
      }
    }
    stateInDeclaration(c) {
      if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
        this.cbs.ondeclaration(this.sectionStart, this.index);
        this.state = State$1.Text;
        this.sectionStart = this.index + 1;
      }
    }
    stateInProcessingInstruction(c) {
      if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
        this.cbs.onprocessinginstruction(this.sectionStart, this.index);
        this.state = State$1.Text;
        this.sectionStart = this.index + 1;
      }
    }
    stateBeforeComment(c) {
      if (c === CharCodes.Dash) {
        this.state = State$1.InCommentLike;
        this.currentSequence = Sequences.CommentEnd;
        this.sequenceIndex = 2;
        this.sectionStart = this.index + 1;
      } else {
        this.state = State$1.InDeclaration;
      }
    }
    stateInSpecialComment(c) {
      if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
        this.cbs.oncomment(this.sectionStart, this.index, 0);
        this.state = State$1.Text;
        this.sectionStart = this.index + 1;
      }
    }
    stateBeforeSpecialS(c) {
      const lower = c | 32;
      if (lower === Sequences.ScriptEnd[3]) {
        this.startSpecial(Sequences.ScriptEnd, 4);
      } else if (lower === Sequences.StyleEnd[3]) {
        this.startSpecial(Sequences.StyleEnd, 4);
      } else {
        this.state = State$1.InTagName;
        this.stateInTagName(c);
      }
    }
    stateBeforeSpecialT(c) {
      const lower = c | 32;
      switch (lower) {
        case Sequences.TitleEnd[3]: {
          this.startSpecial(Sequences.TitleEnd, 4);
          break;
        }
        case Sequences.TextareaEnd[3]: {
          this.startSpecial(Sequences.TextareaEnd, 4);
          break;
        }
        case Sequences.XmpEnd[3]: {
          this.startSpecial(Sequences.XmpEnd, 4);
          break;
        }
        default: {
          this.state = State$1.InTagName;
          this.stateInTagName(c);
        }
      }
    }
    startEntity() {
      this.baseState = this.state;
      this.state = State$1.InEntity;
      this.entityStart = this.index;
      this.entityDecoder.startEntity(this.xmlMode ? DecodingMode.Strict : this.baseState === State$1.Text || this.baseState === State$1.InSpecialTag ? DecodingMode.Legacy : DecodingMode.Attribute);
    }
    stateInEntity() {
      const length = this.entityDecoder.write(this.buffer, this.index - this.offset);
      if (length >= 0) {
        this.state = this.baseState;
        if (length === 0) {
          this.index = this.entityStart;
        }
      } else {
        this.index = this.offset + this.buffer.length - 1;
      }
    }
cleanup() {
      if (this.running && this.sectionStart !== this.index) {
        if (this.state === State$1.Text || this.state === State$1.InSpecialTag && this.sequenceIndex === 0) {
          this.cbs.ontext(this.sectionStart, this.index);
          this.sectionStart = this.index;
        } else if (this.state === State$1.InAttributeValueDq || this.state === State$1.InAttributeValueSq || this.state === State$1.InAttributeValueNq) {
          this.cbs.onattribdata(this.sectionStart, this.index);
          this.sectionStart = this.index;
        }
      }
    }
    shouldContinue() {
      return this.index < this.buffer.length + this.offset && this.running;
    }
parse() {
      while (this.shouldContinue()) {
        const c = this.buffer.charCodeAt(this.index - this.offset);
        switch (this.state) {
          case State$1.Text: {
            this.stateText(c);
            break;
          }
          case State$1.SpecialStartSequence: {
            this.stateSpecialStartSequence(c);
            break;
          }
          case State$1.InSpecialTag: {
            this.stateInSpecialTag(c);
            break;
          }
          case State$1.CDATASequence: {
            this.stateCDATASequence(c);
            break;
          }
          case State$1.InAttributeValueDq: {
            this.stateInAttributeValueDoubleQuotes(c);
            break;
          }
          case State$1.InAttributeName: {
            this.stateInAttributeName(c);
            break;
          }
          case State$1.InCommentLike: {
            this.stateInCommentLike(c);
            break;
          }
          case State$1.InSpecialComment: {
            this.stateInSpecialComment(c);
            break;
          }
          case State$1.BeforeAttributeName: {
            this.stateBeforeAttributeName(c);
            break;
          }
          case State$1.InTagName: {
            this.stateInTagName(c);
            break;
          }
          case State$1.InClosingTagName: {
            this.stateInClosingTagName(c);
            break;
          }
          case State$1.BeforeTagName: {
            this.stateBeforeTagName(c);
            break;
          }
          case State$1.AfterAttributeName: {
            this.stateAfterAttributeName(c);
            break;
          }
          case State$1.InAttributeValueSq: {
            this.stateInAttributeValueSingleQuotes(c);
            break;
          }
          case State$1.BeforeAttributeValue: {
            this.stateBeforeAttributeValue(c);
            break;
          }
          case State$1.BeforeClosingTagName: {
            this.stateBeforeClosingTagName(c);
            break;
          }
          case State$1.AfterClosingTagName: {
            this.stateAfterClosingTagName(c);
            break;
          }
          case State$1.BeforeSpecialS: {
            this.stateBeforeSpecialS(c);
            break;
          }
          case State$1.BeforeSpecialT: {
            this.stateBeforeSpecialT(c);
            break;
          }
          case State$1.InAttributeValueNq: {
            this.stateInAttributeValueNoQuotes(c);
            break;
          }
          case State$1.InSelfClosingTag: {
            this.stateInSelfClosingTag(c);
            break;
          }
          case State$1.InDeclaration: {
            this.stateInDeclaration(c);
            break;
          }
          case State$1.BeforeDeclaration: {
            this.stateBeforeDeclaration(c);
            break;
          }
          case State$1.BeforeComment: {
            this.stateBeforeComment(c);
            break;
          }
          case State$1.InProcessingInstruction: {
            this.stateInProcessingInstruction(c);
            break;
          }
          case State$1.InEntity: {
            this.stateInEntity();
            break;
          }
        }
        this.index++;
      }
      this.cleanup();
    }
    finish() {
      if (this.state === State$1.InEntity) {
        this.entityDecoder.end();
        this.state = this.baseState;
      }
      this.handleTrailingData();
      this.cbs.onend();
    }
handleTrailingData() {
      const endIndex = this.buffer.length + this.offset;
      if (this.sectionStart >= endIndex) {
        return;
      }
      if (this.state === State$1.InCommentLike) {
        if (this.currentSequence === Sequences.CdataEnd) {
          this.cbs.oncdata(this.sectionStart, endIndex, 0);
        } else {
          this.cbs.oncomment(this.sectionStart, endIndex, 0);
        }
      } else if (this.state === State$1.InTagName || this.state === State$1.BeforeAttributeName || this.state === State$1.BeforeAttributeValue || this.state === State$1.AfterAttributeName || this.state === State$1.InAttributeName || this.state === State$1.InAttributeValueSq || this.state === State$1.InAttributeValueDq || this.state === State$1.InAttributeValueNq || this.state === State$1.InClosingTagName) ;
      else {
        this.cbs.ontext(this.sectionStart, endIndex);
      }
    }
    emitCodePoint(cp, consumed) {
      if (this.baseState !== State$1.Text && this.baseState !== State$1.InSpecialTag) {
        if (this.sectionStart < this.entityStart) {
          this.cbs.onattribdata(this.sectionStart, this.entityStart);
        }
        this.sectionStart = this.entityStart + consumed;
        this.index = this.sectionStart - 1;
        this.cbs.onattribentity(cp);
      } else {
        if (this.sectionStart < this.entityStart) {
          this.cbs.ontext(this.sectionStart, this.entityStart);
        }
        this.sectionStart = this.entityStart + consumed;
        this.index = this.sectionStart - 1;
        this.cbs.ontextentity(cp, this.sectionStart);
      }
    }
  };
  const formTags = new Set([
    "input",
    "option",
    "optgroup",
    "select",
    "button",
    "datalist",
    "textarea"
  ]);
  const pTag = new Set(["p"]);
  const tableSectionTags = new Set(["thead", "tbody"]);
  const ddtTags = new Set(["dd", "dt"]);
  const rtpTags = new Set(["rt", "rp"]);
  const openImpliesClose = new Map([
    ["tr", new Set(["tr", "th", "td"])],
    ["th", new Set(["th"])],
    ["td", new Set(["thead", "th", "td"])],
    ["body", new Set(["head", "link", "script"])],
    ["li", new Set(["li"])],
    ["p", pTag],
    ["h1", pTag],
    ["h2", pTag],
    ["h3", pTag],
    ["h4", pTag],
    ["h5", pTag],
    ["h6", pTag],
    ["select", formTags],
    ["input", formTags],
    ["output", formTags],
    ["button", formTags],
    ["datalist", formTags],
    ["textarea", formTags],
    ["option", new Set(["option"])],
    ["optgroup", new Set(["optgroup", "option"])],
    ["dd", ddtTags],
    ["dt", ddtTags],
    ["address", pTag],
    ["article", pTag],
    ["aside", pTag],
    ["blockquote", pTag],
    ["details", pTag],
    ["div", pTag],
    ["dl", pTag],
    ["fieldset", pTag],
    ["figcaption", pTag],
    ["figure", pTag],
    ["footer", pTag],
    ["form", pTag],
    ["header", pTag],
    ["hr", pTag],
    ["main", pTag],
    ["nav", pTag],
    ["ol", pTag],
    ["pre", pTag],
    ["section", pTag],
    ["table", pTag],
    ["ul", pTag],
    ["rt", rtpTags],
    ["rp", rtpTags],
    ["tbody", tableSectionTags],
    ["tfoot", tableSectionTags]
  ]);
  const voidElements = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ]);
  const foreignContextElements = new Set(["math", "svg"]);
  const htmlIntegrationElements = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignobject",
    "desc",
    "title"
  ]);
  const reNameEnd = /\s|\//;
  let Parser$1 = class Parser {
    constructor(cbs, options = {}) {
      var _a2, _b, _c, _d, _e, _f;
      this.options = options;
      this.startIndex = 0;
      this.endIndex = 0;
      this.openTagStart = 0;
      this.tagname = "";
      this.attribname = "";
      this.attribvalue = "";
      this.attribs = null;
      this.stack = [];
      this.buffers = [];
      this.bufferOffset = 0;
      this.writeIndex = 0;
      this.ended = false;
      this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
      this.htmlMode = !this.options.xmlMode;
      this.lowerCaseTagNames = (_a2 = options.lowerCaseTags) !== null && _a2 !== void 0 ? _a2 : this.htmlMode;
      this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : this.htmlMode;
      this.recognizeSelfClosing = (_c = options.recognizeSelfClosing) !== null && _c !== void 0 ? _c : !this.htmlMode;
      this.tokenizer = new ((_d = options.Tokenizer) !== null && _d !== void 0 ? _d : Tokenizer$1)(this.options, this);
      this.foreignContext = [!this.htmlMode];
      (_f = (_e = this.cbs).onparserinit) === null || _f === void 0 ? void 0 : _f.call(_e, this);
    }

ontext(start, endIndex) {
      var _a2, _b;
      const data2 = this.getSlice(start, endIndex);
      this.endIndex = endIndex - 1;
      (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, data2);
      this.startIndex = endIndex;
    }
ontextentity(cp, endIndex) {
      var _a2, _b;
      this.endIndex = endIndex - 1;
      (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, fromCodePoint(cp));
      this.startIndex = endIndex;
    }
isVoidElement(name) {
      return this.htmlMode && voidElements.has(name);
    }
onopentagname(start, endIndex) {
      this.endIndex = endIndex;
      let name = this.getSlice(start, endIndex);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      this.emitOpenTag(name);
    }
    emitOpenTag(name) {
      var _a2, _b, _c, _d;
      this.openTagStart = this.startIndex;
      this.tagname = name;
      const impliesClose = this.htmlMode && openImpliesClose.get(name);
      if (impliesClose) {
        while (this.stack.length > 0 && impliesClose.has(this.stack[0])) {
          const element = this.stack.shift();
          (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, element, true);
        }
      }
      if (!this.isVoidElement(name)) {
        this.stack.unshift(name);
        if (this.htmlMode) {
          if (foreignContextElements.has(name)) {
            this.foreignContext.unshift(true);
          } else if (htmlIntegrationElements.has(name)) {
            this.foreignContext.unshift(false);
          }
        }
      }
      (_d = (_c = this.cbs).onopentagname) === null || _d === void 0 ? void 0 : _d.call(_c, name);
      if (this.cbs.onopentag)
        this.attribs = {};
    }
    endOpenTag(isImplied) {
      var _a2, _b;
      this.startIndex = this.openTagStart;
      if (this.attribs) {
        (_b = (_a2 = this.cbs).onopentag) === null || _b === void 0 ? void 0 : _b.call(_a2, this.tagname, this.attribs, isImplied);
        this.attribs = null;
      }
      if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) {
        this.cbs.onclosetag(this.tagname, true);
      }
      this.tagname = "";
    }
onopentagend(endIndex) {
      this.endIndex = endIndex;
      this.endOpenTag(false);
      this.startIndex = endIndex + 1;
    }
onclosetag(start, endIndex) {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      this.endIndex = endIndex;
      let name = this.getSlice(start, endIndex);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      if (this.htmlMode && (foreignContextElements.has(name) || htmlIntegrationElements.has(name))) {
        this.foreignContext.shift();
      }
      if (!this.isVoidElement(name)) {
        const pos = this.stack.indexOf(name);
        if (pos !== -1) {
          for (let index2 = 0; index2 <= pos; index2++) {
            const element = this.stack.shift();
            (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, element, index2 !== pos);
          }
        } else if (this.htmlMode && name === "p") {
          this.emitOpenTag("p");
          this.closeCurrentTag(true);
        }
      } else if (this.htmlMode && name === "br") {
        (_d = (_c = this.cbs).onopentagname) === null || _d === void 0 ? void 0 : _d.call(_c, "br");
        (_f = (_e = this.cbs).onopentag) === null || _f === void 0 ? void 0 : _f.call(_e, "br", {}, true);
        (_h = (_g = this.cbs).onclosetag) === null || _h === void 0 ? void 0 : _h.call(_g, "br", false);
      }
      this.startIndex = endIndex + 1;
    }
onselfclosingtag(endIndex) {
      this.endIndex = endIndex;
      if (this.recognizeSelfClosing || this.foreignContext[0]) {
        this.closeCurrentTag(false);
        this.startIndex = endIndex + 1;
      } else {
        this.onopentagend(endIndex);
      }
    }
    closeCurrentTag(isOpenImplied) {
      var _a2, _b;
      const name = this.tagname;
      this.endOpenTag(isOpenImplied);
      if (this.stack[0] === name) {
        (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, name, !isOpenImplied);
        this.stack.shift();
      }
    }
onattribname(start, endIndex) {
      this.startIndex = start;
      const name = this.getSlice(start, endIndex);
      this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
    }
onattribdata(start, endIndex) {
      this.attribvalue += this.getSlice(start, endIndex);
    }
onattribentity(cp) {
      this.attribvalue += fromCodePoint(cp);
    }
onattribend(quote, endIndex) {
      var _a2, _b;
      this.endIndex = endIndex;
      (_b = (_a2 = this.cbs).onattribute) === null || _b === void 0 ? void 0 : _b.call(_a2, this.attribname, this.attribvalue, quote === QuoteType.Double ? '"' : quote === QuoteType.Single ? "'" : quote === QuoteType.NoValue ? void 0 : null);
      if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
        this.attribs[this.attribname] = this.attribvalue;
      }
      this.attribvalue = "";
    }
    getInstructionName(value) {
      const index2 = value.search(reNameEnd);
      let name = index2 < 0 ? value : value.substr(0, index2);
      if (this.lowerCaseTagNames) {
        name = name.toLowerCase();
      }
      return name;
    }
ondeclaration(start, endIndex) {
      this.endIndex = endIndex;
      const value = this.getSlice(start, endIndex);
      if (this.cbs.onprocessinginstruction) {
        const name = this.getInstructionName(value);
        this.cbs.onprocessinginstruction(`!${name}`, `!${value}`);
      }
      this.startIndex = endIndex + 1;
    }
onprocessinginstruction(start, endIndex) {
      this.endIndex = endIndex;
      const value = this.getSlice(start, endIndex);
      if (this.cbs.onprocessinginstruction) {
        const name = this.getInstructionName(value);
        this.cbs.onprocessinginstruction(`?${name}`, `?${value}`);
      }
      this.startIndex = endIndex + 1;
    }
oncomment(start, endIndex, offset) {
      var _a2, _b, _c, _d;
      this.endIndex = endIndex;
      (_b = (_a2 = this.cbs).oncomment) === null || _b === void 0 ? void 0 : _b.call(_a2, this.getSlice(start, endIndex - offset));
      (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
      this.startIndex = endIndex + 1;
    }
oncdata(start, endIndex, offset) {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k;
      this.endIndex = endIndex;
      const value = this.getSlice(start, endIndex - offset);
      if (!this.htmlMode || this.options.recognizeCDATA) {
        (_b = (_a2 = this.cbs).oncdatastart) === null || _b === void 0 ? void 0 : _b.call(_a2);
        (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
        (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
      } else {
        (_h = (_g = this.cbs).oncomment) === null || _h === void 0 ? void 0 : _h.call(_g, `[CDATA[${value}]]`);
        (_k = (_j = this.cbs).oncommentend) === null || _k === void 0 ? void 0 : _k.call(_j);
      }
      this.startIndex = endIndex + 1;
    }
onend() {
      var _a2, _b;
      if (this.cbs.onclosetag) {
        this.endIndex = this.startIndex;
        for (let index2 = 0; index2 < this.stack.length; index2++) {
          this.cbs.onclosetag(this.stack[index2], true);
        }
      }
      (_b = (_a2 = this.cbs).onend) === null || _b === void 0 ? void 0 : _b.call(_a2);
    }
reset() {
      var _a2, _b, _c, _d;
      (_b = (_a2 = this.cbs).onreset) === null || _b === void 0 ? void 0 : _b.call(_a2);
      this.tokenizer.reset();
      this.tagname = "";
      this.attribname = "";
      this.attribs = null;
      this.stack.length = 0;
      this.startIndex = 0;
      this.endIndex = 0;
      (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
      this.buffers.length = 0;
      this.foreignContext.length = 0;
      this.foreignContext.unshift(!this.htmlMode);
      this.bufferOffset = 0;
      this.writeIndex = 0;
      this.ended = false;
    }
parseComplete(data2) {
      this.reset();
      this.end(data2);
    }
    getSlice(start, end2) {
      while (start - this.bufferOffset >= this.buffers[0].length) {
        this.shiftBuffer();
      }
      let slice2 = this.buffers[0].slice(start - this.bufferOffset, end2 - this.bufferOffset);
      while (end2 - this.bufferOffset > this.buffers[0].length) {
        this.shiftBuffer();
        slice2 += this.buffers[0].slice(0, end2 - this.bufferOffset);
      }
      return slice2;
    }
    shiftBuffer() {
      this.bufferOffset += this.buffers[0].length;
      this.writeIndex--;
      this.buffers.shift();
    }
write(chunk) {
      var _a2, _b;
      if (this.ended) {
        (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".write() after done!"));
        return;
      }
      this.buffers.push(chunk);
      if (this.tokenizer.running) {
        this.tokenizer.write(chunk);
        this.writeIndex++;
      }
    }
end(chunk) {
      var _a2, _b;
      if (this.ended) {
        (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".end() after done!"));
        return;
      }
      if (chunk)
        this.write(chunk);
      this.ended = true;
      this.tokenizer.end();
    }
pause() {
      this.tokenizer.pause();
    }
resume() {
      this.tokenizer.resume();
      while (this.tokenizer.running && this.writeIndex < this.buffers.length) {
        this.tokenizer.write(this.buffers[this.writeIndex++]);
      }
      if (this.ended)
        this.tokenizer.end();
    }
parseChunk(chunk) {
      this.write(chunk);
    }
done(chunk) {
      this.end(chunk);
    }
  };
  function parseDocument(data2, options) {
    const handler = new DomHandler(void 0, options);
    new Parser$1(handler, options).end(data2);
    return handler.root;
  }
  var _a;
  const hasOwn = (
(_a = Object.hasOwn) !== null && _a !== void 0 ? _a : ((object, prop2) => Object.prototype.hasOwnProperty.call(object, prop2))
  );
  const rspace = /\s+/;
  const dataAttrPrefix = "data-";
  const rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
  const rbrace = /^{[^]*}$|^\[[^]*]$/;
  function getAttr(elem, name, xmlMode) {
    var _a2;
    if (!elem || !isTag(elem))
      return void 0;
    (_a2 = elem.attribs) !== null && _a2 !== void 0 ? _a2 : elem.attribs = {};
    if (!name) {
      return elem.attribs;
    }
    if (hasOwn(elem.attribs, name)) {
      return !xmlMode && rboolean.test(name) ? name : elem.attribs[name];
    }
    if (elem.name === "option" && name === "value") {
      return text$1(elem.children);
    }
    if (elem.name === "input" && (elem.attribs["type"] === "radio" || elem.attribs["type"] === "checkbox") && name === "value") {
      return "on";
    }
    return void 0;
  }
  function setAttr(el, name, value) {
    if (value === null) {
      removeAttribute(el, name);
    } else {
      el.attribs[name] = `${value}`;
    }
  }
  function attr(name, value) {
    if (typeof name === "object" || value !== void 0) {
      if (typeof value === "function") {
        if (typeof name !== "string") {
          {
            throw new Error("Bad combination of arguments.");
          }
        }
        return domEach(this, (el, i) => {
          if (isTag(el))
            setAttr(el, name, value.call(el, i, el.attribs[name]));
        });
      }
      return domEach(this, (el) => {
        if (!isTag(el))
          return;
        if (typeof name === "object") {
          for (const objName of Object.keys(name)) {
            const objValue = name[objName];
            setAttr(el, objName, objValue);
          }
        } else {
          setAttr(el, name, value);
        }
      });
    }
    return arguments.length > 1 ? this : getAttr(this[0], name, this.options.xmlMode);
  }
  function getProp(el, name, xmlMode) {
    return name in el ? (
el[name]
    ) : !xmlMode && rboolean.test(name) ? getAttr(el, name, false) !== void 0 : getAttr(el, name, xmlMode);
  }
  function setProp(el, name, value, xmlMode) {
    if (name in el) {
      el[name] = value;
    } else {
      setAttr(el, name, !xmlMode && rboolean.test(name) ? value ? "" : null : `${value}`);
    }
  }
  function prop(name, value) {
    var _a2;
    if (typeof name === "string" && value === void 0) {
      const el = this[0];
      if (!el)
        return void 0;
      switch (name) {
        case "style": {
          const property = this.css();
          const keys = Object.keys(property);
          for (let i = 0; i < keys.length; i++) {
            property[i] = keys[i];
          }
          property.length = keys.length;
          return property;
        }
        case "tagName":
        case "nodeName": {
          if (!isTag(el))
            return void 0;
          return el.name.toUpperCase();
        }
        case "href":
        case "src": {
          if (!isTag(el))
            return void 0;
          const prop2 = (_a2 = el.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
          if (typeof URL !== "undefined" && (name === "href" && (el.tagName === "a" || el.tagName === "link") || name === "src" && (el.tagName === "img" || el.tagName === "iframe" || el.tagName === "audio" || el.tagName === "video" || el.tagName === "source")) && prop2 !== void 0 && this.options.baseURI) {
            return new URL(prop2, this.options.baseURI).href;
          }
          return prop2;
        }
        case "innerText": {
          return innerText(el);
        }
        case "textContent": {
          return textContent(el);
        }
        case "outerHTML": {
          if (el.type === Root)
            return this.html();
          return this.clone().wrap("<container />").parent().html();
        }
        case "innerHTML": {
          return this.html();
        }
        default: {
          if (!isTag(el))
            return void 0;
          return getProp(el, name, this.options.xmlMode);
        }
      }
    }
    if (typeof name === "object" || value !== void 0) {
      if (typeof value === "function") {
        if (typeof name === "object") {
          throw new TypeError("Bad combination of arguments.");
        }
        return domEach(this, (el, i) => {
          if (isTag(el)) {
            setProp(el, name, value.call(el, i, getProp(el, name, this.options.xmlMode)), this.options.xmlMode);
          }
        });
      }
      return domEach(this, (el) => {
        if (!isTag(el))
          return;
        if (typeof name === "object") {
          for (const key of Object.keys(name)) {
            const val2 = name[key];
            setProp(el, key, val2, this.options.xmlMode);
          }
        } else {
          setProp(el, name, value, this.options.xmlMode);
        }
      });
    }
    return void 0;
  }
  function setData(elem, name, value) {
    var _a2;
    (_a2 = elem.data) !== null && _a2 !== void 0 ? _a2 : elem.data = {};
    if (typeof name === "object")
      Object.assign(elem.data, name);
    else if (typeof name === "string" && value !== void 0) {
      elem.data[name] = value;
    }
  }
  function readAllData(el) {
    for (const domName of Object.keys(el.attribs)) {
      if (!domName.startsWith(dataAttrPrefix)) {
        continue;
      }
      const jsName = camelCase(domName.slice(dataAttrPrefix.length));
      if (!hasOwn(el.data, jsName)) {
        el.data[jsName] = parseDataValue(el.attribs[domName]);
      }
    }
    return el.data;
  }
  function readData(el, name) {
    const domName = dataAttrPrefix + cssCase(name);
    const data2 = el.data;
    if (hasOwn(data2, name)) {
      return data2[name];
    }
    if (hasOwn(el.attribs, domName)) {
      return data2[name] = parseDataValue(el.attribs[domName]);
    }
    return void 0;
  }
  function parseDataValue(value) {
    if (value === "null")
      return null;
    if (value === "true")
      return true;
    if (value === "false")
      return false;
    const num = Number(value);
    if (value === String(num))
      return num;
    if (rbrace.test(value)) {
      try {
        return JSON.parse(value);
      } catch {
      }
    }
    return value;
  }
  function data(name, value) {
    var _a2;
    const elem = this[0];
    if (!elem || !isTag(elem))
      return;
    const dataEl = elem;
    (_a2 = dataEl.data) !== null && _a2 !== void 0 ? _a2 : dataEl.data = {};
    if (name == null) {
      return readAllData(dataEl);
    }
    if (typeof name === "object" || value !== void 0) {
      domEach(this, (el) => {
        if (isTag(el)) {
          if (typeof name === "object")
            setData(el, name);
          else
            setData(el, name, value);
        }
      });
      return this;
    }
    return readData(dataEl, name);
  }
  function val(value) {
    const querying = arguments.length === 0;
    const element = this[0];
    if (!element || !isTag(element))
      return querying ? void 0 : this;
    switch (element.name) {
      case "textarea": {
        return this.text(value);
      }
      case "select": {
        const option = this.find("option:selected");
        if (!querying) {
          if (this.attr("multiple") == null && typeof value === "object") {
            return this;
          }
          this.find("option").removeAttr("selected");
          const values = typeof value === "object" ? value : [value];
          for (const val2 of values) {
            this.find(`option[value="${val2}"]`).attr("selected", "");
          }
          return this;
        }
        return this.attr("multiple") ? option.toArray().map((el) => text$1(el.children)) : option.attr("value");
      }
      case "input":
      case "option": {
        return querying ? this.attr("value") : this.attr("value", value);
      }
    }
    return void 0;
  }
  function removeAttribute(elem, name) {
    if (!elem.attribs || !hasOwn(elem.attribs, name))
      return;
    delete elem.attribs[name];
  }
  function splitNames(names) {
    return names ? names.trim().split(rspace) : [];
  }
  function removeAttr(name) {
    const attrNames = splitNames(name);
    for (const attrName of attrNames) {
      domEach(this, (elem) => {
        if (isTag(elem))
          removeAttribute(elem, attrName);
      });
    }
    return this;
  }
  function hasClass(className) {
    return this.toArray().some((elem) => {
      const clazz = isTag(elem) && elem.attribs["class"];
      let idx = -1;
      if (clazz && className.length > 0) {
        while ((idx = clazz.indexOf(className, idx + 1)) > -1) {
          const end2 = idx + className.length;
          if ((idx === 0 || rspace.test(clazz[idx - 1])) && (end2 === clazz.length || rspace.test(clazz[end2]))) {
            return true;
          }
        }
      }
      return false;
    });
  }
  function addClass(value) {
    if (typeof value === "function") {
      return domEach(this, (el, i) => {
        if (isTag(el)) {
          const className = el.attribs["class"] || "";
          addClass.call([el], value.call(el, i, className));
        }
      });
    }
    if (!value || typeof value !== "string")
      return this;
    const classNames = value.split(rspace);
    const numElements = this.length;
    for (let i = 0; i < numElements; i++) {
      const el = this[i];
      if (!isTag(el))
        continue;
      const className = getAttr(el, "class", false);
      if (className) {
        let setClass = ` ${className} `;
        for (const cn of classNames) {
          const appendClass = `${cn} `;
          if (!setClass.includes(` ${appendClass}`))
            setClass += appendClass;
        }
        setAttr(el, "class", setClass.trim());
      } else {
        setAttr(el, "class", classNames.join(" ").trim());
      }
    }
    return this;
  }
  function removeClass(name) {
    if (typeof name === "function") {
      return domEach(this, (el, i) => {
        if (isTag(el)) {
          removeClass.call([el], name.call(el, i, el.attribs["class"] || ""));
        }
      });
    }
    const classes = splitNames(name);
    const numClasses = classes.length;
    const removeAll = arguments.length === 0;
    return domEach(this, (el) => {
      if (!isTag(el))
        return;
      if (removeAll) {
        el.attribs["class"] = "";
      } else {
        const elClasses = splitNames(el.attribs["class"]);
        let changed = false;
        for (let j = 0; j < numClasses; j++) {
          const index2 = elClasses.indexOf(classes[j]);
          if (index2 !== -1) {
            elClasses.splice(index2, 1);
            changed = true;
            j--;
          }
        }
        if (changed) {
          el.attribs["class"] = elClasses.join(" ");
        }
      }
    });
  }
  function toggleClass(value, stateVal) {
    if (typeof value === "function") {
      return domEach(this, (el, i) => {
        if (isTag(el)) {
          toggleClass.call([el], value.call(el, i, el.attribs["class"] || "", stateVal), stateVal);
        }
      });
    }
    if (!value || typeof value !== "string")
      return this;
    const classNames = value.split(rspace);
    const numClasses = classNames.length;
    const state = typeof stateVal === "boolean" ? stateVal ? 1 : -1 : 0;
    const numElements = this.length;
    for (let i = 0; i < numElements; i++) {
      const el = this[i];
      if (!isTag(el))
        continue;
      const elementClasses = splitNames(el.attribs["class"]);
      for (let j = 0; j < numClasses; j++) {
        const index2 = elementClasses.indexOf(classNames[j]);
        if (state >= 0 && index2 === -1) {
          elementClasses.push(classNames[j]);
        } else if (state <= 0 && index2 !== -1) {
          elementClasses.splice(index2, 1);
        }
      }
      el.attribs["class"] = elementClasses.join(" ");
    }
    return this;
  }
  const Attributes = Object.freeze( Object.defineProperty({
    __proto__: null,
    addClass,
    attr,
    data,
    hasClass,
    prop,
    removeAttr,
    removeClass,
    toggleClass,
    val
  }, Symbol.toStringTag, { value: "Module" }));
  var SelectorType;
  (function(SelectorType2) {
    SelectorType2["Attribute"] = "attribute";
    SelectorType2["Pseudo"] = "pseudo";
    SelectorType2["PseudoElement"] = "pseudo-element";
    SelectorType2["Tag"] = "tag";
    SelectorType2["Universal"] = "universal";
    SelectorType2["Adjacent"] = "adjacent";
    SelectorType2["Child"] = "child";
    SelectorType2["Descendant"] = "descendant";
    SelectorType2["Parent"] = "parent";
    SelectorType2["Sibling"] = "sibling";
    SelectorType2["ColumnCombinator"] = "column-combinator";
  })(SelectorType || (SelectorType = {}));
  var AttributeAction;
  (function(AttributeAction2) {
    AttributeAction2["Any"] = "any";
    AttributeAction2["Element"] = "element";
    AttributeAction2["End"] = "end";
    AttributeAction2["Equals"] = "equals";
    AttributeAction2["Exists"] = "exists";
    AttributeAction2["Hyphen"] = "hyphen";
    AttributeAction2["Not"] = "not";
    AttributeAction2["Start"] = "start";
  })(AttributeAction || (AttributeAction = {}));
  const reName = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;
  const reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
  const actionTypes = new Map([
    [126, AttributeAction.Element],
    [94, AttributeAction.Start],
    [36, AttributeAction.End],
    [42, AttributeAction.Any],
    [33, AttributeAction.Not],
    [124, AttributeAction.Hyphen]
  ]);
  const unpackPseudos = new Set([
    "has",
    "not",
    "matches",
    "is",
    "where",
    "host",
    "host-context"
  ]);
  function isTraversal$1(selector) {
    switch (selector.type) {
      case SelectorType.Adjacent:
      case SelectorType.Child:
      case SelectorType.Descendant:
      case SelectorType.Parent:
      case SelectorType.Sibling:
      case SelectorType.ColumnCombinator:
        return true;
      default:
        return false;
    }
  }
  const stripQuotesFromPseudos = new Set(["contains", "icontains"]);
  function funescape(_, escaped, escapedWhitespace) {
    const high = parseInt(escaped, 16) - 65536;
    return high !== high || escapedWhitespace ? escaped : high < 0 ? (
String.fromCharCode(high + 65536)
    ) : (
String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320)
    );
  }
  function unescapeCSS(str) {
    return str.replace(reEscape, funescape);
  }
  function isQuote(c) {
    return c === 39 || c === 34;
  }
  function isWhitespace$1(c) {
    return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
  }
  function parse$6(selector) {
    const subselects2 = [];
    const endIndex = parseSelector(subselects2, `${selector}`, 0);
    if (endIndex < selector.length) {
      throw new Error(`Unmatched selector: ${selector.slice(endIndex)}`);
    }
    return subselects2;
  }
  function parseSelector(subselects2, selector, selectorIndex) {
    let tokens = [];
    function getName2(offset) {
      const match = selector.slice(selectorIndex + offset).match(reName);
      if (!match) {
        throw new Error(`Expected name, found ${selector.slice(selectorIndex)}`);
      }
      const [name] = match;
      selectorIndex += offset + name.length;
      return unescapeCSS(name);
    }
    function stripWhitespace(offset) {
      selectorIndex += offset;
      while (selectorIndex < selector.length && isWhitespace$1(selector.charCodeAt(selectorIndex))) {
        selectorIndex++;
      }
    }
    function readValueWithParenthesis() {
      selectorIndex += 1;
      const start = selectorIndex;
      let counter = 1;
      for (; counter > 0 && selectorIndex < selector.length; selectorIndex++) {
        if (selector.charCodeAt(selectorIndex) === 40 && !isEscaped(selectorIndex)) {
          counter++;
        } else if (selector.charCodeAt(selectorIndex) === 41 && !isEscaped(selectorIndex)) {
          counter--;
        }
      }
      if (counter) {
        throw new Error("Parenthesis not matched");
      }
      return unescapeCSS(selector.slice(start, selectorIndex - 1));
    }
    function isEscaped(pos) {
      let slashCount = 0;
      while (selector.charCodeAt(--pos) === 92)
        slashCount++;
      return (slashCount & 1) === 1;
    }
    function ensureNotTraversal() {
      if (tokens.length > 0 && isTraversal$1(tokens[tokens.length - 1])) {
        throw new Error("Did not expect successive traversals.");
      }
    }
    function addTraversal(type) {
      if (tokens.length > 0 && tokens[tokens.length - 1].type === SelectorType.Descendant) {
        tokens[tokens.length - 1].type = type;
        return;
      }
      ensureNotTraversal();
      tokens.push({ type });
    }
    function addSpecialAttribute(name, action) {
      tokens.push({
        type: SelectorType.Attribute,
        name,
        action,
        value: getName2(1),
        namespace: null,
        ignoreCase: "quirks"
      });
    }
    function finalizeSubselector() {
      if (tokens.length && tokens[tokens.length - 1].type === SelectorType.Descendant) {
        tokens.pop();
      }
      if (tokens.length === 0) {
        throw new Error("Empty sub-selector");
      }
      subselects2.push(tokens);
    }
    stripWhitespace(0);
    if (selector.length === selectorIndex) {
      return selectorIndex;
    }
    loop: while (selectorIndex < selector.length) {
      const firstChar = selector.charCodeAt(selectorIndex);
      switch (firstChar) {
case 32:
        case 9:
        case 10:
        case 12:
        case 13: {
          if (tokens.length === 0 || tokens[0].type !== SelectorType.Descendant) {
            ensureNotTraversal();
            tokens.push({ type: SelectorType.Descendant });
          }
          stripWhitespace(1);
          break;
        }
case 62: {
          addTraversal(SelectorType.Child);
          stripWhitespace(1);
          break;
        }
        case 60: {
          addTraversal(SelectorType.Parent);
          stripWhitespace(1);
          break;
        }
        case 126: {
          addTraversal(SelectorType.Sibling);
          stripWhitespace(1);
          break;
        }
        case 43: {
          addTraversal(SelectorType.Adjacent);
          stripWhitespace(1);
          break;
        }
case 46: {
          addSpecialAttribute("class", AttributeAction.Element);
          break;
        }
        case 35: {
          addSpecialAttribute("id", AttributeAction.Equals);
          break;
        }
        case 91: {
          stripWhitespace(1);
          let name;
          let namespace = null;
          if (selector.charCodeAt(selectorIndex) === 124) {
            name = getName2(1);
          } else if (selector.startsWith("*|", selectorIndex)) {
            namespace = "*";
            name = getName2(2);
          } else {
            name = getName2(0);
            if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 61) {
              namespace = name;
              name = getName2(1);
            }
          }
          stripWhitespace(0);
          let action = AttributeAction.Exists;
          const possibleAction = actionTypes.get(selector.charCodeAt(selectorIndex));
          if (possibleAction) {
            action = possibleAction;
            if (selector.charCodeAt(selectorIndex + 1) !== 61) {
              throw new Error("Expected `=`");
            }
            stripWhitespace(2);
          } else if (selector.charCodeAt(selectorIndex) === 61) {
            action = AttributeAction.Equals;
            stripWhitespace(1);
          }
          let value = "";
          let ignoreCase = null;
          if (action !== "exists") {
            if (isQuote(selector.charCodeAt(selectorIndex))) {
              const quote = selector.charCodeAt(selectorIndex);
              let sectionEnd = selectorIndex + 1;
              while (sectionEnd < selector.length && (selector.charCodeAt(sectionEnd) !== quote || isEscaped(sectionEnd))) {
                sectionEnd += 1;
              }
              if (selector.charCodeAt(sectionEnd) !== quote) {
                throw new Error("Attribute value didn't end");
              }
              value = unescapeCSS(selector.slice(selectorIndex + 1, sectionEnd));
              selectorIndex = sectionEnd + 1;
            } else {
              const valueStart = selectorIndex;
              while (selectorIndex < selector.length && (!isWhitespace$1(selector.charCodeAt(selectorIndex)) && selector.charCodeAt(selectorIndex) !== 93 || isEscaped(selectorIndex))) {
                selectorIndex += 1;
              }
              value = unescapeCSS(selector.slice(valueStart, selectorIndex));
            }
            stripWhitespace(0);
            const forceIgnore = selector.charCodeAt(selectorIndex) | 32;
            if (forceIgnore === 115) {
              ignoreCase = false;
              stripWhitespace(1);
            } else if (forceIgnore === 105) {
              ignoreCase = true;
              stripWhitespace(1);
            }
          }
          if (selector.charCodeAt(selectorIndex) !== 93) {
            throw new Error("Attribute selector didn't terminate");
          }
          selectorIndex += 1;
          const attributeSelector = {
            type: SelectorType.Attribute,
            name,
            action,
            value,
            namespace,
            ignoreCase
          };
          tokens.push(attributeSelector);
          break;
        }
        case 58: {
          if (selector.charCodeAt(selectorIndex + 1) === 58) {
            tokens.push({
              type: SelectorType.PseudoElement,
              name: getName2(2).toLowerCase(),
              data: selector.charCodeAt(selectorIndex) === 40 ? readValueWithParenthesis() : null
            });
            continue;
          }
          const name = getName2(1).toLowerCase();
          let data2 = null;
          if (selector.charCodeAt(selectorIndex) === 40) {
            if (unpackPseudos.has(name)) {
              if (isQuote(selector.charCodeAt(selectorIndex + 1))) {
                throw new Error(`Pseudo-selector ${name} cannot be quoted`);
              }
              data2 = [];
              selectorIndex = parseSelector(data2, selector, selectorIndex + 1);
              if (selector.charCodeAt(selectorIndex) !== 41) {
                throw new Error(`Missing closing parenthesis in :${name} (${selector})`);
              }
              selectorIndex += 1;
            } else {
              data2 = readValueWithParenthesis();
              if (stripQuotesFromPseudos.has(name)) {
                const quot = data2.charCodeAt(0);
                if (quot === data2.charCodeAt(data2.length - 1) && isQuote(quot)) {
                  data2 = data2.slice(1, -1);
                }
              }
              data2 = unescapeCSS(data2);
            }
          }
          tokens.push({ type: SelectorType.Pseudo, name, data: data2 });
          break;
        }
        case 44: {
          finalizeSubselector();
          tokens = [];
          stripWhitespace(1);
          break;
        }
        default: {
          if (selector.startsWith("/*", selectorIndex)) {
            const endIndex = selector.indexOf("*/", selectorIndex + 2);
            if (endIndex < 0) {
              throw new Error("Comment was not terminated");
            }
            selectorIndex = endIndex + 2;
            if (tokens.length === 0) {
              stripWhitespace(0);
            }
            break;
          }
          let namespace = null;
          let name;
          if (firstChar === 42) {
            selectorIndex += 1;
            name = "*";
          } else if (firstChar === 124) {
            name = "";
            if (selector.charCodeAt(selectorIndex + 1) === 124) {
              addTraversal(SelectorType.ColumnCombinator);
              stripWhitespace(2);
              break;
            }
          } else if (reName.test(selector.slice(selectorIndex))) {
            name = getName2(0);
          } else {
            break loop;
          }
          if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 124) {
            namespace = name;
            if (selector.charCodeAt(selectorIndex + 1) === 42) {
              name = "*";
              selectorIndex += 2;
            } else {
              name = getName2(1);
            }
          }
          tokens.push(name === "*" ? { type: SelectorType.Universal, namespace } : { type: SelectorType.Tag, name, namespace });
        }
      }
    }
    finalizeSubselector();
    return selectorIndex;
  }
  var boolbase$1;
  var hasRequiredBoolbase;
  function requireBoolbase() {
    if (hasRequiredBoolbase) return boolbase$1;
    hasRequiredBoolbase = 1;
    boolbase$1 = {
      trueFunc: function trueFunc() {
        return true;
      },
      falseFunc: function falseFunc() {
        return false;
      }
    };
    return boolbase$1;
  }
  var boolbaseExports = requireBoolbase();
  const boolbase = getDefaultExportFromCjs(boolbaseExports);
  const procedure = new Map([
    [SelectorType.Universal, 50],
    [SelectorType.Tag, 30],
    [SelectorType.Attribute, 1],
    [SelectorType.Pseudo, 0]
  ]);
  function isTraversal(token) {
    return !procedure.has(token.type);
  }
  const attributes = new Map([
    [AttributeAction.Exists, 10],
    [AttributeAction.Equals, 8],
    [AttributeAction.Not, 7],
    [AttributeAction.Start, 6],
    [AttributeAction.End, 6],
    [AttributeAction.Any, 5]
  ]);
  function sortByProcedure(arr) {
    const procs = arr.map(getProcedure);
    for (let i = 1; i < arr.length; i++) {
      const procNew = procs[i];
      if (procNew < 0)
        continue;
      for (let j = i - 1; j >= 0 && procNew < procs[j]; j--) {
        const token = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = token;
        procs[j + 1] = procs[j];
        procs[j] = procNew;
      }
    }
  }
  function getProcedure(token) {
    var _a2, _b;
    let proc = (_a2 = procedure.get(token.type)) !== null && _a2 !== void 0 ? _a2 : -1;
    if (token.type === SelectorType.Attribute) {
      proc = (_b = attributes.get(token.action)) !== null && _b !== void 0 ? _b : 4;
      if (token.action === AttributeAction.Equals && token.name === "id") {
        proc = 9;
      }
      if (token.ignoreCase) {
        proc >>= 1;
      }
    } else if (token.type === SelectorType.Pseudo) {
      if (!token.data) {
        proc = 3;
      } else if (token.name === "has" || token.name === "contains") {
        proc = 0;
      } else if (Array.isArray(token.data)) {
        proc = Math.min(...token.data.map((d) => Math.min(...d.map(getProcedure))));
        if (proc < 0) {
          proc = 0;
        }
      } else {
        proc = 2;
      }
    }
    return proc;
  }
  const reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;
  function escapeRegex(value) {
    return value.replace(reChars, "\\$&");
  }
  const caseInsensitiveAttributes = new Set([
    "accept",
    "accept-charset",
    "align",
    "alink",
    "axis",
    "bgcolor",
    "charset",
    "checked",
    "clear",
    "codetype",
    "color",
    "compact",
    "declare",
    "defer",
    "dir",
    "direction",
    "disabled",
    "enctype",
    "face",
    "frame",
    "hreflang",
    "http-equiv",
    "lang",
    "language",
    "link",
    "media",
    "method",
    "multiple",
    "nohref",
    "noresize",
    "noshade",
    "nowrap",
    "readonly",
    "rel",
    "rev",
    "rules",
    "scope",
    "scrolling",
    "selected",
    "shape",
    "target",
    "text",
    "type",
    "valign",
    "valuetype",
    "vlink"
  ]);
  function shouldIgnoreCase(selector, options) {
    return typeof selector.ignoreCase === "boolean" ? selector.ignoreCase : selector.ignoreCase === "quirks" ? !!options.quirksMode : !options.xmlMode && caseInsensitiveAttributes.has(selector.name);
  }
  const attributeRules = {
    equals(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name } = data2;
      let { value } = data2;
      if (shouldIgnoreCase(data2, options)) {
        value = value.toLowerCase();
        return (elem) => {
          const attr2 = adapter2.getAttributeValue(elem, name);
          return attr2 != null && attr2.length === value.length && attr2.toLowerCase() === value && next2(elem);
        };
      }
      return (elem) => adapter2.getAttributeValue(elem, name) === value && next2(elem);
    },
    hyphen(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name } = data2;
      let { value } = data2;
      const len = value.length;
      if (shouldIgnoreCase(data2, options)) {
        value = value.toLowerCase();
        return function hyphenIC(elem) {
          const attr2 = adapter2.getAttributeValue(elem, name);
          return attr2 != null && (attr2.length === len || attr2.charAt(len) === "-") && attr2.substr(0, len).toLowerCase() === value && next2(elem);
        };
      }
      return function hyphen(elem) {
        const attr2 = adapter2.getAttributeValue(elem, name);
        return attr2 != null && (attr2.length === len || attr2.charAt(len) === "-") && attr2.substr(0, len) === value && next2(elem);
      };
    },
    element(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name, value } = data2;
      if (/\s/.test(value)) {
        return boolbase.falseFunc;
      }
      const regex = new RegExp(`(?:^|\\s)${escapeRegex(value)}(?:$|\\s)`, shouldIgnoreCase(data2, options) ? "i" : "");
      return function element(elem) {
        const attr2 = adapter2.getAttributeValue(elem, name);
        return attr2 != null && attr2.length >= value.length && regex.test(attr2) && next2(elem);
      };
    },
    exists(next2, { name }, { adapter: adapter2 }) {
      return (elem) => adapter2.hasAttrib(elem, name) && next2(elem);
    },
    start(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name } = data2;
      let { value } = data2;
      const len = value.length;
      if (len === 0) {
        return boolbase.falseFunc;
      }
      if (shouldIgnoreCase(data2, options)) {
        value = value.toLowerCase();
        return (elem) => {
          const attr2 = adapter2.getAttributeValue(elem, name);
          return attr2 != null && attr2.length >= len && attr2.substr(0, len).toLowerCase() === value && next2(elem);
        };
      }
      return (elem) => {
        var _a2;
        return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.startsWith(value)) && next2(elem);
      };
    },
    end(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name } = data2;
      let { value } = data2;
      const len = -value.length;
      if (len === 0) {
        return boolbase.falseFunc;
      }
      if (shouldIgnoreCase(data2, options)) {
        value = value.toLowerCase();
        return (elem) => {
          var _a2;
          return ((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.substr(len).toLowerCase()) === value && next2(elem);
        };
      }
      return (elem) => {
        var _a2;
        return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.endsWith(value)) && next2(elem);
      };
    },
    any(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name, value } = data2;
      if (value === "") {
        return boolbase.falseFunc;
      }
      if (shouldIgnoreCase(data2, options)) {
        const regex = new RegExp(escapeRegex(value), "i");
        return function anyIC(elem) {
          const attr2 = adapter2.getAttributeValue(elem, name);
          return attr2 != null && attr2.length >= value.length && regex.test(attr2) && next2(elem);
        };
      }
      return (elem) => {
        var _a2;
        return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.includes(value)) && next2(elem);
      };
    },
    not(next2, data2, options) {
      const { adapter: adapter2 } = options;
      const { name } = data2;
      let { value } = data2;
      if (value === "") {
        return (elem) => !!adapter2.getAttributeValue(elem, name) && next2(elem);
      } else if (shouldIgnoreCase(data2, options)) {
        value = value.toLowerCase();
        return (elem) => {
          const attr2 = adapter2.getAttributeValue(elem, name);
          return (attr2 == null || attr2.length !== value.length || attr2.toLowerCase() !== value) && next2(elem);
        };
      }
      return (elem) => adapter2.getAttributeValue(elem, name) !== value && next2(elem);
    }
  };
  const whitespace = new Set([9, 10, 12, 13, 32]);
  const ZERO = "0".charCodeAt(0);
  const NINE = "9".charCodeAt(0);
  function parse$5(formula) {
    formula = formula.trim().toLowerCase();
    if (formula === "even") {
      return [2, 0];
    } else if (formula === "odd") {
      return [2, 1];
    }
    let idx = 0;
    let a = 0;
    let sign = readSign();
    let number = readNumber();
    if (idx < formula.length && formula.charAt(idx) === "n") {
      idx++;
      a = sign * (number !== null && number !== void 0 ? number : 1);
      skipWhitespace();
      if (idx < formula.length) {
        sign = readSign();
        skipWhitespace();
        number = readNumber();
      } else {
        sign = number = 0;
      }
    }
    if (number === null || idx < formula.length) {
      throw new Error(`n-th rule couldn't be parsed ('${formula}')`);
    }
    return [a, sign * number];
    function readSign() {
      if (formula.charAt(idx) === "-") {
        idx++;
        return -1;
      }
      if (formula.charAt(idx) === "+") {
        idx++;
      }
      return 1;
    }
    function readNumber() {
      const start = idx;
      let value = 0;
      while (idx < formula.length && formula.charCodeAt(idx) >= ZERO && formula.charCodeAt(idx) <= NINE) {
        value = value * 10 + (formula.charCodeAt(idx) - ZERO);
        idx++;
      }
      return idx === start ? null : value;
    }
    function skipWhitespace() {
      while (idx < formula.length && whitespace.has(formula.charCodeAt(idx))) {
        idx++;
      }
    }
  }
  function compile(parsed) {
    const a = parsed[0];
    const b = parsed[1] - 1;
    if (b < 0 && a <= 0)
      return boolbase.falseFunc;
    if (a === -1)
      return (index2) => index2 <= b;
    if (a === 0)
      return (index2) => index2 === b;
    if (a === 1)
      return b < 0 ? boolbase.trueFunc : (index2) => index2 >= b;
    const absA = Math.abs(a);
    const bMod = (b % absA + absA) % absA;
    return a > 1 ? (index2) => index2 >= b && index2 % absA === bMod : (index2) => index2 <= b && index2 % absA === bMod;
  }
  function nthCheck(formula) {
    return compile(parse$5(formula));
  }
  function getChildFunc(next2, adapter2) {
    return (elem) => {
      const parent2 = adapter2.getParent(elem);
      return parent2 != null && adapter2.isTag(parent2) && next2(elem);
    };
  }
  const filters = {
    contains(next2, text2, { adapter: adapter2 }) {
      return function contains2(elem) {
        return next2(elem) && adapter2.getText(elem).includes(text2);
      };
    },
    icontains(next2, text2, { adapter: adapter2 }) {
      const itext = text2.toLowerCase();
      return function icontains(elem) {
        return next2(elem) && adapter2.getText(elem).toLowerCase().includes(itext);
      };
    },
"nth-child"(next2, rule, { adapter: adapter2, equals }) {
      const func = nthCheck(rule);
      if (func === boolbase.falseFunc)
        return boolbase.falseFunc;
      if (func === boolbase.trueFunc)
        return getChildFunc(next2, adapter2);
      return function nthChild(elem) {
        const siblings2 = adapter2.getSiblings(elem);
        let pos = 0;
        for (let i = 0; i < siblings2.length; i++) {
          if (equals(elem, siblings2[i]))
            break;
          if (adapter2.isTag(siblings2[i])) {
            pos++;
          }
        }
        return func(pos) && next2(elem);
      };
    },
    "nth-last-child"(next2, rule, { adapter: adapter2, equals }) {
      const func = nthCheck(rule);
      if (func === boolbase.falseFunc)
        return boolbase.falseFunc;
      if (func === boolbase.trueFunc)
        return getChildFunc(next2, adapter2);
      return function nthLastChild(elem) {
        const siblings2 = adapter2.getSiblings(elem);
        let pos = 0;
        for (let i = siblings2.length - 1; i >= 0; i--) {
          if (equals(elem, siblings2[i]))
            break;
          if (adapter2.isTag(siblings2[i])) {
            pos++;
          }
        }
        return func(pos) && next2(elem);
      };
    },
    "nth-of-type"(next2, rule, { adapter: adapter2, equals }) {
      const func = nthCheck(rule);
      if (func === boolbase.falseFunc)
        return boolbase.falseFunc;
      if (func === boolbase.trueFunc)
        return getChildFunc(next2, adapter2);
      return function nthOfType(elem) {
        const siblings2 = adapter2.getSiblings(elem);
        let pos = 0;
        for (let i = 0; i < siblings2.length; i++) {
          const currentSibling = siblings2[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
            pos++;
          }
        }
        return func(pos) && next2(elem);
      };
    },
    "nth-last-of-type"(next2, rule, { adapter: adapter2, equals }) {
      const func = nthCheck(rule);
      if (func === boolbase.falseFunc)
        return boolbase.falseFunc;
      if (func === boolbase.trueFunc)
        return getChildFunc(next2, adapter2);
      return function nthLastOfType(elem) {
        const siblings2 = adapter2.getSiblings(elem);
        let pos = 0;
        for (let i = siblings2.length - 1; i >= 0; i--) {
          const currentSibling = siblings2[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
            pos++;
          }
        }
        return func(pos) && next2(elem);
      };
    },
root(next2, _rule, { adapter: adapter2 }) {
      return (elem) => {
        const parent2 = adapter2.getParent(elem);
        return (parent2 == null || !adapter2.isTag(parent2)) && next2(elem);
      };
    },
    scope(next2, rule, options, context) {
      const { equals } = options;
      if (!context || context.length === 0) {
        return filters["root"](next2, rule, options);
      }
      if (context.length === 1) {
        return (elem) => equals(context[0], elem) && next2(elem);
      }
      return (elem) => context.includes(elem) && next2(elem);
    },
    hover: dynamicStatePseudo("isHovered"),
    visited: dynamicStatePseudo("isVisited"),
    active: dynamicStatePseudo("isActive")
  };
  function dynamicStatePseudo(name) {
    return function dynamicPseudo(next2, _rule, { adapter: adapter2 }) {
      const func = adapter2[name];
      if (typeof func !== "function") {
        return boolbase.falseFunc;
      }
      return function active(elem) {
        return func(elem) && next2(elem);
      };
    };
  }
  const pseudos = {
    empty(elem, { adapter: adapter2 }) {
      return !adapter2.getChildren(elem).some((elem2) => (
adapter2.isTag(elem2) || adapter2.getText(elem2) !== ""
      ));
    },
    "first-child"(elem, { adapter: adapter2, equals }) {
      if (adapter2.prevElementSibling) {
        return adapter2.prevElementSibling(elem) == null;
      }
      const firstChild = adapter2.getSiblings(elem).find((elem2) => adapter2.isTag(elem2));
      return firstChild != null && equals(elem, firstChild);
    },
    "last-child"(elem, { adapter: adapter2, equals }) {
      const siblings2 = adapter2.getSiblings(elem);
      for (let i = siblings2.length - 1; i >= 0; i--) {
        if (equals(elem, siblings2[i]))
          return true;
        if (adapter2.isTag(siblings2[i]))
          break;
      }
      return false;
    },
    "first-of-type"(elem, { adapter: adapter2, equals }) {
      const siblings2 = adapter2.getSiblings(elem);
      const elemName = adapter2.getName(elem);
      for (let i = 0; i < siblings2.length; i++) {
        const currentSibling = siblings2[i];
        if (equals(elem, currentSibling))
          return true;
        if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
          break;
        }
      }
      return false;
    },
    "last-of-type"(elem, { adapter: adapter2, equals }) {
      const siblings2 = adapter2.getSiblings(elem);
      const elemName = adapter2.getName(elem);
      for (let i = siblings2.length - 1; i >= 0; i--) {
        const currentSibling = siblings2[i];
        if (equals(elem, currentSibling))
          return true;
        if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
          break;
        }
      }
      return false;
    },
    "only-of-type"(elem, { adapter: adapter2, equals }) {
      const elemName = adapter2.getName(elem);
      return adapter2.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter2.isTag(sibling) || adapter2.getName(sibling) !== elemName);
    },
    "only-child"(elem, { adapter: adapter2, equals }) {
      return adapter2.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter2.isTag(sibling));
    }
  };
  function verifyPseudoArgs(func, name, subselect, argIndex) {
    if (subselect === null) {
      if (func.length > argIndex) {
        throw new Error(`Pseudo-class :${name} requires an argument`);
      }
    } else if (func.length === argIndex) {
      throw new Error(`Pseudo-class :${name} doesn't have any arguments`);
    }
  }
  const aliases = {
"any-link": ":is(a, area, link)[href]",
    link: ":any-link:not(:visited)",

disabled: `:is(
        :is(button, input, select, textarea, optgroup, option)[disabled],
        optgroup[disabled] > option,
        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)
    )`,
    enabled: ":not(:disabled)",
    checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], option:selected)",
    required: ":is(input, select, textarea)[required]",
    optional: ":is(input, select, textarea):not([required])",

selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
    checkbox: "[type=checkbox]",
    file: "[type=file]",
    password: "[type=password]",
    radio: "[type=radio]",
    reset: "[type=reset]",
    image: "[type=image]",
    submit: "[type=submit]",
    parent: ":not(:empty)",
    header: ":is(h1, h2, h3, h4, h5, h6)",
    button: ":is(button, input[type=button])",
    input: ":is(input, textarea, select, button)",
    text: "input:is(:not([type!='']), [type=text])"
  };
  const PLACEHOLDER_ELEMENT = {};
  function ensureIsTag(next2, adapter2) {
    if (next2 === boolbase.falseFunc)
      return boolbase.falseFunc;
    return (elem) => adapter2.isTag(elem) && next2(elem);
  }
  function getNextSiblings(elem, adapter2) {
    const siblings2 = adapter2.getSiblings(elem);
    if (siblings2.length <= 1)
      return [];
    const elemIndex = siblings2.indexOf(elem);
    if (elemIndex < 0 || elemIndex === siblings2.length - 1)
      return [];
    return siblings2.slice(elemIndex + 1).filter(adapter2.isTag);
  }
  function copyOptions(options) {
    return {
      xmlMode: !!options.xmlMode,
      lowerCaseAttributeNames: !!options.lowerCaseAttributeNames,
      lowerCaseTags: !!options.lowerCaseTags,
      quirksMode: !!options.quirksMode,
      cacheResults: !!options.cacheResults,
      pseudos: options.pseudos,
      adapter: options.adapter,
      equals: options.equals
    };
  }
  const is$2 = (next2, token, options, context, compileToken2) => {
    const func = compileToken2(token, copyOptions(options), context);
    return func === boolbase.trueFunc ? next2 : func === boolbase.falseFunc ? boolbase.falseFunc : (elem) => func(elem) && next2(elem);
  };
  const subselects = {
    is: is$2,
matches: is$2,
    where: is$2,
    not(next2, token, options, context, compileToken2) {
      const func = compileToken2(token, copyOptions(options), context);
      return func === boolbase.falseFunc ? next2 : func === boolbase.trueFunc ? boolbase.falseFunc : (elem) => !func(elem) && next2(elem);
    },
    has(next2, subselect, options, _context, compileToken2) {
      const { adapter: adapter2 } = options;
      const opts = copyOptions(options);
      opts.relativeSelector = true;
      const context = subselect.some((s) => s.some(isTraversal)) ? (
[PLACEHOLDER_ELEMENT]
      ) : void 0;
      const compiled = compileToken2(subselect, opts, context);
      if (compiled === boolbase.falseFunc)
        return boolbase.falseFunc;
      const hasElement = ensureIsTag(compiled, adapter2);
      if (context && compiled !== boolbase.trueFunc) {
        const { shouldTestNextSiblings = false } = compiled;
        return (elem) => {
          if (!next2(elem))
            return false;
          context[0] = elem;
          const childs = adapter2.getChildren(elem);
          const nextElements = shouldTestNextSiblings ? [...childs, ...getNextSiblings(elem, adapter2)] : childs;
          return adapter2.existsOne(hasElement, nextElements);
        };
      }
      return (elem) => next2(elem) && adapter2.existsOne(hasElement, adapter2.getChildren(elem));
    }
  };
  function compilePseudoSelector(next2, selector, options, context, compileToken2) {
    var _a2;
    const { name, data: data2 } = selector;
    if (Array.isArray(data2)) {
      if (!(name in subselects)) {
        throw new Error(`Unknown pseudo-class :${name}(${data2})`);
      }
      return subselects[name](next2, data2, options, context, compileToken2);
    }
    const userPseudo = (_a2 = options.pseudos) === null || _a2 === void 0 ? void 0 : _a2[name];
    const stringPseudo = typeof userPseudo === "string" ? userPseudo : aliases[name];
    if (typeof stringPseudo === "string") {
      if (data2 != null) {
        throw new Error(`Pseudo ${name} doesn't have any arguments`);
      }
      const alias = parse$6(stringPseudo);
      return subselects["is"](next2, alias, options, context, compileToken2);
    }
    if (typeof userPseudo === "function") {
      verifyPseudoArgs(userPseudo, name, data2, 1);
      return (elem) => userPseudo(elem, data2) && next2(elem);
    }
    if (name in filters) {
      return filters[name](next2, data2, options, context);
    }
    if (name in pseudos) {
      const pseudo = pseudos[name];
      verifyPseudoArgs(pseudo, name, data2, 2);
      return (elem) => pseudo(elem, options, data2) && next2(elem);
    }
    throw new Error(`Unknown pseudo-class :${name}`);
  }
  function getElementParent(node, adapter2) {
    const parent2 = adapter2.getParent(node);
    if (parent2 && adapter2.isTag(parent2)) {
      return parent2;
    }
    return null;
  }
  function compileGeneralSelector(next2, selector, options, context, compileToken2) {
    const { adapter: adapter2, equals } = options;
    switch (selector.type) {
      case SelectorType.PseudoElement: {
        throw new Error("Pseudo-elements are not supported by css-select");
      }
      case SelectorType.ColumnCombinator: {
        throw new Error("Column combinators are not yet supported by css-select");
      }
      case SelectorType.Attribute: {
        if (selector.namespace != null) {
          throw new Error("Namespaced attributes are not yet supported by css-select");
        }
        if (!options.xmlMode || options.lowerCaseAttributeNames) {
          selector.name = selector.name.toLowerCase();
        }
        return attributeRules[selector.action](next2, selector, options);
      }
      case SelectorType.Pseudo: {
        return compilePseudoSelector(next2, selector, options, context, compileToken2);
      }
case SelectorType.Tag: {
        if (selector.namespace != null) {
          throw new Error("Namespaced tag names are not yet supported by css-select");
        }
        let { name } = selector;
        if (!options.xmlMode || options.lowerCaseTags) {
          name = name.toLowerCase();
        }
        return function tag(elem) {
          return adapter2.getName(elem) === name && next2(elem);
        };
      }
case SelectorType.Descendant: {
        if (options.cacheResults === false || typeof WeakSet === "undefined") {
          return function descendant(elem) {
            let current = elem;
            while (current = getElementParent(current, adapter2)) {
              if (next2(current)) {
                return true;
              }
            }
            return false;
          };
        }
        const isFalseCache = new WeakSet();
        return function cachedDescendant(elem) {
          let current = elem;
          while (current = getElementParent(current, adapter2)) {
            if (!isFalseCache.has(current)) {
              if (adapter2.isTag(current) && next2(current)) {
                return true;
              }
              isFalseCache.add(current);
            }
          }
          return false;
        };
      }
      case "_flexibleDescendant": {
        return function flexibleDescendant(elem) {
          let current = elem;
          do {
            if (next2(current))
              return true;
          } while (current = getElementParent(current, adapter2));
          return false;
        };
      }
      case SelectorType.Parent: {
        return function parent2(elem) {
          return adapter2.getChildren(elem).some((elem2) => adapter2.isTag(elem2) && next2(elem2));
        };
      }
      case SelectorType.Child: {
        return function child(elem) {
          const parent2 = adapter2.getParent(elem);
          return parent2 != null && adapter2.isTag(parent2) && next2(parent2);
        };
      }
      case SelectorType.Sibling: {
        return function sibling(elem) {
          const siblings2 = adapter2.getSiblings(elem);
          for (let i = 0; i < siblings2.length; i++) {
            const currentSibling = siblings2[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling) && next2(currentSibling)) {
              return true;
            }
          }
          return false;
        };
      }
      case SelectorType.Adjacent: {
        if (adapter2.prevElementSibling) {
          return function adjacent(elem) {
            const previous = adapter2.prevElementSibling(elem);
            return previous != null && next2(previous);
          };
        }
        return function adjacent(elem) {
          const siblings2 = adapter2.getSiblings(elem);
          let lastElement;
          for (let i = 0; i < siblings2.length; i++) {
            const currentSibling = siblings2[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling)) {
              lastElement = currentSibling;
            }
          }
          return !!lastElement && next2(lastElement);
        };
      }
      case SelectorType.Universal: {
        if (selector.namespace != null && selector.namespace !== "*") {
          throw new Error("Namespaced universal selectors are not yet supported by css-select");
        }
        return next2;
      }
    }
  }
  function includesScopePseudo(t) {
    return t.type === SelectorType.Pseudo && (t.name === "scope" || Array.isArray(t.data) && t.data.some((data2) => data2.some(includesScopePseudo)));
  }
  const DESCENDANT_TOKEN = { type: SelectorType.Descendant };
  const FLEXIBLE_DESCENDANT_TOKEN = {
    type: "_flexibleDescendant"
  };
  const SCOPE_TOKEN = {
    type: SelectorType.Pseudo,
    name: "scope",
    data: null
  };
  function absolutize(token, { adapter: adapter2 }, context) {
    const hasContext = !!(context === null || context === void 0 ? void 0 : context.every((e) => {
      const parent2 = adapter2.isTag(e) && adapter2.getParent(e);
      return e === PLACEHOLDER_ELEMENT || parent2 && adapter2.isTag(parent2);
    }));
    for (const t of token) {
      if (t.length > 0 && isTraversal(t[0]) && t[0].type !== SelectorType.Descendant) ;
      else if (hasContext && !t.some(includesScopePseudo)) {
        t.unshift(DESCENDANT_TOKEN);
      } else {
        continue;
      }
      t.unshift(SCOPE_TOKEN);
    }
  }
  function compileToken(token, options, context) {
    var _a2;
    token.forEach(sortByProcedure);
    context = (_a2 = options.context) !== null && _a2 !== void 0 ? _a2 : context;
    const isArrayContext = Array.isArray(context);
    const finalContext = context && (Array.isArray(context) ? context : [context]);
    if (options.relativeSelector !== false) {
      absolutize(token, options, finalContext);
    } else if (token.some((t) => t.length > 0 && isTraversal(t[0]))) {
      throw new Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
    }
    let shouldTestNextSiblings = false;
    const query = token.map((rules2) => {
      if (rules2.length >= 2) {
        const [first2, second] = rules2;
        if (first2.type !== SelectorType.Pseudo || first2.name !== "scope") ;
        else if (isArrayContext && second.type === SelectorType.Descendant) {
          rules2[1] = FLEXIBLE_DESCENDANT_TOKEN;
        } else if (second.type === SelectorType.Adjacent || second.type === SelectorType.Sibling) {
          shouldTestNextSiblings = true;
        }
      }
      return compileRules(rules2, options, finalContext);
    }).reduce(reduceRules, boolbase.falseFunc);
    query.shouldTestNextSiblings = shouldTestNextSiblings;
    return query;
  }
  function compileRules(rules2, options, context) {
    var _a2;
    return rules2.reduce((previous, rule) => previous === boolbase.falseFunc ? boolbase.falseFunc : compileGeneralSelector(previous, rule, options, context, compileToken), (_a2 = options.rootFunc) !== null && _a2 !== void 0 ? _a2 : boolbase.trueFunc);
  }
  function reduceRules(a, b) {
    if (b === boolbase.falseFunc || a === boolbase.trueFunc) {
      return a;
    }
    if (a === boolbase.falseFunc || b === boolbase.trueFunc) {
      return b;
    }
    return function combine(elem) {
      return a(elem) || b(elem);
    };
  }
  const defaultEquals = (a, b) => a === b;
  const defaultOptions = {
    adapter: DomUtils,
    equals: defaultEquals
  };
  function convertOptionFormats(options) {
    var _a2, _b, _c, _d;
    const opts = options !== null && options !== void 0 ? options : defaultOptions;
    (_a2 = opts.adapter) !== null && _a2 !== void 0 ? _a2 : opts.adapter = DomUtils;
    (_b = opts.equals) !== null && _b !== void 0 ? _b : opts.equals = (_d = (_c = opts.adapter) === null || _c === void 0 ? void 0 : _c.equals) !== null && _d !== void 0 ? _d : defaultEquals;
    return opts;
  }
  function wrapCompile(func) {
    return function addAdapter(selector, options, context) {
      const opts = convertOptionFormats(options);
      return func(selector, opts, context);
    };
  }
  const _compileToken = wrapCompile(compileToken);
  function prepareContext(elems, adapter2, shouldTestNextSiblings = false) {
    if (shouldTestNextSiblings) {
      elems = appendNextSiblings(elems, adapter2);
    }
    return Array.isArray(elems) ? adapter2.removeSubsets(elems) : adapter2.getChildren(elems);
  }
  function appendNextSiblings(elem, adapter2) {
    const elems = Array.isArray(elem) ? elem.slice(0) : [elem];
    const elemsLength = elems.length;
    for (let i = 0; i < elemsLength; i++) {
      const nextSiblings = getNextSiblings(elems[i], adapter2);
      elems.push(...nextSiblings);
    }
    return elems;
  }
  const filterNames = new Set([
    "first",
    "last",
    "eq",
    "gt",
    "nth",
    "lt",
    "even",
    "odd"
  ]);
  function isFilter(s) {
    if (s.type !== "pseudo")
      return false;
    if (filterNames.has(s.name))
      return true;
    if (s.name === "not" && Array.isArray(s.data)) {
      return s.data.some((s2) => s2.some(isFilter));
    }
    return false;
  }
  function getLimit(filter2, data2, partLimit) {
    const num = data2 != null ? parseInt(data2, 10) : NaN;
    switch (filter2) {
      case "first":
        return 1;
      case "nth":
      case "eq":
        return isFinite(num) ? num >= 0 ? num + 1 : Infinity : 0;
      case "lt":
        return isFinite(num) ? num >= 0 ? Math.min(num, partLimit) : Infinity : 0;
      case "gt":
        return isFinite(num) ? Infinity : 0;
      case "odd":
        return 2 * partLimit;
      case "even":
        return 2 * partLimit - 1;
      case "last":
      case "not":
        return Infinity;
    }
  }
  function getDocumentRoot(node) {
    while (node.parent)
      node = node.parent;
    return node;
  }
  function groupSelectors(selectors) {
    const filteredSelectors = [];
    const plainSelectors = [];
    for (const selector of selectors) {
      if (selector.some(isFilter)) {
        filteredSelectors.push(selector);
      } else {
        plainSelectors.push(selector);
      }
    }
    return [plainSelectors, filteredSelectors];
  }
  const UNIVERSAL_SELECTOR = {
    type: SelectorType.Universal,
    namespace: null
  };
  const SCOPE_PSEUDO = {
    type: SelectorType.Pseudo,
    name: "scope",
    data: null
  };
  function is$1(element, selector, options = {}) {
    return some([element], selector, options);
  }
  function some(elements, selector, options = {}) {
    if (typeof selector === "function")
      return elements.some(selector);
    const [plain, filtered] = groupSelectors(parse$6(selector));
    return plain.length > 0 && elements.some(_compileToken(plain, options)) || filtered.some((sel) => filterBySelector(sel, elements, options).length > 0);
  }
  function filterByPosition(filter2, elems, data2, options) {
    const num = typeof data2 === "string" ? parseInt(data2, 10) : NaN;
    switch (filter2) {
      case "first":
      case "lt":
        return elems;
      case "last":
        return elems.length > 0 ? [elems[elems.length - 1]] : elems;
      case "nth":
      case "eq":
        return isFinite(num) && Math.abs(num) < elems.length ? [num < 0 ? elems[elems.length + num] : elems[num]] : [];
      case "gt":
        return isFinite(num) ? elems.slice(num + 1) : [];
      case "even":
        return elems.filter((_, i) => i % 2 === 0);
      case "odd":
        return elems.filter((_, i) => i % 2 === 1);
      case "not": {
        const filtered = new Set(filterParsed(data2, elems, options));
        return elems.filter((e) => !filtered.has(e));
      }
    }
  }
  function filter$1(selector, elements, options = {}) {
    return filterParsed(parse$6(selector), elements, options);
  }
  function filterParsed(selector, elements, options) {
    if (elements.length === 0)
      return [];
    const [plainSelectors, filteredSelectors] = groupSelectors(selector);
    let found;
    if (plainSelectors.length) {
      const filtered = filterElements(elements, plainSelectors, options);
      if (filteredSelectors.length === 0) {
        return filtered;
      }
      if (filtered.length) {
        found = new Set(filtered);
      }
    }
    for (let i = 0; i < filteredSelectors.length && (found === null || found === void 0 ? void 0 : found.size) !== elements.length; i++) {
      const filteredSelector = filteredSelectors[i];
      const missing = found ? elements.filter((e) => isTag(e) && !found.has(e)) : elements;
      if (missing.length === 0)
        break;
      const filtered = filterBySelector(filteredSelector, elements, options);
      if (filtered.length) {
        if (!found) {
          if (i === filteredSelectors.length - 1) {
            return filtered;
          }
          found = new Set(filtered);
        } else {
          filtered.forEach((el) => found.add(el));
        }
      }
    }
    return typeof found !== "undefined" ? found.size === elements.length ? elements : (
elements.filter((el) => found.has(el))
    ) : [];
  }
  function filterBySelector(selector, elements, options) {
    var _a2;
    if (selector.some(isTraversal$1)) {
      const root2 = (_a2 = options.root) !== null && _a2 !== void 0 ? _a2 : getDocumentRoot(elements[0]);
      const opts = { ...options, context: elements, relativeSelector: false };
      selector.push(SCOPE_PSEUDO);
      return findFilterElements(root2, selector, opts, true, elements.length);
    }
    return findFilterElements(elements, selector, options, false, elements.length);
  }
  function select(selector, root2, options = {}, limit = Infinity) {
    if (typeof selector === "function") {
      return find$1(root2, selector);
    }
    const [plain, filtered] = groupSelectors(parse$6(selector));
    const results = filtered.map((sel) => findFilterElements(root2, sel, options, true, limit));
    if (plain.length) {
      results.push(findElements(root2, plain, options, limit));
    }
    if (results.length === 0) {
      return [];
    }
    if (results.length === 1) {
      return results[0];
    }
    return uniqueSort(results.reduce((a, b) => [...a, ...b]));
  }
  function findFilterElements(root2, selector, options, queryForSelector, totalLimit) {
    const filterIndex = selector.findIndex(isFilter);
    const sub = selector.slice(0, filterIndex);
    const filter2 = selector[filterIndex];
    const partLimit = selector.length - 1 === filterIndex ? totalLimit : Infinity;
    const limit = getLimit(filter2.name, filter2.data, partLimit);
    if (limit === 0)
      return [];
    const elemsNoLimit = sub.length === 0 && !Array.isArray(root2) ? getChildren(root2).filter(isTag) : sub.length === 0 ? (Array.isArray(root2) ? root2 : [root2]).filter(isTag) : queryForSelector || sub.some(isTraversal$1) ? findElements(root2, [sub], options, limit) : filterElements(root2, [sub], options);
    const elems = elemsNoLimit.slice(0, limit);
    let result = filterByPosition(filter2.name, elems, filter2.data, options);
    if (result.length === 0 || selector.length === filterIndex + 1) {
      return result;
    }
    const remainingSelector = selector.slice(filterIndex + 1);
    const remainingHasTraversal = remainingSelector.some(isTraversal$1);
    if (remainingHasTraversal) {
      if (isTraversal$1(remainingSelector[0])) {
        const { type } = remainingSelector[0];
        if (type === SelectorType.Sibling || type === SelectorType.Adjacent) {
          result = prepareContext(result, DomUtils, true);
        }
        remainingSelector.unshift(UNIVERSAL_SELECTOR);
      }
      options = {
        ...options,
relativeSelector: false,
rootFunc: (el) => result.includes(el)
      };
    } else if (options.rootFunc && options.rootFunc !== boolbaseExports.trueFunc) {
      options = { ...options, rootFunc: boolbaseExports.trueFunc };
    }
    return remainingSelector.some(isFilter) ? findFilterElements(result, remainingSelector, options, false, totalLimit) : remainingHasTraversal ? (
findElements(result, [remainingSelector], options, totalLimit)
    ) : (
filterElements(result, [remainingSelector], options)
    );
  }
  function findElements(root2, sel, options, limit) {
    const query = _compileToken(sel, options, root2);
    return find$1(root2, query, limit);
  }
  function find$1(root2, query, limit = Infinity) {
    const elems = prepareContext(root2, DomUtils, query.shouldTestNextSiblings);
    return find$2((node) => isTag(node) && query(node), elems, true, limit);
  }
  function filterElements(elements, sel, options) {
    const els = (Array.isArray(elements) ? elements : [elements]).filter(isTag);
    if (els.length === 0)
      return els;
    const query = _compileToken(sel, options);
    return query === boolbaseExports.trueFunc ? els : els.filter(query);
  }
  const reSiblingSelector = /^\s*[+~]/;
  function find(selectorOrHaystack) {
    if (!selectorOrHaystack) {
      return this._make([]);
    }
    if (typeof selectorOrHaystack !== "string") {
      const haystack = isCheerio(selectorOrHaystack) ? selectorOrHaystack.toArray() : [selectorOrHaystack];
      const context = this.toArray();
      return this._make(haystack.filter((elem) => context.some((node) => contains(node, elem))));
    }
    return this._findBySelector(selectorOrHaystack, Number.POSITIVE_INFINITY);
  }
  function _findBySelector(selector, limit) {
    var _a2;
    const context = this.toArray();
    const elems = reSiblingSelector.test(selector) ? context : this.children().toArray();
    const options = {
      context,
      root: (_a2 = this._root) === null || _a2 === void 0 ? void 0 : _a2[0],
xmlMode: this.options.xmlMode,
      lowerCaseTags: this.options.lowerCaseTags,
      lowerCaseAttributeNames: this.options.lowerCaseAttributeNames,
      pseudos: this.options.pseudos,
      quirksMode: this.options.quirksMode
    };
    return this._make(select(selector, elems, options, limit));
  }
  function _getMatcher(matchMap) {
    return function(fn, ...postFns) {
      return function(selector) {
        var _a2;
        let matched = matchMap(fn, this);
        if (selector) {
          matched = filterArray(matched, selector, this.options.xmlMode, (_a2 = this._root) === null || _a2 === void 0 ? void 0 : _a2[0]);
        }
        return this._make(
this.length > 1 && matched.length > 1 ? postFns.reduce((elems, fn2) => fn2(elems), matched) : matched
        );
      };
    };
  }
  const _matcher = _getMatcher((fn, elems) => {
    let ret = [];
    for (let i = 0; i < elems.length; i++) {
      const value = fn(elems[i]);
      if (value.length > 0)
        ret = ret.concat(value);
    }
    return ret;
  });
  const _singleMatcher = _getMatcher((fn, elems) => {
    const ret = [];
    for (let i = 0; i < elems.length; i++) {
      const value = fn(elems[i]);
      if (value !== null) {
        ret.push(value);
      }
    }
    return ret;
  });
  function _matchUntil(nextElem, ...postFns) {
    let matches = null;
    const innerMatcher = _getMatcher((nextElem2, elems) => {
      const matched = [];
      domEach(elems, (elem) => {
        for (let next2; next2 = nextElem2(elem); elem = next2) {
          if (matches === null || matches === void 0 ? void 0 : matches(next2, matched.length))
            break;
          matched.push(next2);
        }
      });
      return matched;
    })(nextElem, ...postFns);
    return function(selector, filterSelector) {
      matches = typeof selector === "string" ? (elem) => is$1(elem, selector, this.options) : selector ? getFilterFn(selector) : null;
      const ret = innerMatcher.call(this, filterSelector);
      matches = null;
      return ret;
    };
  }
  function _removeDuplicates(elems) {
    return elems.length > 1 ? Array.from(new Set(elems)) : elems;
  }
  const parent = _singleMatcher(({ parent: parent2 }) => parent2 && !isDocument(parent2) ? parent2 : null, _removeDuplicates);
  const parents = _matcher((elem) => {
    const matched = [];
    while (elem.parent && !isDocument(elem.parent)) {
      matched.push(elem.parent);
      elem = elem.parent;
    }
    return matched;
  }, uniqueSort, (elems) => elems.reverse());
  const parentsUntil = _matchUntil(({ parent: parent2 }) => parent2 && !isDocument(parent2) ? parent2 : null, uniqueSort, (elems) => elems.reverse());
  function closest(selector) {
    var _a2;
    const set = [];
    if (!selector) {
      return this._make(set);
    }
    const selectOpts = {
      xmlMode: this.options.xmlMode,
      root: (_a2 = this._root) === null || _a2 === void 0 ? void 0 : _a2[0]
    };
    const selectFn = typeof selector === "string" ? (elem) => is$1(elem, selector, selectOpts) : getFilterFn(selector);
    domEach(this, (elem) => {
      if (elem && !isDocument(elem) && !isTag(elem)) {
        elem = elem.parent;
      }
      while (elem && isTag(elem)) {
        if (selectFn(elem, 0)) {
          if (!set.includes(elem)) {
            set.push(elem);
          }
          break;
        }
        elem = elem.parent;
      }
    });
    return this._make(set);
  }
  const next = _singleMatcher((elem) => nextElementSibling(elem));
  const nextAll = _matcher((elem) => {
    const matched = [];
    while (elem.next) {
      elem = elem.next;
      if (isTag(elem))
        matched.push(elem);
    }
    return matched;
  }, _removeDuplicates);
  const nextUntil = _matchUntil((el) => nextElementSibling(el), _removeDuplicates);
  const prev = _singleMatcher((elem) => prevElementSibling(elem));
  const prevAll = _matcher((elem) => {
    const matched = [];
    while (elem.prev) {
      elem = elem.prev;
      if (isTag(elem))
        matched.push(elem);
    }
    return matched;
  }, _removeDuplicates);
  const prevUntil = _matchUntil((el) => prevElementSibling(el), _removeDuplicates);
  const siblings = _matcher((elem) => getSiblings(elem).filter((el) => isTag(el) && el !== elem), uniqueSort);
  const children = _matcher((elem) => getChildren(elem).filter(isTag), _removeDuplicates);
  function contents() {
    const elems = this.toArray().reduce((newElems, elem) => hasChildren(elem) ? newElems.concat(elem.children) : newElems, []);
    return this._make(elems);
  }
  function each(fn) {
    let i = 0;
    const len = this.length;
    while (i < len && fn.call(this[i], i, this[i]) !== false)
      ++i;
    return this;
  }
  function map(fn) {
    let elems = [];
    for (let i = 0; i < this.length; i++) {
      const el = this[i];
      const val2 = fn.call(el, i, el);
      if (val2 != null) {
        elems = elems.concat(val2);
      }
    }
    return this._make(elems);
  }
  function getFilterFn(match) {
    if (typeof match === "function") {
      return (el, i) => match.call(el, i, el);
    }
    if (isCheerio(match)) {
      return (el) => Array.prototype.includes.call(match, el);
    }
    return function(el) {
      return match === el;
    };
  }
  function filter(match) {
    var _a2;
    return this._make(filterArray(this.toArray(), match, this.options.xmlMode, (_a2 = this._root) === null || _a2 === void 0 ? void 0 : _a2[0]));
  }
  function filterArray(nodes, match, xmlMode, root2) {
    return typeof match === "string" ? filter$1(match, nodes, { xmlMode, root: root2 }) : nodes.filter(getFilterFn(match));
  }
  function is(selector) {
    const nodes = this.toArray();
    return typeof selector === "string" ? some(nodes.filter(isTag), selector, this.options) : selector ? nodes.some(getFilterFn(selector)) : false;
  }
  function not(match) {
    let nodes = this.toArray();
    if (typeof match === "string") {
      const matches = new Set(filter$1(match, nodes, this.options));
      nodes = nodes.filter((el) => !matches.has(el));
    } else {
      const filterFn = getFilterFn(match);
      nodes = nodes.filter((el, i) => !filterFn(el, i));
    }
    return this._make(nodes);
  }
  function has(selectorOrHaystack) {
    return this.filter(typeof selectorOrHaystack === "string" ? (
`:has(${selectorOrHaystack})`
    ) : (_, el) => this._make(el).find(selectorOrHaystack).length > 0);
  }
  function first() {
    return this.length > 1 ? this._make(this[0]) : this;
  }
  function last() {
    return this.length > 0 ? this._make(this[this.length - 1]) : this;
  }
  function eq(i) {
    var _a2;
    i = +i;
    if (i === 0 && this.length <= 1)
      return this;
    if (i < 0)
      i = this.length + i;
    return this._make((_a2 = this[i]) !== null && _a2 !== void 0 ? _a2 : []);
  }
  function get(i) {
    if (i == null) {
      return this.toArray();
    }
    return this[i < 0 ? this.length + i : i];
  }
  function toArray() {
    return Array.prototype.slice.call(this);
  }
  function index(selectorOrNeedle) {
    let $haystack;
    let needle;
    if (selectorOrNeedle == null) {
      $haystack = this.parent().children();
      needle = this[0];
    } else if (typeof selectorOrNeedle === "string") {
      $haystack = this._make(selectorOrNeedle);
      needle = this[0];
    } else {
      $haystack = this;
      needle = isCheerio(selectorOrNeedle) ? selectorOrNeedle[0] : selectorOrNeedle;
    }
    return Array.prototype.indexOf.call($haystack, needle);
  }
  function slice(start, end2) {
    return this._make(Array.prototype.slice.call(this, start, end2));
  }
  function end() {
    var _a2;
    return (_a2 = this.prevObject) !== null && _a2 !== void 0 ? _a2 : this._make([]);
  }
  function add(other, context) {
    const selection = this._make(other, context);
    const contents2 = uniqueSort([...this.get(), ...selection.get()]);
    return this._make(contents2);
  }
  function addBack(selector) {
    return this.prevObject ? this.add(selector ? this.prevObject.filter(selector) : this.prevObject) : this;
  }
  const Traversing = Object.freeze( Object.defineProperty({
    __proto__: null,
    _findBySelector,
    add,
    addBack,
    children,
    closest,
    contents,
    each,
    end,
    eq,
    filter,
    filterArray,
    find,
    first,
    get,
    has,
    index,
    is,
    last,
    map,
    next,
    nextAll,
    nextUntil,
    not,
    parent,
    parents,
    parentsUntil,
    prev,
    prevAll,
    prevUntil,
    siblings,
    slice,
    toArray
  }, Symbol.toStringTag, { value: "Module" }));
  function getParse(parser) {
    return function parse2(content, options, isDocument$1, context) {
      if (typeof Buffer !== "undefined" && Buffer.isBuffer(content)) {
        content = content.toString();
      }
      if (typeof content === "string") {
        return parser(content, options, isDocument$1, context);
      }
      const doc = content;
      if (!Array.isArray(doc) && isDocument(doc)) {
        return doc;
      }
      const root2 = new Document([]);
      update(doc, root2);
      return root2;
    };
  }
  function update(newChilds, parent2) {
    const arr = Array.isArray(newChilds) ? newChilds : [newChilds];
    if (parent2) {
      parent2.children = arr;
    } else {
      parent2 = null;
    }
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (node.parent && node.parent.children !== arr) {
        removeElement(node);
      }
      if (parent2) {
        node.prev = arr[i - 1] || null;
        node.next = arr[i + 1] || null;
      } else {
        node.prev = node.next = null;
      }
      node.parent = parent2;
    }
    return parent2;
  }
  function _makeDomArray(elem, clone2) {
    if (elem == null) {
      return [];
    }
    if (typeof elem === "string") {
      return this._parse(elem, this.options, false, null).children.slice(0);
    }
    if ("length" in elem) {
      if (elem.length === 1) {
        return this._makeDomArray(elem[0], clone2);
      }
      const result = [];
      for (let i = 0; i < elem.length; i++) {
        const el = elem[i];
        if (typeof el === "object") {
          if (el == null) {
            continue;
          }
          if (!("length" in el)) {
            result.push(clone2 ? cloneNode(el, true) : el);
            continue;
          }
        }
        result.push(...this._makeDomArray(el, clone2));
      }
      return result;
    }
    return [clone2 ? cloneNode(elem, true) : elem];
  }
  function _insert(concatenator) {
    return function(...elems) {
      const lastIdx = this.length - 1;
      return domEach(this, (el, i) => {
        if (!hasChildren(el))
          return;
        const domSrc = typeof elems[0] === "function" ? elems[0].call(el, i, this._render(el.children)) : elems;
        const dom = this._makeDomArray(domSrc, i < lastIdx);
        concatenator(dom, el.children, el);
      });
    };
  }
  function uniqueSplice(array, spliceIdx, spliceCount, newElems, parent2) {
    var _a2, _b;
    const spliceArgs = [
      spliceIdx,
      spliceCount,
      ...newElems
    ];
    const prev2 = spliceIdx === 0 ? null : array[spliceIdx - 1];
    const next2 = spliceIdx + spliceCount >= array.length ? null : array[spliceIdx + spliceCount];
    for (let idx = 0; idx < newElems.length; ++idx) {
      const node = newElems[idx];
      const oldParent = node.parent;
      if (oldParent) {
        const oldSiblings = oldParent.children;
        const prevIdx = oldSiblings.indexOf(node);
        if (prevIdx !== -1) {
          oldParent.children.splice(prevIdx, 1);
          if (parent2 === oldParent && spliceIdx > prevIdx) {
            spliceArgs[0]--;
          }
        }
      }
      node.parent = parent2;
      if (node.prev) {
        node.prev.next = (_a2 = node.next) !== null && _a2 !== void 0 ? _a2 : null;
      }
      if (node.next) {
        node.next.prev = (_b = node.prev) !== null && _b !== void 0 ? _b : null;
      }
      node.prev = idx === 0 ? prev2 : newElems[idx - 1];
      node.next = idx === newElems.length - 1 ? next2 : newElems[idx + 1];
    }
    if (prev2) {
      prev2.next = newElems[0];
    }
    if (next2) {
      next2.prev = newElems[newElems.length - 1];
    }
    return array.splice(...spliceArgs);
  }
  function appendTo(target) {
    const appendTarget = isCheerio(target) ? target : this._make(target);
    appendTarget.append(this);
    return this;
  }
  function prependTo(target) {
    const prependTarget = isCheerio(target) ? target : this._make(target);
    prependTarget.prepend(this);
    return this;
  }
  const append = _insert((dom, children2, parent2) => {
    uniqueSplice(children2, children2.length, 0, dom, parent2);
  });
  const prepend = _insert((dom, children2, parent2) => {
    uniqueSplice(children2, 0, 0, dom, parent2);
  });
  function _wrap(insert) {
    return function(wrapper2) {
      const lastIdx = this.length - 1;
      const lastParent = this.parents().last();
      for (let i = 0; i < this.length; i++) {
        const el = this[i];
        const wrap2 = typeof wrapper2 === "function" ? wrapper2.call(el, i, el) : typeof wrapper2 === "string" && !isHtml(wrapper2) ? lastParent.find(wrapper2).clone() : wrapper2;
        const [wrapperDom] = this._makeDomArray(wrap2, i < lastIdx);
        if (!wrapperDom || !hasChildren(wrapperDom))
          continue;
        let elInsertLocation = wrapperDom;
        let j = 0;
        while (j < elInsertLocation.children.length) {
          const child = elInsertLocation.children[j];
          if (isTag(child)) {
            elInsertLocation = child;
            j = 0;
          } else {
            j++;
          }
        }
        insert(el, elInsertLocation, [wrapperDom]);
      }
      return this;
    };
  }
  const wrap = _wrap((el, elInsertLocation, wrapperDom) => {
    const { parent: parent2 } = el;
    if (!parent2)
      return;
    const siblings2 = parent2.children;
    const index2 = siblings2.indexOf(el);
    update([el], elInsertLocation);
    uniqueSplice(siblings2, index2, 0, wrapperDom, parent2);
  });
  const wrapInner = _wrap((el, elInsertLocation, wrapperDom) => {
    if (!hasChildren(el))
      return;
    update(el.children, elInsertLocation);
    update(wrapperDom, el);
  });
  function unwrap(selector) {
    this.parent(selector).not("body").each((_, el) => {
      this._make(el).replaceWith(el.children);
    });
    return this;
  }
  function wrapAll(wrapper2) {
    const el = this[0];
    if (el) {
      const wrap2 = this._make(typeof wrapper2 === "function" ? wrapper2.call(el, 0, el) : wrapper2).insertBefore(el);
      let elInsertLocation;
      for (let i = 0; i < wrap2.length; i++) {
        if (wrap2[i].type === Tag) {
          elInsertLocation = wrap2[i];
        }
      }
      let j = 0;
      while (elInsertLocation && j < elInsertLocation.children.length) {
        const child = elInsertLocation.children[j];
        if (child.type === Tag) {
          elInsertLocation = child;
          j = 0;
        } else {
          j++;
        }
      }
      if (elInsertLocation)
        this._make(elInsertLocation).append(this);
    }
    return this;
  }
  function after(...elems) {
    const lastIdx = this.length - 1;
    return domEach(this, (el, i) => {
      if (!hasChildren(el) || !el.parent) {
        return;
      }
      const siblings2 = el.parent.children;
      const index2 = siblings2.indexOf(el);
      if (index2 === -1)
        return;
      const domSrc = typeof elems[0] === "function" ? elems[0].call(el, i, this._render(el.children)) : elems;
      const dom = this._makeDomArray(domSrc, i < lastIdx);
      uniqueSplice(siblings2, index2 + 1, 0, dom, el.parent);
    });
  }
  function insertAfter(target) {
    if (typeof target === "string") {
      target = this._make(target);
    }
    this.remove();
    const clones = [];
    for (const el of this._makeDomArray(target)) {
      const clonedSelf = this.clone().toArray();
      const { parent: parent2 } = el;
      if (!parent2) {
        continue;
      }
      const siblings2 = parent2.children;
      const index2 = siblings2.indexOf(el);
      if (index2 === -1)
        continue;
      uniqueSplice(siblings2, index2 + 1, 0, clonedSelf, parent2);
      clones.push(...clonedSelf);
    }
    return this._make(clones);
  }
  function before(...elems) {
    const lastIdx = this.length - 1;
    return domEach(this, (el, i) => {
      if (!hasChildren(el) || !el.parent) {
        return;
      }
      const siblings2 = el.parent.children;
      const index2 = siblings2.indexOf(el);
      if (index2 === -1)
        return;
      const domSrc = typeof elems[0] === "function" ? elems[0].call(el, i, this._render(el.children)) : elems;
      const dom = this._makeDomArray(domSrc, i < lastIdx);
      uniqueSplice(siblings2, index2, 0, dom, el.parent);
    });
  }
  function insertBefore(target) {
    const targetArr = this._make(target);
    this.remove();
    const clones = [];
    domEach(targetArr, (el) => {
      const clonedSelf = this.clone().toArray();
      const { parent: parent2 } = el;
      if (!parent2) {
        return;
      }
      const siblings2 = parent2.children;
      const index2 = siblings2.indexOf(el);
      if (index2 === -1)
        return;
      uniqueSplice(siblings2, index2, 0, clonedSelf, parent2);
      clones.push(...clonedSelf);
    });
    return this._make(clones);
  }
  function remove(selector) {
    const elems = selector ? this.filter(selector) : this;
    domEach(elems, (el) => {
      removeElement(el);
      el.prev = el.next = el.parent = null;
    });
    return this;
  }
  function replaceWith(content) {
    return domEach(this, (el, i) => {
      const { parent: parent2 } = el;
      if (!parent2) {
        return;
      }
      const siblings2 = parent2.children;
      const cont = typeof content === "function" ? content.call(el, i, el) : content;
      const dom = this._makeDomArray(cont);
      update(dom, null);
      const index2 = siblings2.indexOf(el);
      uniqueSplice(siblings2, index2, 1, dom, parent2);
      if (!dom.includes(el)) {
        el.parent = el.prev = el.next = null;
      }
    });
  }
  function empty() {
    return domEach(this, (el) => {
      if (!hasChildren(el))
        return;
      for (const child of el.children) {
        child.next = child.prev = child.parent = null;
      }
      el.children.length = 0;
    });
  }
  function html$1(str) {
    if (str === void 0) {
      const el = this[0];
      if (!el || !hasChildren(el))
        return null;
      return this._render(el.children);
    }
    return domEach(this, (el) => {
      if (!hasChildren(el))
        return;
      for (const child of el.children) {
        child.next = child.prev = child.parent = null;
      }
      const content = isCheerio(str) ? str.toArray() : this._parse(`${str}`, this.options, false, el).children;
      update(content, el);
    });
  }
  function toString() {
    return this._render(this);
  }
  function text(str) {
    if (str === void 0) {
      return text$1(this);
    }
    if (typeof str === "function") {
      return domEach(this, (el, i) => this._make(el).text(str.call(el, i, text$1([el]))));
    }
    return domEach(this, (el) => {
      if (!hasChildren(el))
        return;
      for (const child of el.children) {
        child.next = child.prev = child.parent = null;
      }
      const textNode = new Text(`${str}`);
      update(textNode, el);
    });
  }
  function clone() {
    const clone2 = Array.prototype.map.call(this.get(), (el) => cloneNode(el, true));
    const root2 = new Document(clone2);
    for (const node of clone2) {
      node.parent = root2;
    }
    return this._make(clone2);
  }
  const Manipulation = Object.freeze( Object.defineProperty({
    __proto__: null,
    _makeDomArray,
    after,
    append,
    appendTo,
    before,
    clone,
    empty,
    html: html$1,
    insertAfter,
    insertBefore,
    prepend,
    prependTo,
    remove,
    replaceWith,
    text,
    toString,
    unwrap,
    wrap,
    wrapAll,
    wrapInner
  }, Symbol.toStringTag, { value: "Module" }));
  function css(prop2, val2) {
    if (prop2 != null && val2 != null ||
typeof prop2 === "object" && !Array.isArray(prop2)) {
      return domEach(this, (el, i) => {
        if (isTag(el)) {
          setCss(el, prop2, val2, i);
        }
      });
    }
    if (this.length === 0) {
      return void 0;
    }
    return getCss(this[0], prop2);
  }
  function setCss(el, prop2, value, idx) {
    if (typeof prop2 === "string") {
      const styles = getCss(el);
      const val2 = typeof value === "function" ? value.call(el, idx, styles[prop2]) : value;
      if (val2 === "") {
        delete styles[prop2];
      } else if (val2 != null) {
        styles[prop2] = val2;
      }
      el.attribs["style"] = stringify(styles);
    } else if (typeof prop2 === "object") {
      const keys = Object.keys(prop2);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        setCss(el, k, prop2[k], i);
      }
    }
  }
  function getCss(el, prop2) {
    if (!el || !isTag(el))
      return;
    const styles = parse$4(el.attribs["style"]);
    if (typeof prop2 === "string") {
      return styles[prop2];
    }
    if (Array.isArray(prop2)) {
      const newStyles = {};
      for (const item of prop2) {
        if (styles[item] != null) {
          newStyles[item] = styles[item];
        }
      }
      return newStyles;
    }
    return styles;
  }
  function stringify(obj) {
    return Object.keys(obj).reduce((str, prop2) => `${str}${str ? " " : ""}${prop2}: ${obj[prop2]};`, "");
  }
  function parse$4(styles) {
    styles = (styles || "").trim();
    if (!styles)
      return {};
    const obj = {};
    let key;
    for (const str of styles.split(";")) {
      const n = str.indexOf(":");
      if (n < 1 || n === str.length - 1) {
        const trimmed = str.trimEnd();
        if (trimmed.length > 0 && key !== void 0) {
          obj[key] += `;${trimmed}`;
        }
      } else {
        key = str.slice(0, n).trim();
        obj[key] = str.slice(n + 1).trim();
      }
    }
    return obj;
  }
  const Css = Object.freeze( Object.defineProperty({
    __proto__: null,
    css
  }, Symbol.toStringTag, { value: "Module" }));
  const submittableSelector = "input,select,textarea,keygen";
  const r20 = /%20/g;
  const rCRLF = /\r?\n/g;
  function serialize() {
    const arr = this.serializeArray();
    const retArr = arr.map((data2) => `${encodeURIComponent(data2.name)}=${encodeURIComponent(data2.value)}`);
    return retArr.join("&").replace(r20, "+");
  }
  function serializeArray() {
    return this.map((_, elem) => {
      const $elem = this._make(elem);
      if (isTag(elem) && elem.name === "form") {
        return $elem.find(submittableSelector).toArray();
      }
      return $elem.filter(submittableSelector).toArray();
    }).filter(
'[name!=""]:enabled:not(:submit, :button, :image, :reset, :file):matches([checked], :not(:checkbox, :radio))'
    ).map((_, elem) => {
      var _a2;
      const $elem = this._make(elem);
      const name = $elem.attr("name");
      const value = (_a2 = $elem.val()) !== null && _a2 !== void 0 ? _a2 : "";
      if (Array.isArray(value)) {
        return value.map((val2) => (
{ name, value: val2.replace(rCRLF, "\r\n") }
        ));
      }
      return { name, value: value.replace(rCRLF, "\r\n") };
    }).toArray();
  }
  const Forms = Object.freeze( Object.defineProperty({
    __proto__: null,
    serialize,
    serializeArray
  }, Symbol.toStringTag, { value: "Module" }));
  function getExtractDescr(descr) {
    var _a2;
    if (typeof descr === "string") {
      return { selector: descr, value: "textContent" };
    }
    return {
      selector: descr.selector,
      value: (_a2 = descr.value) !== null && _a2 !== void 0 ? _a2 : "textContent"
    };
  }
  function extract(map2) {
    const ret = {};
    for (const key in map2) {
      const descr = map2[key];
      const isArray = Array.isArray(descr);
      const { selector, value } = getExtractDescr(isArray ? descr[0] : descr);
      const fn = typeof value === "function" ? value : typeof value === "string" ? (el) => this._make(el).prop(value) : (el) => this._make(el).extract(value);
      if (isArray) {
        ret[key] = this._findBySelector(selector, Number.POSITIVE_INFINITY).map((_, el) => fn(el, key, ret)).get();
      } else {
        const $2 = this._findBySelector(selector, 1);
        ret[key] = $2.length > 0 ? fn($2[0], key, ret) : void 0;
      }
    }
    return ret;
  }
  const Extract = Object.freeze( Object.defineProperty({
    __proto__: null,
    extract
  }, Symbol.toStringTag, { value: "Module" }));
  class Cheerio {
constructor(elements, root2, options) {
      this.length = 0;
      this.options = options;
      this._root = root2;
      if (elements) {
        for (let idx = 0; idx < elements.length; idx++) {
          this[idx] = elements[idx];
        }
        this.length = elements.length;
      }
    }
  }
  Cheerio.prototype.cheerio = "[cheerio object]";
  Cheerio.prototype.splice = Array.prototype.splice;
  Cheerio.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
  Object.assign(Cheerio.prototype, Attributes, Traversing, Manipulation, Css, Forms, Extract);
  function getLoad(parse2, render2) {
    return function load2(content, options, isDocument2 = true) {
      if (content == null) {
        throw new Error("cheerio.load() expects a string");
      }
      const internalOpts = flattenOptions(options);
      const initialRoot = parse2(content, internalOpts, isDocument2, null);
      class LoadedCheerio extends Cheerio {
        _make(selector, context) {
          const cheerio = initialize(selector, context);
          cheerio.prevObject = this;
          return cheerio;
        }
        _parse(content2, options2, isDocument3, context) {
          return parse2(content2, options2, isDocument3, context);
        }
        _render(dom) {
          return render2(dom, this.options);
        }
      }
      function initialize(selector, context, root2 = initialRoot, opts) {
        if (selector && isCheerio(selector))
          return selector;
        const options2 = flattenOptions(opts, internalOpts);
        const r = typeof root2 === "string" ? [parse2(root2, options2, false, null)] : "length" in root2 ? root2 : [root2];
        const rootInstance = isCheerio(r) ? r : new LoadedCheerio(r, null, options2);
        rootInstance._root = rootInstance;
        if (!selector) {
          return new LoadedCheerio(void 0, rootInstance, options2);
        }
        const elements = typeof selector === "string" && isHtml(selector) ? (
parse2(selector, options2, false, null).children
        ) : isNode(selector) ? (
[selector]
        ) : Array.isArray(selector) ? (
selector
        ) : void 0;
        const instance = new LoadedCheerio(elements, rootInstance, options2);
        if (elements) {
          return instance;
        }
        if (typeof selector !== "string") {
          throw new TypeError("Unexpected type of selector");
        }
        let search = selector;
        const searchContext = context ? (
typeof context === "string" ? isHtml(context) ? (
new LoadedCheerio([parse2(context, options2, false, null)], rootInstance, options2)
          ) : (
(search = `${context} ${search}`, rootInstance)
          ) : isCheerio(context) ? (
context
          ) : (
new LoadedCheerio(Array.isArray(context) ? context : [context], rootInstance, options2)
          )
        ) : rootInstance;
        if (!searchContext)
          return instance;
        return searchContext.find(search);
      }
      Object.assign(initialize, staticMethods, {
        load: load2,
_root: initialRoot,
        _options: internalOpts,
fn: LoadedCheerio.prototype,
prototype: LoadedCheerio.prototype
      });
      return initialize;
    };
  }
  function isNode(obj) {
    return (
!!obj.name ||
obj.type === Root ||
obj.type === Text$1 ||
obj.type === Comment$1
    );
  }
  const UNDEFINED_CODE_POINTS = new Set([
    65534,
    65535,
    131070,
    131071,
    196606,
    196607,
    262142,
    262143,
    327678,
    327679,
    393214,
    393215,
    458750,
    458751,
    524286,
    524287,
    589822,
    589823,
    655358,
    655359,
    720894,
    720895,
    786430,
    786431,
    851966,
    851967,
    917502,
    917503,
    983038,
    983039,
    1048574,
    1048575,
    1114110,
    1114111
  ]);
  const REPLACEMENT_CHARACTER = "�";
  var CODE_POINTS;
  (function(CODE_POINTS2) {
    CODE_POINTS2[CODE_POINTS2["EOF"] = -1] = "EOF";
    CODE_POINTS2[CODE_POINTS2["NULL"] = 0] = "NULL";
    CODE_POINTS2[CODE_POINTS2["TABULATION"] = 9] = "TABULATION";
    CODE_POINTS2[CODE_POINTS2["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
    CODE_POINTS2[CODE_POINTS2["LINE_FEED"] = 10] = "LINE_FEED";
    CODE_POINTS2[CODE_POINTS2["FORM_FEED"] = 12] = "FORM_FEED";
    CODE_POINTS2[CODE_POINTS2["SPACE"] = 32] = "SPACE";
    CODE_POINTS2[CODE_POINTS2["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
    CODE_POINTS2[CODE_POINTS2["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
    CODE_POINTS2[CODE_POINTS2["AMPERSAND"] = 38] = "AMPERSAND";
    CODE_POINTS2[CODE_POINTS2["APOSTROPHE"] = 39] = "APOSTROPHE";
    CODE_POINTS2[CODE_POINTS2["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
    CODE_POINTS2[CODE_POINTS2["SOLIDUS"] = 47] = "SOLIDUS";
    CODE_POINTS2[CODE_POINTS2["DIGIT_0"] = 48] = "DIGIT_0";
    CODE_POINTS2[CODE_POINTS2["DIGIT_9"] = 57] = "DIGIT_9";
    CODE_POINTS2[CODE_POINTS2["SEMICOLON"] = 59] = "SEMICOLON";
    CODE_POINTS2[CODE_POINTS2["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
    CODE_POINTS2[CODE_POINTS2["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
    CODE_POINTS2[CODE_POINTS2["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
    CODE_POINTS2[CODE_POINTS2["QUESTION_MARK"] = 63] = "QUESTION_MARK";
    CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_A"] = 65] = "LATIN_CAPITAL_A";
    CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_Z"] = 90] = "LATIN_CAPITAL_Z";
    CODE_POINTS2[CODE_POINTS2["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
    CODE_POINTS2[CODE_POINTS2["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
    CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_A"] = 97] = "LATIN_SMALL_A";
    CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_Z"] = 122] = "LATIN_SMALL_Z";
  })(CODE_POINTS || (CODE_POINTS = {}));
  const SEQUENCES = {
    DASH_DASH: "--",
    CDATA_START: "[CDATA[",
    DOCTYPE: "doctype",
    SCRIPT: "script",
    PUBLIC: "public",
    SYSTEM: "system"
  };
  function isSurrogate(cp) {
    return cp >= 55296 && cp <= 57343;
  }
  function isSurrogatePair(cp) {
    return cp >= 56320 && cp <= 57343;
  }
  function getSurrogatePairCodePoint(cp1, cp2) {
    return (cp1 - 55296) * 1024 + 9216 + cp2;
  }
  function isControlCodePoint(cp) {
    return cp !== 32 && cp !== 10 && cp !== 13 && cp !== 9 && cp !== 12 && cp >= 1 && cp <= 31 || cp >= 127 && cp <= 159;
  }
  function isUndefinedCodePoint(cp) {
    return cp >= 64976 && cp <= 65007 || UNDEFINED_CODE_POINTS.has(cp);
  }
  var ERR;
  (function(ERR2) {
    ERR2["controlCharacterInInputStream"] = "control-character-in-input-stream";
    ERR2["noncharacterInInputStream"] = "noncharacter-in-input-stream";
    ERR2["surrogateInInputStream"] = "surrogate-in-input-stream";
    ERR2["nonVoidHtmlElementStartTagWithTrailingSolidus"] = "non-void-html-element-start-tag-with-trailing-solidus";
    ERR2["endTagWithAttributes"] = "end-tag-with-attributes";
    ERR2["endTagWithTrailingSolidus"] = "end-tag-with-trailing-solidus";
    ERR2["unexpectedSolidusInTag"] = "unexpected-solidus-in-tag";
    ERR2["unexpectedNullCharacter"] = "unexpected-null-character";
    ERR2["unexpectedQuestionMarkInsteadOfTagName"] = "unexpected-question-mark-instead-of-tag-name";
    ERR2["invalidFirstCharacterOfTagName"] = "invalid-first-character-of-tag-name";
    ERR2["unexpectedEqualsSignBeforeAttributeName"] = "unexpected-equals-sign-before-attribute-name";
    ERR2["missingEndTagName"] = "missing-end-tag-name";
    ERR2["unexpectedCharacterInAttributeName"] = "unexpected-character-in-attribute-name";
    ERR2["unknownNamedCharacterReference"] = "unknown-named-character-reference";
    ERR2["missingSemicolonAfterCharacterReference"] = "missing-semicolon-after-character-reference";
    ERR2["unexpectedCharacterAfterDoctypeSystemIdentifier"] = "unexpected-character-after-doctype-system-identifier";
    ERR2["unexpectedCharacterInUnquotedAttributeValue"] = "unexpected-character-in-unquoted-attribute-value";
    ERR2["eofBeforeTagName"] = "eof-before-tag-name";
    ERR2["eofInTag"] = "eof-in-tag";
    ERR2["missingAttributeValue"] = "missing-attribute-value";
    ERR2["missingWhitespaceBetweenAttributes"] = "missing-whitespace-between-attributes";
    ERR2["missingWhitespaceAfterDoctypePublicKeyword"] = "missing-whitespace-after-doctype-public-keyword";
    ERR2["missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers"] = "missing-whitespace-between-doctype-public-and-system-identifiers";
    ERR2["missingWhitespaceAfterDoctypeSystemKeyword"] = "missing-whitespace-after-doctype-system-keyword";
    ERR2["missingQuoteBeforeDoctypePublicIdentifier"] = "missing-quote-before-doctype-public-identifier";
    ERR2["missingQuoteBeforeDoctypeSystemIdentifier"] = "missing-quote-before-doctype-system-identifier";
    ERR2["missingDoctypePublicIdentifier"] = "missing-doctype-public-identifier";
    ERR2["missingDoctypeSystemIdentifier"] = "missing-doctype-system-identifier";
    ERR2["abruptDoctypePublicIdentifier"] = "abrupt-doctype-public-identifier";
    ERR2["abruptDoctypeSystemIdentifier"] = "abrupt-doctype-system-identifier";
    ERR2["cdataInHtmlContent"] = "cdata-in-html-content";
    ERR2["incorrectlyOpenedComment"] = "incorrectly-opened-comment";
    ERR2["eofInScriptHtmlCommentLikeText"] = "eof-in-script-html-comment-like-text";
    ERR2["eofInDoctype"] = "eof-in-doctype";
    ERR2["nestedComment"] = "nested-comment";
    ERR2["abruptClosingOfEmptyComment"] = "abrupt-closing-of-empty-comment";
    ERR2["eofInComment"] = "eof-in-comment";
    ERR2["incorrectlyClosedComment"] = "incorrectly-closed-comment";
    ERR2["eofInCdata"] = "eof-in-cdata";
    ERR2["absenceOfDigitsInNumericCharacterReference"] = "absence-of-digits-in-numeric-character-reference";
    ERR2["nullCharacterReference"] = "null-character-reference";
    ERR2["surrogateCharacterReference"] = "surrogate-character-reference";
    ERR2["characterReferenceOutsideUnicodeRange"] = "character-reference-outside-unicode-range";
    ERR2["controlCharacterReference"] = "control-character-reference";
    ERR2["noncharacterCharacterReference"] = "noncharacter-character-reference";
    ERR2["missingWhitespaceBeforeDoctypeName"] = "missing-whitespace-before-doctype-name";
    ERR2["missingDoctypeName"] = "missing-doctype-name";
    ERR2["invalidCharacterSequenceAfterDoctypeName"] = "invalid-character-sequence-after-doctype-name";
    ERR2["duplicateAttribute"] = "duplicate-attribute";
    ERR2["nonConformingDoctype"] = "non-conforming-doctype";
    ERR2["missingDoctype"] = "missing-doctype";
    ERR2["misplacedDoctype"] = "misplaced-doctype";
    ERR2["endTagWithoutMatchingOpenElement"] = "end-tag-without-matching-open-element";
    ERR2["closingOfElementWithOpenChildElements"] = "closing-of-element-with-open-child-elements";
    ERR2["disallowedContentInNoscriptInHead"] = "disallowed-content-in-noscript-in-head";
    ERR2["openElementsLeftAfterEof"] = "open-elements-left-after-eof";
    ERR2["abandonedHeadElementChild"] = "abandoned-head-element-child";
    ERR2["misplacedStartTagForHeadElement"] = "misplaced-start-tag-for-head-element";
    ERR2["nestedNoscriptInHead"] = "nested-noscript-in-head";
    ERR2["eofInElementThatCanContainOnlyText"] = "eof-in-element-that-can-contain-only-text";
  })(ERR || (ERR = {}));
  const DEFAULT_BUFFER_WATERLINE = 1 << 16;
  class Preprocessor {
    constructor(handler) {
      this.handler = handler;
      this.html = "";
      this.pos = -1;
      this.lastGapPos = -2;
      this.gapStack = [];
      this.skipNextNewLine = false;
      this.lastChunkWritten = false;
      this.endOfChunkHit = false;
      this.bufferWaterline = DEFAULT_BUFFER_WATERLINE;
      this.isEol = false;
      this.lineStartPos = 0;
      this.droppedBufferSize = 0;
      this.line = 1;
      this.lastErrOffset = -1;
    }
get col() {
      return this.pos - this.lineStartPos + Number(this.lastGapPos !== this.pos);
    }
    get offset() {
      return this.droppedBufferSize + this.pos;
    }
    getError(code, cpOffset) {
      const { line, col, offset } = this;
      const startCol = col + cpOffset;
      const startOffset = offset + cpOffset;
      return {
        code,
        startLine: line,
        endLine: line,
        startCol,
        endCol: startCol,
        startOffset,
        endOffset: startOffset
      };
    }
    _err(code) {
      if (this.handler.onParseError && this.lastErrOffset !== this.offset) {
        this.lastErrOffset = this.offset;
        this.handler.onParseError(this.getError(code, 0));
      }
    }
    _addGap() {
      this.gapStack.push(this.lastGapPos);
      this.lastGapPos = this.pos;
    }
    _processSurrogate(cp) {
      if (this.pos !== this.html.length - 1) {
        const nextCp = this.html.charCodeAt(this.pos + 1);
        if (isSurrogatePair(nextCp)) {
          this.pos++;
          this._addGap();
          return getSurrogatePairCodePoint(cp, nextCp);
        }
      } else if (!this.lastChunkWritten) {
        this.endOfChunkHit = true;
        return CODE_POINTS.EOF;
      }
      this._err(ERR.surrogateInInputStream);
      return cp;
    }
    willDropParsedChunk() {
      return this.pos > this.bufferWaterline;
    }
    dropParsedChunk() {
      if (this.willDropParsedChunk()) {
        this.html = this.html.substring(this.pos);
        this.lineStartPos -= this.pos;
        this.droppedBufferSize += this.pos;
        this.pos = 0;
        this.lastGapPos = -2;
        this.gapStack.length = 0;
      }
    }
    write(chunk, isLastChunk) {
      if (this.html.length > 0) {
        this.html += chunk;
      } else {
        this.html = chunk;
      }
      this.endOfChunkHit = false;
      this.lastChunkWritten = isLastChunk;
    }
    insertHtmlAtCurrentPos(chunk) {
      this.html = this.html.substring(0, this.pos + 1) + chunk + this.html.substring(this.pos + 1);
      this.endOfChunkHit = false;
    }
    startsWith(pattern, caseSensitive) {
      if (this.pos + pattern.length > this.html.length) {
        this.endOfChunkHit = !this.lastChunkWritten;
        return false;
      }
      if (caseSensitive) {
        return this.html.startsWith(pattern, this.pos);
      }
      for (let i = 0; i < pattern.length; i++) {
        const cp = this.html.charCodeAt(this.pos + i) | 32;
        if (cp !== pattern.charCodeAt(i)) {
          return false;
        }
      }
      return true;
    }
    peek(offset) {
      const pos = this.pos + offset;
      if (pos >= this.html.length) {
        this.endOfChunkHit = !this.lastChunkWritten;
        return CODE_POINTS.EOF;
      }
      const code = this.html.charCodeAt(pos);
      return code === CODE_POINTS.CARRIAGE_RETURN ? CODE_POINTS.LINE_FEED : code;
    }
    advance() {
      this.pos++;
      if (this.isEol) {
        this.isEol = false;
        this.line++;
        this.lineStartPos = this.pos;
      }
      if (this.pos >= this.html.length) {
        this.endOfChunkHit = !this.lastChunkWritten;
        return CODE_POINTS.EOF;
      }
      let cp = this.html.charCodeAt(this.pos);
      if (cp === CODE_POINTS.CARRIAGE_RETURN) {
        this.isEol = true;
        this.skipNextNewLine = true;
        return CODE_POINTS.LINE_FEED;
      }
      if (cp === CODE_POINTS.LINE_FEED) {
        this.isEol = true;
        if (this.skipNextNewLine) {
          this.line--;
          this.skipNextNewLine = false;
          this._addGap();
          return this.advance();
        }
      }
      this.skipNextNewLine = false;
      if (isSurrogate(cp)) {
        cp = this._processSurrogate(cp);
      }
      const isCommonValidRange = this.handler.onParseError === null || cp > 31 && cp < 127 || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.CARRIAGE_RETURN || cp > 159 && cp < 64976;
      if (!isCommonValidRange) {
        this._checkForProblematicCharacters(cp);
      }
      return cp;
    }
    _checkForProblematicCharacters(cp) {
      if (isControlCodePoint(cp)) {
        this._err(ERR.controlCharacterInInputStream);
      } else if (isUndefinedCodePoint(cp)) {
        this._err(ERR.noncharacterInInputStream);
      }
    }
    retreat(count) {
      this.pos -= count;
      while (this.pos < this.lastGapPos) {
        this.lastGapPos = this.gapStack.pop();
        this.pos--;
      }
      this.isEol = false;
    }
  }
  var TokenType;
  (function(TokenType2) {
    TokenType2[TokenType2["CHARACTER"] = 0] = "CHARACTER";
    TokenType2[TokenType2["NULL_CHARACTER"] = 1] = "NULL_CHARACTER";
    TokenType2[TokenType2["WHITESPACE_CHARACTER"] = 2] = "WHITESPACE_CHARACTER";
    TokenType2[TokenType2["START_TAG"] = 3] = "START_TAG";
    TokenType2[TokenType2["END_TAG"] = 4] = "END_TAG";
    TokenType2[TokenType2["COMMENT"] = 5] = "COMMENT";
    TokenType2[TokenType2["DOCTYPE"] = 6] = "DOCTYPE";
    TokenType2[TokenType2["EOF"] = 7] = "EOF";
    TokenType2[TokenType2["HIBERNATION"] = 8] = "HIBERNATION";
  })(TokenType || (TokenType = {}));
  function getTokenAttr(token, attrName) {
    for (let i = token.attrs.length - 1; i >= 0; i--) {
      if (token.attrs[i].name === attrName) {
        return token.attrs[i].value;
      }
    }
    return null;
  }
  var NS;
  (function(NS2) {
    NS2["HTML"] = "http://www.w3.org/1999/xhtml";
    NS2["MATHML"] = "http://www.w3.org/1998/Math/MathML";
    NS2["SVG"] = "http://www.w3.org/2000/svg";
    NS2["XLINK"] = "http://www.w3.org/1999/xlink";
    NS2["XML"] = "http://www.w3.org/XML/1998/namespace";
    NS2["XMLNS"] = "http://www.w3.org/2000/xmlns/";
  })(NS || (NS = {}));
  var ATTRS;
  (function(ATTRS2) {
    ATTRS2["TYPE"] = "type";
    ATTRS2["ACTION"] = "action";
    ATTRS2["ENCODING"] = "encoding";
    ATTRS2["PROMPT"] = "prompt";
    ATTRS2["NAME"] = "name";
    ATTRS2["COLOR"] = "color";
    ATTRS2["FACE"] = "face";
    ATTRS2["SIZE"] = "size";
  })(ATTRS || (ATTRS = {}));
  var DOCUMENT_MODE;
  (function(DOCUMENT_MODE2) {
    DOCUMENT_MODE2["NO_QUIRKS"] = "no-quirks";
    DOCUMENT_MODE2["QUIRKS"] = "quirks";
    DOCUMENT_MODE2["LIMITED_QUIRKS"] = "limited-quirks";
  })(DOCUMENT_MODE || (DOCUMENT_MODE = {}));
  var TAG_NAMES;
  (function(TAG_NAMES2) {
    TAG_NAMES2["A"] = "a";
    TAG_NAMES2["ADDRESS"] = "address";
    TAG_NAMES2["ANNOTATION_XML"] = "annotation-xml";
    TAG_NAMES2["APPLET"] = "applet";
    TAG_NAMES2["AREA"] = "area";
    TAG_NAMES2["ARTICLE"] = "article";
    TAG_NAMES2["ASIDE"] = "aside";
    TAG_NAMES2["B"] = "b";
    TAG_NAMES2["BASE"] = "base";
    TAG_NAMES2["BASEFONT"] = "basefont";
    TAG_NAMES2["BGSOUND"] = "bgsound";
    TAG_NAMES2["BIG"] = "big";
    TAG_NAMES2["BLOCKQUOTE"] = "blockquote";
    TAG_NAMES2["BODY"] = "body";
    TAG_NAMES2["BR"] = "br";
    TAG_NAMES2["BUTTON"] = "button";
    TAG_NAMES2["CAPTION"] = "caption";
    TAG_NAMES2["CENTER"] = "center";
    TAG_NAMES2["CODE"] = "code";
    TAG_NAMES2["COL"] = "col";
    TAG_NAMES2["COLGROUP"] = "colgroup";
    TAG_NAMES2["DD"] = "dd";
    TAG_NAMES2["DESC"] = "desc";
    TAG_NAMES2["DETAILS"] = "details";
    TAG_NAMES2["DIALOG"] = "dialog";
    TAG_NAMES2["DIR"] = "dir";
    TAG_NAMES2["DIV"] = "div";
    TAG_NAMES2["DL"] = "dl";
    TAG_NAMES2["DT"] = "dt";
    TAG_NAMES2["EM"] = "em";
    TAG_NAMES2["EMBED"] = "embed";
    TAG_NAMES2["FIELDSET"] = "fieldset";
    TAG_NAMES2["FIGCAPTION"] = "figcaption";
    TAG_NAMES2["FIGURE"] = "figure";
    TAG_NAMES2["FONT"] = "font";
    TAG_NAMES2["FOOTER"] = "footer";
    TAG_NAMES2["FOREIGN_OBJECT"] = "foreignObject";
    TAG_NAMES2["FORM"] = "form";
    TAG_NAMES2["FRAME"] = "frame";
    TAG_NAMES2["FRAMESET"] = "frameset";
    TAG_NAMES2["H1"] = "h1";
    TAG_NAMES2["H2"] = "h2";
    TAG_NAMES2["H3"] = "h3";
    TAG_NAMES2["H4"] = "h4";
    TAG_NAMES2["H5"] = "h5";
    TAG_NAMES2["H6"] = "h6";
    TAG_NAMES2["HEAD"] = "head";
    TAG_NAMES2["HEADER"] = "header";
    TAG_NAMES2["HGROUP"] = "hgroup";
    TAG_NAMES2["HR"] = "hr";
    TAG_NAMES2["HTML"] = "html";
    TAG_NAMES2["I"] = "i";
    TAG_NAMES2["IMG"] = "img";
    TAG_NAMES2["IMAGE"] = "image";
    TAG_NAMES2["INPUT"] = "input";
    TAG_NAMES2["IFRAME"] = "iframe";
    TAG_NAMES2["KEYGEN"] = "keygen";
    TAG_NAMES2["LABEL"] = "label";
    TAG_NAMES2["LI"] = "li";
    TAG_NAMES2["LINK"] = "link";
    TAG_NAMES2["LISTING"] = "listing";
    TAG_NAMES2["MAIN"] = "main";
    TAG_NAMES2["MALIGNMARK"] = "malignmark";
    TAG_NAMES2["MARQUEE"] = "marquee";
    TAG_NAMES2["MATH"] = "math";
    TAG_NAMES2["MENU"] = "menu";
    TAG_NAMES2["META"] = "meta";
    TAG_NAMES2["MGLYPH"] = "mglyph";
    TAG_NAMES2["MI"] = "mi";
    TAG_NAMES2["MO"] = "mo";
    TAG_NAMES2["MN"] = "mn";
    TAG_NAMES2["MS"] = "ms";
    TAG_NAMES2["MTEXT"] = "mtext";
    TAG_NAMES2["NAV"] = "nav";
    TAG_NAMES2["NOBR"] = "nobr";
    TAG_NAMES2["NOFRAMES"] = "noframes";
    TAG_NAMES2["NOEMBED"] = "noembed";
    TAG_NAMES2["NOSCRIPT"] = "noscript";
    TAG_NAMES2["OBJECT"] = "object";
    TAG_NAMES2["OL"] = "ol";
    TAG_NAMES2["OPTGROUP"] = "optgroup";
    TAG_NAMES2["OPTION"] = "option";
    TAG_NAMES2["P"] = "p";
    TAG_NAMES2["PARAM"] = "param";
    TAG_NAMES2["PLAINTEXT"] = "plaintext";
    TAG_NAMES2["PRE"] = "pre";
    TAG_NAMES2["RB"] = "rb";
    TAG_NAMES2["RP"] = "rp";
    TAG_NAMES2["RT"] = "rt";
    TAG_NAMES2["RTC"] = "rtc";
    TAG_NAMES2["RUBY"] = "ruby";
    TAG_NAMES2["S"] = "s";
    TAG_NAMES2["SCRIPT"] = "script";
    TAG_NAMES2["SEARCH"] = "search";
    TAG_NAMES2["SECTION"] = "section";
    TAG_NAMES2["SELECT"] = "select";
    TAG_NAMES2["SOURCE"] = "source";
    TAG_NAMES2["SMALL"] = "small";
    TAG_NAMES2["SPAN"] = "span";
    TAG_NAMES2["STRIKE"] = "strike";
    TAG_NAMES2["STRONG"] = "strong";
    TAG_NAMES2["STYLE"] = "style";
    TAG_NAMES2["SUB"] = "sub";
    TAG_NAMES2["SUMMARY"] = "summary";
    TAG_NAMES2["SUP"] = "sup";
    TAG_NAMES2["TABLE"] = "table";
    TAG_NAMES2["TBODY"] = "tbody";
    TAG_NAMES2["TEMPLATE"] = "template";
    TAG_NAMES2["TEXTAREA"] = "textarea";
    TAG_NAMES2["TFOOT"] = "tfoot";
    TAG_NAMES2["TD"] = "td";
    TAG_NAMES2["TH"] = "th";
    TAG_NAMES2["THEAD"] = "thead";
    TAG_NAMES2["TITLE"] = "title";
    TAG_NAMES2["TR"] = "tr";
    TAG_NAMES2["TRACK"] = "track";
    TAG_NAMES2["TT"] = "tt";
    TAG_NAMES2["U"] = "u";
    TAG_NAMES2["UL"] = "ul";
    TAG_NAMES2["SVG"] = "svg";
    TAG_NAMES2["VAR"] = "var";
    TAG_NAMES2["WBR"] = "wbr";
    TAG_NAMES2["XMP"] = "xmp";
  })(TAG_NAMES || (TAG_NAMES = {}));
  var TAG_ID;
  (function(TAG_ID2) {
    TAG_ID2[TAG_ID2["UNKNOWN"] = 0] = "UNKNOWN";
    TAG_ID2[TAG_ID2["A"] = 1] = "A";
    TAG_ID2[TAG_ID2["ADDRESS"] = 2] = "ADDRESS";
    TAG_ID2[TAG_ID2["ANNOTATION_XML"] = 3] = "ANNOTATION_XML";
    TAG_ID2[TAG_ID2["APPLET"] = 4] = "APPLET";
    TAG_ID2[TAG_ID2["AREA"] = 5] = "AREA";
    TAG_ID2[TAG_ID2["ARTICLE"] = 6] = "ARTICLE";
    TAG_ID2[TAG_ID2["ASIDE"] = 7] = "ASIDE";
    TAG_ID2[TAG_ID2["B"] = 8] = "B";
    TAG_ID2[TAG_ID2["BASE"] = 9] = "BASE";
    TAG_ID2[TAG_ID2["BASEFONT"] = 10] = "BASEFONT";
    TAG_ID2[TAG_ID2["BGSOUND"] = 11] = "BGSOUND";
    TAG_ID2[TAG_ID2["BIG"] = 12] = "BIG";
    TAG_ID2[TAG_ID2["BLOCKQUOTE"] = 13] = "BLOCKQUOTE";
    TAG_ID2[TAG_ID2["BODY"] = 14] = "BODY";
    TAG_ID2[TAG_ID2["BR"] = 15] = "BR";
    TAG_ID2[TAG_ID2["BUTTON"] = 16] = "BUTTON";
    TAG_ID2[TAG_ID2["CAPTION"] = 17] = "CAPTION";
    TAG_ID2[TAG_ID2["CENTER"] = 18] = "CENTER";
    TAG_ID2[TAG_ID2["CODE"] = 19] = "CODE";
    TAG_ID2[TAG_ID2["COL"] = 20] = "COL";
    TAG_ID2[TAG_ID2["COLGROUP"] = 21] = "COLGROUP";
    TAG_ID2[TAG_ID2["DD"] = 22] = "DD";
    TAG_ID2[TAG_ID2["DESC"] = 23] = "DESC";
    TAG_ID2[TAG_ID2["DETAILS"] = 24] = "DETAILS";
    TAG_ID2[TAG_ID2["DIALOG"] = 25] = "DIALOG";
    TAG_ID2[TAG_ID2["DIR"] = 26] = "DIR";
    TAG_ID2[TAG_ID2["DIV"] = 27] = "DIV";
    TAG_ID2[TAG_ID2["DL"] = 28] = "DL";
    TAG_ID2[TAG_ID2["DT"] = 29] = "DT";
    TAG_ID2[TAG_ID2["EM"] = 30] = "EM";
    TAG_ID2[TAG_ID2["EMBED"] = 31] = "EMBED";
    TAG_ID2[TAG_ID2["FIELDSET"] = 32] = "FIELDSET";
    TAG_ID2[TAG_ID2["FIGCAPTION"] = 33] = "FIGCAPTION";
    TAG_ID2[TAG_ID2["FIGURE"] = 34] = "FIGURE";
    TAG_ID2[TAG_ID2["FONT"] = 35] = "FONT";
    TAG_ID2[TAG_ID2["FOOTER"] = 36] = "FOOTER";
    TAG_ID2[TAG_ID2["FOREIGN_OBJECT"] = 37] = "FOREIGN_OBJECT";
    TAG_ID2[TAG_ID2["FORM"] = 38] = "FORM";
    TAG_ID2[TAG_ID2["FRAME"] = 39] = "FRAME";
    TAG_ID2[TAG_ID2["FRAMESET"] = 40] = "FRAMESET";
    TAG_ID2[TAG_ID2["H1"] = 41] = "H1";
    TAG_ID2[TAG_ID2["H2"] = 42] = "H2";
    TAG_ID2[TAG_ID2["H3"] = 43] = "H3";
    TAG_ID2[TAG_ID2["H4"] = 44] = "H4";
    TAG_ID2[TAG_ID2["H5"] = 45] = "H5";
    TAG_ID2[TAG_ID2["H6"] = 46] = "H6";
    TAG_ID2[TAG_ID2["HEAD"] = 47] = "HEAD";
    TAG_ID2[TAG_ID2["HEADER"] = 48] = "HEADER";
    TAG_ID2[TAG_ID2["HGROUP"] = 49] = "HGROUP";
    TAG_ID2[TAG_ID2["HR"] = 50] = "HR";
    TAG_ID2[TAG_ID2["HTML"] = 51] = "HTML";
    TAG_ID2[TAG_ID2["I"] = 52] = "I";
    TAG_ID2[TAG_ID2["IMG"] = 53] = "IMG";
    TAG_ID2[TAG_ID2["IMAGE"] = 54] = "IMAGE";
    TAG_ID2[TAG_ID2["INPUT"] = 55] = "INPUT";
    TAG_ID2[TAG_ID2["IFRAME"] = 56] = "IFRAME";
    TAG_ID2[TAG_ID2["KEYGEN"] = 57] = "KEYGEN";
    TAG_ID2[TAG_ID2["LABEL"] = 58] = "LABEL";
    TAG_ID2[TAG_ID2["LI"] = 59] = "LI";
    TAG_ID2[TAG_ID2["LINK"] = 60] = "LINK";
    TAG_ID2[TAG_ID2["LISTING"] = 61] = "LISTING";
    TAG_ID2[TAG_ID2["MAIN"] = 62] = "MAIN";
    TAG_ID2[TAG_ID2["MALIGNMARK"] = 63] = "MALIGNMARK";
    TAG_ID2[TAG_ID2["MARQUEE"] = 64] = "MARQUEE";
    TAG_ID2[TAG_ID2["MATH"] = 65] = "MATH";
    TAG_ID2[TAG_ID2["MENU"] = 66] = "MENU";
    TAG_ID2[TAG_ID2["META"] = 67] = "META";
    TAG_ID2[TAG_ID2["MGLYPH"] = 68] = "MGLYPH";
    TAG_ID2[TAG_ID2["MI"] = 69] = "MI";
    TAG_ID2[TAG_ID2["MO"] = 70] = "MO";
    TAG_ID2[TAG_ID2["MN"] = 71] = "MN";
    TAG_ID2[TAG_ID2["MS"] = 72] = "MS";
    TAG_ID2[TAG_ID2["MTEXT"] = 73] = "MTEXT";
    TAG_ID2[TAG_ID2["NAV"] = 74] = "NAV";
    TAG_ID2[TAG_ID2["NOBR"] = 75] = "NOBR";
    TAG_ID2[TAG_ID2["NOFRAMES"] = 76] = "NOFRAMES";
    TAG_ID2[TAG_ID2["NOEMBED"] = 77] = "NOEMBED";
    TAG_ID2[TAG_ID2["NOSCRIPT"] = 78] = "NOSCRIPT";
    TAG_ID2[TAG_ID2["OBJECT"] = 79] = "OBJECT";
    TAG_ID2[TAG_ID2["OL"] = 80] = "OL";
    TAG_ID2[TAG_ID2["OPTGROUP"] = 81] = "OPTGROUP";
    TAG_ID2[TAG_ID2["OPTION"] = 82] = "OPTION";
    TAG_ID2[TAG_ID2["P"] = 83] = "P";
    TAG_ID2[TAG_ID2["PARAM"] = 84] = "PARAM";
    TAG_ID2[TAG_ID2["PLAINTEXT"] = 85] = "PLAINTEXT";
    TAG_ID2[TAG_ID2["PRE"] = 86] = "PRE";
    TAG_ID2[TAG_ID2["RB"] = 87] = "RB";
    TAG_ID2[TAG_ID2["RP"] = 88] = "RP";
    TAG_ID2[TAG_ID2["RT"] = 89] = "RT";
    TAG_ID2[TAG_ID2["RTC"] = 90] = "RTC";
    TAG_ID2[TAG_ID2["RUBY"] = 91] = "RUBY";
    TAG_ID2[TAG_ID2["S"] = 92] = "S";
    TAG_ID2[TAG_ID2["SCRIPT"] = 93] = "SCRIPT";
    TAG_ID2[TAG_ID2["SEARCH"] = 94] = "SEARCH";
    TAG_ID2[TAG_ID2["SECTION"] = 95] = "SECTION";
    TAG_ID2[TAG_ID2["SELECT"] = 96] = "SELECT";
    TAG_ID2[TAG_ID2["SOURCE"] = 97] = "SOURCE";
    TAG_ID2[TAG_ID2["SMALL"] = 98] = "SMALL";
    TAG_ID2[TAG_ID2["SPAN"] = 99] = "SPAN";
    TAG_ID2[TAG_ID2["STRIKE"] = 100] = "STRIKE";
    TAG_ID2[TAG_ID2["STRONG"] = 101] = "STRONG";
    TAG_ID2[TAG_ID2["STYLE"] = 102] = "STYLE";
    TAG_ID2[TAG_ID2["SUB"] = 103] = "SUB";
    TAG_ID2[TAG_ID2["SUMMARY"] = 104] = "SUMMARY";
    TAG_ID2[TAG_ID2["SUP"] = 105] = "SUP";
    TAG_ID2[TAG_ID2["TABLE"] = 106] = "TABLE";
    TAG_ID2[TAG_ID2["TBODY"] = 107] = "TBODY";
    TAG_ID2[TAG_ID2["TEMPLATE"] = 108] = "TEMPLATE";
    TAG_ID2[TAG_ID2["TEXTAREA"] = 109] = "TEXTAREA";
    TAG_ID2[TAG_ID2["TFOOT"] = 110] = "TFOOT";
    TAG_ID2[TAG_ID2["TD"] = 111] = "TD";
    TAG_ID2[TAG_ID2["TH"] = 112] = "TH";
    TAG_ID2[TAG_ID2["THEAD"] = 113] = "THEAD";
    TAG_ID2[TAG_ID2["TITLE"] = 114] = "TITLE";
    TAG_ID2[TAG_ID2["TR"] = 115] = "TR";
    TAG_ID2[TAG_ID2["TRACK"] = 116] = "TRACK";
    TAG_ID2[TAG_ID2["TT"] = 117] = "TT";
    TAG_ID2[TAG_ID2["U"] = 118] = "U";
    TAG_ID2[TAG_ID2["UL"] = 119] = "UL";
    TAG_ID2[TAG_ID2["SVG"] = 120] = "SVG";
    TAG_ID2[TAG_ID2["VAR"] = 121] = "VAR";
    TAG_ID2[TAG_ID2["WBR"] = 122] = "WBR";
    TAG_ID2[TAG_ID2["XMP"] = 123] = "XMP";
  })(TAG_ID || (TAG_ID = {}));
  const TAG_NAME_TO_ID = new Map([
    [TAG_NAMES.A, TAG_ID.A],
    [TAG_NAMES.ADDRESS, TAG_ID.ADDRESS],
    [TAG_NAMES.ANNOTATION_XML, TAG_ID.ANNOTATION_XML],
    [TAG_NAMES.APPLET, TAG_ID.APPLET],
    [TAG_NAMES.AREA, TAG_ID.AREA],
    [TAG_NAMES.ARTICLE, TAG_ID.ARTICLE],
    [TAG_NAMES.ASIDE, TAG_ID.ASIDE],
    [TAG_NAMES.B, TAG_ID.B],
    [TAG_NAMES.BASE, TAG_ID.BASE],
    [TAG_NAMES.BASEFONT, TAG_ID.BASEFONT],
    [TAG_NAMES.BGSOUND, TAG_ID.BGSOUND],
    [TAG_NAMES.BIG, TAG_ID.BIG],
    [TAG_NAMES.BLOCKQUOTE, TAG_ID.BLOCKQUOTE],
    [TAG_NAMES.BODY, TAG_ID.BODY],
    [TAG_NAMES.BR, TAG_ID.BR],
    [TAG_NAMES.BUTTON, TAG_ID.BUTTON],
    [TAG_NAMES.CAPTION, TAG_ID.CAPTION],
    [TAG_NAMES.CENTER, TAG_ID.CENTER],
    [TAG_NAMES.CODE, TAG_ID.CODE],
    [TAG_NAMES.COL, TAG_ID.COL],
    [TAG_NAMES.COLGROUP, TAG_ID.COLGROUP],
    [TAG_NAMES.DD, TAG_ID.DD],
    [TAG_NAMES.DESC, TAG_ID.DESC],
    [TAG_NAMES.DETAILS, TAG_ID.DETAILS],
    [TAG_NAMES.DIALOG, TAG_ID.DIALOG],
    [TAG_NAMES.DIR, TAG_ID.DIR],
    [TAG_NAMES.DIV, TAG_ID.DIV],
    [TAG_NAMES.DL, TAG_ID.DL],
    [TAG_NAMES.DT, TAG_ID.DT],
    [TAG_NAMES.EM, TAG_ID.EM],
    [TAG_NAMES.EMBED, TAG_ID.EMBED],
    [TAG_NAMES.FIELDSET, TAG_ID.FIELDSET],
    [TAG_NAMES.FIGCAPTION, TAG_ID.FIGCAPTION],
    [TAG_NAMES.FIGURE, TAG_ID.FIGURE],
    [TAG_NAMES.FONT, TAG_ID.FONT],
    [TAG_NAMES.FOOTER, TAG_ID.FOOTER],
    [TAG_NAMES.FOREIGN_OBJECT, TAG_ID.FOREIGN_OBJECT],
    [TAG_NAMES.FORM, TAG_ID.FORM],
    [TAG_NAMES.FRAME, TAG_ID.FRAME],
    [TAG_NAMES.FRAMESET, TAG_ID.FRAMESET],
    [TAG_NAMES.H1, TAG_ID.H1],
    [TAG_NAMES.H2, TAG_ID.H2],
    [TAG_NAMES.H3, TAG_ID.H3],
    [TAG_NAMES.H4, TAG_ID.H4],
    [TAG_NAMES.H5, TAG_ID.H5],
    [TAG_NAMES.H6, TAG_ID.H6],
    [TAG_NAMES.HEAD, TAG_ID.HEAD],
    [TAG_NAMES.HEADER, TAG_ID.HEADER],
    [TAG_NAMES.HGROUP, TAG_ID.HGROUP],
    [TAG_NAMES.HR, TAG_ID.HR],
    [TAG_NAMES.HTML, TAG_ID.HTML],
    [TAG_NAMES.I, TAG_ID.I],
    [TAG_NAMES.IMG, TAG_ID.IMG],
    [TAG_NAMES.IMAGE, TAG_ID.IMAGE],
    [TAG_NAMES.INPUT, TAG_ID.INPUT],
    [TAG_NAMES.IFRAME, TAG_ID.IFRAME],
    [TAG_NAMES.KEYGEN, TAG_ID.KEYGEN],
    [TAG_NAMES.LABEL, TAG_ID.LABEL],
    [TAG_NAMES.LI, TAG_ID.LI],
    [TAG_NAMES.LINK, TAG_ID.LINK],
    [TAG_NAMES.LISTING, TAG_ID.LISTING],
    [TAG_NAMES.MAIN, TAG_ID.MAIN],
    [TAG_NAMES.MALIGNMARK, TAG_ID.MALIGNMARK],
    [TAG_NAMES.MARQUEE, TAG_ID.MARQUEE],
    [TAG_NAMES.MATH, TAG_ID.MATH],
    [TAG_NAMES.MENU, TAG_ID.MENU],
    [TAG_NAMES.META, TAG_ID.META],
    [TAG_NAMES.MGLYPH, TAG_ID.MGLYPH],
    [TAG_NAMES.MI, TAG_ID.MI],
    [TAG_NAMES.MO, TAG_ID.MO],
    [TAG_NAMES.MN, TAG_ID.MN],
    [TAG_NAMES.MS, TAG_ID.MS],
    [TAG_NAMES.MTEXT, TAG_ID.MTEXT],
    [TAG_NAMES.NAV, TAG_ID.NAV],
    [TAG_NAMES.NOBR, TAG_ID.NOBR],
    [TAG_NAMES.NOFRAMES, TAG_ID.NOFRAMES],
    [TAG_NAMES.NOEMBED, TAG_ID.NOEMBED],
    [TAG_NAMES.NOSCRIPT, TAG_ID.NOSCRIPT],
    [TAG_NAMES.OBJECT, TAG_ID.OBJECT],
    [TAG_NAMES.OL, TAG_ID.OL],
    [TAG_NAMES.OPTGROUP, TAG_ID.OPTGROUP],
    [TAG_NAMES.OPTION, TAG_ID.OPTION],
    [TAG_NAMES.P, TAG_ID.P],
    [TAG_NAMES.PARAM, TAG_ID.PARAM],
    [TAG_NAMES.PLAINTEXT, TAG_ID.PLAINTEXT],
    [TAG_NAMES.PRE, TAG_ID.PRE],
    [TAG_NAMES.RB, TAG_ID.RB],
    [TAG_NAMES.RP, TAG_ID.RP],
    [TAG_NAMES.RT, TAG_ID.RT],
    [TAG_NAMES.RTC, TAG_ID.RTC],
    [TAG_NAMES.RUBY, TAG_ID.RUBY],
    [TAG_NAMES.S, TAG_ID.S],
    [TAG_NAMES.SCRIPT, TAG_ID.SCRIPT],
    [TAG_NAMES.SEARCH, TAG_ID.SEARCH],
    [TAG_NAMES.SECTION, TAG_ID.SECTION],
    [TAG_NAMES.SELECT, TAG_ID.SELECT],
    [TAG_NAMES.SOURCE, TAG_ID.SOURCE],
    [TAG_NAMES.SMALL, TAG_ID.SMALL],
    [TAG_NAMES.SPAN, TAG_ID.SPAN],
    [TAG_NAMES.STRIKE, TAG_ID.STRIKE],
    [TAG_NAMES.STRONG, TAG_ID.STRONG],
    [TAG_NAMES.STYLE, TAG_ID.STYLE],
    [TAG_NAMES.SUB, TAG_ID.SUB],
    [TAG_NAMES.SUMMARY, TAG_ID.SUMMARY],
    [TAG_NAMES.SUP, TAG_ID.SUP],
    [TAG_NAMES.TABLE, TAG_ID.TABLE],
    [TAG_NAMES.TBODY, TAG_ID.TBODY],
    [TAG_NAMES.TEMPLATE, TAG_ID.TEMPLATE],
    [TAG_NAMES.TEXTAREA, TAG_ID.TEXTAREA],
    [TAG_NAMES.TFOOT, TAG_ID.TFOOT],
    [TAG_NAMES.TD, TAG_ID.TD],
    [TAG_NAMES.TH, TAG_ID.TH],
    [TAG_NAMES.THEAD, TAG_ID.THEAD],
    [TAG_NAMES.TITLE, TAG_ID.TITLE],
    [TAG_NAMES.TR, TAG_ID.TR],
    [TAG_NAMES.TRACK, TAG_ID.TRACK],
    [TAG_NAMES.TT, TAG_ID.TT],
    [TAG_NAMES.U, TAG_ID.U],
    [TAG_NAMES.UL, TAG_ID.UL],
    [TAG_NAMES.SVG, TAG_ID.SVG],
    [TAG_NAMES.VAR, TAG_ID.VAR],
    [TAG_NAMES.WBR, TAG_ID.WBR],
    [TAG_NAMES.XMP, TAG_ID.XMP]
  ]);
  function getTagID(tagName) {
    var _a2;
    return (_a2 = TAG_NAME_TO_ID.get(tagName)) !== null && _a2 !== void 0 ? _a2 : TAG_ID.UNKNOWN;
  }
  const $ = TAG_ID;
  const SPECIAL_ELEMENTS = {
    [NS.HTML]: new Set([
      $.ADDRESS,
      $.APPLET,
      $.AREA,
      $.ARTICLE,
      $.ASIDE,
      $.BASE,
      $.BASEFONT,
      $.BGSOUND,
      $.BLOCKQUOTE,
      $.BODY,
      $.BR,
      $.BUTTON,
      $.CAPTION,
      $.CENTER,
      $.COL,
      $.COLGROUP,
      $.DD,
      $.DETAILS,
      $.DIR,
      $.DIV,
      $.DL,
      $.DT,
      $.EMBED,
      $.FIELDSET,
      $.FIGCAPTION,
      $.FIGURE,
      $.FOOTER,
      $.FORM,
      $.FRAME,
      $.FRAMESET,
      $.H1,
      $.H2,
      $.H3,
      $.H4,
      $.H5,
      $.H6,
      $.HEAD,
      $.HEADER,
      $.HGROUP,
      $.HR,
      $.HTML,
      $.IFRAME,
      $.IMG,
      $.INPUT,
      $.LI,
      $.LINK,
      $.LISTING,
      $.MAIN,
      $.MARQUEE,
      $.MENU,
      $.META,
      $.NAV,
      $.NOEMBED,
      $.NOFRAMES,
      $.NOSCRIPT,
      $.OBJECT,
      $.OL,
      $.P,
      $.PARAM,
      $.PLAINTEXT,
      $.PRE,
      $.SCRIPT,
      $.SECTION,
      $.SELECT,
      $.SOURCE,
      $.STYLE,
      $.SUMMARY,
      $.TABLE,
      $.TBODY,
      $.TD,
      $.TEMPLATE,
      $.TEXTAREA,
      $.TFOOT,
      $.TH,
      $.THEAD,
      $.TITLE,
      $.TR,
      $.TRACK,
      $.UL,
      $.WBR,
      $.XMP
    ]),
    [NS.MATHML]: new Set([$.MI, $.MO, $.MN, $.MS, $.MTEXT, $.ANNOTATION_XML]),
    [NS.SVG]: new Set([$.TITLE, $.FOREIGN_OBJECT, $.DESC]),
    [NS.XLINK]: new Set(),
    [NS.XML]: new Set(),
    [NS.XMLNS]: new Set()
  };
  const NUMBERED_HEADERS = new Set([$.H1, $.H2, $.H3, $.H4, $.H5, $.H6]);
  const UNESCAPED_TEXT = new Set([
    TAG_NAMES.STYLE,
    TAG_NAMES.SCRIPT,
    TAG_NAMES.XMP,
    TAG_NAMES.IFRAME,
    TAG_NAMES.NOEMBED,
    TAG_NAMES.NOFRAMES,
    TAG_NAMES.PLAINTEXT
  ]);
  function hasUnescapedText(tn, scriptingEnabled) {
    return UNESCAPED_TEXT.has(tn) || scriptingEnabled && tn === TAG_NAMES.NOSCRIPT;
  }
  var State;
  (function(State2) {
    State2[State2["DATA"] = 0] = "DATA";
    State2[State2["RCDATA"] = 1] = "RCDATA";
    State2[State2["RAWTEXT"] = 2] = "RAWTEXT";
    State2[State2["SCRIPT_DATA"] = 3] = "SCRIPT_DATA";
    State2[State2["PLAINTEXT"] = 4] = "PLAINTEXT";
    State2[State2["TAG_OPEN"] = 5] = "TAG_OPEN";
    State2[State2["END_TAG_OPEN"] = 6] = "END_TAG_OPEN";
    State2[State2["TAG_NAME"] = 7] = "TAG_NAME";
    State2[State2["RCDATA_LESS_THAN_SIGN"] = 8] = "RCDATA_LESS_THAN_SIGN";
    State2[State2["RCDATA_END_TAG_OPEN"] = 9] = "RCDATA_END_TAG_OPEN";
    State2[State2["RCDATA_END_TAG_NAME"] = 10] = "RCDATA_END_TAG_NAME";
    State2[State2["RAWTEXT_LESS_THAN_SIGN"] = 11] = "RAWTEXT_LESS_THAN_SIGN";
    State2[State2["RAWTEXT_END_TAG_OPEN"] = 12] = "RAWTEXT_END_TAG_OPEN";
    State2[State2["RAWTEXT_END_TAG_NAME"] = 13] = "RAWTEXT_END_TAG_NAME";
    State2[State2["SCRIPT_DATA_LESS_THAN_SIGN"] = 14] = "SCRIPT_DATA_LESS_THAN_SIGN";
    State2[State2["SCRIPT_DATA_END_TAG_OPEN"] = 15] = "SCRIPT_DATA_END_TAG_OPEN";
    State2[State2["SCRIPT_DATA_END_TAG_NAME"] = 16] = "SCRIPT_DATA_END_TAG_NAME";
    State2[State2["SCRIPT_DATA_ESCAPE_START"] = 17] = "SCRIPT_DATA_ESCAPE_START";
    State2[State2["SCRIPT_DATA_ESCAPE_START_DASH"] = 18] = "SCRIPT_DATA_ESCAPE_START_DASH";
    State2[State2["SCRIPT_DATA_ESCAPED"] = 19] = "SCRIPT_DATA_ESCAPED";
    State2[State2["SCRIPT_DATA_ESCAPED_DASH"] = 20] = "SCRIPT_DATA_ESCAPED_DASH";
    State2[State2["SCRIPT_DATA_ESCAPED_DASH_DASH"] = 21] = "SCRIPT_DATA_ESCAPED_DASH_DASH";
    State2[State2["SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN"] = 22] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN";
    State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_OPEN"] = 23] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN";
    State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_NAME"] = 24] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_START"] = 25] = "SCRIPT_DATA_DOUBLE_ESCAPE_START";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED"] = 26] = "SCRIPT_DATA_DOUBLE_ESCAPED";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH"] = 27] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH"] = 28] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN"] = 29] = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN";
    State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_END"] = 30] = "SCRIPT_DATA_DOUBLE_ESCAPE_END";
    State2[State2["BEFORE_ATTRIBUTE_NAME"] = 31] = "BEFORE_ATTRIBUTE_NAME";
    State2[State2["ATTRIBUTE_NAME"] = 32] = "ATTRIBUTE_NAME";
    State2[State2["AFTER_ATTRIBUTE_NAME"] = 33] = "AFTER_ATTRIBUTE_NAME";
    State2[State2["BEFORE_ATTRIBUTE_VALUE"] = 34] = "BEFORE_ATTRIBUTE_VALUE";
    State2[State2["ATTRIBUTE_VALUE_DOUBLE_QUOTED"] = 35] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED";
    State2[State2["ATTRIBUTE_VALUE_SINGLE_QUOTED"] = 36] = "ATTRIBUTE_VALUE_SINGLE_QUOTED";
    State2[State2["ATTRIBUTE_VALUE_UNQUOTED"] = 37] = "ATTRIBUTE_VALUE_UNQUOTED";
    State2[State2["AFTER_ATTRIBUTE_VALUE_QUOTED"] = 38] = "AFTER_ATTRIBUTE_VALUE_QUOTED";
    State2[State2["SELF_CLOSING_START_TAG"] = 39] = "SELF_CLOSING_START_TAG";
    State2[State2["BOGUS_COMMENT"] = 40] = "BOGUS_COMMENT";
    State2[State2["MARKUP_DECLARATION_OPEN"] = 41] = "MARKUP_DECLARATION_OPEN";
    State2[State2["COMMENT_START"] = 42] = "COMMENT_START";
    State2[State2["COMMENT_START_DASH"] = 43] = "COMMENT_START_DASH";
    State2[State2["COMMENT"] = 44] = "COMMENT";
    State2[State2["COMMENT_LESS_THAN_SIGN"] = 45] = "COMMENT_LESS_THAN_SIGN";
    State2[State2["COMMENT_LESS_THAN_SIGN_BANG"] = 46] = "COMMENT_LESS_THAN_SIGN_BANG";
    State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH"] = 47] = "COMMENT_LESS_THAN_SIGN_BANG_DASH";
    State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH"] = 48] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH";
    State2[State2["COMMENT_END_DASH"] = 49] = "COMMENT_END_DASH";
    State2[State2["COMMENT_END"] = 50] = "COMMENT_END";
    State2[State2["COMMENT_END_BANG"] = 51] = "COMMENT_END_BANG";
    State2[State2["DOCTYPE"] = 52] = "DOCTYPE";
    State2[State2["BEFORE_DOCTYPE_NAME"] = 53] = "BEFORE_DOCTYPE_NAME";
    State2[State2["DOCTYPE_NAME"] = 54] = "DOCTYPE_NAME";
    State2[State2["AFTER_DOCTYPE_NAME"] = 55] = "AFTER_DOCTYPE_NAME";
    State2[State2["AFTER_DOCTYPE_PUBLIC_KEYWORD"] = 56] = "AFTER_DOCTYPE_PUBLIC_KEYWORD";
    State2[State2["BEFORE_DOCTYPE_PUBLIC_IDENTIFIER"] = 57] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER";
    State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED"] = 58] = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED";
    State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED"] = 59] = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED";
    State2[State2["AFTER_DOCTYPE_PUBLIC_IDENTIFIER"] = 60] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER";
    State2[State2["BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS"] = 61] = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS";
    State2[State2["AFTER_DOCTYPE_SYSTEM_KEYWORD"] = 62] = "AFTER_DOCTYPE_SYSTEM_KEYWORD";
    State2[State2["BEFORE_DOCTYPE_SYSTEM_IDENTIFIER"] = 63] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER";
    State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED"] = 64] = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED";
    State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED"] = 65] = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED";
    State2[State2["AFTER_DOCTYPE_SYSTEM_IDENTIFIER"] = 66] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER";
    State2[State2["BOGUS_DOCTYPE"] = 67] = "BOGUS_DOCTYPE";
    State2[State2["CDATA_SECTION"] = 68] = "CDATA_SECTION";
    State2[State2["CDATA_SECTION_BRACKET"] = 69] = "CDATA_SECTION_BRACKET";
    State2[State2["CDATA_SECTION_END"] = 70] = "CDATA_SECTION_END";
    State2[State2["CHARACTER_REFERENCE"] = 71] = "CHARACTER_REFERENCE";
    State2[State2["AMBIGUOUS_AMPERSAND"] = 72] = "AMBIGUOUS_AMPERSAND";
  })(State || (State = {}));
  const TokenizerMode = {
    DATA: State.DATA,
    RCDATA: State.RCDATA,
    RAWTEXT: State.RAWTEXT,
    SCRIPT_DATA: State.SCRIPT_DATA,
    PLAINTEXT: State.PLAINTEXT,
    CDATA_SECTION: State.CDATA_SECTION
  };
  function isAsciiDigit(cp) {
    return cp >= CODE_POINTS.DIGIT_0 && cp <= CODE_POINTS.DIGIT_9;
  }
  function isAsciiUpper(cp) {
    return cp >= CODE_POINTS.LATIN_CAPITAL_A && cp <= CODE_POINTS.LATIN_CAPITAL_Z;
  }
  function isAsciiLower(cp) {
    return cp >= CODE_POINTS.LATIN_SMALL_A && cp <= CODE_POINTS.LATIN_SMALL_Z;
  }
  function isAsciiLetter(cp) {
    return isAsciiLower(cp) || isAsciiUpper(cp);
  }
  function isAsciiAlphaNumeric(cp) {
    return isAsciiLetter(cp) || isAsciiDigit(cp);
  }
  function toAsciiLower(cp) {
    return cp + 32;
  }
  function isWhitespace(cp) {
    return cp === CODE_POINTS.SPACE || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.TABULATION || cp === CODE_POINTS.FORM_FEED;
  }
  function isScriptDataDoubleEscapeSequenceEnd(cp) {
    return isWhitespace(cp) || cp === CODE_POINTS.SOLIDUS || cp === CODE_POINTS.GREATER_THAN_SIGN;
  }
  function getErrorForNumericCharacterReference(code) {
    if (code === CODE_POINTS.NULL) {
      return ERR.nullCharacterReference;
    } else if (code > 1114111) {
      return ERR.characterReferenceOutsideUnicodeRange;
    } else if (isSurrogate(code)) {
      return ERR.surrogateCharacterReference;
    } else if (isUndefinedCodePoint(code)) {
      return ERR.noncharacterCharacterReference;
    } else if (isControlCodePoint(code) || code === CODE_POINTS.CARRIAGE_RETURN) {
      return ERR.controlCharacterReference;
    }
    return null;
  }
  class Tokenizer2 {
    constructor(options, handler) {
      this.options = options;
      this.handler = handler;
      this.paused = false;
      this.inLoop = false;
      this.inForeignNode = false;
      this.lastStartTagName = "";
      this.active = false;
      this.state = State.DATA;
      this.returnState = State.DATA;
      this.entityStartPos = 0;
      this.consumedAfterSnapshot = -1;
      this.currentCharacterToken = null;
      this.currentToken = null;
      this.currentAttr = { name: "", value: "" };
      this.preprocessor = new Preprocessor(handler);
      this.currentLocation = this.getCurrentLocation(-1);
      this.entityDecoder = new EntityDecoder(htmlDecodeTree, (cp, consumed) => {
        this.preprocessor.pos = this.entityStartPos + consumed - 1;
        this._flushCodePointConsumedAsCharacterReference(cp);
      }, handler.onParseError ? {
        missingSemicolonAfterCharacterReference: () => {
          this._err(ERR.missingSemicolonAfterCharacterReference, 1);
        },
        absenceOfDigitsInNumericCharacterReference: (consumed) => {
          this._err(ERR.absenceOfDigitsInNumericCharacterReference, this.entityStartPos - this.preprocessor.pos + consumed);
        },
        validateNumericCharacterReference: (code) => {
          const error2 = getErrorForNumericCharacterReference(code);
          if (error2)
            this._err(error2, 1);
        }
      } : void 0);
    }
_err(code, cpOffset = 0) {
      var _a2, _b;
      (_b = (_a2 = this.handler).onParseError) === null || _b === void 0 ? void 0 : _b.call(_a2, this.preprocessor.getError(code, cpOffset));
    }
getCurrentLocation(offset) {
      if (!this.options.sourceCodeLocationInfo) {
        return null;
      }
      return {
        startLine: this.preprocessor.line,
        startCol: this.preprocessor.col - offset,
        startOffset: this.preprocessor.offset - offset,
        endLine: -1,
        endCol: -1,
        endOffset: -1
      };
    }
    _runParsingLoop() {
      if (this.inLoop)
        return;
      this.inLoop = true;
      while (this.active && !this.paused) {
        this.consumedAfterSnapshot = 0;
        const cp = this._consume();
        if (!this._ensureHibernation()) {
          this._callState(cp);
        }
      }
      this.inLoop = false;
    }
pause() {
      this.paused = true;
    }
    resume(writeCallback) {
      if (!this.paused) {
        throw new Error("Parser was already resumed");
      }
      this.paused = false;
      if (this.inLoop)
        return;
      this._runParsingLoop();
      if (!this.paused) {
        writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
      }
    }
    write(chunk, isLastChunk, writeCallback) {
      this.active = true;
      this.preprocessor.write(chunk, isLastChunk);
      this._runParsingLoop();
      if (!this.paused) {
        writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
      }
    }
    insertHtmlAtCurrentPos(chunk) {
      this.active = true;
      this.preprocessor.insertHtmlAtCurrentPos(chunk);
      this._runParsingLoop();
    }
_ensureHibernation() {
      if (this.preprocessor.endOfChunkHit) {
        this.preprocessor.retreat(this.consumedAfterSnapshot);
        this.consumedAfterSnapshot = 0;
        this.active = false;
        return true;
      }
      return false;
    }
_consume() {
      this.consumedAfterSnapshot++;
      return this.preprocessor.advance();
    }
    _advanceBy(count) {
      this.consumedAfterSnapshot += count;
      for (let i = 0; i < count; i++) {
        this.preprocessor.advance();
      }
    }
    _consumeSequenceIfMatch(pattern, caseSensitive) {
      if (this.preprocessor.startsWith(pattern, caseSensitive)) {
        this._advanceBy(pattern.length - 1);
        return true;
      }
      return false;
    }
_createStartTagToken() {
      this.currentToken = {
        type: TokenType.START_TAG,
        tagName: "",
        tagID: TAG_ID.UNKNOWN,
        selfClosing: false,
        ackSelfClosing: false,
        attrs: [],
        location: this.getCurrentLocation(1)
      };
    }
    _createEndTagToken() {
      this.currentToken = {
        type: TokenType.END_TAG,
        tagName: "",
        tagID: TAG_ID.UNKNOWN,
        selfClosing: false,
        ackSelfClosing: false,
        attrs: [],
        location: this.getCurrentLocation(2)
      };
    }
    _createCommentToken(offset) {
      this.currentToken = {
        type: TokenType.COMMENT,
        data: "",
        location: this.getCurrentLocation(offset)
      };
    }
    _createDoctypeToken(initialName) {
      this.currentToken = {
        type: TokenType.DOCTYPE,
        name: initialName,
        forceQuirks: false,
        publicId: null,
        systemId: null,
        location: this.currentLocation
      };
    }
    _createCharacterToken(type, chars) {
      this.currentCharacterToken = {
        type,
        chars,
        location: this.currentLocation
      };
    }
_createAttr(attrNameFirstCh) {
      this.currentAttr = {
        name: attrNameFirstCh,
        value: ""
      };
      this.currentLocation = this.getCurrentLocation(0);
    }
    _leaveAttrName() {
      var _a2;
      var _b;
      const token = this.currentToken;
      if (getTokenAttr(token, this.currentAttr.name) === null) {
        token.attrs.push(this.currentAttr);
        if (token.location && this.currentLocation) {
          const attrLocations = (_a2 = (_b = token.location).attrs) !== null && _a2 !== void 0 ? _a2 : _b.attrs = Object.create(null);
          attrLocations[this.currentAttr.name] = this.currentLocation;
          this._leaveAttrValue();
        }
      } else {
        this._err(ERR.duplicateAttribute);
      }
    }
    _leaveAttrValue() {
      if (this.currentLocation) {
        this.currentLocation.endLine = this.preprocessor.line;
        this.currentLocation.endCol = this.preprocessor.col;
        this.currentLocation.endOffset = this.preprocessor.offset;
      }
    }
prepareToken(ct) {
      this._emitCurrentCharacterToken(ct.location);
      this.currentToken = null;
      if (ct.location) {
        ct.location.endLine = this.preprocessor.line;
        ct.location.endCol = this.preprocessor.col + 1;
        ct.location.endOffset = this.preprocessor.offset + 1;
      }
      this.currentLocation = this.getCurrentLocation(-1);
    }
    emitCurrentTagToken() {
      const ct = this.currentToken;
      this.prepareToken(ct);
      ct.tagID = getTagID(ct.tagName);
      if (ct.type === TokenType.START_TAG) {
        this.lastStartTagName = ct.tagName;
        this.handler.onStartTag(ct);
      } else {
        if (ct.attrs.length > 0) {
          this._err(ERR.endTagWithAttributes);
        }
        if (ct.selfClosing) {
          this._err(ERR.endTagWithTrailingSolidus);
        }
        this.handler.onEndTag(ct);
      }
      this.preprocessor.dropParsedChunk();
    }
    emitCurrentComment(ct) {
      this.prepareToken(ct);
      this.handler.onComment(ct);
      this.preprocessor.dropParsedChunk();
    }
    emitCurrentDoctype(ct) {
      this.prepareToken(ct);
      this.handler.onDoctype(ct);
      this.preprocessor.dropParsedChunk();
    }
    _emitCurrentCharacterToken(nextLocation) {
      if (this.currentCharacterToken) {
        if (nextLocation && this.currentCharacterToken.location) {
          this.currentCharacterToken.location.endLine = nextLocation.startLine;
          this.currentCharacterToken.location.endCol = nextLocation.startCol;
          this.currentCharacterToken.location.endOffset = nextLocation.startOffset;
        }
        switch (this.currentCharacterToken.type) {
          case TokenType.CHARACTER: {
            this.handler.onCharacter(this.currentCharacterToken);
            break;
          }
          case TokenType.NULL_CHARACTER: {
            this.handler.onNullCharacter(this.currentCharacterToken);
            break;
          }
          case TokenType.WHITESPACE_CHARACTER: {
            this.handler.onWhitespaceCharacter(this.currentCharacterToken);
            break;
          }
        }
        this.currentCharacterToken = null;
      }
    }
    _emitEOFToken() {
      const location2 = this.getCurrentLocation(0);
      if (location2) {
        location2.endLine = location2.startLine;
        location2.endCol = location2.startCol;
        location2.endOffset = location2.startOffset;
      }
      this._emitCurrentCharacterToken(location2);
      this.handler.onEof({ type: TokenType.EOF, location: location2 });
      this.active = false;
    }








_appendCharToCurrentCharacterToken(type, ch) {
      if (this.currentCharacterToken) {
        if (this.currentCharacterToken.type === type) {
          this.currentCharacterToken.chars += ch;
          return;
        } else {
          this.currentLocation = this.getCurrentLocation(0);
          this._emitCurrentCharacterToken(this.currentLocation);
          this.preprocessor.dropParsedChunk();
        }
      }
      this._createCharacterToken(type, ch);
    }
    _emitCodePoint(cp) {
      const type = isWhitespace(cp) ? TokenType.WHITESPACE_CHARACTER : cp === CODE_POINTS.NULL ? TokenType.NULL_CHARACTER : TokenType.CHARACTER;
      this._appendCharToCurrentCharacterToken(type, String.fromCodePoint(cp));
    }

_emitChars(ch) {
      this._appendCharToCurrentCharacterToken(TokenType.CHARACTER, ch);
    }
_startCharacterReference() {
      this.returnState = this.state;
      this.state = State.CHARACTER_REFERENCE;
      this.entityStartPos = this.preprocessor.pos;
      this.entityDecoder.startEntity(this._isCharacterReferenceInAttribute() ? DecodingMode.Attribute : DecodingMode.Legacy);
    }
    _isCharacterReferenceInAttribute() {
      return this.returnState === State.ATTRIBUTE_VALUE_DOUBLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_SINGLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_UNQUOTED;
    }
    _flushCodePointConsumedAsCharacterReference(cp) {
      if (this._isCharacterReferenceInAttribute()) {
        this.currentAttr.value += String.fromCodePoint(cp);
      } else {
        this._emitCodePoint(cp);
      }
    }
_callState(cp) {
      switch (this.state) {
        case State.DATA: {
          this._stateData(cp);
          break;
        }
        case State.RCDATA: {
          this._stateRcdata(cp);
          break;
        }
        case State.RAWTEXT: {
          this._stateRawtext(cp);
          break;
        }
        case State.SCRIPT_DATA: {
          this._stateScriptData(cp);
          break;
        }
        case State.PLAINTEXT: {
          this._statePlaintext(cp);
          break;
        }
        case State.TAG_OPEN: {
          this._stateTagOpen(cp);
          break;
        }
        case State.END_TAG_OPEN: {
          this._stateEndTagOpen(cp);
          break;
        }
        case State.TAG_NAME: {
          this._stateTagName(cp);
          break;
        }
        case State.RCDATA_LESS_THAN_SIGN: {
          this._stateRcdataLessThanSign(cp);
          break;
        }
        case State.RCDATA_END_TAG_OPEN: {
          this._stateRcdataEndTagOpen(cp);
          break;
        }
        case State.RCDATA_END_TAG_NAME: {
          this._stateRcdataEndTagName(cp);
          break;
        }
        case State.RAWTEXT_LESS_THAN_SIGN: {
          this._stateRawtextLessThanSign(cp);
          break;
        }
        case State.RAWTEXT_END_TAG_OPEN: {
          this._stateRawtextEndTagOpen(cp);
          break;
        }
        case State.RAWTEXT_END_TAG_NAME: {
          this._stateRawtextEndTagName(cp);
          break;
        }
        case State.SCRIPT_DATA_LESS_THAN_SIGN: {
          this._stateScriptDataLessThanSign(cp);
          break;
        }
        case State.SCRIPT_DATA_END_TAG_OPEN: {
          this._stateScriptDataEndTagOpen(cp);
          break;
        }
        case State.SCRIPT_DATA_END_TAG_NAME: {
          this._stateScriptDataEndTagName(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPE_START: {
          this._stateScriptDataEscapeStart(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPE_START_DASH: {
          this._stateScriptDataEscapeStartDash(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED: {
          this._stateScriptDataEscaped(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED_DASH: {
          this._stateScriptDataEscapedDash(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED_DASH_DASH: {
          this._stateScriptDataEscapedDashDash(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN: {
          this._stateScriptDataEscapedLessThanSign(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN: {
          this._stateScriptDataEscapedEndTagOpen(cp);
          break;
        }
        case State.SCRIPT_DATA_ESCAPED_END_TAG_NAME: {
          this._stateScriptDataEscapedEndTagName(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPE_START: {
          this._stateScriptDataDoubleEscapeStart(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPED: {
          this._stateScriptDataDoubleEscaped(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH: {
          this._stateScriptDataDoubleEscapedDash(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH: {
          this._stateScriptDataDoubleEscapedDashDash(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN: {
          this._stateScriptDataDoubleEscapedLessThanSign(cp);
          break;
        }
        case State.SCRIPT_DATA_DOUBLE_ESCAPE_END: {
          this._stateScriptDataDoubleEscapeEnd(cp);
          break;
        }
        case State.BEFORE_ATTRIBUTE_NAME: {
          this._stateBeforeAttributeName(cp);
          break;
        }
        case State.ATTRIBUTE_NAME: {
          this._stateAttributeName(cp);
          break;
        }
        case State.AFTER_ATTRIBUTE_NAME: {
          this._stateAfterAttributeName(cp);
          break;
        }
        case State.BEFORE_ATTRIBUTE_VALUE: {
          this._stateBeforeAttributeValue(cp);
          break;
        }
        case State.ATTRIBUTE_VALUE_DOUBLE_QUOTED: {
          this._stateAttributeValueDoubleQuoted(cp);
          break;
        }
        case State.ATTRIBUTE_VALUE_SINGLE_QUOTED: {
          this._stateAttributeValueSingleQuoted(cp);
          break;
        }
        case State.ATTRIBUTE_VALUE_UNQUOTED: {
          this._stateAttributeValueUnquoted(cp);
          break;
        }
        case State.AFTER_ATTRIBUTE_VALUE_QUOTED: {
          this._stateAfterAttributeValueQuoted(cp);
          break;
        }
        case State.SELF_CLOSING_START_TAG: {
          this._stateSelfClosingStartTag(cp);
          break;
        }
        case State.BOGUS_COMMENT: {
          this._stateBogusComment(cp);
          break;
        }
        case State.MARKUP_DECLARATION_OPEN: {
          this._stateMarkupDeclarationOpen(cp);
          break;
        }
        case State.COMMENT_START: {
          this._stateCommentStart(cp);
          break;
        }
        case State.COMMENT_START_DASH: {
          this._stateCommentStartDash(cp);
          break;
        }
        case State.COMMENT: {
          this._stateComment(cp);
          break;
        }
        case State.COMMENT_LESS_THAN_SIGN: {
          this._stateCommentLessThanSign(cp);
          break;
        }
        case State.COMMENT_LESS_THAN_SIGN_BANG: {
          this._stateCommentLessThanSignBang(cp);
          break;
        }
        case State.COMMENT_LESS_THAN_SIGN_BANG_DASH: {
          this._stateCommentLessThanSignBangDash(cp);
          break;
        }
        case State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH: {
          this._stateCommentLessThanSignBangDashDash(cp);
          break;
        }
        case State.COMMENT_END_DASH: {
          this._stateCommentEndDash(cp);
          break;
        }
        case State.COMMENT_END: {
          this._stateCommentEnd(cp);
          break;
        }
        case State.COMMENT_END_BANG: {
          this._stateCommentEndBang(cp);
          break;
        }
        case State.DOCTYPE: {
          this._stateDoctype(cp);
          break;
        }
        case State.BEFORE_DOCTYPE_NAME: {
          this._stateBeforeDoctypeName(cp);
          break;
        }
        case State.DOCTYPE_NAME: {
          this._stateDoctypeName(cp);
          break;
        }
        case State.AFTER_DOCTYPE_NAME: {
          this._stateAfterDoctypeName(cp);
          break;
        }
        case State.AFTER_DOCTYPE_PUBLIC_KEYWORD: {
          this._stateAfterDoctypePublicKeyword(cp);
          break;
        }
        case State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER: {
          this._stateBeforeDoctypePublicIdentifier(cp);
          break;
        }
        case State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED: {
          this._stateDoctypePublicIdentifierDoubleQuoted(cp);
          break;
        }
        case State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED: {
          this._stateDoctypePublicIdentifierSingleQuoted(cp);
          break;
        }
        case State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER: {
          this._stateAfterDoctypePublicIdentifier(cp);
          break;
        }
        case State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS: {
          this._stateBetweenDoctypePublicAndSystemIdentifiers(cp);
          break;
        }
        case State.AFTER_DOCTYPE_SYSTEM_KEYWORD: {
          this._stateAfterDoctypeSystemKeyword(cp);
          break;
        }
        case State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER: {
          this._stateBeforeDoctypeSystemIdentifier(cp);
          break;
        }
        case State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED: {
          this._stateDoctypeSystemIdentifierDoubleQuoted(cp);
          break;
        }
        case State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED: {
          this._stateDoctypeSystemIdentifierSingleQuoted(cp);
          break;
        }
        case State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER: {
          this._stateAfterDoctypeSystemIdentifier(cp);
          break;
        }
        case State.BOGUS_DOCTYPE: {
          this._stateBogusDoctype(cp);
          break;
        }
        case State.CDATA_SECTION: {
          this._stateCdataSection(cp);
          break;
        }
        case State.CDATA_SECTION_BRACKET: {
          this._stateCdataSectionBracket(cp);
          break;
        }
        case State.CDATA_SECTION_END: {
          this._stateCdataSectionEnd(cp);
          break;
        }
        case State.CHARACTER_REFERENCE: {
          this._stateCharacterReference();
          break;
        }
        case State.AMBIGUOUS_AMPERSAND: {
          this._stateAmbiguousAmpersand(cp);
          break;
        }
        default: {
          throw new Error("Unknown state");
        }
      }
    }


_stateData(cp) {
      switch (cp) {
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.TAG_OPEN;
          break;
        }
        case CODE_POINTS.AMPERSAND: {
          this._startCharacterReference();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitCodePoint(cp);
          break;
        }
        case CODE_POINTS.EOF: {
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateRcdata(cp) {
      switch (cp) {
        case CODE_POINTS.AMPERSAND: {
          this._startCharacterReference();
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.RCDATA_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateRawtext(cp) {
      switch (cp) {
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.RAWTEXT_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptData(cp) {
      switch (cp) {
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_statePlaintext(cp) {
      switch (cp) {
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this._createStartTagToken();
        this.state = State.TAG_NAME;
        this._stateTagName(cp);
      } else
        switch (cp) {
          case CODE_POINTS.EXCLAMATION_MARK: {
            this.state = State.MARKUP_DECLARATION_OPEN;
            break;
          }
          case CODE_POINTS.SOLIDUS: {
            this.state = State.END_TAG_OPEN;
            break;
          }
          case CODE_POINTS.QUESTION_MARK: {
            this._err(ERR.unexpectedQuestionMarkInsteadOfTagName);
            this._createCommentToken(1);
            this.state = State.BOGUS_COMMENT;
            this._stateBogusComment(cp);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofBeforeTagName);
            this._emitChars("<");
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.invalidFirstCharacterOfTagName);
            this._emitChars("<");
            this.state = State.DATA;
            this._stateData(cp);
          }
        }
    }

_stateEndTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this._createEndTagToken();
        this.state = State.TAG_NAME;
        this._stateTagName(cp);
      } else
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingEndTagName);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofBeforeTagName);
            this._emitChars("</");
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.invalidFirstCharacterOfTagName);
            this._createCommentToken(2);
            this.state = State.BOGUS_COMMENT;
            this._stateBogusComment(cp);
          }
        }
    }

_stateTagName(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          break;
        }
        case CODE_POINTS.SOLIDUS: {
          this.state = State.SELF_CLOSING_START_TAG;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.tagName += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          token.tagName += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
        }
      }
    }

_stateRcdataLessThanSign(cp) {
      if (cp === CODE_POINTS.SOLIDUS) {
        this.state = State.RCDATA_END_TAG_OPEN;
      } else {
        this._emitChars("<");
        this.state = State.RCDATA;
        this._stateRcdata(cp);
      }
    }

_stateRcdataEndTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this.state = State.RCDATA_END_TAG_NAME;
        this._stateRcdataEndTagName(cp);
      } else {
        this._emitChars("</");
        this.state = State.RCDATA;
        this._stateRcdata(cp);
      }
    }
    handleSpecialEndTag(_cp) {
      if (!this.preprocessor.startsWith(this.lastStartTagName, false)) {
        return !this._ensureHibernation();
      }
      this._createEndTagToken();
      const token = this.currentToken;
      token.tagName = this.lastStartTagName;
      const cp = this.preprocessor.peek(this.lastStartTagName.length);
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this._advanceBy(this.lastStartTagName.length);
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          return false;
        }
        case CODE_POINTS.SOLIDUS: {
          this._advanceBy(this.lastStartTagName.length);
          this.state = State.SELF_CLOSING_START_TAG;
          return false;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._advanceBy(this.lastStartTagName.length);
          this.emitCurrentTagToken();
          this.state = State.DATA;
          return false;
        }
        default: {
          return !this._ensureHibernation();
        }
      }
    }

_stateRcdataEndTagName(cp) {
      if (this.handleSpecialEndTag(cp)) {
        this._emitChars("</");
        this.state = State.RCDATA;
        this._stateRcdata(cp);
      }
    }

_stateRawtextLessThanSign(cp) {
      if (cp === CODE_POINTS.SOLIDUS) {
        this.state = State.RAWTEXT_END_TAG_OPEN;
      } else {
        this._emitChars("<");
        this.state = State.RAWTEXT;
        this._stateRawtext(cp);
      }
    }

_stateRawtextEndTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this.state = State.RAWTEXT_END_TAG_NAME;
        this._stateRawtextEndTagName(cp);
      } else {
        this._emitChars("</");
        this.state = State.RAWTEXT;
        this._stateRawtext(cp);
      }
    }

_stateRawtextEndTagName(cp) {
      if (this.handleSpecialEndTag(cp)) {
        this._emitChars("</");
        this.state = State.RAWTEXT;
        this._stateRawtext(cp);
      }
    }

_stateScriptDataLessThanSign(cp) {
      switch (cp) {
        case CODE_POINTS.SOLIDUS: {
          this.state = State.SCRIPT_DATA_END_TAG_OPEN;
          break;
        }
        case CODE_POINTS.EXCLAMATION_MARK: {
          this.state = State.SCRIPT_DATA_ESCAPE_START;
          this._emitChars("<!");
          break;
        }
        default: {
          this._emitChars("<");
          this.state = State.SCRIPT_DATA;
          this._stateScriptData(cp);
        }
      }
    }

_stateScriptDataEndTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this.state = State.SCRIPT_DATA_END_TAG_NAME;
        this._stateScriptDataEndTagName(cp);
      } else {
        this._emitChars("</");
        this.state = State.SCRIPT_DATA;
        this._stateScriptData(cp);
      }
    }

_stateScriptDataEndTagName(cp) {
      if (this.handleSpecialEndTag(cp)) {
        this._emitChars("</");
        this.state = State.SCRIPT_DATA;
        this._stateScriptData(cp);
      }
    }

_stateScriptDataEscapeStart(cp) {
      if (cp === CODE_POINTS.HYPHEN_MINUS) {
        this.state = State.SCRIPT_DATA_ESCAPE_START_DASH;
        this._emitChars("-");
      } else {
        this.state = State.SCRIPT_DATA;
        this._stateScriptData(cp);
      }
    }

_stateScriptDataEscapeStartDash(cp) {
      if (cp === CODE_POINTS.HYPHEN_MINUS) {
        this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
        this._emitChars("-");
      } else {
        this.state = State.SCRIPT_DATA;
        this._stateScriptData(cp);
      }
    }

_stateScriptDataEscaped(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.SCRIPT_DATA_ESCAPED_DASH;
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataEscapedDash(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataEscapedDashDash(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.SCRIPT_DATA;
          this._emitChars(">");
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataEscapedLessThanSign(cp) {
      if (cp === CODE_POINTS.SOLIDUS) {
        this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
      } else if (isAsciiLetter(cp)) {
        this._emitChars("<");
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_START;
        this._stateScriptDataDoubleEscapeStart(cp);
      } else {
        this._emitChars("<");
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._stateScriptDataEscaped(cp);
      }
    }

_stateScriptDataEscapedEndTagOpen(cp) {
      if (isAsciiLetter(cp)) {
        this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
        this._stateScriptDataEscapedEndTagName(cp);
      } else {
        this._emitChars("</");
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._stateScriptDataEscaped(cp);
      }
    }

_stateScriptDataEscapedEndTagName(cp) {
      if (this.handleSpecialEndTag(cp)) {
        this._emitChars("</");
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._stateScriptDataEscaped(cp);
      }
    }

_stateScriptDataDoubleEscapeStart(cp) {
      if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
        this._emitCodePoint(cp);
        for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
          this._emitCodePoint(this._consume());
        }
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
      } else if (!this._ensureHibernation()) {
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._stateScriptDataEscaped(cp);
      }
    }

_stateScriptDataDoubleEscaped(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
          this._emitChars("<");
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataDoubleEscapedDash(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
          this._emitChars("<");
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataDoubleEscapedDashDash(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this._emitChars("-");
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
          this._emitChars("<");
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.SCRIPT_DATA;
          this._emitChars(">");
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._emitChars(REPLACEMENT_CHARACTER);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInScriptHtmlCommentLikeText);
          this._emitEOFToken();
          break;
        }
        default: {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._emitCodePoint(cp);
        }
      }
    }

_stateScriptDataDoubleEscapedLessThanSign(cp) {
      if (cp === CODE_POINTS.SOLIDUS) {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_END;
        this._emitChars("/");
      } else {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._stateScriptDataDoubleEscaped(cp);
      }
    }

_stateScriptDataDoubleEscapeEnd(cp) {
      if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
        this._emitCodePoint(cp);
        for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
          this._emitCodePoint(this._consume());
        }
        this.state = State.SCRIPT_DATA_ESCAPED;
      } else if (!this._ensureHibernation()) {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._stateScriptDataDoubleEscaped(cp);
      }
    }

_stateBeforeAttributeName(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.SOLIDUS:
        case CODE_POINTS.GREATER_THAN_SIGN:
        case CODE_POINTS.EOF: {
          this.state = State.AFTER_ATTRIBUTE_NAME;
          this._stateAfterAttributeName(cp);
          break;
        }
        case CODE_POINTS.EQUALS_SIGN: {
          this._err(ERR.unexpectedEqualsSignBeforeAttributeName);
          this._createAttr("=");
          this.state = State.ATTRIBUTE_NAME;
          break;
        }
        default: {
          this._createAttr("");
          this.state = State.ATTRIBUTE_NAME;
          this._stateAttributeName(cp);
        }
      }
    }

_stateAttributeName(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED:
        case CODE_POINTS.SOLIDUS:
        case CODE_POINTS.GREATER_THAN_SIGN:
        case CODE_POINTS.EOF: {
          this._leaveAttrName();
          this.state = State.AFTER_ATTRIBUTE_NAME;
          this._stateAfterAttributeName(cp);
          break;
        }
        case CODE_POINTS.EQUALS_SIGN: {
          this._leaveAttrName();
          this.state = State.BEFORE_ATTRIBUTE_VALUE;
          break;
        }
        case CODE_POINTS.QUOTATION_MARK:
        case CODE_POINTS.APOSTROPHE:
        case CODE_POINTS.LESS_THAN_SIGN: {
          this._err(ERR.unexpectedCharacterInAttributeName);
          this.currentAttr.name += String.fromCodePoint(cp);
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.currentAttr.name += REPLACEMENT_CHARACTER;
          break;
        }
        default: {
          this.currentAttr.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
        }
      }
    }

_stateAfterAttributeName(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.SOLIDUS: {
          this.state = State.SELF_CLOSING_START_TAG;
          break;
        }
        case CODE_POINTS.EQUALS_SIGN: {
          this.state = State.BEFORE_ATTRIBUTE_VALUE;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this._createAttr("");
          this.state = State.ATTRIBUTE_NAME;
          this._stateAttributeName(cp);
        }
      }
    }

_stateBeforeAttributeValue(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          this.state = State.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          this.state = State.ATTRIBUTE_VALUE_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingAttributeValue);
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        default: {
          this.state = State.ATTRIBUTE_VALUE_UNQUOTED;
          this._stateAttributeValueUnquoted(cp);
        }
      }
    }

_stateAttributeValueDoubleQuoted(cp) {
      switch (cp) {
        case CODE_POINTS.QUOTATION_MARK: {
          this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
          break;
        }
        case CODE_POINTS.AMPERSAND: {
          this._startCharacterReference();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.currentAttr.value += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this.currentAttr.value += String.fromCodePoint(cp);
        }
      }
    }

_stateAttributeValueSingleQuoted(cp) {
      switch (cp) {
        case CODE_POINTS.APOSTROPHE: {
          this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
          break;
        }
        case CODE_POINTS.AMPERSAND: {
          this._startCharacterReference();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.currentAttr.value += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this.currentAttr.value += String.fromCodePoint(cp);
        }
      }
    }

_stateAttributeValueUnquoted(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this._leaveAttrValue();
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          break;
        }
        case CODE_POINTS.AMPERSAND: {
          this._startCharacterReference();
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._leaveAttrValue();
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this.currentAttr.value += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.QUOTATION_MARK:
        case CODE_POINTS.APOSTROPHE:
        case CODE_POINTS.LESS_THAN_SIGN:
        case CODE_POINTS.EQUALS_SIGN:
        case CODE_POINTS.GRAVE_ACCENT: {
          this._err(ERR.unexpectedCharacterInUnquotedAttributeValue);
          this.currentAttr.value += String.fromCodePoint(cp);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this.currentAttr.value += String.fromCodePoint(cp);
        }
      }
    }

_stateAfterAttributeValueQuoted(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this._leaveAttrValue();
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          break;
        }
        case CODE_POINTS.SOLIDUS: {
          this._leaveAttrValue();
          this.state = State.SELF_CLOSING_START_TAG;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._leaveAttrValue();
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingWhitespaceBetweenAttributes);
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          this._stateBeforeAttributeName(cp);
        }
      }
    }

_stateSelfClosingStartTag(cp) {
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          const token = this.currentToken;
          token.selfClosing = true;
          this.state = State.DATA;
          this.emitCurrentTagToken();
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInTag);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.unexpectedSolidusInTag);
          this.state = State.BEFORE_ATTRIBUTE_NAME;
          this._stateBeforeAttributeName(cp);
        }
      }
    }

_stateBogusComment(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentComment(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.data += REPLACEMENT_CHARACTER;
          break;
        }
        default: {
          token.data += String.fromCodePoint(cp);
        }
      }
    }

_stateMarkupDeclarationOpen(cp) {
      if (this._consumeSequenceIfMatch(SEQUENCES.DASH_DASH, true)) {
        this._createCommentToken(SEQUENCES.DASH_DASH.length + 1);
        this.state = State.COMMENT_START;
      } else if (this._consumeSequenceIfMatch(SEQUENCES.DOCTYPE, false)) {
        this.currentLocation = this.getCurrentLocation(SEQUENCES.DOCTYPE.length + 1);
        this.state = State.DOCTYPE;
      } else if (this._consumeSequenceIfMatch(SEQUENCES.CDATA_START, true)) {
        if (this.inForeignNode) {
          this.state = State.CDATA_SECTION;
        } else {
          this._err(ERR.cdataInHtmlContent);
          this._createCommentToken(SEQUENCES.CDATA_START.length + 1);
          this.currentToken.data = "[CDATA[";
          this.state = State.BOGUS_COMMENT;
        }
      } else if (!this._ensureHibernation()) {
        this._err(ERR.incorrectlyOpenedComment);
        this._createCommentToken(2);
        this.state = State.BOGUS_COMMENT;
        this._stateBogusComment(cp);
      }
    }

_stateCommentStart(cp) {
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.COMMENT_START_DASH;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptClosingOfEmptyComment);
          this.state = State.DATA;
          const token = this.currentToken;
          this.emitCurrentComment(token);
          break;
        }
        default: {
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateCommentStartDash(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.COMMENT_END;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptClosingOfEmptyComment);
          this.state = State.DATA;
          this.emitCurrentComment(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInComment);
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.data += "-";
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateComment(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.COMMENT_END_DASH;
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          token.data += "<";
          this.state = State.COMMENT_LESS_THAN_SIGN;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.data += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInComment);
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.data += String.fromCodePoint(cp);
        }
      }
    }

_stateCommentLessThanSign(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.EXCLAMATION_MARK: {
          token.data += "!";
          this.state = State.COMMENT_LESS_THAN_SIGN_BANG;
          break;
        }
        case CODE_POINTS.LESS_THAN_SIGN: {
          token.data += "<";
          break;
        }
        default: {
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateCommentLessThanSignBang(cp) {
      if (cp === CODE_POINTS.HYPHEN_MINUS) {
        this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH;
      } else {
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }

_stateCommentLessThanSignBangDash(cp) {
      if (cp === CODE_POINTS.HYPHEN_MINUS) {
        this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH;
      } else {
        this.state = State.COMMENT_END_DASH;
        this._stateCommentEndDash(cp);
      }
    }

_stateCommentLessThanSignBangDashDash(cp) {
      if (cp !== CODE_POINTS.GREATER_THAN_SIGN && cp !== CODE_POINTS.EOF) {
        this._err(ERR.nestedComment);
      }
      this.state = State.COMMENT_END;
      this._stateCommentEnd(cp);
    }

_stateCommentEndDash(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          this.state = State.COMMENT_END;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInComment);
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.data += "-";
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateCommentEnd(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentComment(token);
          break;
        }
        case CODE_POINTS.EXCLAMATION_MARK: {
          this.state = State.COMMENT_END_BANG;
          break;
        }
        case CODE_POINTS.HYPHEN_MINUS: {
          token.data += "-";
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInComment);
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.data += "--";
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateCommentEndBang(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.HYPHEN_MINUS: {
          token.data += "--!";
          this.state = State.COMMENT_END_DASH;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.incorrectlyClosedComment);
          this.state = State.DATA;
          this.emitCurrentComment(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInComment);
          this.emitCurrentComment(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.data += "--!";
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
    }

_stateDoctype(cp) {
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.BEFORE_DOCTYPE_NAME;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.BEFORE_DOCTYPE_NAME;
          this._stateBeforeDoctypeName(cp);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          this._createDoctypeToken(null);
          const token = this.currentToken;
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingWhitespaceBeforeDoctypeName);
          this.state = State.BEFORE_DOCTYPE_NAME;
          this._stateBeforeDoctypeName(cp);
        }
      }
    }

_stateBeforeDoctypeName(cp) {
      if (isAsciiUpper(cp)) {
        this._createDoctypeToken(String.fromCharCode(toAsciiLower(cp)));
        this.state = State.DOCTYPE_NAME;
      } else
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._createDoctypeToken(REPLACEMENT_CHARACTER);
            this.state = State.DOCTYPE_NAME;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingDoctypeName);
            this._createDoctypeToken(null);
            const token = this.currentToken;
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            this._createDoctypeToken(null);
            const token = this.currentToken;
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._createDoctypeToken(String.fromCodePoint(cp));
            this.state = State.DOCTYPE_NAME;
          }
        }
    }

_stateDoctypeName(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.AFTER_DOCTYPE_NAME;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.name += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
        }
      }
    }

_stateAfterDoctypeName(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          if (this._consumeSequenceIfMatch(SEQUENCES.PUBLIC, false)) {
            this.state = State.AFTER_DOCTYPE_PUBLIC_KEYWORD;
          } else if (this._consumeSequenceIfMatch(SEQUENCES.SYSTEM, false)) {
            this.state = State.AFTER_DOCTYPE_SYSTEM_KEYWORD;
          } else if (!this._ensureHibernation()) {
            this._err(ERR.invalidCharacterSequenceAfterDoctypeName);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
    }

_stateAfterDoctypePublicKeyword(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
          token.publicId = "";
          this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
          token.publicId = "";
          this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateBeforeDoctypePublicIdentifier(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          token.publicId = "";
          this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          token.publicId = "";
          this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateDoctypePublicIdentifierDoubleQuoted(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.QUOTATION_MARK: {
          this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.publicId += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.publicId += String.fromCodePoint(cp);
        }
      }
    }

_stateDoctypePublicIdentifierSingleQuoted(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.APOSTROPHE: {
          this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.publicId += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptDoctypePublicIdentifier);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.publicId += String.fromCodePoint(cp);
        }
      }
    }

_stateAfterDoctypePublicIdentifier(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateBetweenDoctypePublicAndSystemIdentifiers(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateAfterDoctypeSystemKeyword(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          this.state = State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateBeforeDoctypeSystemIdentifier(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.QUOTATION_MARK: {
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
          break;
        }
        case CODE_POINTS.APOSTROPHE: {
          token.systemId = "";
          this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.DATA;
          this.emitCurrentDoctype(token);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateDoctypeSystemIdentifierDoubleQuoted(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.QUOTATION_MARK: {
          this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.systemId += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.systemId += String.fromCodePoint(cp);
        }
      }
    }

_stateDoctypeSystemIdentifierSingleQuoted(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.APOSTROPHE: {
          this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          token.systemId += REPLACEMENT_CHARACTER;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.abruptDoctypeSystemIdentifier);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          token.systemId += String.fromCodePoint(cp);
        }
      }
    }

_stateAfterDoctypeSystemIdentifier(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.unexpectedCharacterAfterDoctypeSystemIdentifier);
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }

_stateBogusDoctype(cp) {
      const token = this.currentToken;
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          break;
        }
        case CODE_POINTS.EOF: {
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
      }
    }

_stateCdataSection(cp) {
      switch (cp) {
        case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
          this.state = State.CDATA_SECTION_BRACKET;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInCdata);
          this._emitEOFToken();
          break;
        }
        default: {
          this._emitCodePoint(cp);
        }
      }
    }

_stateCdataSectionBracket(cp) {
      if (cp === CODE_POINTS.RIGHT_SQUARE_BRACKET) {
        this.state = State.CDATA_SECTION_END;
      } else {
        this._emitChars("]");
        this.state = State.CDATA_SECTION;
        this._stateCdataSection(cp);
      }
    }

_stateCdataSectionEnd(cp) {
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
          this._emitChars("]");
          break;
        }
        default: {
          this._emitChars("]]");
          this.state = State.CDATA_SECTION;
          this._stateCdataSection(cp);
        }
      }
    }

_stateCharacterReference() {
      let length = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
      if (length < 0) {
        if (this.preprocessor.lastChunkWritten) {
          length = this.entityDecoder.end();
        } else {
          this.active = false;
          this.preprocessor.pos = this.preprocessor.html.length - 1;
          this.consumedAfterSnapshot = 0;
          this.preprocessor.endOfChunkHit = true;
          return;
        }
      }
      if (length === 0) {
        this.preprocessor.pos = this.entityStartPos;
        this._flushCodePointConsumedAsCharacterReference(CODE_POINTS.AMPERSAND);
        this.state = !this._isCharacterReferenceInAttribute() && isAsciiAlphaNumeric(this.preprocessor.peek(1)) ? State.AMBIGUOUS_AMPERSAND : this.returnState;
      } else {
        this.state = this.returnState;
      }
    }

_stateAmbiguousAmpersand(cp) {
      if (isAsciiAlphaNumeric(cp)) {
        this._flushCodePointConsumedAsCharacterReference(cp);
      } else {
        if (cp === CODE_POINTS.SEMICOLON) {
          this._err(ERR.unknownNamedCharacterReference);
        }
        this.state = this.returnState;
        this._callState(cp);
      }
    }
  }
  const IMPLICIT_END_TAG_REQUIRED = new Set([TAG_ID.DD, TAG_ID.DT, TAG_ID.LI, TAG_ID.OPTGROUP, TAG_ID.OPTION, TAG_ID.P, TAG_ID.RB, TAG_ID.RP, TAG_ID.RT, TAG_ID.RTC]);
  const IMPLICIT_END_TAG_REQUIRED_THOROUGHLY = new Set([
    ...IMPLICIT_END_TAG_REQUIRED,
    TAG_ID.CAPTION,
    TAG_ID.COLGROUP,
    TAG_ID.TBODY,
    TAG_ID.TD,
    TAG_ID.TFOOT,
    TAG_ID.TH,
    TAG_ID.THEAD,
    TAG_ID.TR
  ]);
  const SCOPING_ELEMENTS_HTML = new Set([
    TAG_ID.APPLET,
    TAG_ID.CAPTION,
    TAG_ID.HTML,
    TAG_ID.MARQUEE,
    TAG_ID.OBJECT,
    TAG_ID.TABLE,
    TAG_ID.TD,
    TAG_ID.TEMPLATE,
    TAG_ID.TH
  ]);
  const SCOPING_ELEMENTS_HTML_LIST = new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.OL, TAG_ID.UL]);
  const SCOPING_ELEMENTS_HTML_BUTTON = new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.BUTTON]);
  const SCOPING_ELEMENTS_MATHML = new Set([TAG_ID.ANNOTATION_XML, TAG_ID.MI, TAG_ID.MN, TAG_ID.MO, TAG_ID.MS, TAG_ID.MTEXT]);
  const SCOPING_ELEMENTS_SVG = new Set([TAG_ID.DESC, TAG_ID.FOREIGN_OBJECT, TAG_ID.TITLE]);
  const TABLE_ROW_CONTEXT = new Set([TAG_ID.TR, TAG_ID.TEMPLATE, TAG_ID.HTML]);
  const TABLE_BODY_CONTEXT = new Set([TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TEMPLATE, TAG_ID.HTML]);
  const TABLE_CONTEXT = new Set([TAG_ID.TABLE, TAG_ID.TEMPLATE, TAG_ID.HTML]);
  const TABLE_CELLS = new Set([TAG_ID.TD, TAG_ID.TH]);
  class OpenElementStack {
    get currentTmplContentOrNode() {
      return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
    }
    constructor(document2, treeAdapter, handler) {
      this.treeAdapter = treeAdapter;
      this.handler = handler;
      this.items = [];
      this.tagIDs = [];
      this.stackTop = -1;
      this.tmplCount = 0;
      this.currentTagId = TAG_ID.UNKNOWN;
      this.current = document2;
    }
_indexOf(element) {
      return this.items.lastIndexOf(element, this.stackTop);
    }
_isInTemplate() {
      return this.currentTagId === TAG_ID.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === NS.HTML;
    }
    _updateCurrentElement() {
      this.current = this.items[this.stackTop];
      this.currentTagId = this.tagIDs[this.stackTop];
    }
push(element, tagID) {
      this.stackTop++;
      this.items[this.stackTop] = element;
      this.current = element;
      this.tagIDs[this.stackTop] = tagID;
      this.currentTagId = tagID;
      if (this._isInTemplate()) {
        this.tmplCount++;
      }
      this.handler.onItemPush(element, tagID, true);
    }
    pop() {
      const popped = this.current;
      if (this.tmplCount > 0 && this._isInTemplate()) {
        this.tmplCount--;
      }
      this.stackTop--;
      this._updateCurrentElement();
      this.handler.onItemPop(popped, true);
    }
    replace(oldElement, newElement) {
      const idx = this._indexOf(oldElement);
      this.items[idx] = newElement;
      if (idx === this.stackTop) {
        this.current = newElement;
      }
    }
    insertAfter(referenceElement, newElement, newElementID) {
      const insertionIdx = this._indexOf(referenceElement) + 1;
      this.items.splice(insertionIdx, 0, newElement);
      this.tagIDs.splice(insertionIdx, 0, newElementID);
      this.stackTop++;
      if (insertionIdx === this.stackTop) {
        this._updateCurrentElement();
      }
      if (this.current && this.currentTagId !== void 0) {
        this.handler.onItemPush(this.current, this.currentTagId, insertionIdx === this.stackTop);
      }
    }
    popUntilTagNamePopped(tagName) {
      let targetIdx = this.stackTop + 1;
      do {
        targetIdx = this.tagIDs.lastIndexOf(tagName, targetIdx - 1);
      } while (targetIdx > 0 && this.treeAdapter.getNamespaceURI(this.items[targetIdx]) !== NS.HTML);
      this.shortenToLength(Math.max(targetIdx, 0));
    }
    shortenToLength(idx) {
      while (this.stackTop >= idx) {
        const popped = this.current;
        if (this.tmplCount > 0 && this._isInTemplate()) {
          this.tmplCount -= 1;
        }
        this.stackTop--;
        this._updateCurrentElement();
        this.handler.onItemPop(popped, this.stackTop < idx);
      }
    }
    popUntilElementPopped(element) {
      const idx = this._indexOf(element);
      this.shortenToLength(Math.max(idx, 0));
    }
    popUntilPopped(tagNames, targetNS) {
      const idx = this._indexOfTagNames(tagNames, targetNS);
      this.shortenToLength(Math.max(idx, 0));
    }
    popUntilNumberedHeaderPopped() {
      this.popUntilPopped(NUMBERED_HEADERS, NS.HTML);
    }
    popUntilTableCellPopped() {
      this.popUntilPopped(TABLE_CELLS, NS.HTML);
    }
    popAllUpToHtmlElement() {
      this.tmplCount = 0;
      this.shortenToLength(1);
    }
    _indexOfTagNames(tagNames, namespace) {
      for (let i = this.stackTop; i >= 0; i--) {
        if (tagNames.has(this.tagIDs[i]) && this.treeAdapter.getNamespaceURI(this.items[i]) === namespace) {
          return i;
        }
      }
      return -1;
    }
    clearBackTo(tagNames, targetNS) {
      const idx = this._indexOfTagNames(tagNames, targetNS);
      this.shortenToLength(idx + 1);
    }
    clearBackToTableContext() {
      this.clearBackTo(TABLE_CONTEXT, NS.HTML);
    }
    clearBackToTableBodyContext() {
      this.clearBackTo(TABLE_BODY_CONTEXT, NS.HTML);
    }
    clearBackToTableRowContext() {
      this.clearBackTo(TABLE_ROW_CONTEXT, NS.HTML);
    }
    remove(element) {
      const idx = this._indexOf(element);
      if (idx >= 0) {
        if (idx === this.stackTop) {
          this.pop();
        } else {
          this.items.splice(idx, 1);
          this.tagIDs.splice(idx, 1);
          this.stackTop--;
          this._updateCurrentElement();
          this.handler.onItemPop(element, false);
        }
      }
    }
tryPeekProperlyNestedBodyElement() {
      return this.stackTop >= 1 && this.tagIDs[1] === TAG_ID.BODY ? this.items[1] : null;
    }
    contains(element) {
      return this._indexOf(element) > -1;
    }
    getCommonAncestor(element) {
      const elementIdx = this._indexOf(element) - 1;
      return elementIdx >= 0 ? this.items[elementIdx] : null;
    }
    isRootHtmlElementCurrent() {
      return this.stackTop === 0 && this.tagIDs[0] === TAG_ID.HTML;
    }
hasInDynamicScope(tagName, htmlScope) {
      for (let i = this.stackTop; i >= 0; i--) {
        const tn = this.tagIDs[i];
        switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
          case NS.HTML: {
            if (tn === tagName)
              return true;
            if (htmlScope.has(tn))
              return false;
            break;
          }
          case NS.SVG: {
            if (SCOPING_ELEMENTS_SVG.has(tn))
              return false;
            break;
          }
          case NS.MATHML: {
            if (SCOPING_ELEMENTS_MATHML.has(tn))
              return false;
            break;
          }
        }
      }
      return true;
    }
    hasInScope(tagName) {
      return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML);
    }
    hasInListItemScope(tagName) {
      return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_LIST);
    }
    hasInButtonScope(tagName) {
      return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_BUTTON);
    }
    hasNumberedHeaderInScope() {
      for (let i = this.stackTop; i >= 0; i--) {
        const tn = this.tagIDs[i];
        switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
          case NS.HTML: {
            if (NUMBERED_HEADERS.has(tn))
              return true;
            if (SCOPING_ELEMENTS_HTML.has(tn))
              return false;
            break;
          }
          case NS.SVG: {
            if (SCOPING_ELEMENTS_SVG.has(tn))
              return false;
            break;
          }
          case NS.MATHML: {
            if (SCOPING_ELEMENTS_MATHML.has(tn))
              return false;
            break;
          }
        }
      }
      return true;
    }
    hasInTableScope(tagName) {
      for (let i = this.stackTop; i >= 0; i--) {
        if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
          continue;
        }
        switch (this.tagIDs[i]) {
          case tagName: {
            return true;
          }
          case TAG_ID.TABLE:
          case TAG_ID.HTML: {
            return false;
          }
        }
      }
      return true;
    }
    hasTableBodyContextInTableScope() {
      for (let i = this.stackTop; i >= 0; i--) {
        if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
          continue;
        }
        switch (this.tagIDs[i]) {
          case TAG_ID.TBODY:
          case TAG_ID.THEAD:
          case TAG_ID.TFOOT: {
            return true;
          }
          case TAG_ID.TABLE:
          case TAG_ID.HTML: {
            return false;
          }
        }
      }
      return true;
    }
    hasInSelectScope(tagName) {
      for (let i = this.stackTop; i >= 0; i--) {
        if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
          continue;
        }
        switch (this.tagIDs[i]) {
          case tagName: {
            return true;
          }
          case TAG_ID.OPTION:
          case TAG_ID.OPTGROUP: {
            break;
          }
          default: {
            return false;
          }
        }
      }
      return true;
    }
generateImpliedEndTags() {
      while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED.has(this.currentTagId)) {
        this.pop();
      }
    }
    generateImpliedEndTagsThoroughly() {
      while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
        this.pop();
      }
    }
    generateImpliedEndTagsWithExclusion(exclusionId) {
      while (this.currentTagId !== void 0 && this.currentTagId !== exclusionId && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
        this.pop();
      }
    }
  }
  const NOAH_ARK_CAPACITY = 3;
  var EntryType;
  (function(EntryType2) {
    EntryType2[EntryType2["Marker"] = 0] = "Marker";
    EntryType2[EntryType2["Element"] = 1] = "Element";
  })(EntryType || (EntryType = {}));
  const MARKER = { type: EntryType.Marker };
  class FormattingElementList {
    constructor(treeAdapter) {
      this.treeAdapter = treeAdapter;
      this.entries = [];
      this.bookmark = null;
    }


_getNoahArkConditionCandidates(newElement, neAttrs) {
      const candidates = [];
      const neAttrsLength = neAttrs.length;
      const neTagName = this.treeAdapter.getTagName(newElement);
      const neNamespaceURI = this.treeAdapter.getNamespaceURI(newElement);
      for (let i = 0; i < this.entries.length; i++) {
        const entry = this.entries[i];
        if (entry.type === EntryType.Marker) {
          break;
        }
        const { element } = entry;
        if (this.treeAdapter.getTagName(element) === neTagName && this.treeAdapter.getNamespaceURI(element) === neNamespaceURI) {
          const elementAttrs = this.treeAdapter.getAttrList(element);
          if (elementAttrs.length === neAttrsLength) {
            candidates.push({ idx: i, attrs: elementAttrs });
          }
        }
      }
      return candidates;
    }
    _ensureNoahArkCondition(newElement) {
      if (this.entries.length < NOAH_ARK_CAPACITY)
        return;
      const neAttrs = this.treeAdapter.getAttrList(newElement);
      const candidates = this._getNoahArkConditionCandidates(newElement, neAttrs);
      if (candidates.length < NOAH_ARK_CAPACITY)
        return;
      const neAttrsMap = new Map(neAttrs.map((neAttr) => [neAttr.name, neAttr.value]));
      let validCandidates = 0;
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        if (candidate.attrs.every((cAttr) => neAttrsMap.get(cAttr.name) === cAttr.value)) {
          validCandidates += 1;
          if (validCandidates >= NOAH_ARK_CAPACITY) {
            this.entries.splice(candidate.idx, 1);
          }
        }
      }
    }
insertMarker() {
      this.entries.unshift(MARKER);
    }
    pushElement(element, token) {
      this._ensureNoahArkCondition(element);
      this.entries.unshift({
        type: EntryType.Element,
        element,
        token
      });
    }
    insertElementAfterBookmark(element, token) {
      const bookmarkIdx = this.entries.indexOf(this.bookmark);
      this.entries.splice(bookmarkIdx, 0, {
        type: EntryType.Element,
        element,
        token
      });
    }
    removeEntry(entry) {
      const entryIndex = this.entries.indexOf(entry);
      if (entryIndex !== -1) {
        this.entries.splice(entryIndex, 1);
      }
    }
clearToLastMarker() {
      const markerIdx = this.entries.indexOf(MARKER);
      if (markerIdx === -1) {
        this.entries.length = 0;
      } else {
        this.entries.splice(0, markerIdx + 1);
      }
    }
getElementEntryInScopeWithTagName(tagName) {
      const entry = this.entries.find((entry2) => entry2.type === EntryType.Marker || this.treeAdapter.getTagName(entry2.element) === tagName);
      return entry && entry.type === EntryType.Element ? entry : null;
    }
    getElementEntry(element) {
      return this.entries.find((entry) => entry.type === EntryType.Element && entry.element === element);
    }
  }
  const defaultTreeAdapter = {
createDocument() {
      return {
        nodeName: "#document",
        mode: DOCUMENT_MODE.NO_QUIRKS,
        childNodes: []
      };
    },
    createDocumentFragment() {
      return {
        nodeName: "#document-fragment",
        childNodes: []
      };
    },
    createElement(tagName, namespaceURI, attrs) {
      return {
        nodeName: tagName,
        tagName,
        attrs,
        namespaceURI,
        childNodes: [],
        parentNode: null
      };
    },
    createCommentNode(data2) {
      return {
        nodeName: "#comment",
        data: data2,
        parentNode: null
      };
    },
    createTextNode(value) {
      return {
        nodeName: "#text",
        value,
        parentNode: null
      };
    },
appendChild(parentNode, newNode) {
      parentNode.childNodes.push(newNode);
      newNode.parentNode = parentNode;
    },
    insertBefore(parentNode, newNode, referenceNode) {
      const insertionIdx = parentNode.childNodes.indexOf(referenceNode);
      parentNode.childNodes.splice(insertionIdx, 0, newNode);
      newNode.parentNode = parentNode;
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(document2, name, publicId, systemId) {
      const doctypeNode = document2.childNodes.find((node) => node.nodeName === "#documentType");
      if (doctypeNode) {
        doctypeNode.name = name;
        doctypeNode.publicId = publicId;
        doctypeNode.systemId = systemId;
      } else {
        const node = {
          nodeName: "#documentType",
          name,
          publicId,
          systemId,
          parentNode: null
        };
        defaultTreeAdapter.appendChild(document2, node);
      }
    },
    setDocumentMode(document2, mode) {
      document2.mode = mode;
    },
    getDocumentMode(document2) {
      return document2.mode;
    },
    detachNode(node) {
      if (node.parentNode) {
        const idx = node.parentNode.childNodes.indexOf(node);
        node.parentNode.childNodes.splice(idx, 1);
        node.parentNode = null;
      }
    },
    insertText(parentNode, text2) {
      if (parentNode.childNodes.length > 0) {
        const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];
        if (defaultTreeAdapter.isTextNode(prevNode)) {
          prevNode.value += text2;
          return;
        }
      }
      defaultTreeAdapter.appendChild(parentNode, defaultTreeAdapter.createTextNode(text2));
    },
    insertTextBefore(parentNode, text2, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode && defaultTreeAdapter.isTextNode(prevNode)) {
        prevNode.value += text2;
      } else {
        defaultTreeAdapter.insertBefore(parentNode, defaultTreeAdapter.createTextNode(text2), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      const recipientAttrsMap = new Set(recipient.attrs.map((attr2) => attr2.name));
      for (let j = 0; j < attrs.length; j++) {
        if (!recipientAttrsMap.has(attrs[j].name)) {
          recipient.attrs.push(attrs[j]);
        }
      }
    },
getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      return element.attrs;
    },
getTagName(element) {
      return element.tagName;
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.value;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.data;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode.name;
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode.publicId;
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode.systemId;
    },
isTextNode(node) {
      return node.nodeName === "#text";
    },
    isCommentNode(node) {
      return node.nodeName === "#comment";
    },
    isDocumentTypeNode(node) {
      return node.nodeName === "#documentType";
    },
    isElementNode(node) {
      return Object.prototype.hasOwnProperty.call(node, "tagName");
    },
setNodeSourceCodeLocation(node, location2) {
      node.sourceCodeLocation = location2;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    updateNodeSourceCodeLocation(node, endLocation) {
      node.sourceCodeLocation = { ...node.sourceCodeLocation, ...endLocation };
    }
  };
  const VALID_DOCTYPE_NAME = "html";
  const VALID_SYSTEM_ID = "about:legacy-compat";
  const QUIRKS_MODE_SYSTEM_ID = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";
  const QUIRKS_MODE_PUBLIC_ID_PREFIXES = [
    "+//silmaril//dtd html pro v0r11 19970101//",
    "-//as//dtd html 3.0 aswedit + extensions//",
    "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
    "-//ietf//dtd html 2.0 level 1//",
    "-//ietf//dtd html 2.0 level 2//",
    "-//ietf//dtd html 2.0 strict level 1//",
    "-//ietf//dtd html 2.0 strict level 2//",
    "-//ietf//dtd html 2.0 strict//",
    "-//ietf//dtd html 2.0//",
    "-//ietf//dtd html 2.1e//",
    "-//ietf//dtd html 3.0//",
    "-//ietf//dtd html 3.2 final//",
    "-//ietf//dtd html 3.2//",
    "-//ietf//dtd html 3//",
    "-//ietf//dtd html level 0//",
    "-//ietf//dtd html level 1//",
    "-//ietf//dtd html level 2//",
    "-//ietf//dtd html level 3//",
    "-//ietf//dtd html strict level 0//",
    "-//ietf//dtd html strict level 1//",
    "-//ietf//dtd html strict level 2//",
    "-//ietf//dtd html strict level 3//",
    "-//ietf//dtd html strict//",
    "-//ietf//dtd html//",
    "-//metrius//dtd metrius presentational//",
    "-//microsoft//dtd internet explorer 2.0 html strict//",
    "-//microsoft//dtd internet explorer 2.0 html//",
    "-//microsoft//dtd internet explorer 2.0 tables//",
    "-//microsoft//dtd internet explorer 3.0 html strict//",
    "-//microsoft//dtd internet explorer 3.0 html//",
    "-//microsoft//dtd internet explorer 3.0 tables//",
    "-//netscape comm. corp.//dtd html//",
    "-//netscape comm. corp.//dtd strict html//",
    "-//o'reilly and associates//dtd html 2.0//",
    "-//o'reilly and associates//dtd html extended 1.0//",
    "-//o'reilly and associates//dtd html extended relaxed 1.0//",
    "-//sq//dtd html 2.0 hotmetal + extensions//",
    "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
    "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
    "-//spyglass//dtd html 2.0 extended//",
    "-//sun microsystems corp.//dtd hotjava html//",
    "-//sun microsystems corp.//dtd hotjava strict html//",
    "-//w3c//dtd html 3 1995-03-24//",
    "-//w3c//dtd html 3.2 draft//",
    "-//w3c//dtd html 3.2 final//",
    "-//w3c//dtd html 3.2//",
    "-//w3c//dtd html 3.2s draft//",
    "-//w3c//dtd html 4.0 frameset//",
    "-//w3c//dtd html 4.0 transitional//",
    "-//w3c//dtd html experimental 19960712//",
    "-//w3c//dtd html experimental 970421//",
    "-//w3c//dtd w3 html//",
    "-//w3o//dtd w3 html 3.0//",
    "-//webtechs//dtd mozilla html 2.0//",
    "-//webtechs//dtd mozilla html//"
  ];
  const QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
    ...QUIRKS_MODE_PUBLIC_ID_PREFIXES,
    "-//w3c//dtd html 4.01 frameset//",
    "-//w3c//dtd html 4.01 transitional//"
  ];
  const QUIRKS_MODE_PUBLIC_IDS = new Set([
    "-//w3o//dtd w3 html strict 3.0//en//",
    "-/w3c/dtd html 4.0 transitional/en",
    "html"
  ]);
  const LIMITED_QUIRKS_PUBLIC_ID_PREFIXES = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"];
  const LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
    ...LIMITED_QUIRKS_PUBLIC_ID_PREFIXES,
    "-//w3c//dtd html 4.01 frameset//",
    "-//w3c//dtd html 4.01 transitional//"
  ];
  function hasPrefix(publicId, prefixes) {
    return prefixes.some((prefix) => publicId.startsWith(prefix));
  }
  function isConforming(token) {
    return token.name === VALID_DOCTYPE_NAME && token.publicId === null && (token.systemId === null || token.systemId === VALID_SYSTEM_ID);
  }
  function getDocumentMode(token) {
    if (token.name !== VALID_DOCTYPE_NAME) {
      return DOCUMENT_MODE.QUIRKS;
    }
    const { systemId } = token;
    if (systemId && systemId.toLowerCase() === QUIRKS_MODE_SYSTEM_ID) {
      return DOCUMENT_MODE.QUIRKS;
    }
    let { publicId } = token;
    if (publicId !== null) {
      publicId = publicId.toLowerCase();
      if (QUIRKS_MODE_PUBLIC_IDS.has(publicId)) {
        return DOCUMENT_MODE.QUIRKS;
      }
      let prefixes = systemId === null ? QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES : QUIRKS_MODE_PUBLIC_ID_PREFIXES;
      if (hasPrefix(publicId, prefixes)) {
        return DOCUMENT_MODE.QUIRKS;
      }
      prefixes = systemId === null ? LIMITED_QUIRKS_PUBLIC_ID_PREFIXES : LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES;
      if (hasPrefix(publicId, prefixes)) {
        return DOCUMENT_MODE.LIMITED_QUIRKS;
      }
    }
    return DOCUMENT_MODE.NO_QUIRKS;
  }
  const MIME_TYPES = {
    TEXT_HTML: "text/html",
    APPLICATION_XML: "application/xhtml+xml"
  };
  const DEFINITION_URL_ATTR = "definitionurl";
  const ADJUSTED_DEFINITION_URL_ATTR = "definitionURL";
  const SVG_ATTRS_ADJUSTMENT_MAP = new Map([
    "attributeName",
    "attributeType",
    "baseFrequency",
    "baseProfile",
    "calcMode",
    "clipPathUnits",
    "diffuseConstant",
    "edgeMode",
    "filterUnits",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "kernelMatrix",
    "kernelUnitLength",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "limitingConeAngle",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "specularConstant",
    "specularExponent",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stitchTiles",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textLength",
    "viewBox",
    "viewTarget",
    "xChannelSelector",
    "yChannelSelector",
    "zoomAndPan"
  ].map((attr2) => [attr2.toLowerCase(), attr2]));
  const XML_ATTRS_ADJUSTMENT_MAP = new Map([
    ["xlink:actuate", { prefix: "xlink", name: "actuate", namespace: NS.XLINK }],
    ["xlink:arcrole", { prefix: "xlink", name: "arcrole", namespace: NS.XLINK }],
    ["xlink:href", { prefix: "xlink", name: "href", namespace: NS.XLINK }],
    ["xlink:role", { prefix: "xlink", name: "role", namespace: NS.XLINK }],
    ["xlink:show", { prefix: "xlink", name: "show", namespace: NS.XLINK }],
    ["xlink:title", { prefix: "xlink", name: "title", namespace: NS.XLINK }],
    ["xlink:type", { prefix: "xlink", name: "type", namespace: NS.XLINK }],
    ["xml:lang", { prefix: "xml", name: "lang", namespace: NS.XML }],
    ["xml:space", { prefix: "xml", name: "space", namespace: NS.XML }],
    ["xmlns", { prefix: "", name: "xmlns", namespace: NS.XMLNS }],
    ["xmlns:xlink", { prefix: "xmlns", name: "xlink", namespace: NS.XMLNS }]
  ]);
  const SVG_TAG_NAMES_ADJUSTMENT_MAP = new Map([
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "clipPath",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "foreignObject",
    "glyphRef",
    "linearGradient",
    "radialGradient",
    "textPath"
  ].map((tn) => [tn.toLowerCase(), tn]));
  const EXITS_FOREIGN_CONTENT = new Set([
    TAG_ID.B,
    TAG_ID.BIG,
    TAG_ID.BLOCKQUOTE,
    TAG_ID.BODY,
    TAG_ID.BR,
    TAG_ID.CENTER,
    TAG_ID.CODE,
    TAG_ID.DD,
    TAG_ID.DIV,
    TAG_ID.DL,
    TAG_ID.DT,
    TAG_ID.EM,
    TAG_ID.EMBED,
    TAG_ID.H1,
    TAG_ID.H2,
    TAG_ID.H3,
    TAG_ID.H4,
    TAG_ID.H5,
    TAG_ID.H6,
    TAG_ID.HEAD,
    TAG_ID.HR,
    TAG_ID.I,
    TAG_ID.IMG,
    TAG_ID.LI,
    TAG_ID.LISTING,
    TAG_ID.MENU,
    TAG_ID.META,
    TAG_ID.NOBR,
    TAG_ID.OL,
    TAG_ID.P,
    TAG_ID.PRE,
    TAG_ID.RUBY,
    TAG_ID.S,
    TAG_ID.SMALL,
    TAG_ID.SPAN,
    TAG_ID.STRONG,
    TAG_ID.STRIKE,
    TAG_ID.SUB,
    TAG_ID.SUP,
    TAG_ID.TABLE,
    TAG_ID.TT,
    TAG_ID.U,
    TAG_ID.UL,
    TAG_ID.VAR
  ]);
  function causesExit(startTagToken) {
    const tn = startTagToken.tagID;
    const isFontWithAttrs = tn === TAG_ID.FONT && startTagToken.attrs.some(({ name }) => name === ATTRS.COLOR || name === ATTRS.SIZE || name === ATTRS.FACE);
    return isFontWithAttrs || EXITS_FOREIGN_CONTENT.has(tn);
  }
  function adjustTokenMathMLAttrs(token) {
    for (let i = 0; i < token.attrs.length; i++) {
      if (token.attrs[i].name === DEFINITION_URL_ATTR) {
        token.attrs[i].name = ADJUSTED_DEFINITION_URL_ATTR;
        break;
      }
    }
  }
  function adjustTokenSVGAttrs(token) {
    for (let i = 0; i < token.attrs.length; i++) {
      const adjustedAttrName = SVG_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
      if (adjustedAttrName != null) {
        token.attrs[i].name = adjustedAttrName;
      }
    }
  }
  function adjustTokenXMLAttrs(token) {
    for (let i = 0; i < token.attrs.length; i++) {
      const adjustedAttrEntry = XML_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
      if (adjustedAttrEntry) {
        token.attrs[i].prefix = adjustedAttrEntry.prefix;
        token.attrs[i].name = adjustedAttrEntry.name;
        token.attrs[i].namespace = adjustedAttrEntry.namespace;
      }
    }
  }
  function adjustTokenSVGTagName(token) {
    const adjustedTagName = SVG_TAG_NAMES_ADJUSTMENT_MAP.get(token.tagName);
    if (adjustedTagName != null) {
      token.tagName = adjustedTagName;
      token.tagID = getTagID(token.tagName);
    }
  }
  function isMathMLTextIntegrationPoint(tn, ns) {
    return ns === NS.MATHML && (tn === TAG_ID.MI || tn === TAG_ID.MO || tn === TAG_ID.MN || tn === TAG_ID.MS || tn === TAG_ID.MTEXT);
  }
  function isHtmlIntegrationPoint(tn, ns, attrs) {
    if (ns === NS.MATHML && tn === TAG_ID.ANNOTATION_XML) {
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].name === ATTRS.ENCODING) {
          const value = attrs[i].value.toLowerCase();
          return value === MIME_TYPES.TEXT_HTML || value === MIME_TYPES.APPLICATION_XML;
        }
      }
    }
    return ns === NS.SVG && (tn === TAG_ID.FOREIGN_OBJECT || tn === TAG_ID.DESC || tn === TAG_ID.TITLE);
  }
  function isIntegrationPoint(tn, ns, attrs, foreignNS) {
    return (!foreignNS || foreignNS === NS.HTML) && isHtmlIntegrationPoint(tn, ns, attrs) || (!foreignNS || foreignNS === NS.MATHML) && isMathMLTextIntegrationPoint(tn, ns);
  }
  const HIDDEN_INPUT_TYPE = "hidden";
  const AA_OUTER_LOOP_ITER = 8;
  const AA_INNER_LOOP_ITER = 3;
  var InsertionMode;
  (function(InsertionMode2) {
    InsertionMode2[InsertionMode2["INITIAL"] = 0] = "INITIAL";
    InsertionMode2[InsertionMode2["BEFORE_HTML"] = 1] = "BEFORE_HTML";
    InsertionMode2[InsertionMode2["BEFORE_HEAD"] = 2] = "BEFORE_HEAD";
    InsertionMode2[InsertionMode2["IN_HEAD"] = 3] = "IN_HEAD";
    InsertionMode2[InsertionMode2["IN_HEAD_NO_SCRIPT"] = 4] = "IN_HEAD_NO_SCRIPT";
    InsertionMode2[InsertionMode2["AFTER_HEAD"] = 5] = "AFTER_HEAD";
    InsertionMode2[InsertionMode2["IN_BODY"] = 6] = "IN_BODY";
    InsertionMode2[InsertionMode2["TEXT"] = 7] = "TEXT";
    InsertionMode2[InsertionMode2["IN_TABLE"] = 8] = "IN_TABLE";
    InsertionMode2[InsertionMode2["IN_TABLE_TEXT"] = 9] = "IN_TABLE_TEXT";
    InsertionMode2[InsertionMode2["IN_CAPTION"] = 10] = "IN_CAPTION";
    InsertionMode2[InsertionMode2["IN_COLUMN_GROUP"] = 11] = "IN_COLUMN_GROUP";
    InsertionMode2[InsertionMode2["IN_TABLE_BODY"] = 12] = "IN_TABLE_BODY";
    InsertionMode2[InsertionMode2["IN_ROW"] = 13] = "IN_ROW";
    InsertionMode2[InsertionMode2["IN_CELL"] = 14] = "IN_CELL";
    InsertionMode2[InsertionMode2["IN_SELECT"] = 15] = "IN_SELECT";
    InsertionMode2[InsertionMode2["IN_SELECT_IN_TABLE"] = 16] = "IN_SELECT_IN_TABLE";
    InsertionMode2[InsertionMode2["IN_TEMPLATE"] = 17] = "IN_TEMPLATE";
    InsertionMode2[InsertionMode2["AFTER_BODY"] = 18] = "AFTER_BODY";
    InsertionMode2[InsertionMode2["IN_FRAMESET"] = 19] = "IN_FRAMESET";
    InsertionMode2[InsertionMode2["AFTER_FRAMESET"] = 20] = "AFTER_FRAMESET";
    InsertionMode2[InsertionMode2["AFTER_AFTER_BODY"] = 21] = "AFTER_AFTER_BODY";
    InsertionMode2[InsertionMode2["AFTER_AFTER_FRAMESET"] = 22] = "AFTER_AFTER_FRAMESET";
  })(InsertionMode || (InsertionMode = {}));
  const BASE_LOC = {
    startLine: -1,
    startCol: -1,
    startOffset: -1,
    endLine: -1,
    endCol: -1,
    endOffset: -1
  };
  const TABLE_STRUCTURE_TAGS = new Set([TAG_ID.TABLE, TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TR]);
  const defaultParserOptions = {
    scriptingEnabled: true,
    sourceCodeLocationInfo: false,
    treeAdapter: defaultTreeAdapter,
    onParseError: null
  };
  class Parser2 {
    constructor(options, document2, fragmentContext = null, scriptHandler = null) {
      this.fragmentContext = fragmentContext;
      this.scriptHandler = scriptHandler;
      this.currentToken = null;
      this.stopped = false;
      this.insertionMode = InsertionMode.INITIAL;
      this.originalInsertionMode = InsertionMode.INITIAL;
      this.headElement = null;
      this.formElement = null;
      this.currentNotInHTML = false;
      this.tmplInsertionModeStack = [];
      this.pendingCharacterTokens = [];
      this.hasNonWhitespacePendingCharacterToken = false;
      this.framesetOk = true;
      this.skipNextNewLine = false;
      this.fosterParentingEnabled = false;
      this.options = {
        ...defaultParserOptions,
        ...options
      };
      this.treeAdapter = this.options.treeAdapter;
      this.onParseError = this.options.onParseError;
      if (this.onParseError) {
        this.options.sourceCodeLocationInfo = true;
      }
      this.document = document2 !== null && document2 !== void 0 ? document2 : this.treeAdapter.createDocument();
      this.tokenizer = new Tokenizer2(this.options, this);
      this.activeFormattingElements = new FormattingElementList(this.treeAdapter);
      this.fragmentContextID = fragmentContext ? getTagID(this.treeAdapter.getTagName(fragmentContext)) : TAG_ID.UNKNOWN;
      this._setContextModes(fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : this.document, this.fragmentContextID);
      this.openElements = new OpenElementStack(this.document, this.treeAdapter, this);
    }
static parse(html2, options) {
      const parser = new this(options);
      parser.tokenizer.write(html2, true);
      return parser.document;
    }
    static getFragmentParser(fragmentContext, options) {
      const opts = {
        ...defaultParserOptions,
        ...options
      };
      fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : fragmentContext = opts.treeAdapter.createElement(TAG_NAMES.TEMPLATE, NS.HTML, []);
      const documentMock = opts.treeAdapter.createElement("documentmock", NS.HTML, []);
      const parser = new this(opts, documentMock, fragmentContext);
      if (parser.fragmentContextID === TAG_ID.TEMPLATE) {
        parser.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
      }
      parser._initTokenizerForFragmentParsing();
      parser._insertFakeRootElement();
      parser._resetInsertionMode();
      parser._findFormInFragmentContext();
      return parser;
    }
    getFragment() {
      const rootElement = this.treeAdapter.getFirstChild(this.document);
      const fragment = this.treeAdapter.createDocumentFragment();
      this._adoptNodes(rootElement, fragment);
      return fragment;
    }

_err(token, code, beforeToken) {
      var _a2;
      if (!this.onParseError)
        return;
      const loc = (_a2 = token.location) !== null && _a2 !== void 0 ? _a2 : BASE_LOC;
      const err = {
        code,
        startLine: loc.startLine,
        startCol: loc.startCol,
        startOffset: loc.startOffset,
        endLine: beforeToken ? loc.startLine : loc.endLine,
        endCol: beforeToken ? loc.startCol : loc.endCol,
        endOffset: beforeToken ? loc.startOffset : loc.endOffset
      };
      this.onParseError(err);
    }

onItemPush(node, tid, isTop) {
      var _a2, _b;
      (_b = (_a2 = this.treeAdapter).onItemPush) === null || _b === void 0 ? void 0 : _b.call(_a2, node);
      if (isTop && this.openElements.stackTop > 0)
        this._setContextModes(node, tid);
    }
onItemPop(node, isTop) {
      var _a2, _b;
      if (this.options.sourceCodeLocationInfo) {
        this._setEndLocation(node, this.currentToken);
      }
      (_b = (_a2 = this.treeAdapter).onItemPop) === null || _b === void 0 ? void 0 : _b.call(_a2, node, this.openElements.current);
      if (isTop) {
        let current;
        let currentTagId;
        if (this.openElements.stackTop === 0 && this.fragmentContext) {
          current = this.fragmentContext;
          currentTagId = this.fragmentContextID;
        } else {
          ({ current, currentTagId } = this.openElements);
        }
        this._setContextModes(current, currentTagId);
      }
    }
    _setContextModes(current, tid) {
      const isHTML = current === this.document || current && this.treeAdapter.getNamespaceURI(current) === NS.HTML;
      this.currentNotInHTML = !isHTML;
      this.tokenizer.inForeignNode = !isHTML && current !== void 0 && tid !== void 0 && !this._isIntegrationPoint(tid, current);
    }
_switchToTextParsing(currentToken, nextTokenizerState) {
      this._insertElement(currentToken, NS.HTML);
      this.tokenizer.state = nextTokenizerState;
      this.originalInsertionMode = this.insertionMode;
      this.insertionMode = InsertionMode.TEXT;
    }
    switchToPlaintextParsing() {
      this.insertionMode = InsertionMode.TEXT;
      this.originalInsertionMode = InsertionMode.IN_BODY;
      this.tokenizer.state = TokenizerMode.PLAINTEXT;
    }

_getAdjustedCurrentElement() {
      return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
    }
_findFormInFragmentContext() {
      let node = this.fragmentContext;
      while (node) {
        if (this.treeAdapter.getTagName(node) === TAG_NAMES.FORM) {
          this.formElement = node;
          break;
        }
        node = this.treeAdapter.getParentNode(node);
      }
    }
    _initTokenizerForFragmentParsing() {
      if (!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== NS.HTML) {
        return;
      }
      switch (this.fragmentContextID) {
        case TAG_ID.TITLE:
        case TAG_ID.TEXTAREA: {
          this.tokenizer.state = TokenizerMode.RCDATA;
          break;
        }
        case TAG_ID.STYLE:
        case TAG_ID.XMP:
        case TAG_ID.IFRAME:
        case TAG_ID.NOEMBED:
        case TAG_ID.NOFRAMES:
        case TAG_ID.NOSCRIPT: {
          this.tokenizer.state = TokenizerMode.RAWTEXT;
          break;
        }
        case TAG_ID.SCRIPT: {
          this.tokenizer.state = TokenizerMode.SCRIPT_DATA;
          break;
        }
        case TAG_ID.PLAINTEXT: {
          this.tokenizer.state = TokenizerMode.PLAINTEXT;
          break;
        }
      }
    }

_setDocumentType(token) {
      const name = token.name || "";
      const publicId = token.publicId || "";
      const systemId = token.systemId || "";
      this.treeAdapter.setDocumentType(this.document, name, publicId, systemId);
      if (token.location) {
        const documentChildren = this.treeAdapter.getChildNodes(this.document);
        const docTypeNode = documentChildren.find((node) => this.treeAdapter.isDocumentTypeNode(node));
        if (docTypeNode) {
          this.treeAdapter.setNodeSourceCodeLocation(docTypeNode, token.location);
        }
      }
    }
_attachElementToTree(element, location2) {
      if (this.options.sourceCodeLocationInfo) {
        const loc = location2 && {
          ...location2,
          startTag: location2
        };
        this.treeAdapter.setNodeSourceCodeLocation(element, loc);
      }
      if (this._shouldFosterParentOnInsertion()) {
        this._fosterParentElement(element);
      } else {
        const parent2 = this.openElements.currentTmplContentOrNode;
        this.treeAdapter.appendChild(parent2 !== null && parent2 !== void 0 ? parent2 : this.document, element);
      }
    }

_appendElement(token, namespaceURI) {
      const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
      this._attachElementToTree(element, token.location);
    }
_insertElement(token, namespaceURI) {
      const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
      this._attachElementToTree(element, token.location);
      this.openElements.push(element, token.tagID);
    }
_insertFakeElement(tagName, tagID) {
      const element = this.treeAdapter.createElement(tagName, NS.HTML, []);
      this._attachElementToTree(element, null);
      this.openElements.push(element, tagID);
    }
_insertTemplate(token) {
      const tmpl = this.treeAdapter.createElement(token.tagName, NS.HTML, token.attrs);
      const content = this.treeAdapter.createDocumentFragment();
      this.treeAdapter.setTemplateContent(tmpl, content);
      this._attachElementToTree(tmpl, token.location);
      this.openElements.push(tmpl, token.tagID);
      if (this.options.sourceCodeLocationInfo)
        this.treeAdapter.setNodeSourceCodeLocation(content, null);
    }
_insertFakeRootElement() {
      const element = this.treeAdapter.createElement(TAG_NAMES.HTML, NS.HTML, []);
      if (this.options.sourceCodeLocationInfo)
        this.treeAdapter.setNodeSourceCodeLocation(element, null);
      this.treeAdapter.appendChild(this.openElements.current, element);
      this.openElements.push(element, TAG_ID.HTML);
    }
_appendCommentNode(token, parent2) {
      const commentNode = this.treeAdapter.createCommentNode(token.data);
      this.treeAdapter.appendChild(parent2, commentNode);
      if (this.options.sourceCodeLocationInfo) {
        this.treeAdapter.setNodeSourceCodeLocation(commentNode, token.location);
      }
    }
_insertCharacters(token) {
      let parent2;
      let beforeElement;
      if (this._shouldFosterParentOnInsertion()) {
        ({ parent: parent2, beforeElement } = this._findFosterParentingLocation());
        if (beforeElement) {
          this.treeAdapter.insertTextBefore(parent2, token.chars, beforeElement);
        } else {
          this.treeAdapter.insertText(parent2, token.chars);
        }
      } else {
        parent2 = this.openElements.currentTmplContentOrNode;
        this.treeAdapter.insertText(parent2, token.chars);
      }
      if (!token.location)
        return;
      const siblings2 = this.treeAdapter.getChildNodes(parent2);
      const textNodeIdx = beforeElement ? siblings2.lastIndexOf(beforeElement) : siblings2.length;
      const textNode = siblings2[textNodeIdx - 1];
      const tnLoc = this.treeAdapter.getNodeSourceCodeLocation(textNode);
      if (tnLoc) {
        const { endLine, endCol, endOffset } = token.location;
        this.treeAdapter.updateNodeSourceCodeLocation(textNode, { endLine, endCol, endOffset });
      } else if (this.options.sourceCodeLocationInfo) {
        this.treeAdapter.setNodeSourceCodeLocation(textNode, token.location);
      }
    }
_adoptNodes(donor, recipient) {
      for (let child = this.treeAdapter.getFirstChild(donor); child; child = this.treeAdapter.getFirstChild(donor)) {
        this.treeAdapter.detachNode(child);
        this.treeAdapter.appendChild(recipient, child);
      }
    }
_setEndLocation(element, closingToken) {
      if (this.treeAdapter.getNodeSourceCodeLocation(element) && closingToken.location) {
        const ctLoc = closingToken.location;
        const tn = this.treeAdapter.getTagName(element);
        const endLoc = (

closingToken.type === TokenType.END_TAG && tn === closingToken.tagName ? {
            endTag: { ...ctLoc },
            endLine: ctLoc.endLine,
            endCol: ctLoc.endCol,
            endOffset: ctLoc.endOffset
          } : {
            endLine: ctLoc.startLine,
            endCol: ctLoc.startCol,
            endOffset: ctLoc.startOffset
          }
        );
        this.treeAdapter.updateNodeSourceCodeLocation(element, endLoc);
      }
    }
shouldProcessStartTagTokenInForeignContent(token) {
      if (!this.currentNotInHTML)
        return false;
      let current;
      let currentTagId;
      if (this.openElements.stackTop === 0 && this.fragmentContext) {
        current = this.fragmentContext;
        currentTagId = this.fragmentContextID;
      } else {
        ({ current, currentTagId } = this.openElements);
      }
      if (token.tagID === TAG_ID.SVG && this.treeAdapter.getTagName(current) === TAG_NAMES.ANNOTATION_XML && this.treeAdapter.getNamespaceURI(current) === NS.MATHML) {
        return false;
      }
      return (
this.tokenizer.inForeignNode ||

(token.tagID === TAG_ID.MGLYPH || token.tagID === TAG_ID.MALIGNMARK) && currentTagId !== void 0 && !this._isIntegrationPoint(currentTagId, current, NS.HTML)
      );
    }
_processToken(token) {
      switch (token.type) {
        case TokenType.CHARACTER: {
          this.onCharacter(token);
          break;
        }
        case TokenType.NULL_CHARACTER: {
          this.onNullCharacter(token);
          break;
        }
        case TokenType.COMMENT: {
          this.onComment(token);
          break;
        }
        case TokenType.DOCTYPE: {
          this.onDoctype(token);
          break;
        }
        case TokenType.START_TAG: {
          this._processStartTag(token);
          break;
        }
        case TokenType.END_TAG: {
          this.onEndTag(token);
          break;
        }
        case TokenType.EOF: {
          this.onEof(token);
          break;
        }
        case TokenType.WHITESPACE_CHARACTER: {
          this.onWhitespaceCharacter(token);
          break;
        }
      }
    }

_isIntegrationPoint(tid, element, foreignNS) {
      const ns = this.treeAdapter.getNamespaceURI(element);
      const attrs = this.treeAdapter.getAttrList(element);
      return isIntegrationPoint(tid, ns, attrs, foreignNS);
    }

_reconstructActiveFormattingElements() {
      const listLength = this.activeFormattingElements.entries.length;
      if (listLength) {
        const endIndex = this.activeFormattingElements.entries.findIndex((entry) => entry.type === EntryType.Marker || this.openElements.contains(entry.element));
        const unopenIdx = endIndex === -1 ? listLength - 1 : endIndex - 1;
        for (let i = unopenIdx; i >= 0; i--) {
          const entry = this.activeFormattingElements.entries[i];
          this._insertElement(entry.token, this.treeAdapter.getNamespaceURI(entry.element));
          entry.element = this.openElements.current;
        }
      }
    }

_closeTableCell() {
      this.openElements.generateImpliedEndTags();
      this.openElements.popUntilTableCellPopped();
      this.activeFormattingElements.clearToLastMarker();
      this.insertionMode = InsertionMode.IN_ROW;
    }
_closePElement() {
      this.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.P);
      this.openElements.popUntilTagNamePopped(TAG_ID.P);
    }

_resetInsertionMode() {
      for (let i = this.openElements.stackTop; i >= 0; i--) {
        switch (i === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[i]) {
          case TAG_ID.TR: {
            this.insertionMode = InsertionMode.IN_ROW;
            return;
          }
          case TAG_ID.TBODY:
          case TAG_ID.THEAD:
          case TAG_ID.TFOOT: {
            this.insertionMode = InsertionMode.IN_TABLE_BODY;
            return;
          }
          case TAG_ID.CAPTION: {
            this.insertionMode = InsertionMode.IN_CAPTION;
            return;
          }
          case TAG_ID.COLGROUP: {
            this.insertionMode = InsertionMode.IN_COLUMN_GROUP;
            return;
          }
          case TAG_ID.TABLE: {
            this.insertionMode = InsertionMode.IN_TABLE;
            return;
          }
          case TAG_ID.BODY: {
            this.insertionMode = InsertionMode.IN_BODY;
            return;
          }
          case TAG_ID.FRAMESET: {
            this.insertionMode = InsertionMode.IN_FRAMESET;
            return;
          }
          case TAG_ID.SELECT: {
            this._resetInsertionModeForSelect(i);
            return;
          }
          case TAG_ID.TEMPLATE: {
            this.insertionMode = this.tmplInsertionModeStack[0];
            return;
          }
          case TAG_ID.HTML: {
            this.insertionMode = this.headElement ? InsertionMode.AFTER_HEAD : InsertionMode.BEFORE_HEAD;
            return;
          }
          case TAG_ID.TD:
          case TAG_ID.TH: {
            if (i > 0) {
              this.insertionMode = InsertionMode.IN_CELL;
              return;
            }
            break;
          }
          case TAG_ID.HEAD: {
            if (i > 0) {
              this.insertionMode = InsertionMode.IN_HEAD;
              return;
            }
            break;
          }
        }
      }
      this.insertionMode = InsertionMode.IN_BODY;
    }
_resetInsertionModeForSelect(selectIdx) {
      if (selectIdx > 0) {
        for (let i = selectIdx - 1; i > 0; i--) {
          const tn = this.openElements.tagIDs[i];
          if (tn === TAG_ID.TEMPLATE) {
            break;
          } else if (tn === TAG_ID.TABLE) {
            this.insertionMode = InsertionMode.IN_SELECT_IN_TABLE;
            return;
          }
        }
      }
      this.insertionMode = InsertionMode.IN_SELECT;
    }

_isElementCausesFosterParenting(tn) {
      return TABLE_STRUCTURE_TAGS.has(tn);
    }
_shouldFosterParentOnInsertion() {
      return this.fosterParentingEnabled && this.openElements.currentTagId !== void 0 && this._isElementCausesFosterParenting(this.openElements.currentTagId);
    }
_findFosterParentingLocation() {
      for (let i = this.openElements.stackTop; i >= 0; i--) {
        const openElement = this.openElements.items[i];
        switch (this.openElements.tagIDs[i]) {
          case TAG_ID.TEMPLATE: {
            if (this.treeAdapter.getNamespaceURI(openElement) === NS.HTML) {
              return { parent: this.treeAdapter.getTemplateContent(openElement), beforeElement: null };
            }
            break;
          }
          case TAG_ID.TABLE: {
            const parent2 = this.treeAdapter.getParentNode(openElement);
            if (parent2) {
              return { parent: parent2, beforeElement: openElement };
            }
            return { parent: this.openElements.items[i - 1], beforeElement: null };
          }
        }
      }
      return { parent: this.openElements.items[0], beforeElement: null };
    }
_fosterParentElement(element) {
      const location2 = this._findFosterParentingLocation();
      if (location2.beforeElement) {
        this.treeAdapter.insertBefore(location2.parent, element, location2.beforeElement);
      } else {
        this.treeAdapter.appendChild(location2.parent, element);
      }
    }

_isSpecialElement(element, id) {
      const ns = this.treeAdapter.getNamespaceURI(element);
      return SPECIAL_ELEMENTS[ns].has(id);
    }
onCharacter(token) {
      this.skipNextNewLine = false;
      if (this.tokenizer.inForeignNode) {
        characterInForeignContent(this, token);
        return;
      }
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          tokenInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HTML: {
          tokenBeforeHtml(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD: {
          tokenBeforeHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD: {
          tokenInHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD_NO_SCRIPT: {
          tokenInHeadNoScript(this, token);
          break;
        }
        case InsertionMode.AFTER_HEAD: {
          tokenAfterHead(this, token);
          break;
        }
        case InsertionMode.IN_BODY:
        case InsertionMode.IN_CAPTION:
        case InsertionMode.IN_CELL:
        case InsertionMode.IN_TEMPLATE: {
          characterInBody(this, token);
          break;
        }
        case InsertionMode.TEXT:
        case InsertionMode.IN_SELECT:
        case InsertionMode.IN_SELECT_IN_TABLE: {
          this._insertCharacters(token);
          break;
        }
        case InsertionMode.IN_TABLE:
        case InsertionMode.IN_TABLE_BODY:
        case InsertionMode.IN_ROW: {
          characterInTable(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          characterInTableText(this, token);
          break;
        }
        case InsertionMode.IN_COLUMN_GROUP: {
          tokenInColumnGroup(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY: {
          tokenAfterBody(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_BODY: {
          tokenAfterAfterBody(this, token);
          break;
        }
      }
    }
onNullCharacter(token) {
      this.skipNextNewLine = false;
      if (this.tokenizer.inForeignNode) {
        nullCharacterInForeignContent(this, token);
        return;
      }
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          tokenInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HTML: {
          tokenBeforeHtml(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD: {
          tokenBeforeHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD: {
          tokenInHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD_NO_SCRIPT: {
          tokenInHeadNoScript(this, token);
          break;
        }
        case InsertionMode.AFTER_HEAD: {
          tokenAfterHead(this, token);
          break;
        }
        case InsertionMode.TEXT: {
          this._insertCharacters(token);
          break;
        }
        case InsertionMode.IN_TABLE:
        case InsertionMode.IN_TABLE_BODY:
        case InsertionMode.IN_ROW: {
          characterInTable(this, token);
          break;
        }
        case InsertionMode.IN_COLUMN_GROUP: {
          tokenInColumnGroup(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY: {
          tokenAfterBody(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_BODY: {
          tokenAfterAfterBody(this, token);
          break;
        }
      }
    }
onComment(token) {
      this.skipNextNewLine = false;
      if (this.currentNotInHTML) {
        appendComment(this, token);
        return;
      }
      switch (this.insertionMode) {
        case InsertionMode.INITIAL:
        case InsertionMode.BEFORE_HTML:
        case InsertionMode.BEFORE_HEAD:
        case InsertionMode.IN_HEAD:
        case InsertionMode.IN_HEAD_NO_SCRIPT:
        case InsertionMode.AFTER_HEAD:
        case InsertionMode.IN_BODY:
        case InsertionMode.IN_TABLE:
        case InsertionMode.IN_CAPTION:
        case InsertionMode.IN_COLUMN_GROUP:
        case InsertionMode.IN_TABLE_BODY:
        case InsertionMode.IN_ROW:
        case InsertionMode.IN_CELL:
        case InsertionMode.IN_SELECT:
        case InsertionMode.IN_SELECT_IN_TABLE:
        case InsertionMode.IN_TEMPLATE:
        case InsertionMode.IN_FRAMESET:
        case InsertionMode.AFTER_FRAMESET: {
          appendComment(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          tokenInTableText(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY: {
          appendCommentToRootHtmlElement(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_BODY:
        case InsertionMode.AFTER_AFTER_FRAMESET: {
          appendCommentToDocument(this, token);
          break;
        }
      }
    }
onDoctype(token) {
      this.skipNextNewLine = false;
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          doctypeInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD:
        case InsertionMode.IN_HEAD:
        case InsertionMode.IN_HEAD_NO_SCRIPT:
        case InsertionMode.AFTER_HEAD: {
          this._err(token, ERR.misplacedDoctype);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          tokenInTableText(this, token);
          break;
        }
      }
    }
onStartTag(token) {
      this.skipNextNewLine = false;
      this.currentToken = token;
      this._processStartTag(token);
      if (token.selfClosing && !token.ackSelfClosing) {
        this._err(token, ERR.nonVoidHtmlElementStartTagWithTrailingSolidus);
      }
    }
_processStartTag(token) {
      if (this.shouldProcessStartTagTokenInForeignContent(token)) {
        startTagInForeignContent(this, token);
      } else {
        this._startTagOutsideForeignContent(token);
      }
    }
_startTagOutsideForeignContent(token) {
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          tokenInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HTML: {
          startTagBeforeHtml(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD: {
          startTagBeforeHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD: {
          startTagInHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD_NO_SCRIPT: {
          startTagInHeadNoScript(this, token);
          break;
        }
        case InsertionMode.AFTER_HEAD: {
          startTagAfterHead(this, token);
          break;
        }
        case InsertionMode.IN_BODY: {
          startTagInBody(this, token);
          break;
        }
        case InsertionMode.IN_TABLE: {
          startTagInTable(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          tokenInTableText(this, token);
          break;
        }
        case InsertionMode.IN_CAPTION: {
          startTagInCaption(this, token);
          break;
        }
        case InsertionMode.IN_COLUMN_GROUP: {
          startTagInColumnGroup(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_BODY: {
          startTagInTableBody(this, token);
          break;
        }
        case InsertionMode.IN_ROW: {
          startTagInRow(this, token);
          break;
        }
        case InsertionMode.IN_CELL: {
          startTagInCell(this, token);
          break;
        }
        case InsertionMode.IN_SELECT: {
          startTagInSelect(this, token);
          break;
        }
        case InsertionMode.IN_SELECT_IN_TABLE: {
          startTagInSelectInTable(this, token);
          break;
        }
        case InsertionMode.IN_TEMPLATE: {
          startTagInTemplate(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY: {
          startTagAfterBody(this, token);
          break;
        }
        case InsertionMode.IN_FRAMESET: {
          startTagInFrameset(this, token);
          break;
        }
        case InsertionMode.AFTER_FRAMESET: {
          startTagAfterFrameset(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_BODY: {
          startTagAfterAfterBody(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_FRAMESET: {
          startTagAfterAfterFrameset(this, token);
          break;
        }
      }
    }
onEndTag(token) {
      this.skipNextNewLine = false;
      this.currentToken = token;
      if (this.currentNotInHTML) {
        endTagInForeignContent(this, token);
      } else {
        this._endTagOutsideForeignContent(token);
      }
    }
_endTagOutsideForeignContent(token) {
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          tokenInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HTML: {
          endTagBeforeHtml(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD: {
          endTagBeforeHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD: {
          endTagInHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD_NO_SCRIPT: {
          endTagInHeadNoScript(this, token);
          break;
        }
        case InsertionMode.AFTER_HEAD: {
          endTagAfterHead(this, token);
          break;
        }
        case InsertionMode.IN_BODY: {
          endTagInBody(this, token);
          break;
        }
        case InsertionMode.TEXT: {
          endTagInText(this, token);
          break;
        }
        case InsertionMode.IN_TABLE: {
          endTagInTable(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          tokenInTableText(this, token);
          break;
        }
        case InsertionMode.IN_CAPTION: {
          endTagInCaption(this, token);
          break;
        }
        case InsertionMode.IN_COLUMN_GROUP: {
          endTagInColumnGroup(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_BODY: {
          endTagInTableBody(this, token);
          break;
        }
        case InsertionMode.IN_ROW: {
          endTagInRow(this, token);
          break;
        }
        case InsertionMode.IN_CELL: {
          endTagInCell(this, token);
          break;
        }
        case InsertionMode.IN_SELECT: {
          endTagInSelect(this, token);
          break;
        }
        case InsertionMode.IN_SELECT_IN_TABLE: {
          endTagInSelectInTable(this, token);
          break;
        }
        case InsertionMode.IN_TEMPLATE: {
          endTagInTemplate(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY: {
          endTagAfterBody(this, token);
          break;
        }
        case InsertionMode.IN_FRAMESET: {
          endTagInFrameset(this, token);
          break;
        }
        case InsertionMode.AFTER_FRAMESET: {
          endTagAfterFrameset(this, token);
          break;
        }
        case InsertionMode.AFTER_AFTER_BODY: {
          tokenAfterAfterBody(this, token);
          break;
        }
      }
    }
onEof(token) {
      switch (this.insertionMode) {
        case InsertionMode.INITIAL: {
          tokenInInitialMode(this, token);
          break;
        }
        case InsertionMode.BEFORE_HTML: {
          tokenBeforeHtml(this, token);
          break;
        }
        case InsertionMode.BEFORE_HEAD: {
          tokenBeforeHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD: {
          tokenInHead(this, token);
          break;
        }
        case InsertionMode.IN_HEAD_NO_SCRIPT: {
          tokenInHeadNoScript(this, token);
          break;
        }
        case InsertionMode.AFTER_HEAD: {
          tokenAfterHead(this, token);
          break;
        }
        case InsertionMode.IN_BODY:
        case InsertionMode.IN_TABLE:
        case InsertionMode.IN_CAPTION:
        case InsertionMode.IN_COLUMN_GROUP:
        case InsertionMode.IN_TABLE_BODY:
        case InsertionMode.IN_ROW:
        case InsertionMode.IN_CELL:
        case InsertionMode.IN_SELECT:
        case InsertionMode.IN_SELECT_IN_TABLE: {
          eofInBody(this, token);
          break;
        }
        case InsertionMode.TEXT: {
          eofInText(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          tokenInTableText(this, token);
          break;
        }
        case InsertionMode.IN_TEMPLATE: {
          eofInTemplate(this, token);
          break;
        }
        case InsertionMode.AFTER_BODY:
        case InsertionMode.IN_FRAMESET:
        case InsertionMode.AFTER_FRAMESET:
        case InsertionMode.AFTER_AFTER_BODY:
        case InsertionMode.AFTER_AFTER_FRAMESET: {
          stopParsing(this, token);
          break;
        }
      }
    }
onWhitespaceCharacter(token) {
      if (this.skipNextNewLine) {
        this.skipNextNewLine = false;
        if (token.chars.charCodeAt(0) === CODE_POINTS.LINE_FEED) {
          if (token.chars.length === 1) {
            return;
          }
          token.chars = token.chars.substr(1);
        }
      }
      if (this.tokenizer.inForeignNode) {
        this._insertCharacters(token);
        return;
      }
      switch (this.insertionMode) {
        case InsertionMode.IN_HEAD:
        case InsertionMode.IN_HEAD_NO_SCRIPT:
        case InsertionMode.AFTER_HEAD:
        case InsertionMode.TEXT:
        case InsertionMode.IN_COLUMN_GROUP:
        case InsertionMode.IN_SELECT:
        case InsertionMode.IN_SELECT_IN_TABLE:
        case InsertionMode.IN_FRAMESET:
        case InsertionMode.AFTER_FRAMESET: {
          this._insertCharacters(token);
          break;
        }
        case InsertionMode.IN_BODY:
        case InsertionMode.IN_CAPTION:
        case InsertionMode.IN_CELL:
        case InsertionMode.IN_TEMPLATE:
        case InsertionMode.AFTER_BODY:
        case InsertionMode.AFTER_AFTER_BODY:
        case InsertionMode.AFTER_AFTER_FRAMESET: {
          whitespaceCharacterInBody(this, token);
          break;
        }
        case InsertionMode.IN_TABLE:
        case InsertionMode.IN_TABLE_BODY:
        case InsertionMode.IN_ROW: {
          characterInTable(this, token);
          break;
        }
        case InsertionMode.IN_TABLE_TEXT: {
          whitespaceCharacterInTableText(this, token);
          break;
        }
      }
    }
  }
  function aaObtainFormattingElementEntry(p, token) {
    let formattingElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(token.tagName);
    if (formattingElementEntry) {
      if (!p.openElements.contains(formattingElementEntry.element)) {
        p.activeFormattingElements.removeEntry(formattingElementEntry);
        formattingElementEntry = null;
      } else if (!p.openElements.hasInScope(token.tagID)) {
        formattingElementEntry = null;
      }
    } else {
      genericEndTagInBody(p, token);
    }
    return formattingElementEntry;
  }
  function aaObtainFurthestBlock(p, formattingElementEntry) {
    let furthestBlock = null;
    let idx = p.openElements.stackTop;
    for (; idx >= 0; idx--) {
      const element = p.openElements.items[idx];
      if (element === formattingElementEntry.element) {
        break;
      }
      if (p._isSpecialElement(element, p.openElements.tagIDs[idx])) {
        furthestBlock = element;
      }
    }
    if (!furthestBlock) {
      p.openElements.shortenToLength(Math.max(idx, 0));
      p.activeFormattingElements.removeEntry(formattingElementEntry);
    }
    return furthestBlock;
  }
  function aaInnerLoop(p, furthestBlock, formattingElement) {
    let lastElement = furthestBlock;
    let nextElement = p.openElements.getCommonAncestor(furthestBlock);
    for (let i = 0, element = nextElement; element !== formattingElement; i++, element = nextElement) {
      nextElement = p.openElements.getCommonAncestor(element);
      const elementEntry = p.activeFormattingElements.getElementEntry(element);
      const counterOverflow = elementEntry && i >= AA_INNER_LOOP_ITER;
      const shouldRemoveFromOpenElements = !elementEntry || counterOverflow;
      if (shouldRemoveFromOpenElements) {
        if (counterOverflow) {
          p.activeFormattingElements.removeEntry(elementEntry);
        }
        p.openElements.remove(element);
      } else {
        element = aaRecreateElementFromEntry(p, elementEntry);
        if (lastElement === furthestBlock) {
          p.activeFormattingElements.bookmark = elementEntry;
        }
        p.treeAdapter.detachNode(lastElement);
        p.treeAdapter.appendChild(element, lastElement);
        lastElement = element;
      }
    }
    return lastElement;
  }
  function aaRecreateElementFromEntry(p, elementEntry) {
    const ns = p.treeAdapter.getNamespaceURI(elementEntry.element);
    const newElement = p.treeAdapter.createElement(elementEntry.token.tagName, ns, elementEntry.token.attrs);
    p.openElements.replace(elementEntry.element, newElement);
    elementEntry.element = newElement;
    return newElement;
  }
  function aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement) {
    const tn = p.treeAdapter.getTagName(commonAncestor);
    const tid = getTagID(tn);
    if (p._isElementCausesFosterParenting(tid)) {
      p._fosterParentElement(lastElement);
    } else {
      const ns = p.treeAdapter.getNamespaceURI(commonAncestor);
      if (tid === TAG_ID.TEMPLATE && ns === NS.HTML) {
        commonAncestor = p.treeAdapter.getTemplateContent(commonAncestor);
      }
      p.treeAdapter.appendChild(commonAncestor, lastElement);
    }
  }
  function aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry) {
    const ns = p.treeAdapter.getNamespaceURI(formattingElementEntry.element);
    const { token } = formattingElementEntry;
    const newElement = p.treeAdapter.createElement(token.tagName, ns, token.attrs);
    p._adoptNodes(furthestBlock, newElement);
    p.treeAdapter.appendChild(furthestBlock, newElement);
    p.activeFormattingElements.insertElementAfterBookmark(newElement, token);
    p.activeFormattingElements.removeEntry(formattingElementEntry);
    p.openElements.remove(formattingElementEntry.element);
    p.openElements.insertAfter(furthestBlock, newElement, token.tagID);
  }
  function callAdoptionAgency(p, token) {
    for (let i = 0; i < AA_OUTER_LOOP_ITER; i++) {
      const formattingElementEntry = aaObtainFormattingElementEntry(p, token);
      if (!formattingElementEntry) {
        break;
      }
      const furthestBlock = aaObtainFurthestBlock(p, formattingElementEntry);
      if (!furthestBlock) {
        break;
      }
      p.activeFormattingElements.bookmark = formattingElementEntry;
      const lastElement = aaInnerLoop(p, furthestBlock, formattingElementEntry.element);
      const commonAncestor = p.openElements.getCommonAncestor(formattingElementEntry.element);
      p.treeAdapter.detachNode(lastElement);
      if (commonAncestor)
        aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement);
      aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry);
    }
  }
  function appendComment(p, token) {
    p._appendCommentNode(token, p.openElements.currentTmplContentOrNode);
  }
  function appendCommentToRootHtmlElement(p, token) {
    p._appendCommentNode(token, p.openElements.items[0]);
  }
  function appendCommentToDocument(p, token) {
    p._appendCommentNode(token, p.document);
  }
  function stopParsing(p, token) {
    p.stopped = true;
    if (token.location) {
      const target = p.fragmentContext ? 0 : 2;
      for (let i = p.openElements.stackTop; i >= target; i--) {
        p._setEndLocation(p.openElements.items[i], token);
      }
      if (!p.fragmentContext && p.openElements.stackTop >= 0) {
        const htmlElement = p.openElements.items[0];
        const htmlLocation = p.treeAdapter.getNodeSourceCodeLocation(htmlElement);
        if (htmlLocation && !htmlLocation.endTag) {
          p._setEndLocation(htmlElement, token);
          if (p.openElements.stackTop >= 1) {
            const bodyElement = p.openElements.items[1];
            const bodyLocation = p.treeAdapter.getNodeSourceCodeLocation(bodyElement);
            if (bodyLocation && !bodyLocation.endTag) {
              p._setEndLocation(bodyElement, token);
            }
          }
        }
      }
    }
  }
  function doctypeInInitialMode(p, token) {
    p._setDocumentType(token);
    const mode = token.forceQuirks ? DOCUMENT_MODE.QUIRKS : getDocumentMode(token);
    if (!isConforming(token)) {
      p._err(token, ERR.nonConformingDoctype);
    }
    p.treeAdapter.setDocumentMode(p.document, mode);
    p.insertionMode = InsertionMode.BEFORE_HTML;
  }
  function tokenInInitialMode(p, token) {
    p._err(token, ERR.missingDoctype, true);
    p.treeAdapter.setDocumentMode(p.document, DOCUMENT_MODE.QUIRKS);
    p.insertionMode = InsertionMode.BEFORE_HTML;
    p._processToken(token);
  }
  function startTagBeforeHtml(p, token) {
    if (token.tagID === TAG_ID.HTML) {
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.BEFORE_HEAD;
    } else {
      tokenBeforeHtml(p, token);
    }
  }
  function endTagBeforeHtml(p, token) {
    const tn = token.tagID;
    if (tn === TAG_ID.HTML || tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.BR) {
      tokenBeforeHtml(p, token);
    }
  }
  function tokenBeforeHtml(p, token) {
    p._insertFakeRootElement();
    p.insertionMode = InsertionMode.BEFORE_HEAD;
    p._processToken(token);
  }
  function startTagBeforeHead(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.HEAD: {
        p._insertElement(token, NS.HTML);
        p.headElement = p.openElements.current;
        p.insertionMode = InsertionMode.IN_HEAD;
        break;
      }
      default: {
        tokenBeforeHead(p, token);
      }
    }
  }
  function endTagBeforeHead(p, token) {
    const tn = token.tagID;
    if (tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.HTML || tn === TAG_ID.BR) {
      tokenBeforeHead(p, token);
    } else {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
  function tokenBeforeHead(p, token) {
    p._insertFakeElement(TAG_NAMES.HEAD, TAG_ID.HEAD);
    p.headElement = p.openElements.current;
    p.insertionMode = InsertionMode.IN_HEAD;
    p._processToken(token);
  }
  function startTagInHead(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.BASE:
      case TAG_ID.BASEFONT:
      case TAG_ID.BGSOUND:
      case TAG_ID.LINK:
      case TAG_ID.META: {
        p._appendElement(token, NS.HTML);
        token.ackSelfClosing = true;
        break;
      }
      case TAG_ID.TITLE: {
        p._switchToTextParsing(token, TokenizerMode.RCDATA);
        break;
      }
      case TAG_ID.NOSCRIPT: {
        if (p.options.scriptingEnabled) {
          p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
        } else {
          p._insertElement(token, NS.HTML);
          p.insertionMode = InsertionMode.IN_HEAD_NO_SCRIPT;
        }
        break;
      }
      case TAG_ID.NOFRAMES:
      case TAG_ID.STYLE: {
        p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
        break;
      }
      case TAG_ID.SCRIPT: {
        p._switchToTextParsing(token, TokenizerMode.SCRIPT_DATA);
        break;
      }
      case TAG_ID.TEMPLATE: {
        p._insertTemplate(token);
        p.activeFormattingElements.insertMarker();
        p.framesetOk = false;
        p.insertionMode = InsertionMode.IN_TEMPLATE;
        p.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
        break;
      }
      case TAG_ID.HEAD: {
        p._err(token, ERR.misplacedStartTagForHeadElement);
        break;
      }
      default: {
        tokenInHead(p, token);
      }
    }
  }
  function endTagInHead(p, token) {
    switch (token.tagID) {
      case TAG_ID.HEAD: {
        p.openElements.pop();
        p.insertionMode = InsertionMode.AFTER_HEAD;
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.BR:
      case TAG_ID.HTML: {
        tokenInHead(p, token);
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
      default: {
        p._err(token, ERR.endTagWithoutMatchingOpenElement);
      }
    }
  }
  function templateEndTagInHead(p, token) {
    if (p.openElements.tmplCount > 0) {
      p.openElements.generateImpliedEndTagsThoroughly();
      if (p.openElements.currentTagId !== TAG_ID.TEMPLATE) {
        p._err(token, ERR.closingOfElementWithOpenChildElements);
      }
      p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
      p.activeFormattingElements.clearToLastMarker();
      p.tmplInsertionModeStack.shift();
      p._resetInsertionMode();
    } else {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
  function tokenInHead(p, token) {
    p.openElements.pop();
    p.insertionMode = InsertionMode.AFTER_HEAD;
    p._processToken(token);
  }
  function startTagInHeadNoScript(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.BASEFONT:
      case TAG_ID.BGSOUND:
      case TAG_ID.HEAD:
      case TAG_ID.LINK:
      case TAG_ID.META:
      case TAG_ID.NOFRAMES:
      case TAG_ID.STYLE: {
        startTagInHead(p, token);
        break;
      }
      case TAG_ID.NOSCRIPT: {
        p._err(token, ERR.nestedNoscriptInHead);
        break;
      }
      default: {
        tokenInHeadNoScript(p, token);
      }
    }
  }
  function endTagInHeadNoScript(p, token) {
    switch (token.tagID) {
      case TAG_ID.NOSCRIPT: {
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_HEAD;
        break;
      }
      case TAG_ID.BR: {
        tokenInHeadNoScript(p, token);
        break;
      }
      default: {
        p._err(token, ERR.endTagWithoutMatchingOpenElement);
      }
    }
  }
  function tokenInHeadNoScript(p, token) {
    const errCode = token.type === TokenType.EOF ? ERR.openElementsLeftAfterEof : ERR.disallowedContentInNoscriptInHead;
    p._err(token, errCode);
    p.openElements.pop();
    p.insertionMode = InsertionMode.IN_HEAD;
    p._processToken(token);
  }
  function startTagAfterHead(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.BODY: {
        p._insertElement(token, NS.HTML);
        p.framesetOk = false;
        p.insertionMode = InsertionMode.IN_BODY;
        break;
      }
      case TAG_ID.FRAMESET: {
        p._insertElement(token, NS.HTML);
        p.insertionMode = InsertionMode.IN_FRAMESET;
        break;
      }
      case TAG_ID.BASE:
      case TAG_ID.BASEFONT:
      case TAG_ID.BGSOUND:
      case TAG_ID.LINK:
      case TAG_ID.META:
      case TAG_ID.NOFRAMES:
      case TAG_ID.SCRIPT:
      case TAG_ID.STYLE:
      case TAG_ID.TEMPLATE:
      case TAG_ID.TITLE: {
        p._err(token, ERR.abandonedHeadElementChild);
        p.openElements.push(p.headElement, TAG_ID.HEAD);
        startTagInHead(p, token);
        p.openElements.remove(p.headElement);
        break;
      }
      case TAG_ID.HEAD: {
        p._err(token, ERR.misplacedStartTagForHeadElement);
        break;
      }
      default: {
        tokenAfterHead(p, token);
      }
    }
  }
  function endTagAfterHead(p, token) {
    switch (token.tagID) {
      case TAG_ID.BODY:
      case TAG_ID.HTML:
      case TAG_ID.BR: {
        tokenAfterHead(p, token);
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
      default: {
        p._err(token, ERR.endTagWithoutMatchingOpenElement);
      }
    }
  }
  function tokenAfterHead(p, token) {
    p._insertFakeElement(TAG_NAMES.BODY, TAG_ID.BODY);
    p.insertionMode = InsertionMode.IN_BODY;
    modeInBody(p, token);
  }
  function modeInBody(p, token) {
    switch (token.type) {
      case TokenType.CHARACTER: {
        characterInBody(p, token);
        break;
      }
      case TokenType.WHITESPACE_CHARACTER: {
        whitespaceCharacterInBody(p, token);
        break;
      }
      case TokenType.COMMENT: {
        appendComment(p, token);
        break;
      }
      case TokenType.START_TAG: {
        startTagInBody(p, token);
        break;
      }
      case TokenType.END_TAG: {
        endTagInBody(p, token);
        break;
      }
      case TokenType.EOF: {
        eofInBody(p, token);
        break;
      }
    }
  }
  function whitespaceCharacterInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertCharacters(token);
  }
  function characterInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertCharacters(token);
    p.framesetOk = false;
  }
  function htmlStartTagInBody(p, token) {
    if (p.openElements.tmplCount === 0) {
      p.treeAdapter.adoptAttributes(p.openElements.items[0], token.attrs);
    }
  }
  function bodyStartTagInBody(p, token) {
    const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
    if (bodyElement && p.openElements.tmplCount === 0) {
      p.framesetOk = false;
      p.treeAdapter.adoptAttributes(bodyElement, token.attrs);
    }
  }
  function framesetStartTagInBody(p, token) {
    const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
    if (p.framesetOk && bodyElement) {
      p.treeAdapter.detachNode(bodyElement);
      p.openElements.popAllUpToHtmlElement();
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_FRAMESET;
    }
  }
  function addressStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
  }
  function numberedHeaderStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    if (p.openElements.currentTagId !== void 0 && NUMBERED_HEADERS.has(p.openElements.currentTagId)) {
      p.openElements.pop();
    }
    p._insertElement(token, NS.HTML);
  }
  function preStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
    p.skipNextNewLine = true;
    p.framesetOk = false;
  }
  function formStartTagInBody(p, token) {
    const inTemplate = p.openElements.tmplCount > 0;
    if (!p.formElement || inTemplate) {
      if (p.openElements.hasInButtonScope(TAG_ID.P)) {
        p._closePElement();
      }
      p._insertElement(token, NS.HTML);
      if (!inTemplate) {
        p.formElement = p.openElements.current;
      }
    }
  }
  function listItemStartTagInBody(p, token) {
    p.framesetOk = false;
    const tn = token.tagID;
    for (let i = p.openElements.stackTop; i >= 0; i--) {
      const elementId = p.openElements.tagIDs[i];
      if (tn === TAG_ID.LI && elementId === TAG_ID.LI || (tn === TAG_ID.DD || tn === TAG_ID.DT) && (elementId === TAG_ID.DD || elementId === TAG_ID.DT)) {
        p.openElements.generateImpliedEndTagsWithExclusion(elementId);
        p.openElements.popUntilTagNamePopped(elementId);
        break;
      }
      if (elementId !== TAG_ID.ADDRESS && elementId !== TAG_ID.DIV && elementId !== TAG_ID.P && p._isSpecialElement(p.openElements.items[i], elementId)) {
        break;
      }
    }
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
  }
  function plaintextStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
    p.tokenizer.state = TokenizerMode.PLAINTEXT;
  }
  function buttonStartTagInBody(p, token) {
    if (p.openElements.hasInScope(TAG_ID.BUTTON)) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilTagNamePopped(TAG_ID.BUTTON);
    }
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.framesetOk = false;
  }
  function aStartTagInBody(p, token) {
    const activeElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(TAG_NAMES.A);
    if (activeElementEntry) {
      callAdoptionAgency(p, token);
      p.openElements.remove(activeElementEntry.element);
      p.activeFormattingElements.removeEntry(activeElementEntry);
    }
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.pushElement(p.openElements.current, token);
  }
  function bStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.pushElement(p.openElements.current, token);
  }
  function nobrStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    if (p.openElements.hasInScope(TAG_ID.NOBR)) {
      callAdoptionAgency(p, token);
      p._reconstructActiveFormattingElements();
    }
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.pushElement(p.openElements.current, token);
  }
  function appletStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.insertMarker();
    p.framesetOk = false;
  }
  function tableStartTagInBody(p, token) {
    if (p.treeAdapter.getDocumentMode(p.document) !== DOCUMENT_MODE.QUIRKS && p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
    p.framesetOk = false;
    p.insertionMode = InsertionMode.IN_TABLE;
  }
  function areaStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._appendElement(token, NS.HTML);
    p.framesetOk = false;
    token.ackSelfClosing = true;
  }
  function isHiddenInput(token) {
    const inputType = getTokenAttr(token, ATTRS.TYPE);
    return inputType != null && inputType.toLowerCase() === HIDDEN_INPUT_TYPE;
  }
  function inputStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._appendElement(token, NS.HTML);
    if (!isHiddenInput(token)) {
      p.framesetOk = false;
    }
    token.ackSelfClosing = true;
  }
  function paramStartTagInBody(p, token) {
    p._appendElement(token, NS.HTML);
    token.ackSelfClosing = true;
  }
  function hrStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._appendElement(token, NS.HTML);
    p.framesetOk = false;
    token.ackSelfClosing = true;
  }
  function imageStartTagInBody(p, token) {
    token.tagName = TAG_NAMES.IMG;
    token.tagID = TAG_ID.IMG;
    areaStartTagInBody(p, token);
  }
  function textareaStartTagInBody(p, token) {
    p._insertElement(token, NS.HTML);
    p.skipNextNewLine = true;
    p.tokenizer.state = TokenizerMode.RCDATA;
    p.originalInsertionMode = p.insertionMode;
    p.framesetOk = false;
    p.insertionMode = InsertionMode.TEXT;
  }
  function xmpStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._reconstructActiveFormattingElements();
    p.framesetOk = false;
    p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
  }
  function iframeStartTagInBody(p, token) {
    p.framesetOk = false;
    p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
  }
  function rawTextStartTagInBody(p, token) {
    p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
  }
  function selectStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.framesetOk = false;
    p.insertionMode = p.insertionMode === InsertionMode.IN_TABLE || p.insertionMode === InsertionMode.IN_CAPTION || p.insertionMode === InsertionMode.IN_TABLE_BODY || p.insertionMode === InsertionMode.IN_ROW || p.insertionMode === InsertionMode.IN_CELL ? InsertionMode.IN_SELECT_IN_TABLE : InsertionMode.IN_SELECT;
  }
  function optgroupStartTagInBody(p, token) {
    if (p.openElements.currentTagId === TAG_ID.OPTION) {
      p.openElements.pop();
    }
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
  }
  function rbStartTagInBody(p, token) {
    if (p.openElements.hasInScope(TAG_ID.RUBY)) {
      p.openElements.generateImpliedEndTags();
    }
    p._insertElement(token, NS.HTML);
  }
  function rtStartTagInBody(p, token) {
    if (p.openElements.hasInScope(TAG_ID.RUBY)) {
      p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.RTC);
    }
    p._insertElement(token, NS.HTML);
  }
  function mathStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    adjustTokenMathMLAttrs(token);
    adjustTokenXMLAttrs(token);
    if (token.selfClosing) {
      p._appendElement(token, NS.MATHML);
    } else {
      p._insertElement(token, NS.MATHML);
    }
    token.ackSelfClosing = true;
  }
  function svgStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    adjustTokenSVGAttrs(token);
    adjustTokenXMLAttrs(token);
    if (token.selfClosing) {
      p._appendElement(token, NS.SVG);
    } else {
      p._insertElement(token, NS.SVG);
    }
    token.ackSelfClosing = true;
  }
  function genericStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
  }
  function startTagInBody(p, token) {
    switch (token.tagID) {
      case TAG_ID.I:
      case TAG_ID.S:
      case TAG_ID.B:
      case TAG_ID.U:
      case TAG_ID.EM:
      case TAG_ID.TT:
      case TAG_ID.BIG:
      case TAG_ID.CODE:
      case TAG_ID.FONT:
      case TAG_ID.SMALL:
      case TAG_ID.STRIKE:
      case TAG_ID.STRONG: {
        bStartTagInBody(p, token);
        break;
      }
      case TAG_ID.A: {
        aStartTagInBody(p, token);
        break;
      }
      case TAG_ID.H1:
      case TAG_ID.H2:
      case TAG_ID.H3:
      case TAG_ID.H4:
      case TAG_ID.H5:
      case TAG_ID.H6: {
        numberedHeaderStartTagInBody(p, token);
        break;
      }
      case TAG_ID.P:
      case TAG_ID.DL:
      case TAG_ID.OL:
      case TAG_ID.UL:
      case TAG_ID.DIV:
      case TAG_ID.DIR:
      case TAG_ID.NAV:
      case TAG_ID.MAIN:
      case TAG_ID.MENU:
      case TAG_ID.ASIDE:
      case TAG_ID.CENTER:
      case TAG_ID.FIGURE:
      case TAG_ID.FOOTER:
      case TAG_ID.HEADER:
      case TAG_ID.HGROUP:
      case TAG_ID.DIALOG:
      case TAG_ID.DETAILS:
      case TAG_ID.ADDRESS:
      case TAG_ID.ARTICLE:
      case TAG_ID.SEARCH:
      case TAG_ID.SECTION:
      case TAG_ID.SUMMARY:
      case TAG_ID.FIELDSET:
      case TAG_ID.BLOCKQUOTE:
      case TAG_ID.FIGCAPTION: {
        addressStartTagInBody(p, token);
        break;
      }
      case TAG_ID.LI:
      case TAG_ID.DD:
      case TAG_ID.DT: {
        listItemStartTagInBody(p, token);
        break;
      }
      case TAG_ID.BR:
      case TAG_ID.IMG:
      case TAG_ID.WBR:
      case TAG_ID.AREA:
      case TAG_ID.EMBED:
      case TAG_ID.KEYGEN: {
        areaStartTagInBody(p, token);
        break;
      }
      case TAG_ID.HR: {
        hrStartTagInBody(p, token);
        break;
      }
      case TAG_ID.RB:
      case TAG_ID.RTC: {
        rbStartTagInBody(p, token);
        break;
      }
      case TAG_ID.RT:
      case TAG_ID.RP: {
        rtStartTagInBody(p, token);
        break;
      }
      case TAG_ID.PRE:
      case TAG_ID.LISTING: {
        preStartTagInBody(p, token);
        break;
      }
      case TAG_ID.XMP: {
        xmpStartTagInBody(p, token);
        break;
      }
      case TAG_ID.SVG: {
        svgStartTagInBody(p, token);
        break;
      }
      case TAG_ID.HTML: {
        htmlStartTagInBody(p, token);
        break;
      }
      case TAG_ID.BASE:
      case TAG_ID.LINK:
      case TAG_ID.META:
      case TAG_ID.STYLE:
      case TAG_ID.TITLE:
      case TAG_ID.SCRIPT:
      case TAG_ID.BGSOUND:
      case TAG_ID.BASEFONT:
      case TAG_ID.TEMPLATE: {
        startTagInHead(p, token);
        break;
      }
      case TAG_ID.BODY: {
        bodyStartTagInBody(p, token);
        break;
      }
      case TAG_ID.FORM: {
        formStartTagInBody(p, token);
        break;
      }
      case TAG_ID.NOBR: {
        nobrStartTagInBody(p, token);
        break;
      }
      case TAG_ID.MATH: {
        mathStartTagInBody(p, token);
        break;
      }
      case TAG_ID.TABLE: {
        tableStartTagInBody(p, token);
        break;
      }
      case TAG_ID.INPUT: {
        inputStartTagInBody(p, token);
        break;
      }
      case TAG_ID.PARAM:
      case TAG_ID.TRACK:
      case TAG_ID.SOURCE: {
        paramStartTagInBody(p, token);
        break;
      }
      case TAG_ID.IMAGE: {
        imageStartTagInBody(p, token);
        break;
      }
      case TAG_ID.BUTTON: {
        buttonStartTagInBody(p, token);
        break;
      }
      case TAG_ID.APPLET:
      case TAG_ID.OBJECT:
      case TAG_ID.MARQUEE: {
        appletStartTagInBody(p, token);
        break;
      }
      case TAG_ID.IFRAME: {
        iframeStartTagInBody(p, token);
        break;
      }
      case TAG_ID.SELECT: {
        selectStartTagInBody(p, token);
        break;
      }
      case TAG_ID.OPTION:
      case TAG_ID.OPTGROUP: {
        optgroupStartTagInBody(p, token);
        break;
      }
      case TAG_ID.NOEMBED:
      case TAG_ID.NOFRAMES: {
        rawTextStartTagInBody(p, token);
        break;
      }
      case TAG_ID.FRAMESET: {
        framesetStartTagInBody(p, token);
        break;
      }
      case TAG_ID.TEXTAREA: {
        textareaStartTagInBody(p, token);
        break;
      }
      case TAG_ID.NOSCRIPT: {
        if (p.options.scriptingEnabled) {
          rawTextStartTagInBody(p, token);
        } else {
          genericStartTagInBody(p, token);
        }
        break;
      }
      case TAG_ID.PLAINTEXT: {
        plaintextStartTagInBody(p, token);
        break;
      }
      case TAG_ID.COL:
      case TAG_ID.TH:
      case TAG_ID.TD:
      case TAG_ID.TR:
      case TAG_ID.HEAD:
      case TAG_ID.FRAME:
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD:
      case TAG_ID.CAPTION:
      case TAG_ID.COLGROUP: {
        break;
      }
      default: {
        genericStartTagInBody(p, token);
      }
    }
  }
  function bodyEndTagInBody(p, token) {
    if (p.openElements.hasInScope(TAG_ID.BODY)) {
      p.insertionMode = InsertionMode.AFTER_BODY;
      if (p.options.sourceCodeLocationInfo) {
        const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
        if (bodyElement) {
          p._setEndLocation(bodyElement, token);
        }
      }
    }
  }
  function htmlEndTagInBody(p, token) {
    if (p.openElements.hasInScope(TAG_ID.BODY)) {
      p.insertionMode = InsertionMode.AFTER_BODY;
      endTagAfterBody(p, token);
    }
  }
  function addressEndTagInBody(p, token) {
    const tn = token.tagID;
    if (p.openElements.hasInScope(tn)) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilTagNamePopped(tn);
    }
  }
  function formEndTagInBody(p) {
    const inTemplate = p.openElements.tmplCount > 0;
    const { formElement } = p;
    if (!inTemplate) {
      p.formElement = null;
    }
    if ((formElement || inTemplate) && p.openElements.hasInScope(TAG_ID.FORM)) {
      p.openElements.generateImpliedEndTags();
      if (inTemplate) {
        p.openElements.popUntilTagNamePopped(TAG_ID.FORM);
      } else if (formElement) {
        p.openElements.remove(formElement);
      }
    }
  }
  function pEndTagInBody(p) {
    if (!p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._insertFakeElement(TAG_NAMES.P, TAG_ID.P);
    }
    p._closePElement();
  }
  function liEndTagInBody(p) {
    if (p.openElements.hasInListItemScope(TAG_ID.LI)) {
      p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.LI);
      p.openElements.popUntilTagNamePopped(TAG_ID.LI);
    }
  }
  function ddEndTagInBody(p, token) {
    const tn = token.tagID;
    if (p.openElements.hasInScope(tn)) {
      p.openElements.generateImpliedEndTagsWithExclusion(tn);
      p.openElements.popUntilTagNamePopped(tn);
    }
  }
  function numberedHeaderEndTagInBody(p) {
    if (p.openElements.hasNumberedHeaderInScope()) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilNumberedHeaderPopped();
    }
  }
  function appletEndTagInBody(p, token) {
    const tn = token.tagID;
    if (p.openElements.hasInScope(tn)) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilTagNamePopped(tn);
      p.activeFormattingElements.clearToLastMarker();
    }
  }
  function brEndTagInBody(p) {
    p._reconstructActiveFormattingElements();
    p._insertFakeElement(TAG_NAMES.BR, TAG_ID.BR);
    p.openElements.pop();
    p.framesetOk = false;
  }
  function genericEndTagInBody(p, token) {
    const tn = token.tagName;
    const tid = token.tagID;
    for (let i = p.openElements.stackTop; i > 0; i--) {
      const element = p.openElements.items[i];
      const elementId = p.openElements.tagIDs[i];
      if (tid === elementId && (tid !== TAG_ID.UNKNOWN || p.treeAdapter.getTagName(element) === tn)) {
        p.openElements.generateImpliedEndTagsWithExclusion(tid);
        if (p.openElements.stackTop >= i)
          p.openElements.shortenToLength(i);
        break;
      }
      if (p._isSpecialElement(element, elementId)) {
        break;
      }
    }
  }
  function endTagInBody(p, token) {
    switch (token.tagID) {
      case TAG_ID.A:
      case TAG_ID.B:
      case TAG_ID.I:
      case TAG_ID.S:
      case TAG_ID.U:
      case TAG_ID.EM:
      case TAG_ID.TT:
      case TAG_ID.BIG:
      case TAG_ID.CODE:
      case TAG_ID.FONT:
      case TAG_ID.NOBR:
      case TAG_ID.SMALL:
      case TAG_ID.STRIKE:
      case TAG_ID.STRONG: {
        callAdoptionAgency(p, token);
        break;
      }
      case TAG_ID.P: {
        pEndTagInBody(p);
        break;
      }
      case TAG_ID.DL:
      case TAG_ID.UL:
      case TAG_ID.OL:
      case TAG_ID.DIR:
      case TAG_ID.DIV:
      case TAG_ID.NAV:
      case TAG_ID.PRE:
      case TAG_ID.MAIN:
      case TAG_ID.MENU:
      case TAG_ID.ASIDE:
      case TAG_ID.BUTTON:
      case TAG_ID.CENTER:
      case TAG_ID.FIGURE:
      case TAG_ID.FOOTER:
      case TAG_ID.HEADER:
      case TAG_ID.HGROUP:
      case TAG_ID.DIALOG:
      case TAG_ID.ADDRESS:
      case TAG_ID.ARTICLE:
      case TAG_ID.DETAILS:
      case TAG_ID.SEARCH:
      case TAG_ID.SECTION:
      case TAG_ID.SUMMARY:
      case TAG_ID.LISTING:
      case TAG_ID.FIELDSET:
      case TAG_ID.BLOCKQUOTE:
      case TAG_ID.FIGCAPTION: {
        addressEndTagInBody(p, token);
        break;
      }
      case TAG_ID.LI: {
        liEndTagInBody(p);
        break;
      }
      case TAG_ID.DD:
      case TAG_ID.DT: {
        ddEndTagInBody(p, token);
        break;
      }
      case TAG_ID.H1:
      case TAG_ID.H2:
      case TAG_ID.H3:
      case TAG_ID.H4:
      case TAG_ID.H5:
      case TAG_ID.H6: {
        numberedHeaderEndTagInBody(p);
        break;
      }
      case TAG_ID.BR: {
        brEndTagInBody(p);
        break;
      }
      case TAG_ID.BODY: {
        bodyEndTagInBody(p, token);
        break;
      }
      case TAG_ID.HTML: {
        htmlEndTagInBody(p, token);
        break;
      }
      case TAG_ID.FORM: {
        formEndTagInBody(p);
        break;
      }
      case TAG_ID.APPLET:
      case TAG_ID.OBJECT:
      case TAG_ID.MARQUEE: {
        appletEndTagInBody(p, token);
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
      default: {
        genericEndTagInBody(p, token);
      }
    }
  }
  function eofInBody(p, token) {
    if (p.tmplInsertionModeStack.length > 0) {
      eofInTemplate(p, token);
    } else {
      stopParsing(p, token);
    }
  }
  function endTagInText(p, token) {
    var _a2;
    if (token.tagID === TAG_ID.SCRIPT) {
      (_a2 = p.scriptHandler) === null || _a2 === void 0 ? void 0 : _a2.call(p, p.openElements.current);
    }
    p.openElements.pop();
    p.insertionMode = p.originalInsertionMode;
  }
  function eofInText(p, token) {
    p._err(token, ERR.eofInElementThatCanContainOnlyText);
    p.openElements.pop();
    p.insertionMode = p.originalInsertionMode;
    p.onEof(token);
  }
  function characterInTable(p, token) {
    if (p.openElements.currentTagId !== void 0 && TABLE_STRUCTURE_TAGS.has(p.openElements.currentTagId)) {
      p.pendingCharacterTokens.length = 0;
      p.hasNonWhitespacePendingCharacterToken = false;
      p.originalInsertionMode = p.insertionMode;
      p.insertionMode = InsertionMode.IN_TABLE_TEXT;
      switch (token.type) {
        case TokenType.CHARACTER: {
          characterInTableText(p, token);
          break;
        }
        case TokenType.WHITESPACE_CHARACTER: {
          whitespaceCharacterInTableText(p, token);
          break;
        }
      }
    } else {
      tokenInTable(p, token);
    }
  }
  function captionStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p.activeFormattingElements.insertMarker();
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.IN_CAPTION;
  }
  function colgroupStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
  }
  function colStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertFakeElement(TAG_NAMES.COLGROUP, TAG_ID.COLGROUP);
    p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
    startTagInColumnGroup(p, token);
  }
  function tbodyStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.IN_TABLE_BODY;
  }
  function tdStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertFakeElement(TAG_NAMES.TBODY, TAG_ID.TBODY);
    p.insertionMode = InsertionMode.IN_TABLE_BODY;
    startTagInTableBody(p, token);
  }
  function tableStartTagInTable(p, token) {
    if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
      p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
      p._resetInsertionMode();
      p._processStartTag(token);
    }
  }
  function inputStartTagInTable(p, token) {
    if (isHiddenInput(token)) {
      p._appendElement(token, NS.HTML);
    } else {
      tokenInTable(p, token);
    }
    token.ackSelfClosing = true;
  }
  function formStartTagInTable(p, token) {
    if (!p.formElement && p.openElements.tmplCount === 0) {
      p._insertElement(token, NS.HTML);
      p.formElement = p.openElements.current;
      p.openElements.pop();
    }
  }
  function startTagInTable(p, token) {
    switch (token.tagID) {
      case TAG_ID.TD:
      case TAG_ID.TH:
      case TAG_ID.TR: {
        tdStartTagInTable(p, token);
        break;
      }
      case TAG_ID.STYLE:
      case TAG_ID.SCRIPT:
      case TAG_ID.TEMPLATE: {
        startTagInHead(p, token);
        break;
      }
      case TAG_ID.COL: {
        colStartTagInTable(p, token);
        break;
      }
      case TAG_ID.FORM: {
        formStartTagInTable(p, token);
        break;
      }
      case TAG_ID.TABLE: {
        tableStartTagInTable(p, token);
        break;
      }
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD: {
        tbodyStartTagInTable(p, token);
        break;
      }
      case TAG_ID.INPUT: {
        inputStartTagInTable(p, token);
        break;
      }
      case TAG_ID.CAPTION: {
        captionStartTagInTable(p, token);
        break;
      }
      case TAG_ID.COLGROUP: {
        colgroupStartTagInTable(p, token);
        break;
      }
      default: {
        tokenInTable(p, token);
      }
    }
  }
  function endTagInTable(p, token) {
    switch (token.tagID) {
      case TAG_ID.TABLE: {
        if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
          p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
          p._resetInsertionMode();
        }
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.HTML:
      case TAG_ID.TBODY:
      case TAG_ID.TD:
      case TAG_ID.TFOOT:
      case TAG_ID.TH:
      case TAG_ID.THEAD:
      case TAG_ID.TR: {
        break;
      }
      default: {
        tokenInTable(p, token);
      }
    }
  }
  function tokenInTable(p, token) {
    const savedFosterParentingState = p.fosterParentingEnabled;
    p.fosterParentingEnabled = true;
    modeInBody(p, token);
    p.fosterParentingEnabled = savedFosterParentingState;
  }
  function whitespaceCharacterInTableText(p, token) {
    p.pendingCharacterTokens.push(token);
  }
  function characterInTableText(p, token) {
    p.pendingCharacterTokens.push(token);
    p.hasNonWhitespacePendingCharacterToken = true;
  }
  function tokenInTableText(p, token) {
    let i = 0;
    if (p.hasNonWhitespacePendingCharacterToken) {
      for (; i < p.pendingCharacterTokens.length; i++) {
        tokenInTable(p, p.pendingCharacterTokens[i]);
      }
    } else {
      for (; i < p.pendingCharacterTokens.length; i++) {
        p._insertCharacters(p.pendingCharacterTokens[i]);
      }
    }
    p.insertionMode = p.originalInsertionMode;
    p._processToken(token);
  }
  const TABLE_VOID_ELEMENTS = new Set([TAG_ID.CAPTION, TAG_ID.COL, TAG_ID.COLGROUP, TAG_ID.TBODY, TAG_ID.TD, TAG_ID.TFOOT, TAG_ID.TH, TAG_ID.THEAD, TAG_ID.TR]);
  function startTagInCaption(p, token) {
    const tn = token.tagID;
    if (TABLE_VOID_ELEMENTS.has(tn)) {
      if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
        p.openElements.generateImpliedEndTags();
        p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
        p.activeFormattingElements.clearToLastMarker();
        p.insertionMode = InsertionMode.IN_TABLE;
        startTagInTable(p, token);
      }
    } else {
      startTagInBody(p, token);
    }
  }
  function endTagInCaption(p, token) {
    const tn = token.tagID;
    switch (tn) {
      case TAG_ID.CAPTION:
      case TAG_ID.TABLE: {
        if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
          p.openElements.generateImpliedEndTags();
          p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
          p.activeFormattingElements.clearToLastMarker();
          p.insertionMode = InsertionMode.IN_TABLE;
          if (tn === TAG_ID.TABLE) {
            endTagInTable(p, token);
          }
        }
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.HTML:
      case TAG_ID.TBODY:
      case TAG_ID.TD:
      case TAG_ID.TFOOT:
      case TAG_ID.TH:
      case TAG_ID.THEAD:
      case TAG_ID.TR: {
        break;
      }
      default: {
        endTagInBody(p, token);
      }
    }
  }
  function startTagInColumnGroup(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.COL: {
        p._appendElement(token, NS.HTML);
        token.ackSelfClosing = true;
        break;
      }
      case TAG_ID.TEMPLATE: {
        startTagInHead(p, token);
        break;
      }
      default: {
        tokenInColumnGroup(p, token);
      }
    }
  }
  function endTagInColumnGroup(p, token) {
    switch (token.tagID) {
      case TAG_ID.COLGROUP: {
        if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE;
        }
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
      case TAG_ID.COL: {
        break;
      }
      default: {
        tokenInColumnGroup(p, token);
      }
    }
  }
  function tokenInColumnGroup(p, token) {
    if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
      p.openElements.pop();
      p.insertionMode = InsertionMode.IN_TABLE;
      p._processToken(token);
    }
  }
  function startTagInTableBody(p, token) {
    switch (token.tagID) {
      case TAG_ID.TR: {
        p.openElements.clearBackToTableBodyContext();
        p._insertElement(token, NS.HTML);
        p.insertionMode = InsertionMode.IN_ROW;
        break;
      }
      case TAG_ID.TH:
      case TAG_ID.TD: {
        p.openElements.clearBackToTableBodyContext();
        p._insertFakeElement(TAG_NAMES.TR, TAG_ID.TR);
        p.insertionMode = InsertionMode.IN_ROW;
        startTagInRow(p, token);
        break;
      }
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD: {
        if (p.openElements.hasTableBodyContextInTableScope()) {
          p.openElements.clearBackToTableBodyContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE;
          startTagInTable(p, token);
        }
        break;
      }
      default: {
        startTagInTable(p, token);
      }
    }
  }
  function endTagInTableBody(p, token) {
    const tn = token.tagID;
    switch (token.tagID) {
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD: {
        if (p.openElements.hasInTableScope(tn)) {
          p.openElements.clearBackToTableBodyContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE;
        }
        break;
      }
      case TAG_ID.TABLE: {
        if (p.openElements.hasTableBodyContextInTableScope()) {
          p.openElements.clearBackToTableBodyContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE;
          endTagInTable(p, token);
        }
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.HTML:
      case TAG_ID.TD:
      case TAG_ID.TH:
      case TAG_ID.TR: {
        break;
      }
      default: {
        endTagInTable(p, token);
      }
    }
  }
  function startTagInRow(p, token) {
    switch (token.tagID) {
      case TAG_ID.TH:
      case TAG_ID.TD: {
        p.openElements.clearBackToTableRowContext();
        p._insertElement(token, NS.HTML);
        p.insertionMode = InsertionMode.IN_CELL;
        p.activeFormattingElements.insertMarker();
        break;
      }
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD:
      case TAG_ID.TR: {
        if (p.openElements.hasInTableScope(TAG_ID.TR)) {
          p.openElements.clearBackToTableRowContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE_BODY;
          startTagInTableBody(p, token);
        }
        break;
      }
      default: {
        startTagInTable(p, token);
      }
    }
  }
  function endTagInRow(p, token) {
    switch (token.tagID) {
      case TAG_ID.TR: {
        if (p.openElements.hasInTableScope(TAG_ID.TR)) {
          p.openElements.clearBackToTableRowContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE_BODY;
        }
        break;
      }
      case TAG_ID.TABLE: {
        if (p.openElements.hasInTableScope(TAG_ID.TR)) {
          p.openElements.clearBackToTableRowContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE_BODY;
          endTagInTableBody(p, token);
        }
        break;
      }
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD: {
        if (p.openElements.hasInTableScope(token.tagID) || p.openElements.hasInTableScope(TAG_ID.TR)) {
          p.openElements.clearBackToTableRowContext();
          p.openElements.pop();
          p.insertionMode = InsertionMode.IN_TABLE_BODY;
          endTagInTableBody(p, token);
        }
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.HTML:
      case TAG_ID.TD:
      case TAG_ID.TH: {
        break;
      }
      default: {
        endTagInTable(p, token);
      }
    }
  }
  function startTagInCell(p, token) {
    const tn = token.tagID;
    if (TABLE_VOID_ELEMENTS.has(tn)) {
      if (p.openElements.hasInTableScope(TAG_ID.TD) || p.openElements.hasInTableScope(TAG_ID.TH)) {
        p._closeTableCell();
        startTagInRow(p, token);
      }
    } else {
      startTagInBody(p, token);
    }
  }
  function endTagInCell(p, token) {
    const tn = token.tagID;
    switch (tn) {
      case TAG_ID.TD:
      case TAG_ID.TH: {
        if (p.openElements.hasInTableScope(tn)) {
          p.openElements.generateImpliedEndTags();
          p.openElements.popUntilTagNamePopped(tn);
          p.activeFormattingElements.clearToLastMarker();
          p.insertionMode = InsertionMode.IN_ROW;
        }
        break;
      }
      case TAG_ID.TABLE:
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD:
      case TAG_ID.TR: {
        if (p.openElements.hasInTableScope(tn)) {
          p._closeTableCell();
          endTagInRow(p, token);
        }
        break;
      }
      case TAG_ID.BODY:
      case TAG_ID.CAPTION:
      case TAG_ID.COL:
      case TAG_ID.COLGROUP:
      case TAG_ID.HTML: {
        break;
      }
      default: {
        endTagInBody(p, token);
      }
    }
  }
  function startTagInSelect(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.OPTION: {
        if (p.openElements.currentTagId === TAG_ID.OPTION) {
          p.openElements.pop();
        }
        p._insertElement(token, NS.HTML);
        break;
      }
      case TAG_ID.OPTGROUP: {
        if (p.openElements.currentTagId === TAG_ID.OPTION) {
          p.openElements.pop();
        }
        if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
          p.openElements.pop();
        }
        p._insertElement(token, NS.HTML);
        break;
      }
      case TAG_ID.HR: {
        if (p.openElements.currentTagId === TAG_ID.OPTION) {
          p.openElements.pop();
        }
        if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
          p.openElements.pop();
        }
        p._appendElement(token, NS.HTML);
        token.ackSelfClosing = true;
        break;
      }
      case TAG_ID.INPUT:
      case TAG_ID.KEYGEN:
      case TAG_ID.TEXTAREA:
      case TAG_ID.SELECT: {
        if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
          p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
          p._resetInsertionMode();
          if (token.tagID !== TAG_ID.SELECT) {
            p._processStartTag(token);
          }
        }
        break;
      }
      case TAG_ID.SCRIPT:
      case TAG_ID.TEMPLATE: {
        startTagInHead(p, token);
        break;
      }
    }
  }
  function endTagInSelect(p, token) {
    switch (token.tagID) {
      case TAG_ID.OPTGROUP: {
        if (p.openElements.stackTop > 0 && p.openElements.currentTagId === TAG_ID.OPTION && p.openElements.tagIDs[p.openElements.stackTop - 1] === TAG_ID.OPTGROUP) {
          p.openElements.pop();
        }
        if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
          p.openElements.pop();
        }
        break;
      }
      case TAG_ID.OPTION: {
        if (p.openElements.currentTagId === TAG_ID.OPTION) {
          p.openElements.pop();
        }
        break;
      }
      case TAG_ID.SELECT: {
        if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
          p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
          p._resetInsertionMode();
        }
        break;
      }
      case TAG_ID.TEMPLATE: {
        templateEndTagInHead(p, token);
        break;
      }
    }
  }
  function startTagInSelectInTable(p, token) {
    const tn = token.tagID;
    if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
      p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
      p._resetInsertionMode();
      p._processStartTag(token);
    } else {
      startTagInSelect(p, token);
    }
  }
  function endTagInSelectInTable(p, token) {
    const tn = token.tagID;
    if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
      if (p.openElements.hasInTableScope(tn)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
        p._resetInsertionMode();
        p.onEndTag(token);
      }
    } else {
      endTagInSelect(p, token);
    }
  }
  function startTagInTemplate(p, token) {
    switch (token.tagID) {
case TAG_ID.BASE:
      case TAG_ID.BASEFONT:
      case TAG_ID.BGSOUND:
      case TAG_ID.LINK:
      case TAG_ID.META:
      case TAG_ID.NOFRAMES:
      case TAG_ID.SCRIPT:
      case TAG_ID.STYLE:
      case TAG_ID.TEMPLATE:
      case TAG_ID.TITLE: {
        startTagInHead(p, token);
        break;
      }
case TAG_ID.CAPTION:
      case TAG_ID.COLGROUP:
      case TAG_ID.TBODY:
      case TAG_ID.TFOOT:
      case TAG_ID.THEAD: {
        p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE;
        p.insertionMode = InsertionMode.IN_TABLE;
        startTagInTable(p, token);
        break;
      }
      case TAG_ID.COL: {
        p.tmplInsertionModeStack[0] = InsertionMode.IN_COLUMN_GROUP;
        p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
        startTagInColumnGroup(p, token);
        break;
      }
      case TAG_ID.TR: {
        p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE_BODY;
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        startTagInTableBody(p, token);
        break;
      }
      case TAG_ID.TD:
      case TAG_ID.TH: {
        p.tmplInsertionModeStack[0] = InsertionMode.IN_ROW;
        p.insertionMode = InsertionMode.IN_ROW;
        startTagInRow(p, token);
        break;
      }
      default: {
        p.tmplInsertionModeStack[0] = InsertionMode.IN_BODY;
        p.insertionMode = InsertionMode.IN_BODY;
        startTagInBody(p, token);
      }
    }
  }
  function endTagInTemplate(p, token) {
    if (token.tagID === TAG_ID.TEMPLATE) {
      templateEndTagInHead(p, token);
    }
  }
  function eofInTemplate(p, token) {
    if (p.openElements.tmplCount > 0) {
      p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
      p.activeFormattingElements.clearToLastMarker();
      p.tmplInsertionModeStack.shift();
      p._resetInsertionMode();
      p.onEof(token);
    } else {
      stopParsing(p, token);
    }
  }
  function startTagAfterBody(p, token) {
    if (token.tagID === TAG_ID.HTML) {
      startTagInBody(p, token);
    } else {
      tokenAfterBody(p, token);
    }
  }
  function endTagAfterBody(p, token) {
    var _a2;
    if (token.tagID === TAG_ID.HTML) {
      if (!p.fragmentContext) {
        p.insertionMode = InsertionMode.AFTER_AFTER_BODY;
      }
      if (p.options.sourceCodeLocationInfo && p.openElements.tagIDs[0] === TAG_ID.HTML) {
        p._setEndLocation(p.openElements.items[0], token);
        const bodyElement = p.openElements.items[1];
        if (bodyElement && !((_a2 = p.treeAdapter.getNodeSourceCodeLocation(bodyElement)) === null || _a2 === void 0 ? void 0 : _a2.endTag)) {
          p._setEndLocation(bodyElement, token);
        }
      }
    } else {
      tokenAfterBody(p, token);
    }
  }
  function tokenAfterBody(p, token) {
    p.insertionMode = InsertionMode.IN_BODY;
    modeInBody(p, token);
  }
  function startTagInFrameset(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.FRAMESET: {
        p._insertElement(token, NS.HTML);
        break;
      }
      case TAG_ID.FRAME: {
        p._appendElement(token, NS.HTML);
        token.ackSelfClosing = true;
        break;
      }
      case TAG_ID.NOFRAMES: {
        startTagInHead(p, token);
        break;
      }
    }
  }
  function endTagInFrameset(p, token) {
    if (token.tagID === TAG_ID.FRAMESET && !p.openElements.isRootHtmlElementCurrent()) {
      p.openElements.pop();
      if (!p.fragmentContext && p.openElements.currentTagId !== TAG_ID.FRAMESET) {
        p.insertionMode = InsertionMode.AFTER_FRAMESET;
      }
    }
  }
  function startTagAfterFrameset(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.NOFRAMES: {
        startTagInHead(p, token);
        break;
      }
    }
  }
  function endTagAfterFrameset(p, token) {
    if (token.tagID === TAG_ID.HTML) {
      p.insertionMode = InsertionMode.AFTER_AFTER_FRAMESET;
    }
  }
  function startTagAfterAfterBody(p, token) {
    if (token.tagID === TAG_ID.HTML) {
      startTagInBody(p, token);
    } else {
      tokenAfterAfterBody(p, token);
    }
  }
  function tokenAfterAfterBody(p, token) {
    p.insertionMode = InsertionMode.IN_BODY;
    modeInBody(p, token);
  }
  function startTagAfterAfterFrameset(p, token) {
    switch (token.tagID) {
      case TAG_ID.HTML: {
        startTagInBody(p, token);
        break;
      }
      case TAG_ID.NOFRAMES: {
        startTagInHead(p, token);
        break;
      }
    }
  }
  function nullCharacterInForeignContent(p, token) {
    token.chars = REPLACEMENT_CHARACTER;
    p._insertCharacters(token);
  }
  function characterInForeignContent(p, token) {
    p._insertCharacters(token);
    p.framesetOk = false;
  }
  function popUntilHtmlOrIntegrationPoint(p) {
    while (p.treeAdapter.getNamespaceURI(p.openElements.current) !== NS.HTML && p.openElements.currentTagId !== void 0 && !p._isIntegrationPoint(p.openElements.currentTagId, p.openElements.current)) {
      p.openElements.pop();
    }
  }
  function startTagInForeignContent(p, token) {
    if (causesExit(token)) {
      popUntilHtmlOrIntegrationPoint(p);
      p._startTagOutsideForeignContent(token);
    } else {
      const current = p._getAdjustedCurrentElement();
      const currentNs = p.treeAdapter.getNamespaceURI(current);
      if (currentNs === NS.MATHML) {
        adjustTokenMathMLAttrs(token);
      } else if (currentNs === NS.SVG) {
        adjustTokenSVGTagName(token);
        adjustTokenSVGAttrs(token);
      }
      adjustTokenXMLAttrs(token);
      if (token.selfClosing) {
        p._appendElement(token, currentNs);
      } else {
        p._insertElement(token, currentNs);
      }
      token.ackSelfClosing = true;
    }
  }
  function endTagInForeignContent(p, token) {
    if (token.tagID === TAG_ID.P || token.tagID === TAG_ID.BR) {
      popUntilHtmlOrIntegrationPoint(p);
      p._endTagOutsideForeignContent(token);
      return;
    }
    for (let i = p.openElements.stackTop; i > 0; i--) {
      const element = p.openElements.items[i];
      if (p.treeAdapter.getNamespaceURI(element) === NS.HTML) {
        p._endTagOutsideForeignContent(token);
        break;
      }
      const tagName = p.treeAdapter.getTagName(element);
      if (tagName.toLowerCase() === token.tagName) {
        token.tagName = tagName;
        p.openElements.shortenToLength(i);
        break;
      }
    }
  }
  function getEscaper(regex, map2) {
    return function escape(data2) {
      let match;
      let lastIndex = 0;
      let result = "";
      while (match = regex.exec(data2)) {
        if (lastIndex !== match.index) {
          result += data2.substring(lastIndex, match.index);
        }
        result += map2.get(match[0].charCodeAt(0));
        lastIndex = match.index + 1;
      }
      return result + data2.substring(lastIndex);
    };
  }
  const escapeAttribute = getEscaper(/["&\u00A0]/g, new Map([
    [34, "&quot;"],
    [38, "&amp;"],
    [160, "&nbsp;"]
  ]));
  const escapeText = getEscaper(/[&<>\u00A0]/g, new Map([
    [38, "&amp;"],
    [60, "&lt;"],
    [62, "&gt;"],
    [160, "&nbsp;"]
  ]));
  const VOID_ELEMENTS = new Set([
    TAG_NAMES.AREA,
    TAG_NAMES.BASE,
    TAG_NAMES.BASEFONT,
    TAG_NAMES.BGSOUND,
    TAG_NAMES.BR,
    TAG_NAMES.COL,
    TAG_NAMES.EMBED,
    TAG_NAMES.FRAME,
    TAG_NAMES.HR,
    TAG_NAMES.IMG,
    TAG_NAMES.INPUT,
    TAG_NAMES.KEYGEN,
    TAG_NAMES.LINK,
    TAG_NAMES.META,
    TAG_NAMES.PARAM,
    TAG_NAMES.SOURCE,
    TAG_NAMES.TRACK,
    TAG_NAMES.WBR
  ]);
  function isVoidElement(node, options) {
    return options.treeAdapter.isElementNode(node) && options.treeAdapter.getNamespaceURI(node) === NS.HTML && VOID_ELEMENTS.has(options.treeAdapter.getTagName(node));
  }
  const defaultOpts = { treeAdapter: defaultTreeAdapter, scriptingEnabled: true };
  function serializeOuter(node, options) {
    const opts = { ...defaultOpts, ...options };
    return serializeNode(node, opts);
  }
  function serializeChildNodes(parentNode, options) {
    let html2 = "";
    const container = options.treeAdapter.isElementNode(parentNode) && options.treeAdapter.getTagName(parentNode) === TAG_NAMES.TEMPLATE && options.treeAdapter.getNamespaceURI(parentNode) === NS.HTML ? options.treeAdapter.getTemplateContent(parentNode) : parentNode;
    const childNodes = options.treeAdapter.getChildNodes(container);
    if (childNodes) {
      for (const currentNode of childNodes) {
        html2 += serializeNode(currentNode, options);
      }
    }
    return html2;
  }
  function serializeNode(node, options) {
    if (options.treeAdapter.isElementNode(node)) {
      return serializeElement(node, options);
    }
    if (options.treeAdapter.isTextNode(node)) {
      return serializeTextNode(node, options);
    }
    if (options.treeAdapter.isCommentNode(node)) {
      return serializeCommentNode(node, options);
    }
    if (options.treeAdapter.isDocumentTypeNode(node)) {
      return serializeDocumentTypeNode(node, options);
    }
    return "";
  }
  function serializeElement(node, options) {
    const tn = options.treeAdapter.getTagName(node);
    return `<${tn}${serializeAttributes(node, options)}>${isVoidElement(node, options) ? "" : `${serializeChildNodes(node, options)}</${tn}>`}`;
  }
  function serializeAttributes(node, { treeAdapter }) {
    let html2 = "";
    for (const attr2 of treeAdapter.getAttrList(node)) {
      html2 += " ";
      if (attr2.namespace) {
        switch (attr2.namespace) {
          case NS.XML: {
            html2 += `xml:${attr2.name}`;
            break;
          }
          case NS.XMLNS: {
            if (attr2.name !== "xmlns") {
              html2 += "xmlns:";
            }
            html2 += attr2.name;
            break;
          }
          case NS.XLINK: {
            html2 += `xlink:${attr2.name}`;
            break;
          }
          default: {
            html2 += `${attr2.prefix}:${attr2.name}`;
          }
        }
      } else {
        html2 += attr2.name;
      }
      html2 += `="${escapeAttribute(attr2.value)}"`;
    }
    return html2;
  }
  function serializeTextNode(node, options) {
    const { treeAdapter } = options;
    const content = treeAdapter.getTextNodeContent(node);
    const parent2 = treeAdapter.getParentNode(node);
    const parentTn = parent2 && treeAdapter.isElementNode(parent2) && treeAdapter.getTagName(parent2);
    return parentTn && treeAdapter.getNamespaceURI(parent2) === NS.HTML && hasUnescapedText(parentTn, options.scriptingEnabled) ? content : escapeText(content);
  }
  function serializeCommentNode(node, { treeAdapter }) {
    return `<!--${treeAdapter.getCommentNodeContent(node)}-->`;
  }
  function serializeDocumentTypeNode(node, { treeAdapter }) {
    return `<!DOCTYPE ${treeAdapter.getDocumentTypeNodeName(node)}>`;
  }
  function parse$3(html2, options) {
    return Parser2.parse(html2, options);
  }
  function parseFragment(fragmentContext, html2, options) {
    if (typeof fragmentContext === "string") {
      options = html2;
      html2 = fragmentContext;
      fragmentContext = null;
    }
    const parser = Parser2.getFragmentParser(fragmentContext, options);
    parser.tokenizer.write(html2, true);
    return parser.getFragment();
  }
  function enquoteDoctypeId(id) {
    const quote = id.includes('"') ? "'" : '"';
    return quote + id + quote;
  }
  function serializeDoctypeContent(name, publicId, systemId) {
    let str = "!DOCTYPE ";
    if (name) {
      str += name;
    }
    if (publicId) {
      str += ` PUBLIC ${enquoteDoctypeId(publicId)}`;
    } else if (systemId) {
      str += " SYSTEM";
    }
    if (systemId) {
      str += ` ${enquoteDoctypeId(systemId)}`;
    }
    return str;
  }
  const adapter = {
isCommentNode: isComment,
    isElementNode: isTag,
    isTextNode: isText,
createDocument() {
      const node = new Document([]);
      node["x-mode"] = DOCUMENT_MODE.NO_QUIRKS;
      return node;
    },
    createDocumentFragment() {
      return new Document([]);
    },
    createElement(tagName, namespaceURI, attrs) {
      const attribs = Object.create(null);
      const attribsNamespace = Object.create(null);
      const attribsPrefix = Object.create(null);
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name;
        attribs[attrName] = attrs[i].value;
        attribsNamespace[attrName] = attrs[i].namespace;
        attribsPrefix[attrName] = attrs[i].prefix;
      }
      const node = new Element(tagName, attribs, []);
      node.namespace = namespaceURI;
      node["x-attribsNamespace"] = attribsNamespace;
      node["x-attribsPrefix"] = attribsPrefix;
      return node;
    },
    createCommentNode(data2) {
      return new Comment(data2);
    },
    createTextNode(value) {
      return new Text(value);
    },
appendChild(parentNode, newNode) {
      const prev2 = parentNode.children[parentNode.children.length - 1];
      if (prev2) {
        prev2.next = newNode;
        newNode.prev = prev2;
      }
      parentNode.children.push(newNode);
      newNode.parent = parentNode;
    },
    insertBefore(parentNode, newNode, referenceNode) {
      const insertionIdx = parentNode.children.indexOf(referenceNode);
      const { prev: prev2 } = referenceNode;
      if (prev2) {
        prev2.next = newNode;
        newNode.prev = prev2;
      }
      referenceNode.prev = newNode;
      newNode.next = referenceNode;
      parentNode.children.splice(insertionIdx, 0, newNode);
      newNode.parent = parentNode;
    },
    setTemplateContent(templateElement, contentElement) {
      adapter.appendChild(templateElement, contentElement);
    },
    getTemplateContent(templateElement) {
      return templateElement.children[0];
    },
    setDocumentType(document2, name, publicId, systemId) {
      const data2 = serializeDoctypeContent(name, publicId, systemId);
      let doctypeNode = document2.children.find((node) => isDirective(node) && node.name === "!doctype");
      if (doctypeNode) {
        doctypeNode.data = data2 !== null && data2 !== void 0 ? data2 : null;
      } else {
        doctypeNode = new ProcessingInstruction("!doctype", data2);
        adapter.appendChild(document2, doctypeNode);
      }
      doctypeNode["x-name"] = name;
      doctypeNode["x-publicId"] = publicId;
      doctypeNode["x-systemId"] = systemId;
    },
    setDocumentMode(document2, mode) {
      document2["x-mode"] = mode;
    },
    getDocumentMode(document2) {
      return document2["x-mode"];
    },
    detachNode(node) {
      if (node.parent) {
        const idx = node.parent.children.indexOf(node);
        const { prev: prev2, next: next2 } = node;
        node.prev = null;
        node.next = null;
        if (prev2) {
          prev2.next = next2;
        }
        if (next2) {
          next2.prev = prev2;
        }
        node.parent.children.splice(idx, 1);
        node.parent = null;
      }
    },
    insertText(parentNode, text2) {
      const lastChild = parentNode.children[parentNode.children.length - 1];
      if (lastChild && isText(lastChild)) {
        lastChild.data += text2;
      } else {
        adapter.appendChild(parentNode, adapter.createTextNode(text2));
      }
    },
    insertTextBefore(parentNode, text2, referenceNode) {
      const prevNode = parentNode.children[parentNode.children.indexOf(referenceNode) - 1];
      if (prevNode && isText(prevNode)) {
        prevNode.data += text2;
      } else {
        adapter.insertBefore(parentNode, adapter.createTextNode(text2), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name;
        if (recipient.attribs[attrName] === void 0) {
          recipient.attribs[attrName] = attrs[i].value;
          recipient["x-attribsNamespace"][attrName] = attrs[i].namespace;
          recipient["x-attribsPrefix"][attrName] = attrs[i].prefix;
        }
      }
    },
getFirstChild(node) {
      return node.children[0];
    },
    getChildNodes(node) {
      return node.children;
    },
    getParentNode(node) {
      return node.parent;
    },
    getAttrList(element) {
      return element.attributes;
    },
getTagName(element) {
      return element.name;
    },
    getNamespaceURI(element) {
      return element.namespace;
    },
    getTextNodeContent(textNode) {
      return textNode.data;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.data;
    },
    getDocumentTypeNodeName(doctypeNode) {
      var _a2;
      return (_a2 = doctypeNode["x-name"]) !== null && _a2 !== void 0 ? _a2 : "";
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      var _a2;
      return (_a2 = doctypeNode["x-publicId"]) !== null && _a2 !== void 0 ? _a2 : "";
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      var _a2;
      return (_a2 = doctypeNode["x-systemId"]) !== null && _a2 !== void 0 ? _a2 : "";
    },
isDocumentTypeNode(node) {
      return isDirective(node) && node.name === "!doctype";
    },
setNodeSourceCodeLocation(node, location2) {
      if (location2) {
        node.startIndex = location2.startOffset;
        node.endIndex = location2.endOffset;
      }
      node.sourceCodeLocation = location2;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    updateNodeSourceCodeLocation(node, endLocation) {
      if (endLocation.endOffset != null)
        node.endIndex = endLocation.endOffset;
      node.sourceCodeLocation = {
        ...node.sourceCodeLocation,
        ...endLocation
      };
    }
  };
  function parseWithParse5(content, options, isDocument2, context) {
    var _a2;
    (_a2 = options.treeAdapter) !== null && _a2 !== void 0 ? _a2 : options.treeAdapter = adapter;
    if (options.scriptingEnabled !== false) {
      options.scriptingEnabled = true;
    }
    return isDocument2 ? parse$3(content, options) : parseFragment(context, content, options);
  }
  const renderOpts = { treeAdapter: adapter };
  function renderWithParse5(dom) {
    const nodes = "length" in dom ? dom : [dom];
    for (let index2 = 0; index2 < nodes.length; index2 += 1) {
      const node = nodes[index2];
      if (isDocument(node)) {
        Array.prototype.splice.call(nodes, index2, 1, ...node.children);
      }
    }
    let result = "";
    for (let index2 = 0; index2 < nodes.length; index2 += 1) {
      const node = nodes[index2];
      result += serializeOuter(node, renderOpts);
    }
    return result;
  }
  const parse$2 = getParse((content, options, isDocument2, context) => options._useHtmlParser2 ? parseDocument(content, options) : parseWithParse5(content, options, isDocument2, context));
  const load = getLoad(parse$2, (dom, options) => options._useHtmlParser2 ? render$1(dom, options) : renderWithParse5(dom));
  const browser$1 = Object.freeze( Object.defineProperty({
    __proto__: null,
    contains,
    load,
    merge
  }, Symbol.toStringTag, { value: "Module" }));
  const require$$3 = getAugmentedNamespace(browser$1);
var axios_1;
  var hasRequiredAxios;
  function requireAxios() {
    if (hasRequiredAxios) return axios_1;
    hasRequiredAxios = 1;
    function bind(fn, thisArg) {
      return function wrap2() {
        return fn.apply(thisArg, arguments);
      };
    }
    const { toString: toString2 } = Object.prototype;
    const { getPrototypeOf } = Object;
    const { iterator, toStringTag } = Symbol;
    const kindOf = ((cache) => (thing) => {
      const str = toString2.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })( Object.create(null));
    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type;
    };
    const typeOfTest = (type) => (thing) => typeof thing === type;
    const { isArray } = Array;
    const isUndefined = typeOfTest("undefined");
    function isBuffer(val2) {
      return val2 !== null && !isUndefined(val2) && val2.constructor !== null && !isUndefined(val2.constructor) && isFunction$1(val2.constructor.isBuffer) && val2.constructor.isBuffer(val2);
    }
    const isArrayBuffer = kindOfTest("ArrayBuffer");
    function isArrayBufferView(val2) {
      let result;
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val2);
      } else {
        result = val2 && val2.buffer && isArrayBuffer(val2.buffer);
      }
      return result;
    }
    const isString = typeOfTest("string");
    const isFunction$1 = typeOfTest("function");
    const isNumber2 = typeOfTest("number");
    const isObject = (thing) => thing !== null && typeof thing === "object";
    const isBoolean = (thing) => thing === true || thing === false;
    const isPlainObject = (val2) => {
      if (kindOf(val2) !== "object") {
        return false;
      }
      const prototype2 = getPrototypeOf(val2);
      return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val2) && !(iterator in val2);
    };
    const isEmptyObject = (val2) => {
      if (!isObject(val2) || isBuffer(val2)) {
        return false;
      }
      try {
        return Object.keys(val2).length === 0 && Object.getPrototypeOf(val2) === Object.prototype;
      } catch (e) {
        return false;
      }
    };
    const isDate = kindOfTest("Date");
    const isFile = kindOfTest("File");
    const isBlob = kindOfTest("Blob");
    const isFileList = kindOfTest("FileList");
    const isStream = (val2) => isObject(val2) && isFunction$1(val2.pipe);
    const isFormData = (thing) => {
      let kind;
      return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" ||
kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
    };
    const isURLSearchParams = kindOfTest("URLSearchParams");
    const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
    const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    function forEach(obj, fn, { allOwnKeys = false } = {}) {
      if (obj === null || typeof obj === "undefined") {
        return;
      }
      let i;
      let l;
      if (typeof obj !== "object") {
        obj = [obj];
      }
      if (isArray(obj)) {
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        if (isBuffer(obj)) {
          return;
        }
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;
        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }
    function findKey(obj, key) {
      if (isBuffer(obj)) {
        return null;
      }
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }
    const _global = (() => {
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : commonjsGlobal;
    })();
    const isContextDefined = (context) => !isUndefined(context) && context !== _global;
    function merge2() {
      const { caseless, skipUndefined } = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val2, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val2)) {
          result[targetKey] = merge2(result[targetKey], val2);
        } else if (isPlainObject(val2)) {
          result[targetKey] = merge2({}, val2);
        } else if (isArray(val2)) {
          result[targetKey] = val2.slice();
        } else if (!skipUndefined || !isUndefined(val2)) {
          result[targetKey] = val2;
        }
      };
      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }
    const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
      forEach(b, (val2, key) => {
        if (thisArg && isFunction$1(val2)) {
          a[key] = bind(val2, thisArg);
        } else {
          a[key] = val2;
        }
      }, { allOwnKeys });
      return a;
    };
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    };
    const inherits = (constructor, superConstructor, props, descriptors2) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, "super", {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };
    const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
      let props;
      let i;
      let prop2;
      const merged = {};
      destObj = destObj || {};
      if (sourceObj == null) return destObj;
      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop2 = props[i];
          if ((!propFilter || propFilter(prop2, sourceObj, destObj)) && !merged[prop2]) {
            destObj[prop2] = sourceObj[prop2];
            merged[prop2] = true;
          }
        }
        sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
      return destObj;
    };
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === void 0 || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
    const toArray2 = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber2(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };
    const isTypedArray = ((TypedArray) => {
      return (thing) => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[iterator];
      const _iterator = generator.call(obj);
      let result;
      while ((result = _iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];
      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }
      return arr;
    };
    const isHTMLForm = kindOfTest("HTMLFormElement");
    const toCamelCase = (str) => {
      return str.toLowerCase().replace(
        /[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };
    const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop2) => hasOwnProperty2.call(obj, prop2))(Object.prototype);
    const isRegExp = kindOfTest("RegExp");
    const reduceDescriptors = (obj, reducer) => {
      const descriptors2 = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};
      forEach(descriptors2, (descriptor, name) => {
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
          reducedDescriptors[name] = ret || descriptor;
        }
      });
      Object.defineProperties(obj, reducedDescriptors);
    };
    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        if (isFunction$1(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
          return false;
        }
        const value = obj[name];
        if (!isFunction$1(value)) return;
        descriptor.enumerable = false;
        if ("writable" in descriptor) {
          descriptor.writable = false;
          return;
        }
        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error("Can not rewrite read-only method '" + name + "'");
          };
        }
      });
    };
    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};
      const define = (arr) => {
        arr.forEach((value) => {
          obj[value] = true;
        });
      };
      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
      return obj;
    };
    const noop2 = () => {
    };
    const toFiniteNumber = (value, defaultValue) => {
      return value != null && Number.isFinite(value = +value) ? value : defaultValue;
    };
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
    }
    const toJSONObject = (obj) => {
      const stack = new Array(10);
      const visit = (source, i) => {
        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }
          if (isBuffer(source)) {
            return source;
          }
          if (!("toJSON" in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};
            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });
            stack[i] = void 0;
            return target;
          }
        }
        return source;
      };
      return visit(obj, 0);
    };
    const isAsyncFn = kindOfTest("AsyncFunction");
    const isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
    const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
      if (setImmediateSupported) {
        return setImmediate;
      }
      return postMessageSupported ? ((token, callbacks) => {
        _global.addEventListener("message", ({ source, data: data2 }) => {
          if (source === _global && data2 === token) {
            callbacks.length && callbacks.shift()();
          }
        }, false);
        return (cb) => {
          callbacks.push(cb);
          _global.postMessage(token, "*");
        };
      })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
    })(
      typeof setImmediate === "function",
      isFunction$1(_global.postMessage)
    );
    const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
    const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
    var utils$1 = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber: isNumber2,
      isBoolean,
      isObject,
      isPlainObject,
      isEmptyObject,
      isReadableStream,
      isRequest,
      isResponse,
      isHeaders,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction: isFunction$1,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge: merge2,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray: toArray2,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty,
reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop: noop2,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable,
      setImmediate: _setImmediate,
      asap,
      isIterable
    };
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack;
      }
      this.message = message;
      this.name = "AxiosError";
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      if (response) {
        this.response = response;
        this.status = response.status ? response.status : null;
      }
    }
    utils$1.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
message: this.message,
          name: this.name,
description: this.description,
          number: this.number,
fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
config: utils$1.toJSONObject(this.config),
          code: this.code,
          status: this.status
        };
      }
    });
    const prototype$1 = AxiosError.prototype;
    const descriptors = {};
    [
      "ERR_BAD_OPTION_VALUE",
      "ERR_BAD_OPTION",
      "ECONNABORTED",
      "ETIMEDOUT",
      "ERR_NETWORK",
      "ERR_FR_TOO_MANY_REDIRECTS",
      "ERR_DEPRECATED",
      "ERR_BAD_RESPONSE",
      "ERR_BAD_REQUEST",
      "ERR_CANCELED",
      "ERR_NOT_SUPPORT",
      "ERR_INVALID_URL"
].forEach((code) => {
      descriptors[code] = { value: code };
    });
    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, "isAxiosError", { value: true });
    AxiosError.from = (error2, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);
      utils$1.toFlatObject(error2, axiosError, function filter2(obj) {
        return obj !== Error.prototype;
      }, (prop2) => {
        return prop2 !== "isAxiosError";
      });
      const msg = error2 && error2.message ? error2.message : "Error";
      const errCode = code == null && error2 ? error2.code : code;
      AxiosError.call(axiosError, msg, errCode, config, request, response);
      if (error2 && axiosError.cause == null) {
        Object.defineProperty(axiosError, "cause", { value: error2, configurable: true });
      }
      axiosError.name = error2 && error2.name || "Error";
      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    };
    var httpAdapter = null;
    function isVisitable(thing) {
      return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
    }
    function removeBrackets(key) {
      return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
    }
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each2(token, i) {
        token = removeBrackets(token);
        return !dots && i ? "[" + token + "]" : token;
      }).join(dots ? "." : "");
    }
    function isFlatArray(arr) {
      return utils$1.isArray(arr) && !arr.some(isVisitable);
    }
    const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter2(prop2) {
      return /^is[A-Z]/.test(prop2);
    });
    function toFormData(obj, formData, options) {
      if (!utils$1.isObject(obj)) {
        throw new TypeError("target must be an object");
      }
      formData = formData || new FormData();
      options = utils$1.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        return !utils$1.isUndefined(source[option]);
      });
      const metaTokens = options.metaTokens;
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
      const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
      if (!utils$1.isFunction(visitor)) {
        throw new TypeError("visitor must be a function");
      }
      function convertValue(value) {
        if (value === null) return "";
        if (utils$1.isDate(value)) {
          return value.toISOString();
        }
        if (utils$1.isBoolean(value)) {
          return value.toString();
        }
        if (!useBlob && utils$1.isBlob(value)) {
          throw new AxiosError("Blob is not supported. Use a Buffer instead.");
        }
        if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
          return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
        }
        return value;
      }
      function defaultVisitor(value, key, path) {
        let arr = value;
        if (value && !path && typeof value === "object") {
          if (utils$1.endsWith(key, "{}")) {
            key = metaTokens ? key : key.slice(0, -2);
            value = JSON.stringify(value);
          } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
            key = removeBrackets(key);
            arr.forEach(function each2(el, index2) {
              !(utils$1.isUndefined(el) || el === null) && formData.append(
indexes === true ? renderKey([key], index2, dots) : indexes === null ? key : key + "[]",
                convertValue(el)
              );
            });
            return false;
          }
        }
        if (isVisitable(value)) {
          return true;
        }
        formData.append(renderKey(path, key, dots), convertValue(value));
        return false;
      }
      const stack = [];
      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });
      function build(value, path) {
        if (utils$1.isUndefined(value)) return;
        if (stack.indexOf(value) !== -1) {
          throw Error("Circular reference detected in " + path.join("."));
        }
        stack.push(value);
        utils$1.forEach(value, function each2(el, key) {
          const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
            formData,
            el,
            utils$1.isString(key) ? key.trim() : key,
            path,
            exposedHelpers
          );
          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });
        stack.pop();
      }
      if (!utils$1.isObject(obj)) {
        throw new TypeError("data must be an object");
      }
      build(obj);
      return formData;
    }
    function encode$1(str) {
      const charMap = {
        "!": "%21",
        "'": "%27",
        "(": "%28",
        ")": "%29",
        "~": "%7E",
        "%20": "+",
        "%00": "\0"
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];
      params && toFormData(params, this, options);
    }
    const prototype = AxiosURLSearchParams.prototype;
    prototype.append = function append2(name, value) {
      this._pairs.push([name, value]);
    };
    prototype.toString = function toString3(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;
      return this._pairs.map(function each2(pair) {
        return _encode(pair[0]) + "=" + _encode(pair[1]);
      }, "").join("&");
    };
    function encode(val2) {
      return encodeURIComponent(val2).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
    }
    function buildURL(url, params, options) {
      if (!params) {
        return url;
      }
      const _encode = options && options.encode || encode;
      if (utils$1.isFunction(options)) {
        options = {
          serialize: options
        };
      }
      const serializeFn = options && options.serialize;
      let serializedParams;
      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
      }
      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
      }
      return url;
    }
    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }
use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }
eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }
clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }
forEach(fn) {
        utils$1.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }
    var InterceptorManager$1 = InterceptorManager;
    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };
    var URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
    var FormData$1 = typeof FormData !== "undefined" ? FormData : null;
    var Blob$1 = typeof Blob !== "undefined" ? Blob : null;
    var platform$1 = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
    const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
    const _navigator = typeof navigator === "object" && navigator || void 0;
    const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
    const hasStandardBrowserWebWorkerEnv = (() => {
      return typeof WorkerGlobalScope !== "undefined" &&
self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
    })();
    const origin = hasBrowserEnv && window.location.href || "http://localhost";
    var utils = Object.freeze({
      __proto__: null,
      hasBrowserEnv,
      hasStandardBrowserWebWorkerEnv,
      hasStandardBrowserEnv,
      navigator: _navigator,
      origin
    });
    var platform = {
      ...utils,
      ...platform$1
    };
    function toURLEncodedForm(data2, options) {
      return toFormData(data2, new platform.classes.URLSearchParams(), {
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils$1.isBuffer(value)) {
            this.append(key, value.toString("base64"));
            return false;
          }
          return helpers.defaultVisitor.apply(this, arguments);
        },
        ...options
      });
    }
    function parsePropPath(name) {
      return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
        return match[0] === "[]" ? "" : match[1] || match[0];
      });
    }
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index2) {
        let name = path[index2++];
        if (name === "__proto__") return true;
        const isNumericKey = Number.isFinite(+name);
        const isLast = index2 >= path.length;
        name = !name && utils$1.isArray(target) ? target.length : name;
        if (isLast) {
          if (utils$1.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }
          return !isNumericKey;
        }
        if (!target[name] || !utils$1.isObject(target[name])) {
          target[name] = [];
        }
        const result = buildPath(path, value, target[name], index2);
        if (result && utils$1.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }
        return !isNumericKey;
      }
      if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
        const obj = {};
        utils$1.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });
        return obj;
      }
      return null;
    }
    function stringifySafely(rawValue, parser, encoder) {
      if (utils$1.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils$1.trim(rawValue);
        } catch (e) {
          if (e.name !== "SyntaxError") {
            throw e;
          }
        }
      }
      return (encoder || JSON.stringify)(rawValue);
    }
    const defaults = {
      transitional: transitionalDefaults,
      adapter: ["xhr", "http", "fetch"],
      transformRequest: [function transformRequest(data2, headers) {
        const contentType = headers.getContentType() || "";
        const hasJSONContentType = contentType.indexOf("application/json") > -1;
        const isObjectPayload = utils$1.isObject(data2);
        if (isObjectPayload && utils$1.isHTMLForm(data2)) {
          data2 = new FormData(data2);
        }
        const isFormData2 = utils$1.isFormData(data2);
        if (isFormData2) {
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data2)) : data2;
        }
        if (utils$1.isArrayBuffer(data2) || utils$1.isBuffer(data2) || utils$1.isStream(data2) || utils$1.isFile(data2) || utils$1.isBlob(data2) || utils$1.isReadableStream(data2)) {
          return data2;
        }
        if (utils$1.isArrayBufferView(data2)) {
          return data2.buffer;
        }
        if (utils$1.isURLSearchParams(data2)) {
          headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
          return data2.toString();
        }
        let isFileList2;
        if (isObjectPayload) {
          if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return toURLEncodedForm(data2, this.formSerializer).toString();
          }
          if ((isFileList2 = utils$1.isFileList(data2)) || contentType.indexOf("multipart/form-data") > -1) {
            const _FormData = this.env && this.env.FormData;
            return toFormData(
              isFileList2 ? { "files[]": data2 } : data2,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }
        if (isObjectPayload || hasJSONContentType) {
          headers.setContentType("application/json", false);
          return stringifySafely(data2);
        }
        return data2;
      }],
      transformResponse: [function transformResponse(data2) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === "json";
        if (utils$1.isResponse(data2) || utils$1.isReadableStream(data2)) {
          return data2;
        }
        if (data2 && utils$1.isString(data2) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;
          try {
            return JSON.parse(data2, this.parseReviver);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }
        return data2;
      }],
timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },
      headers: {
        common: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": void 0
        }
      }
    };
    utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
      defaults.headers[method] = {};
    });
    var defaults$1 = defaults;
    const ignoreDuplicateOf = utils$1.toObjectSet([
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ]);
    var parseHeaders = (rawHeaders) => {
      const parsed = {};
      let key;
      let val2;
      let i;
      rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
        i = line.indexOf(":");
        key = line.substring(0, i).trim().toLowerCase();
        val2 = line.substring(i + 1).trim();
        if (!key || parsed[key] && ignoreDuplicateOf[key]) {
          return;
        }
        if (key === "set-cookie") {
          if (parsed[key]) {
            parsed[key].push(val2);
          } else {
            parsed[key] = [val2];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ", " + val2 : val2;
        }
      });
      return parsed;
    };
    const $internals = Symbol("internals");
    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }
    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }
      return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
    }
    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;
      while (match = tokensRE.exec(str)) {
        tokens[match[1]] = match[2];
      }
      return tokens;
    }
    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
    function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
      if (utils$1.isFunction(filter2)) {
        return filter2.call(this, value, header);
      }
      if (isHeaderNameFilter) {
        value = header;
      }
      if (!utils$1.isString(value)) return;
      if (utils$1.isString(filter2)) {
        return value.indexOf(filter2) !== -1;
      }
      if (utils$1.isRegExp(filter2)) {
        return filter2.test(value);
      }
    }
    function formatHeader(header) {
      return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
      });
    }
    function buildAccessors(obj, header) {
      const accessorName = utils$1.toCamelCase(" " + header);
      ["get", "set", "has"].forEach((methodName) => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }
    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }
      set(header, valueOrRewrite, rewrite) {
        const self2 = this;
        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);
          if (!lHeader) {
            throw new Error("header name must be a non-empty string");
          }
          const key = utils$1.findKey(self2, lHeader);
          if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
            self2[key || _header] = normalizeValue(_value);
          }
        }
        const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
        if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
          let obj = {}, dest, key;
          for (const entry of header) {
            if (!utils$1.isArray(entry)) {
              throw TypeError("Object iterator must return a key-value pair");
            }
            obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
          }
          setHeaders(obj, valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
      }
      get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils$1.findKey(this, header);
          if (key) {
            const value = this[key];
            if (!parser) {
              return value;
            }
            if (parser === true) {
              return parseTokens(value);
            }
            if (utils$1.isFunction(parser)) {
              return parser.call(this, value, key);
            }
            if (utils$1.isRegExp(parser)) {
              return parser.exec(value);
            }
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
      has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils$1.findKey(this, header);
          return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }
        return false;
      }
      delete(header, matcher) {
        const self2 = this;
        let deleted = false;
        function deleteHeader(_header) {
          _header = normalizeHeader(_header);
          if (_header) {
            const key = utils$1.findKey(self2, _header);
            if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
              delete self2[key];
              deleted = true;
            }
          }
        }
        if (utils$1.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }
        return deleted;
      }
      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;
        while (i--) {
          const key = keys[i];
          if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }
        return deleted;
      }
      normalize(format) {
        const self2 = this;
        const headers = {};
        utils$1.forEach(this, (value, header) => {
          const key = utils$1.findKey(headers, header);
          if (key) {
            self2[key] = normalizeValue(value);
            delete self2[header];
            return;
          }
          const normalized = format ? formatHeader(header) : String(header).trim();
          if (normalized !== header) {
            delete self2[header];
          }
          self2[normalized] = normalizeValue(value);
          headers[normalized] = true;
        });
        return this;
      }
      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }
      toJSON(asStrings) {
        const obj = Object.create(null);
        utils$1.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
        });
        return obj;
      }
      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
      }
      getSetCookie() {
        return this.get("set-cookie") || [];
      }
      get [Symbol.toStringTag]() {
        return "AxiosHeaders";
      }
      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }
      static concat(first2, ...targets) {
        const computed = new this(first2);
        targets.forEach((target) => computed.set(target));
        return computed;
      }
      static accessor(header) {
        const internals = this[$internals] = this[$internals] = {
          accessors: {}
        };
        const accessors = internals.accessors;
        const prototype2 = this.prototype;
        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);
          if (!accessors[lHeader]) {
            buildAccessors(prototype2, _header);
            accessors[lHeader] = true;
          }
        }
        utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
        return this;
      }
    }
    AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
    utils$1.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
      let mapped = key[0].toUpperCase() + key.slice(1);
      return {
        get: () => value,
        set(headerValue) {
          this[mapped] = headerValue;
        }
      };
    });
    utils$1.freezeMethods(AxiosHeaders);
    var AxiosHeaders$1 = AxiosHeaders;
    function transformData(fns, response) {
      const config = this || defaults$1;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data2 = context.data;
      utils$1.forEach(fns, function transform(fn) {
        data2 = fn.call(config, data2, headers.normalize(), response ? response.status : void 0);
      });
      headers.normalize();
      return data2;
    }
    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }
    function CanceledError(message, config, request) {
      AxiosError.call(this, message == null ? "canceled" : message, AxiosError.ERR_CANCELED, config, request);
      this.name = "CanceledError";
    }
    utils$1.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          "Request failed with status code " + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }
    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || "";
    }
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;
      min = min !== void 0 ? min : 1e3;
      return function push(chunkLength) {
        const now = Date.now();
        const startedAt = timestamps[tail];
        if (!firstSampleTS) {
          firstSampleTS = now;
        }
        bytes[head] = chunkLength;
        timestamps[head] = now;
        let i = tail;
        let bytesCount = 0;
        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }
        head = (head + 1) % samplesCount;
        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }
        if (now - firstSampleTS < min) {
          return;
        }
        const passed = startedAt && now - startedAt;
        return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
      };
    }
    function throttle(fn, freq) {
      let timestamp = 0;
      let threshold = 1e3 / freq;
      let lastArgs;
      let timer;
      const invoke = (args, now = Date.now()) => {
        timestamp = now;
        lastArgs = null;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        fn(...args);
      };
      const throttled = (...args) => {
        const now = Date.now();
        const passed = now - timestamp;
        if (passed >= threshold) {
          invoke(args, now);
        } else {
          lastArgs = args;
          if (!timer) {
            timer = setTimeout(() => {
              timer = null;
              invoke(lastArgs);
            }, threshold - passed);
          }
        }
      };
      const flush = () => lastArgs && invoke(lastArgs);
      return [throttled, flush];
    }
    const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);
      return throttle((e) => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : void 0;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;
        bytesNotified = loaded;
        const data2 = {
          loaded,
          total,
          progress: total ? loaded / total : void 0,
          bytes: progressBytes,
          rate: rate ? rate : void 0,
          estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
          event: e,
          lengthComputable: total != null,
          [isDownloadStream ? "download" : "upload"]: true
        };
        listener(data2);
      }, freq);
    };
    const progressEventDecorator = (total, throttled) => {
      const lengthComputable = total != null;
      return [(loaded) => throttled[0]({
        lengthComputable,
        total,
        loaded
      }), throttled[1]];
    };
    const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
    var isURLSameOrigin = platform.hasStandardBrowserEnv ? ((origin2, isMSIE) => (url) => {
      url = new URL(url, platform.origin);
      return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
    })(
      new URL(platform.origin),
      platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
    ) : () => true;
    var cookies = platform.hasStandardBrowserEnv ? (
{
        write(name, value, expires, path, domain, secure) {
          const cookie = [name + "=" + encodeURIComponent(value)];
          utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
          utils$1.isString(path) && cookie.push("path=" + path);
          utils$1.isString(domain) && cookie.push("domain=" + domain);
          secure === true && cookie.push("secure");
          document.cookie = cookie.join("; ");
        },
        read(name) {
          const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
          return match ? decodeURIComponent(match[3]) : null;
        },
        remove(name) {
          this.write(name, "", Date.now() - 864e5);
        }
      }
    ) : (
{
        write() {
        },
        read() {
          return null;
        },
        remove() {
        }
      }
    );
    function isAbsoluteURL(url) {
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }
    function combineURLs(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    }
    function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
      let isRelativeUrl = !isAbsoluteURL(requestedURL);
      if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }
    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
    function mergeConfig(config1, config2) {
      config2 = config2 || {};
      const config = {};
      function getMergedValue(target, source, prop2, caseless) {
        if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
          return utils$1.merge.call({ caseless }, target, source);
        } else if (utils$1.isPlainObject(source)) {
          return utils$1.merge({}, source);
        } else if (utils$1.isArray(source)) {
          return source.slice();
        }
        return source;
      }
      function mergeDeepProperties(a, b, prop2, caseless) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(a, b, prop2, caseless);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(void 0, a, prop2, caseless);
        }
      }
      function valueFromConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(void 0, b);
        }
      }
      function defaultToConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(void 0, b);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(void 0, a);
        }
      }
      function mergeDirectKeys(a, b, prop2) {
        if (prop2 in config2) {
          return getMergedValue(a, b);
        } else if (prop2 in config1) {
          return getMergedValue(void 0, a);
        }
      }
      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        withXSRFToken: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b, prop2) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop2, true)
      };
      utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop2) {
        const merge3 = mergeMap[prop2] || mergeDeepProperties;
        const configValue = merge3(config1[prop2], config2[prop2], prop2);
        utils$1.isUndefined(configValue) && merge3 !== mergeDirectKeys || (config[prop2] = configValue);
      });
      return config;
    }
    var resolveConfig = (config) => {
      const newConfig = mergeConfig({}, config);
      let { data: data2, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth: auth2 } = newConfig;
      newConfig.headers = headers = AxiosHeaders$1.from(headers);
      newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
      if (auth2) {
        headers.set(
          "Authorization",
          "Basic " + btoa((auth2.username || "") + ":" + (auth2.password ? unescape(encodeURIComponent(auth2.password)) : ""))
        );
      }
      if (utils$1.isFormData(data2)) {
        if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
          headers.setContentType(void 0);
        } else if (utils$1.isFunction(data2.getHeaders)) {
          const formHeaders = data2.getHeaders();
          const allowedHeaders = ["content-type", "content-length"];
          Object.entries(formHeaders).forEach(([key, val2]) => {
            if (allowedHeaders.includes(key.toLowerCase())) {
              headers.set(key, val2);
            }
          });
        }
      }
      if (platform.hasStandardBrowserEnv) {
        withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
        if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
          const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
          if (xsrfValue) {
            headers.set(xsrfHeaderName, xsrfValue);
          }
        }
      }
      return newConfig;
    };
    const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
    var xhrAdapter = isXHRAdapterSupported && function(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = resolveConfig(config);
        let requestData = _config.data;
        const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
        let { responseType, onUploadProgress, onDownloadProgress } = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;
        function done() {
          flushUpload && flushUpload();
          flushDownload && flushDownload();
          _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
          _config.signal && _config.signal.removeEventListener("abort", onCanceled);
        }
        let request = new XMLHttpRequest();
        request.open(_config.method.toUpperCase(), _config.url, true);
        request.timeout = _config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          const responseHeaders = AxiosHeaders$1.from(
            "getAllResponseHeaders" in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
          request = null;
        };
        request.onerror = function handleError(event) {
          const msg = event && event.message ? event.message : "Network Error";
          const err = new AxiosError(msg, AxiosError.ERR_NETWORK, config, request);
          err.event = event || null;
          reject(err);
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
          const transitional = _config.transitional || transitionalDefaults;
          if (_config.timeoutErrorMessage) {
            timeoutErrorMessage = _config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request
          ));
          request = null;
        };
        requestData === void 0 && requestHeaders.setContentType(null);
        if ("setRequestHeader" in request) {
          utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val2, key) {
            request.setRequestHeader(key, val2);
          });
        }
        if (!utils$1.isUndefined(_config.withCredentials)) {
          request.withCredentials = !!_config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = _config.responseType;
        }
        if (onDownloadProgress) {
          [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
          request.addEventListener("progress", downloadThrottled);
        }
        if (onUploadProgress && request.upload) {
          [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
          request.upload.addEventListener("progress", uploadThrottled);
          request.upload.addEventListener("loadend", flushUpload);
        }
        if (_config.cancelToken || _config.signal) {
          onCanceled = (cancel) => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };
          _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
          if (_config.signal) {
            _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
          }
        }
        const protocol = parseProtocol(_config.url);
        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
          return;
        }
        request.send(requestData || null);
      });
    };
    const composeSignals = (signals, timeout) => {
      const { length } = signals = signals ? signals.filter(Boolean) : [];
      if (timeout || length) {
        let controller = new AbortController();
        let aborted;
        const onabort = function(reason) {
          if (!aborted) {
            aborted = true;
            unsubscribe();
            const err = reason instanceof Error ? reason : this.reason;
            controller.abort(err instanceof AxiosError ? err : new CanceledError(err instanceof Error ? err.message : err));
          }
        };
        let timer = timeout && setTimeout(() => {
          timer = null;
          onabort(new AxiosError(`timeout ${timeout} of ms exceeded`, AxiosError.ETIMEDOUT));
        }, timeout);
        const unsubscribe = () => {
          if (signals) {
            timer && clearTimeout(timer);
            timer = null;
            signals.forEach((signal2) => {
              signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
            });
            signals = null;
          }
        };
        signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
        const { signal } = controller;
        signal.unsubscribe = () => utils$1.asap(unsubscribe);
        return signal;
      }
    };
    var composeSignals$1 = composeSignals;
    const streamChunk = function* (chunk, chunkSize) {
      let len = chunk.byteLength;
      if (len < chunkSize) {
        yield chunk;
        return;
      }
      let pos = 0;
      let end2;
      while (pos < len) {
        end2 = pos + chunkSize;
        yield chunk.slice(pos, end2);
        pos = end2;
      }
    };
    const readBytes = async function* (iterable, chunkSize) {
      for await (const chunk of readStream(iterable)) {
        yield* streamChunk(chunk, chunkSize);
      }
    };
    const readStream = async function* (stream) {
      if (stream[Symbol.asyncIterator]) {
        yield* stream;
        return;
      }
      const reader = stream.getReader();
      try {
        for (; ; ) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          yield value;
        }
      } finally {
        await reader.cancel();
      }
    };
    const trackStream = (stream, chunkSize, onProgress, onFinish) => {
      const iterator2 = readBytes(stream, chunkSize);
      let bytes = 0;
      let done;
      let _onFinish = (e) => {
        if (!done) {
          done = true;
          onFinish && onFinish(e);
        }
      };
      return new ReadableStream({
        async pull(controller) {
          try {
            const { done: done2, value } = await iterator2.next();
            if (done2) {
              _onFinish();
              controller.close();
              return;
            }
            let len = value.byteLength;
            if (onProgress) {
              let loadedBytes = bytes += len;
              onProgress(loadedBytes);
            }
            controller.enqueue(new Uint8Array(value));
          } catch (err) {
            _onFinish(err);
            throw err;
          }
        },
        cancel(reason) {
          _onFinish(reason);
          return iterator2.return();
        }
      }, {
        highWaterMark: 2
      });
    };
    const DEFAULT_CHUNK_SIZE = 64 * 1024;
    const { isFunction } = utils$1;
    const globalFetchAPI = (({ Request, Response }) => ({
      Request,
      Response
    }))(utils$1.global);
    const {
      ReadableStream: ReadableStream$1,
      TextEncoder
    } = utils$1.global;
    const test = (fn, ...args) => {
      try {
        return !!fn(...args);
      } catch (e) {
        return false;
      }
    };
    const factory = (env) => {
      env = utils$1.merge.call({
        skipUndefined: true
      }, globalFetchAPI, env);
      const { fetch: envFetch, Request, Response } = env;
      const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
      const isRequestSupported = isFunction(Request);
      const isResponseSupported = isFunction(Response);
      if (!isFetchSupported) {
        return false;
      }
      const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
      const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
      const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
        let duplexAccessed = false;
        const hasContentType = new Request(platform.origin, {
          body: new ReadableStream$1(),
          method: "POST",
          get duplex() {
            duplexAccessed = true;
            return "half";
          }
        }).headers.has("Content-Type");
        return duplexAccessed && !hasContentType;
      });
      const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
      const resolvers = {
        stream: supportsResponseStream && ((res) => res.body)
      };
      isFetchSupported && (() => {
        ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
          !resolvers[type] && (resolvers[type] = (res, config) => {
            let method = res && res[type];
            if (method) {
              return method.call(res);
            }
            throw new AxiosError(`Response type '${type}' is not supported`, AxiosError.ERR_NOT_SUPPORT, config);
          });
        });
      })();
      const getBodyLength = async (body) => {
        if (body == null) {
          return 0;
        }
        if (utils$1.isBlob(body)) {
          return body.size;
        }
        if (utils$1.isSpecCompliantForm(body)) {
          const _request = new Request(platform.origin, {
            method: "POST",
            body
          });
          return (await _request.arrayBuffer()).byteLength;
        }
        if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
          return body.byteLength;
        }
        if (utils$1.isURLSearchParams(body)) {
          body = body + "";
        }
        if (utils$1.isString(body)) {
          return (await encodeText(body)).byteLength;
        }
      };
      const resolveBodyLength = async (headers, body) => {
        const length = utils$1.toFiniteNumber(headers.getContentLength());
        return length == null ? getBodyLength(body) : length;
      };
      return async (config) => {
        let {
          url,
          method,
          data: data2,
          signal,
          cancelToken,
          timeout,
          onDownloadProgress,
          onUploadProgress,
          responseType,
          headers,
          withCredentials = "same-origin",
          fetchOptions
        } = resolveConfig(config);
        let _fetch = envFetch || fetch;
        responseType = responseType ? (responseType + "").toLowerCase() : "text";
        let composedSignal = composeSignals$1([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
        let request = null;
        const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
          composedSignal.unsubscribe();
        });
        let requestContentLength;
        try {
          if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data2)) !== 0) {
            let _request = new Request(url, {
              method: "POST",
              body: data2,
              duplex: "half"
            });
            let contentTypeHeader;
            if (utils$1.isFormData(data2) && (contentTypeHeader = _request.headers.get("content-type"))) {
              headers.setContentType(contentTypeHeader);
            }
            if (_request.body) {
              const [onProgress, flush] = progressEventDecorator(
                requestContentLength,
                progressEventReducer(asyncDecorator(onUploadProgress))
              );
              data2 = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
            }
          }
          if (!utils$1.isString(withCredentials)) {
            withCredentials = withCredentials ? "include" : "omit";
          }
          const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
          const resolvedOptions = {
            ...fetchOptions,
            signal: composedSignal,
            method: method.toUpperCase(),
            headers: headers.normalize().toJSON(),
            body: data2,
            duplex: "half",
            credentials: isCredentialsSupported ? withCredentials : void 0
          };
          request = isRequestSupported && new Request(url, resolvedOptions);
          let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
          const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
          if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
            const options = {};
            ["status", "statusText", "headers"].forEach((prop2) => {
              options[prop2] = response[prop2];
            });
            const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
            const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
              responseContentLength,
              progressEventReducer(asyncDecorator(onDownloadProgress), true)
            ) || [];
            response = new Response(
              trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
                flush && flush();
                unsubscribe && unsubscribe();
              }),
              options
            );
          }
          responseType = responseType || "text";
          let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
          !isStreamResponse && unsubscribe && unsubscribe();
          return await new Promise((resolve, reject) => {
            settle(resolve, reject, {
              data: responseData,
              headers: AxiosHeaders$1.from(response.headers),
              status: response.status,
              statusText: response.statusText,
              config,
              request
            });
          });
        } catch (err) {
          unsubscribe && unsubscribe();
          if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
            throw Object.assign(
              new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request),
              {
                cause: err.cause || err
              }
            );
          }
          throw AxiosError.from(err, err && err.code, config, request);
        }
      };
    };
    const seedCache = new Map();
    const getFetch = (config) => {
      let env = config ? config.env : {};
      const { fetch: fetch2, Request, Response } = env;
      const seeds = [
        Request,
        Response,
        fetch2
      ];
      let len = seeds.length, i = len, seed, target, map2 = seedCache;
      while (i--) {
        seed = seeds[i];
        target = map2.get(seed);
        target === void 0 && map2.set(seed, target = i ? new Map() : factory(env));
        map2 = target;
      }
      return target;
    };
    getFetch();
    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter,
      fetch: {
        get: getFetch
      }
    };
    utils$1.forEach(knownAdapters, (fn, value) => {
      if (fn) {
        try {
          Object.defineProperty(fn, "name", { value });
        } catch (e) {
        }
        Object.defineProperty(fn, "adapterName", { value });
      }
    });
    const renderReason = (reason) => `- ${reason}`;
    const isResolvedHandle = (adapter2) => utils$1.isFunction(adapter2) || adapter2 === null || adapter2 === false;
    var adapters = {
      getAdapter: (adapters2, config) => {
        adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
        const { length } = adapters2;
        let nameOrAdapter;
        let adapter2;
        const rejectedReasons = {};
        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters2[i];
          let id;
          adapter2 = nameOrAdapter;
          if (!isResolvedHandle(nameOrAdapter)) {
            adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
            if (adapter2 === void 0) {
              throw new AxiosError(`Unknown adapter '${id}'`);
            }
          }
          if (adapter2 && (utils$1.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
            break;
          }
          rejectedReasons[id || "#" + i] = adapter2;
        }
        if (!adapter2) {
          const reasons = Object.entries(rejectedReasons).map(
            ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
          );
          let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
          throw new AxiosError(
            `There is no suitable adapter to dispatch the request ` + s,
            "ERR_NOT_SUPPORT"
          );
        }
        return adapter2;
      },
      adapters: knownAdapters
    };
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);
      config.headers = AxiosHeaders$1.from(config.headers);
      config.data = transformData.call(
        config,
        config.transformRequest
      );
      if (["post", "put", "patch"].indexOf(config.method) !== -1) {
        config.headers.setContentType("application/x-www-form-urlencoded", false);
      }
      const adapter2 = adapters.getAdapter(config.adapter || defaults$1.adapter, config);
      return adapter2(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );
        response.headers = AxiosHeaders$1.from(response.headers);
        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }
        return Promise.reject(reason);
      });
    }
    const VERSION = "1.12.2";
    const validators$1 = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
      validators$1[type] = function validator2(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
      };
    });
    const deprecatedWarnings = {};
    validators$1.transitional = function transitional(validator2, version, message) {
      function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return (value, opt, opts) => {
        if (validator2 === false) {
          throw new AxiosError(
            formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
            AxiosError.ERR_DEPRECATED
          );
        }
        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(
            formatMessage(
              opt,
              " has been deprecated since v" + version + " and will be removed in the near future"
            )
          );
        }
        return validator2 ? validator2(value, opt, opts) : true;
      };
    };
    validators$1.spelling = function spelling(correctSpelling) {
      return (value, opt) => {
        console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
        return true;
      };
    };
    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== "object") {
        throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator2 = schema[opt];
        if (validator2) {
          const value = options[opt];
          const result = value === void 0 || validator2(value, opt, options);
          if (result !== true) {
            throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }
    var validator = {
      assertOptions,
      validators: validators$1
    };
    const validators = validator.validators;
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig || {};
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }
async request(configOrUrl, config) {
        try {
          return await this._request(configOrUrl, config);
        } catch (err) {
          if (err instanceof Error) {
            let dummy = {};
            Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
            const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
            try {
              if (!err.stack) {
                err.stack = stack;
              } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
                err.stack += "\n" + stack;
              }
            } catch (e) {
            }
          }
          throw err;
        }
      }
      _request(configOrUrl, config) {
        if (typeof configOrUrl === "string") {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }
        config = mergeConfig(this.defaults, config);
        const { transitional, paramsSerializer, headers } = config;
        if (transitional !== void 0) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }
        if (paramsSerializer != null) {
          if (utils$1.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }
        if (config.allowAbsoluteUrls !== void 0) ;
        else if (this.defaults.allowAbsoluteUrls !== void 0) {
          config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
        } else {
          config.allowAbsoluteUrls = true;
        }
        validator.assertOptions(config, {
          baseUrl: validators.spelling("baseURL"),
          withXsrfToken: validators.spelling("withXSRFToken")
        }, true);
        config.method = (config.method || this.defaults.method || "get").toLowerCase();
        let contextHeaders = headers && utils$1.merge(
          headers.common,
          headers[config.method]
        );
        headers && utils$1.forEach(
          ["delete", "get", "head", "post", "put", "patch", "common"],
          (method) => {
            delete headers[method];
          }
        );
        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
            return;
          }
          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        let promise;
        let i = 0;
        let len;
        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), void 0];
          chain.unshift(...requestInterceptorChain);
          chain.push(...responseInterceptorChain);
          len = chain.length;
          promise = Promise.resolve(config);
          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }
          return promise;
        }
        len = requestInterceptorChain.length;
        let newConfig = config;
        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error2) {
            onRejected.call(this, error2);
            break;
          }
        }
        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error2) {
          return Promise.reject(error2);
        }
        i = 0;
        len = responseInterceptorChain.length;
        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }
        return promise;
      }
      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }
    utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });
    utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data2, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              "Content-Type": "multipart/form-data"
            } : {},
            url,
            data: data2
          }));
        };
      }
      Axios.prototype[method] = generateHTTPMethod();
      Axios.prototype[method + "Form"] = generateHTTPMethod(true);
    });
    var Axios$1 = Axios;
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== "function") {
          throw new TypeError("executor must be a function.");
        }
        let resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });
        const token = this;
        this.promise.then((cancel) => {
          if (!token._listeners) return;
          let i = token._listeners.length;
          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });
        this.promise.then = (onfulfilled) => {
          let _resolve;
          const promise = new Promise((resolve) => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);
          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };
          return promise;
        };
        executor(function cancel(message, config, request) {
          if (token.reason) {
            return;
          }
          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }
throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }
subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }
        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }
unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index2 = this._listeners.indexOf(listener);
        if (index2 !== -1) {
          this._listeners.splice(index2, 1);
        }
      }
      toAbortSignal() {
        const controller = new AbortController();
        const abort = (err) => {
          controller.abort(err);
        };
        this.subscribe(abort);
        controller.signal.unsubscribe = () => this.unsubscribe(abort);
        return controller.signal;
      }
static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }
    var CancelToken$1 = CancelToken;
    function spread(callback) {
      return function wrap2(arr) {
        return callback.apply(null, arr);
      };
    }
    function isAxiosError(payload) {
      return utils$1.isObject(payload) && payload.isAxiosError === true;
    }
    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511
    };
    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });
    var HttpStatusCode$1 = HttpStatusCode;
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);
      utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
      utils$1.extend(instance, context, null, { allOwnKeys: true });
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };
      return instance;
    }
    const axios = createInstance(defaults$1);
    axios.Axios = Axios$1;
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;
    axios.AxiosError = AxiosError;
    axios.Cancel = axios.CanceledError;
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;
    axios.isAxiosError = isAxiosError;
    axios.mergeConfig = mergeConfig;
    axios.AxiosHeaders = AxiosHeaders$1;
    axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
    axios.getAdapter = adapters.getAdapter;
    axios.HttpStatusCode = HttpStatusCode$1;
    axios.default = axios;
    axios_1 = axios;
    return axios_1;
  }
  var util = {};
  var core = {};
  var error = {};
  var hasRequiredError;
  function requireError() {
    if (hasRequiredError) return error;
    hasRequiredError = 1;
    Object.defineProperty(error, "__esModule", { value: true });
    error.createHttpError = error.CrawlError = void 0;
    class CrawlError extends Error {
      constructor(message, type = "unknown", originalError = null, metadata = {}) {
        super(message);
        this.name = "CrawlError";
        this.type = type;
        this.originalError = originalError;
        this.metadata = metadata;
        this.timestamp = new Date();
        if (originalError && originalError.stack) {
          this.stack = `${this.stack}
Caused by: ${originalError.stack}`;
        }
      }
      logError(verbose = false) {
        console.error(`[${this.timestamp.toISOString()}] ${this.name}(${this.type}): ${this.message}`);
        if (verbose) {
          if (Object.keys(this.metadata).length)
            console.error("메타데이터", this.metadata);
          if (this.originalError)
            console.error("원본 오류:", this.originalError);
        }
      }
      isRetryable() {
        return ["network", "rate_limit", "server"].includes(this.type);
      }
    }
    error.CrawlError = CrawlError;
    const createHttpError = (error2, defaultMessage, metadata = {}) => {
      const status = error2?.response?.status;
      const url = error2?.config?.url || "";
      let type = "network";
      let message = defaultMessage;
      if (typeof status === "number") {
        if (status === 404) {
          type = "notFound";
          message = `리소스를 찾을 수 없습니다: ${url}`;
        } else if (status === 429) {
          type = "rate_limit";
          message = `요청 한도 초과: ${url}`;
        } else if (status === 403) {
          type = "auth";
          message = `접근이 거부되었습니다: ${url}`;
        } else if (status >= 500) {
          type = "server";
          message = `서버 오류 (${status}): ${url}`;
        }
      } else if (error2?.code === "ECONNABORTED") {
        type = "timeout";
        message = `요청 시간 초과: ${url}`;
      } else if (error2?.code === "ECONNREFUSED") {
        type = "connection";
        message = `연결이 거부되었습니다: ${url}`;
      }
      return new CrawlError(message, type, error2, { ...metadata, url, status });
    };
    error.createHttpError = createHttpError;
    return error;
  }
  var hasRequiredCore;
  function requireCore() {
    if (hasRequiredCore) return core;
    hasRequiredCore = 1;
    Object.defineProperty(core, "__esModule", { value: true });
    core.validateNumberInput = validateNumberInput;
    core.delay = delay;
    core.getRandomUserAgent = getRandomUserAgent;
    core.withRetry = withRetry;
    const error_1 = requireError();
    function validateNumberInput(input, defaultValue) {
      const n = parseInt(String(input), 10);
      return isNaN(n) ? defaultValue : n;
    }
    function delay(ms) {
      if (typeof ms !== "number" || isNaN(ms)) {
        ms = 100;
        console.warn(`delay 함수의 유효하지 않은 값, 기본 ${ms}ms 사용`);
      }
      return new Promise((res) => setTimeout(res, ms));
    }
    function getRandomUserAgent() {
      const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/125.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_6) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/125.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/125.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/124.0.0.0 Chrome/124.0.0.0 Safari/537.36"
      ];
      return agents[Math.floor(Math.random() * agents.length)];
    }
    async function withRetry(fn, options = {}) {
      const { maxRetries = 3, delayMs = 1e3, exponentialBackoff = true } = options;
      let lastError;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error2) {
          lastError = error2;
          if (error2 instanceof error_1.CrawlError && !error2.isRetryable())
            throw error2;
          if (attempt === maxRetries)
            throw error2;
          const wait = exponentialBackoff ? delayMs * Math.pow(2, attempt) : delayMs;
          console.warn(`시도 ${attempt + 1}/${maxRetries + 1} 실패. ${wait}ms 후 재시도..`);
          await delay(wait);
        }
      }
      throw lastError;
    }
    return core;
  }
  var hasRequiredUtil;
  function requireUtil() {
    if (hasRequiredUtil) return util;
    hasRequiredUtil = 1;
    (function(exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.createHttpError = exports.CrawlError = exports.withRetry = exports.getRandomUserAgent = exports.delay = exports.validateNumberInput = void 0;
      var core_1 = requireCore();
      Object.defineProperty(exports, "validateNumberInput", { enumerable: true, get: function() {
        return core_1.validateNumberInput;
      } });
      Object.defineProperty(exports, "delay", { enumerable: true, get: function() {
        return core_1.delay;
      } });
      Object.defineProperty(exports, "getRandomUserAgent", { enumerable: true, get: function() {
        return core_1.getRandomUserAgent;
      } });
      Object.defineProperty(exports, "withRetry", { enumerable: true, get: function() {
        return core_1.withRetry;
      } });
      var error_1 = requireError();
      Object.defineProperty(exports, "CrawlError", { enumerable: true, get: function() {
        return error_1.CrawlError;
      } });
      Object.defineProperty(exports, "createHttpError", { enumerable: true, get: function() {
        return error_1.createHttpError;
      } });
    })(util);
    return util;
  }
  var config_1;
  var hasRequiredConfig;
  function requireConfig() {
    if (hasRequiredConfig) return config_1;
    hasRequiredConfig = 1;
    const config = {
      BASE_URL: "https://gall.dcinside.com",
      HTTP: {
        USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        TIMEOUT: 1e4,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1e3
      },
      CRAWL: {
        DEFAULT_GALLERY_ID: "chatgpt",
        DEFAULT_PAGE_SIZE: 100,
        DELAY_BETWEEN_REQUESTS: 500,
        MAX_COMMENT_PAGES: 100,
        COMMENT_PAGE_SIZE: 100
},
      DEBUG: {
        ENABLED: false,
        VERBOSE: false
      }
    };
    config_1 = config;
    return config_1;
  }
  var http;
  var hasRequiredHttp;
  function requireHttp() {
    if (hasRequiredHttp) return http;
    hasRequiredHttp = 1;
    const axios = requireAxios();
    const { withRetry, createHttpError, getRandomUserAgent } = requireUtil();
    const config = requireConfig();
    const { USER_AGENT, TIMEOUT, RETRY_ATTEMPTS, RETRY_DELAY } = config.HTTP;
    const DEFAULT_HEADERS = {
      "User-Agent": USER_AGENT
    };
    const axiosInstance = (
axios.create({
        timeout: TIMEOUT,
        headers: DEFAULT_HEADERS
      })
    );
    async function getWithRetry(url, options = {}) {
      const { retryCount, ...axiosConfig } = (
options || {}
      );
      const retryOptions = {
        maxRetries: retryCount || RETRY_ATTEMPTS,
        delayMs: RETRY_DELAY,
        exponentialBackoff: true
      };
      try {
        return await withRetry(async () => {
          const finalOptions = { ...axiosConfig };
          if (config.CRAWL && config.CRAWL.RANDOM_USER_AGENT) {
            finalOptions.headers = {
              ...axiosConfig.headers || {},
              "User-Agent": getRandomUserAgent()
            };
          }
          return (await axiosInstance.get(url, finalOptions)).data;
        }, retryOptions);
      } catch (error2) {
        if (axios.isAxiosError(error2)) {
          throw createHttpError(error2, `GET failed: ${url}`, { method: "GET", options });
        }
        throw error2;
      }
    }
    async function postWithRetry(url, data2, options = {}) {
      const { retryCount, ...axiosConfig } = (
options || {}
      );
      const retryOptions = {
        maxRetries: RETRY_ATTEMPTS,
        delayMs: RETRY_DELAY,
        exponentialBackoff: true
      };
      try {
        return await withRetry(async () => {
          const finalOptions = { ...axiosConfig };
          if (config.CRAWL && config.CRAWL.RANDOM_USER_AGENT) {
            finalOptions.headers = {
              ...axiosConfig.headers || {},
              "User-Agent": getRandomUserAgent()
            };
          }
          return (await axiosInstance.post(url, data2, finalOptions)).data;
        }, retryOptions);
      } catch (error2) {
        if (axios.isAxiosError(error2)) {
          throw createHttpError(error2, `POST failed: ${url}`, { method: "POST", options });
        }
        throw error2;
      }
    }
    http = {
      axiosInstance,
      getWithRetry,
      postWithRetry
    };
    return http;
  }
  var pc;
  var hasRequiredPc;
  function requirePc() {
    if (hasRequiredPc) return pc;
    hasRequiredPc = 1;
    var __createBinding = pc && pc.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = pc && pc.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = pc && pc.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    const cheerio = __importStar(require$$3);
    const config = requireConfig();
    const http_1 = requireHttp();
    const { BASE_URL } = config;
    async function scrapeBoardPage(page, galleryId, options = {}) {
      const { boardType = "all", id, subject, nickname, ip } = options;
      if (page <= 0)
        return [];
      const url = `${BASE_URL}/mgallery/board/lists/?id=${galleryId}&list_num=100&search_head=&page=${page}&exception_mode=${boardType}`;
      try {
        const html2 = await (0, http_1.getWithRetry)(url);
        const $2 = cheerio.load(html2);
        const posts = [];
        const types = [
          { dataType: "icon_notice", type: "notice" },
          { dataType: "icon_pic", type: "picture" },
          { dataType: "icon_txt", type: "text" },
          { dataType: "icon_survey", type: "survey" }
        ];
        $2(".ub-content").each((_, el) => {
          const $el = $2(el);
          const iconClass = $el.find(".icon_img").attr("class") || "";
          const type = types.find((t) => iconClass.includes(t.dataType))?.type || "unknown";
          const pid = $el.find(".gall_num").text().trim();
          const subj = (() => {
            const $td = $el.find(".gall_subject");
            return $td.attr("onmouseover") ? $td.find(".subject_inner").text().trim() : $td.text().trim();
          })();
          const titA = $el.find(".gall_tit a").first();
          const title = titA.text().trim().replace(/\s+/g, " ");
          const link = titA.attr("href") || "";
          const fullLink = link.startsWith("javascript") ? "" : link.startsWith("http") ? link : `https://gall.dcinside.com${link}`;
          const writer = $el.find(".gall_writer");
          const nick = writer.attr("data-nick") || writer.find("b").text().trim() || writer.find(".nickname em").text().trim() || "익명";
          const uid = writer.attr("data-uid") || "";
          const ipAddr = writer.attr("data-ip") || "";
          const dateEl = $el.find(".gall_date");
          const date = dateEl.attr("title") || dateEl.text().trim();
          const countText = $el.find(".gall_count").text().trim();
          const count = countText === "-" ? 0 : parseInt(countText, 10) || 0;
          const recText = $el.find(".gall_recommend").text().trim();
          const recommend = recText === "-" ? 0 : parseInt(recText, 10) || 0;
          const replyText = ($el.find(".reply_num").text() || "0").replace(/[\[\]]/g, "");
          const replyCount = parseInt(replyText, 10) || 0;
          const skip = id && id !== pid || subject && subject !== subj || nickname && nickname !== nick || ip && ip !== ipAddr;
          if (skip)
            return;
          posts.push({ id: pid, type, subject: subj, title, link: fullLink, author: { nickname: nick, userId: uid, ip: ipAddr }, date, count, recommend, replyCount });
        });
        return [...posts];
      } catch (e) {
        console.error(`게시판 ${page} 수집 오류: ${e.message}`);
        return [];
      }
    }
    pc = { scrapeBoardPage };
    return pc;
  }
  var mobile;
  var hasRequiredMobile;
  function requireMobile() {
    if (hasRequiredMobile) return mobile;
    hasRequiredMobile = 1;
    var __createBinding = mobile && mobile.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = mobile && mobile.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = mobile && mobile.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    const cheerio = __importStar(require$$3);
    const http_1 = requireHttp();
    const MOBILE_BASE_URL = "https://m.dcinside.com";
    async function scrapeMobileBoardPage(page, galleryId, options = {}) {
      const { boardType = "all", id, subject, nickname, ip } = options;
      if (boardType === "notice") {
        const { scrapeBoardPage } = requirePc();
        return scrapeBoardPage(page, galleryId, { boardType, id, subject, nickname, ip });
      }
      if (page <= 0)
        return [];
      const qs = boardType === "recommend" ? `recommend=1&page=${page}` : `page=${page}`;
      const url = `${MOBILE_BASE_URL}/board/${encodeURIComponent(galleryId)}?${qs}`;
      try {
        const html2 = await (0, http_1.getWithRetry)(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G973N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
            "Cookie": "list_count=100"
          }
        });
        const $2 = cheerio.load(html2);
        const posts = [];
        $2("ul.gall-detail-lst > li").each((_, el) => {
          const $el = $2(el);
          if ($el.find(".pwlink").length || $el.find(".power-lst").length)
            return;
          const TYPE = {
            "sp-lst-txt": "text",
            "sp-lst-img": "picture",
            "sp-lst-recoimg": "recommended",
            "sp-lst-recotxt": "recommended"
          };
          const href = $el.find("a").attr("href") || "";
          const idMatch = href.match(/\/board\/[^/]+\/(\d+)/);
          const nicknameAttr = $el.find(".blockInfo").attr("data-name") || "";
          const dataInfo = $el.find(".blockInfo").attr("data-info") || "";
          const rawDate = $el.find(".ginfo > li:nth-child(3)").text().trim();
          let date = rawDate;
          if (/^\d{2}:\d{2}$/.test(rawDate)) {
            const today = new Date();
            date = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")} ${rawDate}`;
          } else if (/^\d{2}\.\d{2}$/.test(rawDate)) {
            const today = new Date();
            date = `${today.getFullYear()}.${rawDate}`;
          }
          const klass = ($el.find(".subject-add .sp-lst").attr("class") || "").split(" ");
          const key = klass.find((cls) => cls.startsWith("sp-lst-")) || "";
          const post2 = {
            id: idMatch ? idMatch[1] : "",
            type: TYPE[key] || "unknown",
            subject: $el.find(".ginfo > li:nth-child(1)").text().trim(),
            title: $el.find(".subjectin").text().trim(),
            link: href,
            author: {
              nickname: nicknameAttr,
              userId: dataInfo.includes(".") ? "" : dataInfo,
              ip: dataInfo.includes(".") ? dataInfo : ""
            },
            date,
            count: Number(($el.find(".ginfo > li:nth-child(4)").text().trim().replace(/^조회\s*/, "") || "0").replace(/,/g, "")),
            recommend: Number(($el.find(".ginfo > li:nth-child(5)").text().trim().replace(/^추천\s*/, "") || "0").replace(/,/g, "")),
            replyCount: Number(($el.find(".ct").text().trim() || "0").replace(/[^\d]/g, ""))
          };
          const skipFilter = id && String(id) !== String(post2.id) || subject && subject !== post2.subject || nickname && nickname !== post2.author.nickname || ip && ip !== post2.author.ip;
          if (!skipFilter)
            posts.push(post2);
        });
        return posts;
      } catch (e) {
        console.error(`모바일 게시판 ${page} 수집 오류: ${e.message}`);
        return [];
      }
    }
    mobile = { scrapeMobileBoardPage };
    return mobile;
  }
  var board;
  var hasRequiredBoard;
  function requireBoard() {
    if (hasRequiredBoard) return board;
    hasRequiredBoard = 1;
    const { scrapeMobileBoardPage } = requireMobile();
    const { scrapeBoardPage: scrapeBoardPageLegacy } = requirePc();
    board = {
scrapeBoardPage: scrapeMobileBoardPage,
scrapeBoardPageLegacy
    };
    return board;
  }
  var html;
  var hasRequiredHtml;
  function requireHtml() {
    if (hasRequiredHtml) return html;
    hasRequiredHtml = 1;
    const config = requireConfig();
    const { BASE_URL } = config;
    const extractText = ($2, selector, defaultValue = "") => $2(selector).text().trim() || defaultValue;
    const processImages = (element, options = {}) => {
      const { mode = "replace", placeholder = "image", includeSource = false } = options;
      const imageUrls = [];
      if (mode === "extract" || mode === "both") {
        element.find("img").each((_, img) => {
          const dataOriginal = img.attribs?.["data-original"] || "";
          const src = img.attribs?.src || "";
          const dataSrc = img.attribs?.["data-src"] || "";
          const imageUrl = dataOriginal || dataSrc || src;
          if (imageUrl) {
            const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
            imageUrls.push(fullUrl);
          }
        });
      }
      if (mode === "replace" || mode === "both") {
        element.find("img").each((i, img) => {
          const replacement = includeSource && imageUrls[i] ? `[${placeholder}(${i}):"${imageUrls[i]}"]
` : `[${placeholder}(${i})]
`;
          img.tagName = "span";
          img.attribs = {};
          img.children = [{ data: replacement, type: "text" }];
        });
      }
      return mode === "extract" || mode === "both" ? imageUrls : null;
    };
    const replaceImagesWithPlaceholder = (element, placeholder = "image") => {
      processImages(element, { mode: "replace", placeholder });
    };
    html = {
      extractText,
      processImages,
      replaceImagesWithPlaceholder
    };
    return html;
  }
  var comments;
  var hasRequiredComments;
  function requireComments() {
    if (hasRequiredComments) return comments;
    hasRequiredComments = 1;
    const config = requireConfig();
    const util_1 = requireUtil();
    const http_1 = requireHttp();
    const { BASE_URL } = config;
    const HEADERS = { "User-Agent": config.HTTP.USER_AGENT };
    async function getCommentsForPost(no, galleryId, e_s_n_o) {
      const url = `${BASE_URL}/board/comment/`;
      let items = [];
      let page = 1;
      let totalCount = 0;
      const maxPages = config.CRAWL.MAX_COMMENT_PAGES;
      try {
        while (page <= maxPages) {
          const params = new URLSearchParams({ id: String(galleryId), no: String(no), cmt_id: String(galleryId), cmt_no: String(no), e_s_n_o, comment_page: String(page), _GALLTYPE_: "M" });
          const data2 = await (0, http_1.postWithRetry)(url, params.toString(), {
            headers: {
              ...HEADERS,
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "x-requested-with": "XMLHttpRequest",
              "Referer": `${BASE_URL}/mgallery/board/view/?id=${galleryId}&no=${no}`
            }
          });
          const comments2 = data2.comments || [];
          totalCount = data2.total_cnt;
          const mapped = comments2.map((c) => ({
            parent: c.parent,
            id: c.no,
            author: { nickname: c.name, userId: c.user_id, ip: c.ip },
            regDate: c.reg_date,
            memo: c.memo,
            isDeleted: c.is_delete
          })).filter((c) => c.author.nickname !== "관리자" || c.author.ip !== "");
          items = items.concat(mapped);
          if (!comments2.length || comments2.length < config.CRAWL.COMMENT_PAGE_SIZE)
            break;
          await (0, util_1.delay)(config.CRAWL.DELAY_BETWEEN_REQUESTS);
          page++;
        }
        return { totalCount, items };
      } catch (e) {
        console.error(`댓글 수집 오류 (게시글 ${no}): ${e.message}`);
        return null;
      }
    }
    comments = { getCommentsForPost };
    return comments;
  }
  var post$1;
  var hasRequiredPost$1;
  function requirePost$1() {
    if (hasRequiredPost$1) return post$1;
    hasRequiredPost$1 = 1;
    var __createBinding = post$1 && post$1.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = post$1 && post$1.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = post$1 && post$1.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    const cheerio = __importStar(require$$3);
    const config = requireConfig();
    const http_1 = requireHttp();
    const { extractText, processImages } = requireHtml();
    const { getCommentsForPost } = requireComments();
    const { BASE_URL } = config;
    async function getPostContent(galleryId = "chatgpt", no, options = {}) {
      const { extractImages = true, includeImageSource = false } = options;
      if (no === void 0 || no === null)
        return null;
      const postNo = String(no);
      if (!postNo)
        return null;
      const url = `${BASE_URL}/mgallery/board/view/?id=${galleryId}&no=${postNo}`;
      try {
        const html2 = await (0, http_1.getWithRetry)(url);
        const $2 = cheerio.load(html2);
        const title = extractText($2, "header .title_subject");
        const author = extractText($2, "header .gall_writer .nickname");
        const date = extractText($2, "header .gall_date");
        const contentEl = $2(".gallview_contents .write_div");
        const e_s_n_o = $2('input[name="e_s_n_o"]').val() || "";
        if (!title && !contentEl.length && !e_s_n_o) {
          return null;
        }
        const imgOpts = { mode: extractImages ? "both" : "replace", placeholder: "image", includeSource: includeImageSource };
        const imageUrls = processImages(contentEl, imgOpts) || void 0;
        contentEl.find("br").replaceWith("\n");
        contentEl.find("p, div, li").each((_, el) => $2(el).after("\n"));
        const content = contentEl.text().trim();
        const viewCount = extractText($2, "header .gall_count").replace("조회", "") || "null";
        const recommendCount = extractText($2, ".btn_recommend_box .up_num_box .up_num", "null");
        const dislikeCount = extractText($2, ".btn_recommend_box .down_num_box .down_num", "null");
        const comments2 = await getCommentsForPost(no, galleryId, String(e_s_n_o));
        const result = { postNo, title, author, date, content, viewCount, recommendCount, dislikeCount, comments: comments2 || { totalCount: 0, items: [] } };
        if (extractImages && imageUrls && imageUrls.length)
          result.images = imageUrls;
        return result;
      } catch (e) {
        console.error(`게시글 ${no} 수집 오류: ${e.message} (URL: ${url})`);
        return null;
      }
    }
    post$1 = { getPostContent };
    return post$1;
  }
  var mobilePost;
  var hasRequiredMobilePost;
  function requireMobilePost() {
    if (hasRequiredMobilePost) return mobilePost;
    hasRequiredMobilePost = 1;
    var __createBinding = mobilePost && mobilePost.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = mobilePost && mobilePost.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = mobilePost && mobilePost.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    const cheerio = __importStar(require$$3);
    const http_1 = requireHttp();
    const MOBILE_BASE_URL = "https://m.dcinside.com";
    function normalizeText(t) {
      return (t || "").replace(/\s+/g, " ").trim();
    }
    function extractTextPreserveNewlines($2, $container) {
      if (!$container || !$container.length)
        return "";
      $container.find("br").replaceWith("\n");
      $container.find("p, div, li, h1, h2, h3, h4, h5, h6").each((_, el) => $2(el).after("\n"));
      const raw = $container.text().replace(/\r/g, "");
      return raw.replace(/\n{3,}/g, "\n\n").trim();
    }
    function extractNumber(text2, fallback = "0") {
      const m = (text2 || "").toString().match(/([\d,]+)/);
      return m ? m[1].replace(/,/g, "") : fallback;
    }
    function processImagesMobile($container, options = {}) {
      const { mode = "replace", placeholder = "image", includeSource = false } = options;
      const imageUrls = [];
      $container.find("img").each((i, img) => {
        const attribs = img.attribs || {};
        const dataOriginal = attribs["data-original"] || "";
        const dataSrc = attribs["data-src"] || "";
        const src = attribs["src"] || "";
        let imageUrl = dataOriginal || dataSrc || src;
        if (!imageUrl)
          return;
        if (!/^https?:\/\//i.test(imageUrl)) {
          const leadingSlash = imageUrl.startsWith("/") ? "" : "/";
          imageUrl = `${MOBILE_BASE_URL}${leadingSlash}${imageUrl}`;
        }
        imageUrls.push(imageUrl);
      });
      if (mode === "replace" || mode === "both") {
        $container.find("img").each((i, img) => {
          const replacement = includeSource && imageUrls[i] ? `[${placeholder}(${i}):"${imageUrls[i]}"]
` : `[${placeholder}(${i})]
`;
          img.tagName = "span";
          img.attribs = {};
          img.children = [{ data: replacement, type: "text" }];
        });
      }
      return mode === "extract" || mode === "both" ? imageUrls : null;
    }
    function parseMobilePostHtml(html2, options = {}) {
      const { extractImages = true, includeImageSource = false } = options;
      const $2 = cheerio.load(html2);
      let title = normalizeText($2("span.tit").first().text());
      if (!title) {
        const ogt = $2('meta[property="og:title"]').attr("content") || "";
        title = normalizeText(ogt.split(" - ")[0] || ogt);
      }
      title = title.replace(/^\[[^\]]+\]\s*/, "").trim();
      const headerInfo = $2("ul.ginfo2").first().find("li");
      const author = normalizeText(headerInfo.eq(0).text());
      const date = normalizeText(headerInfo.eq(1).text());
      const contentEl = $2(".thum-txtin");
      const imgOpts = { mode: extractImages ? "both" : "replace", placeholder: "image", includeSource: includeImageSource };
      const imageUrls = processImagesMobile(contentEl, imgOpts) || void 0;
      const content = extractTextPreserveNewlines($2, contentEl);
      let viewCount = "0";
      let recommendCount = "0";
      let dislikeCount = "0";
      $2("ul.ginfo2 li").each((_, li) => {
        const t = $2(li).text();
        if (/^\s*조회(수)?/i.test(t))
          viewCount = extractNumber(t, "0");
        if (/^\s*추천/i.test(t))
          recommendCount = extractNumber(t, recommendCount);
      });
      const recommBtn = $2("#recomm_btn").text();
      if (recommBtn)
        recommendCount = extractNumber(recommBtn, recommendCount);
      const nonRecommBtn = $2("#nonrecomm_btn").text();
      if (nonRecommBtn)
        dislikeCount = extractNumber(nonRecommBtn, dislikeCount);
      let totalCount = 0;
      const totalHidden = $2("#reple_totalCnt").attr("value");
      if (totalHidden)
        totalCount = parseInt(totalHidden, 10) || 0;
      const items = [];
      let currentParentId = "0";
      $2(".all-comment-lst > li").each((_, li) => {
        const $li = $2(li);
        const id = String($li.attr("no") || "").trim();
        const a = $li.find("a.nick").first();
        const nameRaw = normalizeText(a.text()).replace(/^글쓴\s*/, "");
        const userId = a.find(".blockCommentId").attr("data-info") || "";
        const ip = ($li.find(".ip").first().text() || "").replace(/[()]/g, "").trim();
        const regDate = normalizeText($li.find("span.date").first().text());
        const memoEl = $li.find("p.txt").first();
        memoEl.find("br").replaceWith("\n");
        const memo = memoEl.text().replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
        if (!id && !nameRaw && !memo)
          return;
        const klass = $li.attr("class") || "";
        const isReply = /\bcomment-add\b/.test(klass);
        const parent2 = isReply ? currentParentId || "0" : "0";
        if (!isReply)
          currentParentId = id || currentParentId;
        items.push({
          parent: parent2,
          id,
          author: { userId, nickname: nameRaw, ip },
          regDate,
          memo
        });
      });
      if (!totalCount)
        totalCount = items.length;
      return { title, author, date, content, viewCount, recommendCount, dislikeCount, comments: { totalCount, items }, images: extractImages && imageUrls && imageUrls.length ? imageUrls : void 0 };
    }
    async function getMobilePostContent(galleryId = "chatgpt", no, options = {}) {
      const { extractImages = true, includeImageSource = false, retryCount } = options;
      if (no === void 0 || no === null)
        return null;
      const postNo = String(no);
      if (!postNo)
        return null;
      const url = `${MOBILE_BASE_URL}/board/${encodeURIComponent(galleryId)}/${encodeURIComponent(postNo)}`;
      try {
        const MOBILE_HEADERS = {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://m.dcinside.com/",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        };
        const html2 = await (0, http_1.getWithRetry)(url, { responseType: "text", headers: MOBILE_HEADERS, retryCount });
        const parsed = parseMobilePostHtml(html2, { extractImages, includeImageSource });
        if (!parsed)
          return null;
        return { postNo, ...parsed };
      } catch (e) {
        console.error(`모바일 게시글 ${no} 수집 오류: ${e.message} (URL: ${url})`);
        return null;
      }
    }
    mobilePost = { getMobilePostContent, parseMobilePostHtml };
    return mobilePost;
  }
  var mobileWrite = {};
  function shareSameDomainSuffix(hostname, vhost) {
    if (hostname.endsWith(vhost)) {
      return hostname.length === vhost.length || hostname[hostname.length - vhost.length - 1] === ".";
    }
    return false;
  }
  function extractDomainWithSuffix(hostname, publicSuffix) {
    const publicSuffixIndex = hostname.length - publicSuffix.length - 2;
    const lastDotBeforeSuffixIndex = hostname.lastIndexOf(".", publicSuffixIndex);
    if (lastDotBeforeSuffixIndex === -1) {
      return hostname;
    }
    return hostname.slice(lastDotBeforeSuffixIndex + 1);
  }
  function getDomain$1(suffix, hostname, options) {
    if (options.validHosts !== null) {
      const validHosts = options.validHosts;
      for (const vhost of validHosts) {
        if (
shareSameDomainSuffix(hostname, vhost)
        ) {
          return vhost;
        }
      }
    }
    let numberOfLeadingDots = 0;
    if (hostname.startsWith(".")) {
      while (numberOfLeadingDots < hostname.length && hostname[numberOfLeadingDots] === ".") {
        numberOfLeadingDots += 1;
      }
    }
    if (suffix.length === hostname.length - numberOfLeadingDots) {
      return null;
    }
    return (
extractDomainWithSuffix(hostname, suffix)
    );
  }
  function getDomainWithoutSuffix$1(domain, suffix) {
    return domain.slice(0, -suffix.length - 1);
  }
  function extractHostname(url, urlIsValidHostname) {
    let start = 0;
    let end2 = url.length;
    let hasUpper = false;
    if (!urlIsValidHostname) {
      if (url.startsWith("data:")) {
        return null;
      }
      while (start < url.length && url.charCodeAt(start) <= 32) {
        start += 1;
      }
      while (end2 > start + 1 && url.charCodeAt(end2 - 1) <= 32) {
        end2 -= 1;
      }
      if (url.charCodeAt(start) === 47 && url.charCodeAt(start + 1) === 47) {
        start += 2;
      } else {
        const indexOfProtocol = url.indexOf(":/", start);
        if (indexOfProtocol !== -1) {
          const protocolSize = indexOfProtocol - start;
          const c0 = url.charCodeAt(start);
          const c1 = url.charCodeAt(start + 1);
          const c2 = url.charCodeAt(start + 2);
          const c3 = url.charCodeAt(start + 3);
          const c4 = url.charCodeAt(start + 4);
          if (protocolSize === 5 && c0 === 104 && c1 === 116 && c2 === 116 && c3 === 112 && c4 === 115) ;
          else if (protocolSize === 4 && c0 === 104 && c1 === 116 && c2 === 116 && c3 === 112) ;
          else if (protocolSize === 3 && c0 === 119 && c1 === 115 && c2 === 115) ;
          else if (protocolSize === 2 && c0 === 119 && c1 === 115) ;
          else {
            for (let i = start; i < indexOfProtocol; i += 1) {
              const lowerCaseCode = url.charCodeAt(i) | 32;
              if (!(lowerCaseCode >= 97 && lowerCaseCode <= 122 ||
lowerCaseCode >= 48 && lowerCaseCode <= 57 ||
lowerCaseCode === 46 ||
lowerCaseCode === 45 ||
lowerCaseCode === 43)) {
                return null;
              }
            }
          }
          start = indexOfProtocol + 2;
          while (url.charCodeAt(start) === 47) {
            start += 1;
          }
        }
      }
      let indexOfIdentifier = -1;
      let indexOfClosingBracket = -1;
      let indexOfPort = -1;
      for (let i = start; i < end2; i += 1) {
        const code = url.charCodeAt(i);
        if (code === 35 ||
code === 47 ||
code === 63) {
          end2 = i;
          break;
        } else if (code === 64) {
          indexOfIdentifier = i;
        } else if (code === 93) {
          indexOfClosingBracket = i;
        } else if (code === 58) {
          indexOfPort = i;
        } else if (code >= 65 && code <= 90) {
          hasUpper = true;
        }
      }
      if (indexOfIdentifier !== -1 && indexOfIdentifier > start && indexOfIdentifier < end2) {
        start = indexOfIdentifier + 1;
      }
      if (url.charCodeAt(start) === 91) {
        if (indexOfClosingBracket !== -1) {
          return url.slice(start + 1, indexOfClosingBracket).toLowerCase();
        }
        return null;
      } else if (indexOfPort !== -1 && indexOfPort > start && indexOfPort < end2) {
        end2 = indexOfPort;
      }
    }
    while (end2 > start + 1 && url.charCodeAt(end2 - 1) === 46) {
      end2 -= 1;
    }
    const hostname = start !== 0 || end2 !== url.length ? url.slice(start, end2) : url;
    if (hasUpper) {
      return hostname.toLowerCase();
    }
    return hostname;
  }
  function isProbablyIpv4(hostname) {
    if (hostname.length < 7) {
      return false;
    }
    if (hostname.length > 15) {
      return false;
    }
    let numberOfDots = 0;
    for (let i = 0; i < hostname.length; i += 1) {
      const code = hostname.charCodeAt(i);
      if (code === 46) {
        numberOfDots += 1;
      } else if (code < 48 || code > 57) {
        return false;
      }
    }
    return numberOfDots === 3 && hostname.charCodeAt(0) !== 46 && hostname.charCodeAt(hostname.length - 1) !== 46;
  }
  function isProbablyIpv6(hostname) {
    if (hostname.length < 3) {
      return false;
    }
    let start = hostname.startsWith("[") ? 1 : 0;
    let end2 = hostname.length;
    if (hostname[end2 - 1] === "]") {
      end2 -= 1;
    }
    if (end2 - start > 39) {
      return false;
    }
    let hasColon = false;
    for (; start < end2; start += 1) {
      const code = hostname.charCodeAt(start);
      if (code === 58) {
        hasColon = true;
      } else if (!(code >= 48 && code <= 57 ||
code >= 97 && code <= 102 ||
code >= 65 && code <= 90)) {
        return false;
      }
    }
    return hasColon;
  }
  function isIp(hostname) {
    return isProbablyIpv6(hostname) || isProbablyIpv4(hostname);
  }
  function isValidAscii(code) {
    return code >= 97 && code <= 122 || code >= 48 && code <= 57 || code > 127;
  }
  function isValidHostname(hostname) {
    if (hostname.length > 255) {
      return false;
    }
    if (hostname.length === 0) {
      return false;
    }
    if (
!isValidAscii(hostname.charCodeAt(0)) && hostname.charCodeAt(0) !== 46 &&
hostname.charCodeAt(0) !== 95
    ) {
      return false;
    }
    let lastDotIndex = -1;
    let lastCharCode = -1;
    const len = hostname.length;
    for (let i = 0; i < len; i += 1) {
      const code = hostname.charCodeAt(i);
      if (code === 46) {
        if (
i - lastDotIndex > 64 ||
lastCharCode === 46 ||
lastCharCode === 45 ||
lastCharCode === 95
        ) {
          return false;
        }
        lastDotIndex = i;
      } else if (!
(isValidAscii(code) || code === 45 || code === 95)) {
        return false;
      }
      lastCharCode = code;
    }
    return (
len - lastDotIndex - 1 <= 63 &&


lastCharCode !== 45
    );
  }
  function setDefaultsImpl({ allowIcannDomains = true, allowPrivateDomains = false, detectIp = true, extractHostname: extractHostname2 = true, mixedInputs = true, validHosts = null, validateHostname = true }) {
    return {
      allowIcannDomains,
      allowPrivateDomains,
      detectIp,
      extractHostname: extractHostname2,
      mixedInputs,
      validHosts,
      validateHostname
    };
  }
  const DEFAULT_OPTIONS = (
setDefaultsImpl({})
  );
  function setDefaults(options) {
    if (options === void 0) {
      return DEFAULT_OPTIONS;
    }
    return (
setDefaultsImpl(options)
    );
  }
  function getSubdomain$1(hostname, domain) {
    if (domain.length === hostname.length) {
      return "";
    }
    return hostname.slice(0, -domain.length - 1);
  }
  function getEmptyResult() {
    return {
      domain: null,
      domainWithoutSuffix: null,
      hostname: null,
      isIcann: null,
      isIp: null,
      isPrivate: null,
      publicSuffix: null,
      subdomain: null
    };
  }
  function resetResult(result) {
    result.domain = null;
    result.domainWithoutSuffix = null;
    result.hostname = null;
    result.isIcann = null;
    result.isIp = null;
    result.isPrivate = null;
    result.publicSuffix = null;
    result.subdomain = null;
  }
  function parseImpl(url, step, suffixLookup2, partialOptions, result) {
    const options = (
setDefaults(partialOptions)
    );
    if (typeof url !== "string") {
      return result;
    }
    if (!options.extractHostname) {
      result.hostname = url;
    } else if (options.mixedInputs) {
      result.hostname = extractHostname(url, isValidHostname(url));
    } else {
      result.hostname = extractHostname(url, false);
    }
    if (options.detectIp && result.hostname !== null) {
      result.isIp = isIp(result.hostname);
      if (result.isIp) {
        return result;
      }
    }
    if (options.validateHostname && options.extractHostname && result.hostname !== null && !isValidHostname(result.hostname)) {
      result.hostname = null;
      return result;
    }
    if (step === 0 || result.hostname === null) {
      return result;
    }
    suffixLookup2(result.hostname, options, result);
    if (step === 2 || result.publicSuffix === null) {
      return result;
    }
    result.domain = getDomain$1(result.publicSuffix, result.hostname, options);
    if (step === 3 || result.domain === null) {
      return result;
    }
    result.subdomain = getSubdomain$1(result.hostname, result.domain);
    if (step === 4) {
      return result;
    }
    result.domainWithoutSuffix = getDomainWithoutSuffix$1(result.domain, result.publicSuffix);
    return result;
  }
  function fastPathLookup(hostname, options, out) {
    if (!options.allowPrivateDomains && hostname.length > 3) {
      const last2 = hostname.length - 1;
      const c3 = hostname.charCodeAt(last2);
      const c2 = hostname.charCodeAt(last2 - 1);
      const c1 = hostname.charCodeAt(last2 - 2);
      const c0 = hostname.charCodeAt(last2 - 3);
      if (c3 === 109 && c2 === 111 && c1 === 99 && c0 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "com";
        return true;
      } else if (c3 === 103 && c2 === 114 && c1 === 111 && c0 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "org";
        return true;
      } else if (c3 === 117 && c2 === 100 && c1 === 101 && c0 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "edu";
        return true;
      } else if (c3 === 118 && c2 === 111 && c1 === 103 && c0 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "gov";
        return true;
      } else if (c3 === 116 && c2 === 101 && c1 === 110 && c0 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "net";
        return true;
      } else if (c3 === 101 && c2 === 100 && c1 === 46) {
        out.isIcann = true;
        out.isPrivate = false;
        out.publicSuffix = "de";
        return true;
      }
    }
    return false;
  }
  const exceptions = (function() {
    const _0 = [1, {}], _1 = [0, { "city": _0 }];
    const exceptions2 = [0, { "ck": [0, { "www": _0 }], "jp": [0, { "kawasaki": _1, "kitakyushu": _1, "kobe": _1, "nagoya": _1, "sapporo": _1, "sendai": _1, "yokohama": _1 }] }];
    return exceptions2;
  })();
  const rules = (function() {
    const _2 = [1, {}], _3 = [2, {}], _4 = [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2 }], _5 = [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2 }], _6 = [0, { "*": _3 }], _7 = [2, { "s": _6 }], _8 = [0, { "relay": _3 }], _9 = [2, { "id": _3 }], _10 = [1, { "gov": _2 }], _11 = [2, { "vps": _3 }], _12 = [0, { "airflow": _6, "transfer-webapp": _3 }], _13 = [0, { "transfer-webapp": _3, "transfer-webapp-fips": _3 }], _14 = [0, { "notebook": _3, "studio": _3 }], _15 = [0, { "labeling": _3, "notebook": _3, "studio": _3 }], _16 = [0, { "notebook": _3 }], _17 = [0, { "labeling": _3, "notebook": _3, "notebook-fips": _3, "studio": _3 }], _18 = [0, { "notebook": _3, "notebook-fips": _3, "studio": _3, "studio-fips": _3 }], _19 = [0, { "shop": _3 }], _20 = [0, { "*": _2 }], _21 = [1, { "co": _3 }], _22 = [0, { "objects": _3 }], _23 = [2, { "nodes": _3 }], _24 = [0, { "my": _3 }], _25 = [0, { "s3": _3, "s3-accesspoint": _3, "s3-website": _3 }], _26 = [0, { "s3": _3, "s3-accesspoint": _3 }], _27 = [0, { "direct": _3 }], _28 = [0, { "webview-assets": _3 }], _29 = [0, { "vfs": _3, "webview-assets": _3 }], _30 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3, "aws-cloud9": _28, "cloud9": _29 }], _31 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _26, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3, "aws-cloud9": _28, "cloud9": _29 }], _32 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3, "analytics-gateway": _3, "aws-cloud9": _28, "cloud9": _29 }], _33 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3 }], _34 = [0, { "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-fips": _3, "s3-website": _3 }], _35 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _34, "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-fips": _3, "s3-object-lambda": _3, "s3-website": _3, "aws-cloud9": _28, "cloud9": _29 }], _36 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _34, "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-deprecated": _3, "s3-fips": _3, "s3-object-lambda": _3, "s3-website": _3, "analytics-gateway": _3, "aws-cloud9": _28, "cloud9": _29 }], _37 = [0, { "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-fips": _3 }], _38 = [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _37, "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-fips": _3, "s3-object-lambda": _3, "s3-website": _3 }], _39 = [0, { "auth": _3 }], _40 = [0, { "auth": _3, "auth-fips": _3 }], _41 = [0, { "auth-fips": _3 }], _42 = [0, { "apps": _3 }], _43 = [0, { "paas": _3 }], _44 = [2, { "eu": _3 }], _45 = [0, { "app": _3 }], _46 = [0, { "site": _3 }], _47 = [1, { "com": _2, "edu": _2, "net": _2, "org": _2 }], _48 = [0, { "j": _3 }], _49 = [0, { "dyn": _3 }], _50 = [2, { "web": _3 }], _51 = [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2 }], _52 = [0, { "p": _3 }], _53 = [0, { "user": _3 }], _54 = [0, { "cdn": _3 }], _55 = [2, { "raw": _6 }], _56 = [0, { "cust": _3, "reservd": _3 }], _57 = [0, { "cust": _3 }], _58 = [0, { "s3": _3 }], _59 = [1, { "biz": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "net": _2, "org": _2 }], _60 = [0, { "ipfs": _3 }], _61 = [1, { "framer": _3 }], _62 = [0, { "forgot": _3 }], _63 = [1, { "gs": _2 }], _64 = [0, { "nes": _2 }], _65 = [1, { "k12": _2, "cc": _2, "lib": _2 }], _66 = [1, { "cc": _2 }], _67 = [1, { "cc": _2, "lib": _2 }];
    const rules2 = [0, { "ac": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "drr": _3, "feedback": _3, "forms": _3 }], "ad": _2, "ae": [1, { "ac": _2, "co": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "sch": _2 }], "aero": [1, { "airline": _2, "airport": _2, "accident-investigation": _2, "accident-prevention": _2, "aerobatic": _2, "aeroclub": _2, "aerodrome": _2, "agents": _2, "air-surveillance": _2, "air-traffic-control": _2, "aircraft": _2, "airtraffic": _2, "ambulance": _2, "association": _2, "author": _2, "ballooning": _2, "broker": _2, "caa": _2, "cargo": _2, "catering": _2, "certification": _2, "championship": _2, "charter": _2, "civilaviation": _2, "club": _2, "conference": _2, "consultant": _2, "consulting": _2, "control": _2, "council": _2, "crew": _2, "design": _2, "dgca": _2, "educator": _2, "emergency": _2, "engine": _2, "engineer": _2, "entertainment": _2, "equipment": _2, "exchange": _2, "express": _2, "federation": _2, "flight": _2, "freight": _2, "fuel": _2, "gliding": _2, "government": _2, "groundhandling": _2, "group": _2, "hanggliding": _2, "homebuilt": _2, "insurance": _2, "journal": _2, "journalist": _2, "leasing": _2, "logistics": _2, "magazine": _2, "maintenance": _2, "marketplace": _2, "media": _2, "microlight": _2, "modelling": _2, "navigation": _2, "parachuting": _2, "paragliding": _2, "passenger-association": _2, "pilot": _2, "press": _2, "production": _2, "recreation": _2, "repbody": _2, "res": _2, "research": _2, "rotorcraft": _2, "safety": _2, "scientist": _2, "services": _2, "show": _2, "skydiving": _2, "software": _2, "student": _2, "taxi": _2, "trader": _2, "trading": _2, "trainer": _2, "union": _2, "workinggroup": _2, "works": _2 }], "af": _4, "ag": [1, { "co": _2, "com": _2, "net": _2, "nom": _2, "org": _2, "obj": _3 }], "ai": [1, { "com": _2, "net": _2, "off": _2, "org": _2, "uwu": _3, "framer": _3 }], "al": _5, "am": [1, { "co": _2, "com": _2, "commune": _2, "net": _2, "org": _2, "radio": _3 }], "ao": [1, { "co": _2, "ed": _2, "edu": _2, "gov": _2, "gv": _2, "it": _2, "og": _2, "org": _2, "pb": _2 }], "aq": _2, "ar": [1, { "bet": _2, "com": _2, "coop": _2, "edu": _2, "gob": _2, "gov": _2, "int": _2, "mil": _2, "musica": _2, "mutual": _2, "net": _2, "org": _2, "seg": _2, "senasa": _2, "tur": _2 }], "arpa": [1, { "e164": _2, "home": _2, "in-addr": _2, "ip6": _2, "iris": _2, "uri": _2, "urn": _2 }], "as": _10, "asia": [1, { "cloudns": _3, "daemon": _3, "dix": _3 }], "at": [1, { "4": _3, "ac": [1, { "sth": _2 }], "co": _2, "gv": _2, "or": _2, "funkfeuer": [0, { "wien": _3 }], "futurecms": [0, { "*": _3, "ex": _6, "in": _6 }], "futurehosting": _3, "futuremailing": _3, "ortsinfo": [0, { "ex": _6, "kunden": _6 }], "biz": _3, "info": _3, "123webseite": _3, "priv": _3, "my": _3, "myspreadshop": _3, "12hp": _3, "2ix": _3, "4lima": _3, "lima-city": _3 }], "au": [1, { "asn": _2, "com": [1, { "cloudlets": [0, { "mel": _3 }], "myspreadshop": _3 }], "edu": [1, { "act": _2, "catholic": _2, "nsw": _2, "nt": _2, "qld": _2, "sa": _2, "tas": _2, "vic": _2, "wa": _2 }], "gov": [1, { "qld": _2, "sa": _2, "tas": _2, "vic": _2, "wa": _2 }], "id": _2, "net": _2, "org": _2, "conf": _2, "oz": _2, "act": _2, "nsw": _2, "nt": _2, "qld": _2, "sa": _2, "tas": _2, "vic": _2, "wa": _2, "hrsn": _11 }], "aw": [1, { "com": _2 }], "ax": _2, "az": [1, { "biz": _2, "co": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "int": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "pp": _2, "pro": _2 }], "ba": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "brendly": _19, "rs": _3 }], "bb": [1, { "biz": _2, "co": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "net": _2, "org": _2, "store": _2, "tv": _2 }], "bd": _20, "be": [1, { "ac": _2, "cloudns": _3, "webhosting": _3, "interhostsolutions": [0, { "cloud": _3 }], "kuleuven": [0, { "ezproxy": _3 }], "123website": _3, "myspreadshop": _3, "transurl": _6 }], "bf": _10, "bg": [1, { "0": _2, "1": _2, "2": _2, "3": _2, "4": _2, "5": _2, "6": _2, "7": _2, "8": _2, "9": _2, "a": _2, "b": _2, "c": _2, "d": _2, "e": _2, "f": _2, "g": _2, "h": _2, "i": _2, "j": _2, "k": _2, "l": _2, "m": _2, "n": _2, "o": _2, "p": _2, "q": _2, "r": _2, "s": _2, "t": _2, "u": _2, "v": _2, "w": _2, "x": _2, "y": _2, "z": _2, "barsy": _3 }], "bh": _4, "bi": [1, { "co": _2, "com": _2, "edu": _2, "or": _2, "org": _2 }], "biz": [1, { "activetrail": _3, "cloud-ip": _3, "cloudns": _3, "jozi": _3, "dyndns": _3, "for-better": _3, "for-more": _3, "for-some": _3, "for-the": _3, "selfip": _3, "webhop": _3, "orx": _3, "mmafan": _3, "myftp": _3, "no-ip": _3, "dscloud": _3 }], "bj": [1, { "africa": _2, "agro": _2, "architectes": _2, "assur": _2, "avocats": _2, "co": _2, "com": _2, "eco": _2, "econo": _2, "edu": _2, "info": _2, "loisirs": _2, "money": _2, "net": _2, "org": _2, "ote": _2, "restaurant": _2, "resto": _2, "tourism": _2, "univ": _2 }], "bm": _4, "bn": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "co": _3 }], "bo": [1, { "com": _2, "edu": _2, "gob": _2, "int": _2, "mil": _2, "net": _2, "org": _2, "tv": _2, "web": _2, "academia": _2, "agro": _2, "arte": _2, "blog": _2, "bolivia": _2, "ciencia": _2, "cooperativa": _2, "democracia": _2, "deporte": _2, "ecologia": _2, "economia": _2, "empresa": _2, "indigena": _2, "industria": _2, "info": _2, "medicina": _2, "movimiento": _2, "musica": _2, "natural": _2, "nombre": _2, "noticias": _2, "patria": _2, "plurinacional": _2, "politica": _2, "profesional": _2, "pueblo": _2, "revista": _2, "salud": _2, "tecnologia": _2, "tksat": _2, "transporte": _2, "wiki": _2 }], "br": [1, { "9guacu": _2, "abc": _2, "adm": _2, "adv": _2, "agr": _2, "aju": _2, "am": _2, "anani": _2, "aparecida": _2, "api": _2, "app": _2, "arq": _2, "art": _2, "ato": _2, "b": _2, "barueri": _2, "belem": _2, "bet": _2, "bhz": _2, "bib": _2, "bio": _2, "blog": _2, "bmd": _2, "boavista": _2, "bsb": _2, "campinagrande": _2, "campinas": _2, "caxias": _2, "cim": _2, "cng": _2, "cnt": _2, "com": [1, { "simplesite": _3 }], "contagem": _2, "coop": _2, "coz": _2, "cri": _2, "cuiaba": _2, "curitiba": _2, "def": _2, "des": _2, "det": _2, "dev": _2, "ecn": _2, "eco": _2, "edu": _2, "emp": _2, "enf": _2, "eng": _2, "esp": _2, "etc": _2, "eti": _2, "far": _2, "feira": _2, "flog": _2, "floripa": _2, "fm": _2, "fnd": _2, "fortal": _2, "fot": _2, "foz": _2, "fst": _2, "g12": _2, "geo": _2, "ggf": _2, "goiania": _2, "gov": [1, { "ac": _2, "al": _2, "am": _2, "ap": _2, "ba": _2, "ce": _2, "df": _2, "es": _2, "go": _2, "ma": _2, "mg": _2, "ms": _2, "mt": _2, "pa": _2, "pb": _2, "pe": _2, "pi": _2, "pr": _2, "rj": _2, "rn": _2, "ro": _2, "rr": _2, "rs": _2, "sc": _2, "se": _2, "sp": _2, "to": _2 }], "gru": _2, "ia": _2, "imb": _2, "ind": _2, "inf": _2, "jab": _2, "jampa": _2, "jdf": _2, "joinville": _2, "jor": _2, "jus": _2, "leg": [1, { "ac": _3, "al": _3, "am": _3, "ap": _3, "ba": _3, "ce": _3, "df": _3, "es": _3, "go": _3, "ma": _3, "mg": _3, "ms": _3, "mt": _3, "pa": _3, "pb": _3, "pe": _3, "pi": _3, "pr": _3, "rj": _3, "rn": _3, "ro": _3, "rr": _3, "rs": _3, "sc": _3, "se": _3, "sp": _3, "to": _3 }], "leilao": _2, "lel": _2, "log": _2, "londrina": _2, "macapa": _2, "maceio": _2, "manaus": _2, "maringa": _2, "mat": _2, "med": _2, "mil": _2, "morena": _2, "mp": _2, "mus": _2, "natal": _2, "net": _2, "niteroi": _2, "nom": _20, "not": _2, "ntr": _2, "odo": _2, "ong": _2, "org": _2, "osasco": _2, "palmas": _2, "poa": _2, "ppg": _2, "pro": _2, "psc": _2, "psi": _2, "pvh": _2, "qsl": _2, "radio": _2, "rec": _2, "recife": _2, "rep": _2, "ribeirao": _2, "rio": _2, "riobranco": _2, "riopreto": _2, "salvador": _2, "sampa": _2, "santamaria": _2, "santoandre": _2, "saobernardo": _2, "saogonca": _2, "seg": _2, "sjc": _2, "slg": _2, "slz": _2, "social": _2, "sorocaba": _2, "srv": _2, "taxi": _2, "tc": _2, "tec": _2, "teo": _2, "the": _2, "tmp": _2, "trd": _2, "tur": _2, "tv": _2, "udi": _2, "vet": _2, "vix": _2, "vlog": _2, "wiki": _2, "xyz": _2, "zlg": _2, "tche": _3 }], "bs": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "we": _3 }], "bt": _4, "bv": _2, "bw": [1, { "ac": _2, "co": _2, "gov": _2, "net": _2, "org": _2 }], "by": [1, { "gov": _2, "mil": _2, "com": _2, "of": _2, "mediatech": _3 }], "bz": [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "za": _3, "mydns": _3, "gsj": _3 }], "ca": [1, { "ab": _2, "bc": _2, "mb": _2, "nb": _2, "nf": _2, "nl": _2, "ns": _2, "nt": _2, "nu": _2, "on": _2, "pe": _2, "qc": _2, "sk": _2, "yk": _2, "gc": _2, "barsy": _3, "awdev": _6, "co": _3, "no-ip": _3, "onid": _3, "myspreadshop": _3, "box": _3 }], "cat": _2, "cc": [1, { "cleverapps": _3, "cloudns": _3, "ftpaccess": _3, "game-server": _3, "myphotos": _3, "scrapping": _3, "twmail": _3, "csx": _3, "fantasyleague": _3, "spawn": [0, { "instances": _3 }] }], "cd": _10, "cf": _2, "cg": _2, "ch": [1, { "square7": _3, "cloudns": _3, "cloudscale": [0, { "cust": _3, "lpg": _22, "rma": _22 }], "objectstorage": [0, { "lpg": _3, "rma": _3 }], "flow": [0, { "ae": [0, { "alp1": _3 }], "appengine": _3 }], "linkyard-cloud": _3, "gotdns": _3, "dnsking": _3, "123website": _3, "myspreadshop": _3, "firenet": [0, { "*": _3, "svc": _6 }], "12hp": _3, "2ix": _3, "4lima": _3, "lima-city": _3 }], "ci": [1, { "ac": _2, "xn--aroport-bya": _2, "aéroport": _2, "asso": _2, "co": _2, "com": _2, "ed": _2, "edu": _2, "go": _2, "gouv": _2, "int": _2, "net": _2, "or": _2, "org": _2 }], "ck": _20, "cl": [1, { "co": _2, "gob": _2, "gov": _2, "mil": _2, "cloudns": _3 }], "cm": [1, { "co": _2, "com": _2, "gov": _2, "net": _2 }], "cn": [1, { "ac": _2, "com": [1, { "amazonaws": [0, { "cn-north-1": [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-deprecated": _3, "s3-object-lambda": _3, "s3-website": _3 }], "cn-northwest-1": [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _26, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3 }], "compute": _6, "airflow": [0, { "cn-north-1": _6, "cn-northwest-1": _6 }], "eb": [0, { "cn-north-1": _3, "cn-northwest-1": _3 }], "elb": _6 }], "amazonwebservices": [0, { "on": [0, { "cn-north-1": _12, "cn-northwest-1": _12 }] }], "sagemaker": [0, { "cn-north-1": _14, "cn-northwest-1": _14 }] }], "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "xn--55qx5d": _2, "公司": _2, "xn--od0alg": _2, "網絡": _2, "xn--io0a7i": _2, "网络": _2, "ah": _2, "bj": _2, "cq": _2, "fj": _2, "gd": _2, "gs": _2, "gx": _2, "gz": _2, "ha": _2, "hb": _2, "he": _2, "hi": _2, "hk": _2, "hl": _2, "hn": _2, "jl": _2, "js": _2, "jx": _2, "ln": _2, "mo": _2, "nm": _2, "nx": _2, "qh": _2, "sc": _2, "sd": _2, "sh": [1, { "as": _3 }], "sn": _2, "sx": _2, "tj": _2, "tw": _2, "xj": _2, "xz": _2, "yn": _2, "zj": _2, "canva-apps": _3, "canvasite": _24, "myqnapcloud": _3, "quickconnect": _27 }], "co": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "nom": _2, "org": _2, "carrd": _3, "crd": _3, "otap": _6, "hidns": _3, "leadpages": _3, "lpages": _3, "mypi": _3, "xmit": _6, "firewalledreplit": _9, "repl": _9, "supabase": [2, { "realtime": _3, "storage": _3 }] }], "com": [1, { "a2hosted": _3, "cpserver": _3, "adobeaemcloud": [2, { "dev": _6 }], "africa": _3, "aivencloud": _3, "alibabacloudcs": _3, "kasserver": _3, "amazonaws": [0, { "af-south-1": _30, "ap-east-1": _31, "ap-northeast-1": _32, "ap-northeast-2": _32, "ap-northeast-3": _30, "ap-south-1": _32, "ap-south-2": _33, "ap-southeast-1": _32, "ap-southeast-2": _32, "ap-southeast-3": _33, "ap-southeast-4": _33, "ap-southeast-5": [0, { "execute-api": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-deprecated": _3, "s3-object-lambda": _3, "s3-website": _3 }], "ca-central-1": _35, "ca-west-1": [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _34, "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-fips": _3, "s3-object-lambda": _3, "s3-website": _3 }], "eu-central-1": _32, "eu-central-2": _33, "eu-north-1": _31, "eu-south-1": _30, "eu-south-2": _33, "eu-west-1": [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-deprecated": _3, "s3-object-lambda": _3, "s3-website": _3, "analytics-gateway": _3, "aws-cloud9": _28, "cloud9": _29 }], "eu-west-2": _31, "eu-west-3": _30, "il-central-1": [0, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _25, "s3": _3, "s3-accesspoint": _3, "s3-object-lambda": _3, "s3-website": _3, "aws-cloud9": _28, "cloud9": [0, { "vfs": _3 }] }], "me-central-1": _33, "me-south-1": _31, "sa-east-1": _30, "us-east-1": [2, { "execute-api": _3, "emrappui-prod": _3, "emrnotebooks-prod": _3, "emrstudio-prod": _3, "dualstack": _34, "s3": _3, "s3-accesspoint": _3, "s3-accesspoint-fips": _3, "s3-deprecated": _3, "s3-fips": _3, "s3-object-lambda": _3, "s3-website": _3, "analytics-gateway": _3, "aws-cloud9": _28, "cloud9": _29 }], "us-east-2": _36, "us-gov-east-1": _38, "us-gov-west-1": _38, "us-west-1": _35, "us-west-2": _36, "compute": _6, "compute-1": _6, "airflow": [0, { "af-south-1": _6, "ap-east-1": _6, "ap-northeast-1": _6, "ap-northeast-2": _6, "ap-northeast-3": _6, "ap-south-1": _6, "ap-south-2": _6, "ap-southeast-1": _6, "ap-southeast-2": _6, "ap-southeast-3": _6, "ap-southeast-4": _6, "ap-southeast-5": _6, "ca-central-1": _6, "ca-west-1": _6, "eu-central-1": _6, "eu-central-2": _6, "eu-north-1": _6, "eu-south-1": _6, "eu-south-2": _6, "eu-west-1": _6, "eu-west-2": _6, "eu-west-3": _6, "il-central-1": _6, "me-central-1": _6, "me-south-1": _6, "sa-east-1": _6, "us-east-1": _6, "us-east-2": _6, "us-west-1": _6, "us-west-2": _6 }], "s3": _3, "s3-1": _3, "s3-ap-east-1": _3, "s3-ap-northeast-1": _3, "s3-ap-northeast-2": _3, "s3-ap-northeast-3": _3, "s3-ap-south-1": _3, "s3-ap-southeast-1": _3, "s3-ap-southeast-2": _3, "s3-ca-central-1": _3, "s3-eu-central-1": _3, "s3-eu-north-1": _3, "s3-eu-west-1": _3, "s3-eu-west-2": _3, "s3-eu-west-3": _3, "s3-external-1": _3, "s3-fips-us-gov-east-1": _3, "s3-fips-us-gov-west-1": _3, "s3-global": [0, { "accesspoint": [0, { "mrap": _3 }] }], "s3-me-south-1": _3, "s3-sa-east-1": _3, "s3-us-east-2": _3, "s3-us-gov-east-1": _3, "s3-us-gov-west-1": _3, "s3-us-west-1": _3, "s3-us-west-2": _3, "s3-website-ap-northeast-1": _3, "s3-website-ap-southeast-1": _3, "s3-website-ap-southeast-2": _3, "s3-website-eu-west-1": _3, "s3-website-sa-east-1": _3, "s3-website-us-east-1": _3, "s3-website-us-gov-west-1": _3, "s3-website-us-west-1": _3, "s3-website-us-west-2": _3, "elb": _6 }], "amazoncognito": [0, { "af-south-1": _39, "ap-east-1": _39, "ap-northeast-1": _39, "ap-northeast-2": _39, "ap-northeast-3": _39, "ap-south-1": _39, "ap-south-2": _39, "ap-southeast-1": _39, "ap-southeast-2": _39, "ap-southeast-3": _39, "ap-southeast-4": _39, "ap-southeast-5": _39, "ap-southeast-7": _39, "ca-central-1": _39, "ca-west-1": _39, "eu-central-1": _39, "eu-central-2": _39, "eu-north-1": _39, "eu-south-1": _39, "eu-south-2": _39, "eu-west-1": _39, "eu-west-2": _39, "eu-west-3": _39, "il-central-1": _39, "me-central-1": _39, "me-south-1": _39, "mx-central-1": _39, "sa-east-1": _39, "us-east-1": _40, "us-east-2": _40, "us-gov-east-1": _41, "us-gov-west-1": _41, "us-west-1": _40, "us-west-2": _40 }], "amplifyapp": _3, "awsapprunner": _6, "awsapps": _3, "elasticbeanstalk": [2, { "af-south-1": _3, "ap-east-1": _3, "ap-northeast-1": _3, "ap-northeast-2": _3, "ap-northeast-3": _3, "ap-south-1": _3, "ap-southeast-1": _3, "ap-southeast-2": _3, "ap-southeast-3": _3, "ca-central-1": _3, "eu-central-1": _3, "eu-north-1": _3, "eu-south-1": _3, "eu-west-1": _3, "eu-west-2": _3, "eu-west-3": _3, "il-central-1": _3, "me-south-1": _3, "sa-east-1": _3, "us-east-1": _3, "us-east-2": _3, "us-gov-east-1": _3, "us-gov-west-1": _3, "us-west-1": _3, "us-west-2": _3 }], "awsglobalaccelerator": _3, "siiites": _3, "appspacehosted": _3, "appspaceusercontent": _3, "on-aptible": _3, "myasustor": _3, "balena-devices": _3, "boutir": _3, "bplaced": _3, "cafjs": _3, "canva-apps": _3, "cdn77-storage": _3, "br": _3, "cn": _3, "de": _3, "eu": _3, "jpn": _3, "mex": _3, "ru": _3, "sa": _3, "uk": _3, "us": _3, "za": _3, "clever-cloud": [0, { "services": _6 }], "dnsabr": _3, "ip-ddns": _3, "jdevcloud": _3, "wpdevcloud": _3, "cf-ipfs": _3, "cloudflare-ipfs": _3, "trycloudflare": _3, "co": _3, "devinapps": _6, "builtwithdark": _3, "datadetect": [0, { "demo": _3, "instance": _3 }], "dattolocal": _3, "dattorelay": _3, "dattoweb": _3, "mydatto": _3, "digitaloceanspaces": _6, "discordsays": _3, "discordsez": _3, "drayddns": _3, "dreamhosters": _3, "durumis": _3, "blogdns": _3, "cechire": _3, "dnsalias": _3, "dnsdojo": _3, "doesntexist": _3, "dontexist": _3, "doomdns": _3, "dyn-o-saur": _3, "dynalias": _3, "dyndns-at-home": _3, "dyndns-at-work": _3, "dyndns-blog": _3, "dyndns-free": _3, "dyndns-home": _3, "dyndns-ip": _3, "dyndns-mail": _3, "dyndns-office": _3, "dyndns-pics": _3, "dyndns-remote": _3, "dyndns-server": _3, "dyndns-web": _3, "dyndns-wiki": _3, "dyndns-work": _3, "est-a-la-maison": _3, "est-a-la-masion": _3, "est-le-patron": _3, "est-mon-blogueur": _3, "from-ak": _3, "from-al": _3, "from-ar": _3, "from-ca": _3, "from-ct": _3, "from-dc": _3, "from-de": _3, "from-fl": _3, "from-ga": _3, "from-hi": _3, "from-ia": _3, "from-id": _3, "from-il": _3, "from-in": _3, "from-ks": _3, "from-ky": _3, "from-ma": _3, "from-md": _3, "from-mi": _3, "from-mn": _3, "from-mo": _3, "from-ms": _3, "from-mt": _3, "from-nc": _3, "from-nd": _3, "from-ne": _3, "from-nh": _3, "from-nj": _3, "from-nm": _3, "from-nv": _3, "from-oh": _3, "from-ok": _3, "from-or": _3, "from-pa": _3, "from-pr": _3, "from-ri": _3, "from-sc": _3, "from-sd": _3, "from-tn": _3, "from-tx": _3, "from-ut": _3, "from-va": _3, "from-vt": _3, "from-wa": _3, "from-wi": _3, "from-wv": _3, "from-wy": _3, "getmyip": _3, "gotdns": _3, "hobby-site": _3, "homelinux": _3, "homeunix": _3, "iamallama": _3, "is-a-anarchist": _3, "is-a-blogger": _3, "is-a-bookkeeper": _3, "is-a-bulls-fan": _3, "is-a-caterer": _3, "is-a-chef": _3, "is-a-conservative": _3, "is-a-cpa": _3, "is-a-cubicle-slave": _3, "is-a-democrat": _3, "is-a-designer": _3, "is-a-doctor": _3, "is-a-financialadvisor": _3, "is-a-geek": _3, "is-a-green": _3, "is-a-guru": _3, "is-a-hard-worker": _3, "is-a-hunter": _3, "is-a-landscaper": _3, "is-a-lawyer": _3, "is-a-liberal": _3, "is-a-libertarian": _3, "is-a-llama": _3, "is-a-musician": _3, "is-a-nascarfan": _3, "is-a-nurse": _3, "is-a-painter": _3, "is-a-personaltrainer": _3, "is-a-photographer": _3, "is-a-player": _3, "is-a-republican": _3, "is-a-rockstar": _3, "is-a-socialist": _3, "is-a-student": _3, "is-a-teacher": _3, "is-a-techie": _3, "is-a-therapist": _3, "is-an-accountant": _3, "is-an-actor": _3, "is-an-actress": _3, "is-an-anarchist": _3, "is-an-artist": _3, "is-an-engineer": _3, "is-an-entertainer": _3, "is-certified": _3, "is-gone": _3, "is-into-anime": _3, "is-into-cars": _3, "is-into-cartoons": _3, "is-into-games": _3, "is-leet": _3, "is-not-certified": _3, "is-slick": _3, "is-uberleet": _3, "is-with-theband": _3, "isa-geek": _3, "isa-hockeynut": _3, "issmarterthanyou": _3, "likes-pie": _3, "likescandy": _3, "neat-url": _3, "saves-the-whales": _3, "selfip": _3, "sells-for-less": _3, "sells-for-u": _3, "servebbs": _3, "simple-url": _3, "space-to-rent": _3, "teaches-yoga": _3, "writesthisblog": _3, "ddnsfree": _3, "ddnsgeek": _3, "giize": _3, "gleeze": _3, "kozow": _3, "loseyourip": _3, "ooguy": _3, "theworkpc": _3, "mytuleap": _3, "tuleap-partners": _3, "encoreapi": _3, "evennode": [0, { "eu-1": _3, "eu-2": _3, "eu-3": _3, "eu-4": _3, "us-1": _3, "us-2": _3, "us-3": _3, "us-4": _3 }], "onfabrica": _3, "fastly-edge": _3, "fastly-terrarium": _3, "fastvps-server": _3, "mydobiss": _3, "firebaseapp": _3, "fldrv": _3, "forgeblocks": _3, "framercanvas": _3, "freebox-os": _3, "freeboxos": _3, "freemyip": _3, "aliases121": _3, "gentapps": _3, "gentlentapis": _3, "githubusercontent": _3, "0emm": _6, "appspot": [2, { "r": _6 }], "blogspot": _3, "codespot": _3, "googleapis": _3, "googlecode": _3, "pagespeedmobilizer": _3, "withgoogle": _3, "withyoutube": _3, "grayjayleagues": _3, "hatenablog": _3, "hatenadiary": _3, "herokuapp": _3, "gr": _3, "smushcdn": _3, "wphostedmail": _3, "wpmucdn": _3, "pixolino": _3, "apps-1and1": _3, "live-website": _3, "webspace-host": _3, "dopaas": _3, "hosted-by-previder": _43, "hosteur": [0, { "rag-cloud": _3, "rag-cloud-ch": _3 }], "ik-server": [0, { "jcloud": _3, "jcloud-ver-jpc": _3 }], "jelastic": [0, { "demo": _3 }], "massivegrid": _43, "wafaicloud": [0, { "jed": _3, "ryd": _3 }], "jote-dr-lt1": _3, "jote-rd-lt1": _3, "webadorsite": _3, "joyent": [0, { "cns": _6 }], "on-forge": _3, "on-vapor": _3, "lpusercontent": _3, "linode": [0, { "members": _3, "nodebalancer": _6 }], "linodeobjects": _6, "linodeusercontent": [0, { "ip": _3 }], "localtonet": _3, "lovableproject": _3, "barsycenter": _3, "barsyonline": _3, "lutrausercontent": _6, "modelscape": _3, "mwcloudnonprod": _3, "polyspace": _3, "mazeplay": _3, "miniserver": _3, "atmeta": _3, "fbsbx": _42, "meteorapp": _44, "routingthecloud": _3, "same-app": _3, "same-preview": _3, "mydbserver": _3, "hostedpi": _3, "mythic-beasts": [0, { "caracal": _3, "customer": _3, "fentiger": _3, "lynx": _3, "ocelot": _3, "oncilla": _3, "onza": _3, "sphinx": _3, "vs": _3, "x": _3, "yali": _3 }], "nospamproxy": [0, { "cloud": [2, { "o365": _3 }] }], "4u": _3, "nfshost": _3, "3utilities": _3, "blogsyte": _3, "ciscofreak": _3, "damnserver": _3, "ddnsking": _3, "ditchyourip": _3, "dnsiskinky": _3, "dynns": _3, "geekgalaxy": _3, "health-carereform": _3, "homesecuritymac": _3, "homesecuritypc": _3, "myactivedirectory": _3, "mysecuritycamera": _3, "myvnc": _3, "net-freaks": _3, "onthewifi": _3, "point2this": _3, "quicksytes": _3, "securitytactics": _3, "servebeer": _3, "servecounterstrike": _3, "serveexchange": _3, "serveftp": _3, "servegame": _3, "servehalflife": _3, "servehttp": _3, "servehumour": _3, "serveirc": _3, "servemp3": _3, "servep2p": _3, "servepics": _3, "servequake": _3, "servesarcasm": _3, "stufftoread": _3, "unusualperson": _3, "workisboring": _3, "myiphost": _3, "observableusercontent": [0, { "static": _3 }], "simplesite": _3, "oaiusercontent": _6, "orsites": _3, "operaunite": _3, "customer-oci": [0, { "*": _3, "oci": _6, "ocp": _6, "ocs": _6 }], "oraclecloudapps": _6, "oraclegovcloudapps": _6, "authgear-staging": _3, "authgearapps": _3, "skygearapp": _3, "outsystemscloud": _3, "ownprovider": _3, "pgfog": _3, "pagexl": _3, "gotpantheon": _3, "paywhirl": _6, "upsunapp": _3, "postman-echo": _3, "prgmr": [0, { "xen": _3 }], "project-study": [0, { "dev": _3 }], "pythonanywhere": _44, "qa2": _3, "alpha-myqnapcloud": _3, "dev-myqnapcloud": _3, "mycloudnas": _3, "mynascloud": _3, "myqnapcloud": _3, "qualifioapp": _3, "ladesk": _3, "qualyhqpartner": _6, "qualyhqportal": _6, "qbuser": _3, "quipelements": _6, "rackmaze": _3, "readthedocs-hosted": _3, "rhcloud": _3, "onrender": _3, "render": _45, "subsc-pay": _3, "180r": _3, "dojin": _3, "sakuratan": _3, "sakuraweb": _3, "x0": _3, "code": [0, { "builder": _6, "dev-builder": _6, "stg-builder": _6 }], "salesforce": [0, { "platform": [0, { "code-builder-stg": [0, { "test": [0, { "001": _6 }] }] }] }], "logoip": _3, "scrysec": _3, "firewall-gateway": _3, "myshopblocks": _3, "myshopify": _3, "shopitsite": _3, "1kapp": _3, "appchizi": _3, "applinzi": _3, "sinaapp": _3, "vipsinaapp": _3, "streamlitapp": _3, "try-snowplow": _3, "playstation-cloud": _3, "myspreadshop": _3, "w-corp-staticblitz": _3, "w-credentialless-staticblitz": _3, "w-staticblitz": _3, "stackhero-network": _3, "stdlib": [0, { "api": _3 }], "strapiapp": [2, { "media": _3 }], "streak-link": _3, "streaklinks": _3, "streakusercontent": _3, "temp-dns": _3, "dsmynas": _3, "familyds": _3, "mytabit": _3, "taveusercontent": _3, "tb-hosting": _46, "reservd": _3, "thingdustdata": _3, "townnews-staging": _3, "typeform": [0, { "pro": _3 }], "hk": _3, "it": _3, "deus-canvas": _3, "vultrobjects": _6, "wafflecell": _3, "hotelwithflight": _3, "reserve-online": _3, "cprapid": _3, "pleskns": _3, "remotewd": _3, "wiardweb": [0, { "pages": _3 }], "wixsite": _3, "wixstudio": _3, "messwithdns": _3, "woltlab-demo": _3, "wpenginepowered": [2, { "js": _3 }], "xnbay": [2, { "u2": _3, "u2-local": _3 }], "yolasite": _3 }], "coop": _2, "cr": [1, { "ac": _2, "co": _2, "ed": _2, "fi": _2, "go": _2, "or": _2, "sa": _2 }], "cu": [1, { "com": _2, "edu": _2, "gob": _2, "inf": _2, "nat": _2, "net": _2, "org": _2 }], "cv": [1, { "com": _2, "edu": _2, "id": _2, "int": _2, "net": _2, "nome": _2, "org": _2, "publ": _2 }], "cw": _47, "cx": [1, { "gov": _2, "cloudns": _3, "ath": _3, "info": _3, "assessments": _3, "calculators": _3, "funnels": _3, "paynow": _3, "quizzes": _3, "researched": _3, "tests": _3 }], "cy": [1, { "ac": _2, "biz": _2, "com": [1, { "scaleforce": _48 }], "ekloges": _2, "gov": _2, "ltd": _2, "mil": _2, "net": _2, "org": _2, "press": _2, "pro": _2, "tm": _2 }], "cz": [1, { "gov": _2, "contentproxy9": [0, { "rsc": _3 }], "realm": _3, "e4": _3, "co": _3, "metacentrum": [0, { "cloud": _6, "custom": _3 }], "muni": [0, { "cloud": [0, { "flt": _3, "usr": _3 }] }] }], "de": [1, { "bplaced": _3, "square7": _3, "com": _3, "cosidns": _49, "dnsupdater": _3, "dynamisches-dns": _3, "internet-dns": _3, "l-o-g-i-n": _3, "ddnss": [2, { "dyn": _3, "dyndns": _3 }], "dyn-ip24": _3, "dyndns1": _3, "home-webserver": [2, { "dyn": _3 }], "myhome-server": _3, "dnshome": _3, "fuettertdasnetz": _3, "isteingeek": _3, "istmein": _3, "lebtimnetz": _3, "leitungsen": _3, "traeumtgerade": _3, "frusky": _6, "goip": _3, "xn--gnstigbestellen-zvb": _3, "günstigbestellen": _3, "xn--gnstigliefern-wob": _3, "günstigliefern": _3, "hs-heilbronn": [0, { "it": [0, { "pages": _3, "pages-research": _3 }] }], "dyn-berlin": _3, "in-berlin": _3, "in-brb": _3, "in-butter": _3, "in-dsl": _3, "in-vpn": _3, "iservschule": _3, "mein-iserv": _3, "schuldock": _3, "schulplattform": _3, "schulserver": _3, "test-iserv": _3, "keymachine": _3, "co": _3, "git-repos": _3, "lcube-server": _3, "svn-repos": _3, "barsy": _3, "webspaceconfig": _3, "123webseite": _3, "rub": _3, "ruhr-uni-bochum": [2, { "noc": [0, { "io": _3 }] }], "logoip": _3, "firewall-gateway": _3, "my-gateway": _3, "my-router": _3, "spdns": _3, "my": _3, "speedpartner": [0, { "customer": _3 }], "myspreadshop": _3, "taifun-dns": _3, "12hp": _3, "2ix": _3, "4lima": _3, "lima-city": _3, "dd-dns": _3, "dray-dns": _3, "draydns": _3, "dyn-vpn": _3, "dynvpn": _3, "mein-vigor": _3, "my-vigor": _3, "my-wan": _3, "syno-ds": _3, "synology-diskstation": _3, "synology-ds": _3, "virtual-user": _3, "virtualuser": _3, "community-pro": _3, "diskussionsbereich": _3 }], "dj": _2, "dk": [1, { "biz": _3, "co": _3, "firm": _3, "reg": _3, "store": _3, "123hjemmeside": _3, "myspreadshop": _3 }], "dm": _51, "do": [1, { "art": _2, "com": _2, "edu": _2, "gob": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "sld": _2, "web": _2 }], "dz": [1, { "art": _2, "asso": _2, "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "pol": _2, "soc": _2, "tm": _2 }], "ec": [1, { "abg": _2, "adm": _2, "agron": _2, "arqt": _2, "art": _2, "bar": _2, "chef": _2, "com": _2, "cont": _2, "cpa": _2, "cue": _2, "dent": _2, "dgn": _2, "disco": _2, "doc": _2, "edu": _2, "eng": _2, "esm": _2, "fin": _2, "fot": _2, "gal": _2, "gob": _2, "gov": _2, "gye": _2, "ibr": _2, "info": _2, "k12": _2, "lat": _2, "loj": _2, "med": _2, "mil": _2, "mktg": _2, "mon": _2, "net": _2, "ntr": _2, "odont": _2, "org": _2, "pro": _2, "prof": _2, "psic": _2, "psiq": _2, "pub": _2, "rio": _2, "rrpp": _2, "sal": _2, "tech": _2, "tul": _2, "tur": _2, "uio": _2, "vet": _2, "xxx": _2, "base": _3, "official": _3 }], "edu": [1, { "rit": [0, { "git-pages": _3 }] }], "ee": [1, { "aip": _2, "com": _2, "edu": _2, "fie": _2, "gov": _2, "lib": _2, "med": _2, "org": _2, "pri": _2, "riik": _2 }], "eg": [1, { "ac": _2, "com": _2, "edu": _2, "eun": _2, "gov": _2, "info": _2, "me": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "sci": _2, "sport": _2, "tv": _2 }], "er": _20, "es": [1, { "com": _2, "edu": _2, "gob": _2, "nom": _2, "org": _2, "123miweb": _3, "myspreadshop": _3 }], "et": [1, { "biz": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "name": _2, "net": _2, "org": _2 }], "eu": [1, { "cloudns": _3, "dogado": [0, { "jelastic": _3 }], "barsy": _3, "spdns": _3, "nxa": _6, "transurl": _6, "diskstation": _3 }], "fi": [1, { "aland": _2, "dy": _3, "xn--hkkinen-5wa": _3, "häkkinen": _3, "iki": _3, "cloudplatform": [0, { "fi": _3 }], "datacenter": [0, { "demo": _3, "paas": _3 }], "kapsi": _3, "123kotisivu": _3, "myspreadshop": _3 }], "fj": [1, { "ac": _2, "biz": _2, "com": _2, "gov": _2, "info": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "pro": _2 }], "fk": _20, "fm": [1, { "com": _2, "edu": _2, "net": _2, "org": _2, "radio": _3, "user": _6 }], "fo": _2, "fr": [1, { "asso": _2, "com": _2, "gouv": _2, "nom": _2, "prd": _2, "tm": _2, "avoues": _2, "cci": _2, "greta": _2, "huissier-justice": _2, "en-root": _3, "fbx-os": _3, "fbxos": _3, "freebox-os": _3, "freeboxos": _3, "goupile": _3, "123siteweb": _3, "on-web": _3, "chirurgiens-dentistes-en-france": _3, "dedibox": _3, "aeroport": _3, "avocat": _3, "chambagri": _3, "chirurgiens-dentistes": _3, "experts-comptables": _3, "medecin": _3, "notaires": _3, "pharmacien": _3, "port": _3, "veterinaire": _3, "myspreadshop": _3, "ynh": _3 }], "ga": _2, "gb": _2, "gd": [1, { "edu": _2, "gov": _2 }], "ge": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "pvt": _2, "school": _2 }], "gf": _2, "gg": [1, { "co": _2, "net": _2, "org": _2, "botdash": _3, "kaas": _3, "stackit": _3, "panel": [2, { "daemon": _3 }] }], "gh": [1, { "biz": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2 }], "gi": [1, { "com": _2, "edu": _2, "gov": _2, "ltd": _2, "mod": _2, "org": _2 }], "gl": [1, { "co": _2, "com": _2, "edu": _2, "net": _2, "org": _2 }], "gm": _2, "gn": [1, { "ac": _2, "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2 }], "gov": _2, "gp": [1, { "asso": _2, "com": _2, "edu": _2, "mobi": _2, "net": _2, "org": _2 }], "gq": _2, "gr": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "barsy": _3, "simplesite": _3 }], "gs": _2, "gt": [1, { "com": _2, "edu": _2, "gob": _2, "ind": _2, "mil": _2, "net": _2, "org": _2 }], "gu": [1, { "com": _2, "edu": _2, "gov": _2, "guam": _2, "info": _2, "net": _2, "org": _2, "web": _2 }], "gw": [1, { "nx": _3 }], "gy": _51, "hk": [1, { "com": _2, "edu": _2, "gov": _2, "idv": _2, "net": _2, "org": _2, "xn--ciqpn": _2, "个人": _2, "xn--gmqw5a": _2, "個人": _2, "xn--55qx5d": _2, "公司": _2, "xn--mxtq1m": _2, "政府": _2, "xn--lcvr32d": _2, "敎育": _2, "xn--wcvs22d": _2, "教育": _2, "xn--gmq050i": _2, "箇人": _2, "xn--uc0atv": _2, "組織": _2, "xn--uc0ay4a": _2, "組织": _2, "xn--od0alg": _2, "網絡": _2, "xn--zf0avx": _2, "網络": _2, "xn--mk0axi": _2, "组織": _2, "xn--tn0ag": _2, "组织": _2, "xn--od0aq3b": _2, "网絡": _2, "xn--io0a7i": _2, "网络": _2, "inc": _3, "ltd": _3 }], "hm": _2, "hn": [1, { "com": _2, "edu": _2, "gob": _2, "mil": _2, "net": _2, "org": _2 }], "hr": [1, { "com": _2, "from": _2, "iz": _2, "name": _2, "brendly": _19 }], "ht": [1, { "adult": _2, "art": _2, "asso": _2, "com": _2, "coop": _2, "edu": _2, "firm": _2, "gouv": _2, "info": _2, "med": _2, "net": _2, "org": _2, "perso": _2, "pol": _2, "pro": _2, "rel": _2, "shop": _2, "rt": _3 }], "hu": [1, { "2000": _2, "agrar": _2, "bolt": _2, "casino": _2, "city": _2, "co": _2, "erotica": _2, "erotika": _2, "film": _2, "forum": _2, "games": _2, "hotel": _2, "info": _2, "ingatlan": _2, "jogasz": _2, "konyvelo": _2, "lakas": _2, "media": _2, "news": _2, "org": _2, "priv": _2, "reklam": _2, "sex": _2, "shop": _2, "sport": _2, "suli": _2, "szex": _2, "tm": _2, "tozsde": _2, "utazas": _2, "video": _2 }], "id": [1, { "ac": _2, "biz": _2, "co": _2, "desa": _2, "go": _2, "kop": _2, "mil": _2, "my": _2, "net": _2, "or": _2, "ponpes": _2, "sch": _2, "web": _2, "e": _3, "zone": _3 }], "ie": [1, { "gov": _2, "myspreadshop": _3 }], "il": [1, { "ac": _2, "co": [1, { "ravpage": _3, "mytabit": _3, "tabitorder": _3 }], "gov": _2, "idf": _2, "k12": _2, "muni": _2, "net": _2, "org": _2 }], "xn--4dbrk0ce": [1, { "xn--4dbgdty6c": _2, "xn--5dbhl8d": _2, "xn--8dbq2a": _2, "xn--hebda8b": _2 }], "ישראל": [1, { "אקדמיה": _2, "ישוב": _2, "צהל": _2, "ממשל": _2 }], "im": [1, { "ac": _2, "co": [1, { "ltd": _2, "plc": _2 }], "com": _2, "net": _2, "org": _2, "tt": _2, "tv": _2 }], "in": [1, { "5g": _2, "6g": _2, "ac": _2, "ai": _2, "am": _2, "bihar": _2, "biz": _2, "business": _2, "ca": _2, "cn": _2, "co": _2, "com": _2, "coop": _2, "cs": _2, "delhi": _2, "dr": _2, "edu": _2, "er": _2, "firm": _2, "gen": _2, "gov": _2, "gujarat": _2, "ind": _2, "info": _2, "int": _2, "internet": _2, "io": _2, "me": _2, "mil": _2, "net": _2, "nic": _2, "org": _2, "pg": _2, "post": _2, "pro": _2, "res": _2, "travel": _2, "tv": _2, "uk": _2, "up": _2, "us": _2, "cloudns": _3, "barsy": _3, "web": _3, "supabase": _3 }], "info": [1, { "cloudns": _3, "dynamic-dns": _3, "barrel-of-knowledge": _3, "barrell-of-knowledge": _3, "dyndns": _3, "for-our": _3, "groks-the": _3, "groks-this": _3, "here-for-more": _3, "knowsitall": _3, "selfip": _3, "webhop": _3, "barsy": _3, "mayfirst": _3, "mittwald": _3, "mittwaldserver": _3, "typo3server": _3, "dvrcam": _3, "ilovecollege": _3, "no-ip": _3, "forumz": _3, "nsupdate": _3, "dnsupdate": _3, "v-info": _3 }], "int": [1, { "eu": _2 }], "io": [1, { "2038": _3, "co": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "nom": _2, "org": _2, "on-acorn": _6, "myaddr": _3, "apigee": _3, "b-data": _3, "beagleboard": _3, "bitbucket": _3, "bluebite": _3, "boxfuse": _3, "brave": _7, "browsersafetymark": _3, "bubble": _54, "bubbleapps": _3, "bigv": [0, { "uk0": _3 }], "cleverapps": _3, "cloudbeesusercontent": _3, "dappnode": [0, { "dyndns": _3 }], "darklang": _3, "definima": _3, "dedyn": _3, "icp0": _55, "icp1": _55, "qzz": _3, "fh-muenster": _3, "shw": _3, "forgerock": [0, { "id": _3 }], "github": _3, "gitlab": _3, "lolipop": _3, "hasura-app": _3, "hostyhosting": _3, "hypernode": _3, "moonscale": _6, "beebyte": _43, "beebyteapp": [0, { "sekd1": _3 }], "jele": _3, "webthings": _3, "loginline": _3, "barsy": _3, "azurecontainer": _6, "ngrok": [2, { "ap": _3, "au": _3, "eu": _3, "in": _3, "jp": _3, "sa": _3, "us": _3 }], "nodeart": [0, { "stage": _3 }], "pantheonsite": _3, "pstmn": [2, { "mock": _3 }], "protonet": _3, "qcx": [2, { "sys": _6 }], "qoto": _3, "vaporcloud": _3, "myrdbx": _3, "rb-hosting": _46, "on-k3s": _6, "on-rio": _6, "readthedocs": _3, "resindevice": _3, "resinstaging": [0, { "devices": _3 }], "hzc": _3, "sandcats": _3, "scrypted": [0, { "client": _3 }], "mo-siemens": _3, "lair": _42, "stolos": _6, "musician": _3, "utwente": _3, "edugit": _3, "telebit": _3, "thingdust": [0, { "dev": _56, "disrec": _56, "prod": _57, "testing": _56 }], "tickets": _3, "webflow": _3, "webflowtest": _3, "editorx": _3, "wixstudio": _3, "basicserver": _3, "virtualserver": _3 }], "iq": _5, "ir": [1, { "ac": _2, "co": _2, "gov": _2, "id": _2, "net": _2, "org": _2, "sch": _2, "xn--mgba3a4f16a": _2, "ایران": _2, "xn--mgba3a4fra": _2, "ايران": _2, "arvanedge": _3, "vistablog": _3 }], "is": _2, "it": [1, { "edu": _2, "gov": _2, "abr": _2, "abruzzo": _2, "aosta-valley": _2, "aostavalley": _2, "bas": _2, "basilicata": _2, "cal": _2, "calabria": _2, "cam": _2, "campania": _2, "emilia-romagna": _2, "emiliaromagna": _2, "emr": _2, "friuli-v-giulia": _2, "friuli-ve-giulia": _2, "friuli-vegiulia": _2, "friuli-venezia-giulia": _2, "friuli-veneziagiulia": _2, "friuli-vgiulia": _2, "friuliv-giulia": _2, "friulive-giulia": _2, "friulivegiulia": _2, "friulivenezia-giulia": _2, "friuliveneziagiulia": _2, "friulivgiulia": _2, "fvg": _2, "laz": _2, "lazio": _2, "lig": _2, "liguria": _2, "lom": _2, "lombardia": _2, "lombardy": _2, "lucania": _2, "mar": _2, "marche": _2, "mol": _2, "molise": _2, "piedmont": _2, "piemonte": _2, "pmn": _2, "pug": _2, "puglia": _2, "sar": _2, "sardegna": _2, "sardinia": _2, "sic": _2, "sicilia": _2, "sicily": _2, "taa": _2, "tos": _2, "toscana": _2, "trentin-sud-tirol": _2, "xn--trentin-sd-tirol-rzb": _2, "trentin-süd-tirol": _2, "trentin-sudtirol": _2, "xn--trentin-sdtirol-7vb": _2, "trentin-südtirol": _2, "trentin-sued-tirol": _2, "trentin-suedtirol": _2, "trentino": _2, "trentino-a-adige": _2, "trentino-aadige": _2, "trentino-alto-adige": _2, "trentino-altoadige": _2, "trentino-s-tirol": _2, "trentino-stirol": _2, "trentino-sud-tirol": _2, "xn--trentino-sd-tirol-c3b": _2, "trentino-süd-tirol": _2, "trentino-sudtirol": _2, "xn--trentino-sdtirol-szb": _2, "trentino-südtirol": _2, "trentino-sued-tirol": _2, "trentino-suedtirol": _2, "trentinoa-adige": _2, "trentinoaadige": _2, "trentinoalto-adige": _2, "trentinoaltoadige": _2, "trentinos-tirol": _2, "trentinostirol": _2, "trentinosud-tirol": _2, "xn--trentinosd-tirol-rzb": _2, "trentinosüd-tirol": _2, "trentinosudtirol": _2, "xn--trentinosdtirol-7vb": _2, "trentinosüdtirol": _2, "trentinosued-tirol": _2, "trentinosuedtirol": _2, "trentinsud-tirol": _2, "xn--trentinsd-tirol-6vb": _2, "trentinsüd-tirol": _2, "trentinsudtirol": _2, "xn--trentinsdtirol-nsb": _2, "trentinsüdtirol": _2, "trentinsued-tirol": _2, "trentinsuedtirol": _2, "tuscany": _2, "umb": _2, "umbria": _2, "val-d-aosta": _2, "val-daosta": _2, "vald-aosta": _2, "valdaosta": _2, "valle-aosta": _2, "valle-d-aosta": _2, "valle-daosta": _2, "valleaosta": _2, "valled-aosta": _2, "valledaosta": _2, "vallee-aoste": _2, "xn--valle-aoste-ebb": _2, "vallée-aoste": _2, "vallee-d-aoste": _2, "xn--valle-d-aoste-ehb": _2, "vallée-d-aoste": _2, "valleeaoste": _2, "xn--valleaoste-e7a": _2, "valléeaoste": _2, "valleedaoste": _2, "xn--valledaoste-ebb": _2, "valléedaoste": _2, "vao": _2, "vda": _2, "ven": _2, "veneto": _2, "ag": _2, "agrigento": _2, "al": _2, "alessandria": _2, "alto-adige": _2, "altoadige": _2, "an": _2, "ancona": _2, "andria-barletta-trani": _2, "andria-trani-barletta": _2, "andriabarlettatrani": _2, "andriatranibarletta": _2, "ao": _2, "aosta": _2, "aoste": _2, "ap": _2, "aq": _2, "aquila": _2, "ar": _2, "arezzo": _2, "ascoli-piceno": _2, "ascolipiceno": _2, "asti": _2, "at": _2, "av": _2, "avellino": _2, "ba": _2, "balsan": _2, "balsan-sudtirol": _2, "xn--balsan-sdtirol-nsb": _2, "balsan-südtirol": _2, "balsan-suedtirol": _2, "bari": _2, "barletta-trani-andria": _2, "barlettatraniandria": _2, "belluno": _2, "benevento": _2, "bergamo": _2, "bg": _2, "bi": _2, "biella": _2, "bl": _2, "bn": _2, "bo": _2, "bologna": _2, "bolzano": _2, "bolzano-altoadige": _2, "bozen": _2, "bozen-sudtirol": _2, "xn--bozen-sdtirol-2ob": _2, "bozen-südtirol": _2, "bozen-suedtirol": _2, "br": _2, "brescia": _2, "brindisi": _2, "bs": _2, "bt": _2, "bulsan": _2, "bulsan-sudtirol": _2, "xn--bulsan-sdtirol-nsb": _2, "bulsan-südtirol": _2, "bulsan-suedtirol": _2, "bz": _2, "ca": _2, "cagliari": _2, "caltanissetta": _2, "campidano-medio": _2, "campidanomedio": _2, "campobasso": _2, "carbonia-iglesias": _2, "carboniaiglesias": _2, "carrara-massa": _2, "carraramassa": _2, "caserta": _2, "catania": _2, "catanzaro": _2, "cb": _2, "ce": _2, "cesena-forli": _2, "xn--cesena-forl-mcb": _2, "cesena-forlì": _2, "cesenaforli": _2, "xn--cesenaforl-i8a": _2, "cesenaforlì": _2, "ch": _2, "chieti": _2, "ci": _2, "cl": _2, "cn": _2, "co": _2, "como": _2, "cosenza": _2, "cr": _2, "cremona": _2, "crotone": _2, "cs": _2, "ct": _2, "cuneo": _2, "cz": _2, "dell-ogliastra": _2, "dellogliastra": _2, "en": _2, "enna": _2, "fc": _2, "fe": _2, "fermo": _2, "ferrara": _2, "fg": _2, "fi": _2, "firenze": _2, "florence": _2, "fm": _2, "foggia": _2, "forli-cesena": _2, "xn--forl-cesena-fcb": _2, "forlì-cesena": _2, "forlicesena": _2, "xn--forlcesena-c8a": _2, "forlìcesena": _2, "fr": _2, "frosinone": _2, "ge": _2, "genoa": _2, "genova": _2, "go": _2, "gorizia": _2, "gr": _2, "grosseto": _2, "iglesias-carbonia": _2, "iglesiascarbonia": _2, "im": _2, "imperia": _2, "is": _2, "isernia": _2, "kr": _2, "la-spezia": _2, "laquila": _2, "laspezia": _2, "latina": _2, "lc": _2, "le": _2, "lecce": _2, "lecco": _2, "li": _2, "livorno": _2, "lo": _2, "lodi": _2, "lt": _2, "lu": _2, "lucca": _2, "macerata": _2, "mantova": _2, "massa-carrara": _2, "massacarrara": _2, "matera": _2, "mb": _2, "mc": _2, "me": _2, "medio-campidano": _2, "mediocampidano": _2, "messina": _2, "mi": _2, "milan": _2, "milano": _2, "mn": _2, "mo": _2, "modena": _2, "monza": _2, "monza-brianza": _2, "monza-e-della-brianza": _2, "monzabrianza": _2, "monzaebrianza": _2, "monzaedellabrianza": _2, "ms": _2, "mt": _2, "na": _2, "naples": _2, "napoli": _2, "no": _2, "novara": _2, "nu": _2, "nuoro": _2, "og": _2, "ogliastra": _2, "olbia-tempio": _2, "olbiatempio": _2, "or": _2, "oristano": _2, "ot": _2, "pa": _2, "padova": _2, "padua": _2, "palermo": _2, "parma": _2, "pavia": _2, "pc": _2, "pd": _2, "pe": _2, "perugia": _2, "pesaro-urbino": _2, "pesarourbino": _2, "pescara": _2, "pg": _2, "pi": _2, "piacenza": _2, "pisa": _2, "pistoia": _2, "pn": _2, "po": _2, "pordenone": _2, "potenza": _2, "pr": _2, "prato": _2, "pt": _2, "pu": _2, "pv": _2, "pz": _2, "ra": _2, "ragusa": _2, "ravenna": _2, "rc": _2, "re": _2, "reggio-calabria": _2, "reggio-emilia": _2, "reggiocalabria": _2, "reggioemilia": _2, "rg": _2, "ri": _2, "rieti": _2, "rimini": _2, "rm": _2, "rn": _2, "ro": _2, "roma": _2, "rome": _2, "rovigo": _2, "sa": _2, "salerno": _2, "sassari": _2, "savona": _2, "si": _2, "siena": _2, "siracusa": _2, "so": _2, "sondrio": _2, "sp": _2, "sr": _2, "ss": _2, "xn--sdtirol-n2a": _2, "südtirol": _2, "suedtirol": _2, "sv": _2, "ta": _2, "taranto": _2, "te": _2, "tempio-olbia": _2, "tempioolbia": _2, "teramo": _2, "terni": _2, "tn": _2, "to": _2, "torino": _2, "tp": _2, "tr": _2, "trani-andria-barletta": _2, "trani-barletta-andria": _2, "traniandriabarletta": _2, "tranibarlettaandria": _2, "trapani": _2, "trento": _2, "treviso": _2, "trieste": _2, "ts": _2, "turin": _2, "tv": _2, "ud": _2, "udine": _2, "urbino-pesaro": _2, "urbinopesaro": _2, "va": _2, "varese": _2, "vb": _2, "vc": _2, "ve": _2, "venezia": _2, "venice": _2, "verbania": _2, "vercelli": _2, "verona": _2, "vi": _2, "vibo-valentia": _2, "vibovalentia": _2, "vicenza": _2, "viterbo": _2, "vr": _2, "vs": _2, "vt": _2, "vv": _2, "12chars": _3, "ibxos": _3, "iliadboxos": _3, "neen": [0, { "jc": _3 }], "123homepage": _3, "16-b": _3, "32-b": _3, "64-b": _3, "myspreadshop": _3, "syncloud": _3 }], "je": [1, { "co": _2, "net": _2, "org": _2, "of": _3 }], "jm": _20, "jo": [1, { "agri": _2, "ai": _2, "com": _2, "edu": _2, "eng": _2, "fm": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "per": _2, "phd": _2, "sch": _2, "tv": _2 }], "jobs": _2, "jp": [1, { "ac": _2, "ad": _2, "co": _2, "ed": _2, "go": _2, "gr": _2, "lg": _2, "ne": [1, { "aseinet": _53, "gehirn": _3, "ivory": _3, "mail-box": _3, "mints": _3, "mokuren": _3, "opal": _3, "sakura": _3, "sumomo": _3, "topaz": _3 }], "or": _2, "aichi": [1, { "aisai": _2, "ama": _2, "anjo": _2, "asuke": _2, "chiryu": _2, "chita": _2, "fuso": _2, "gamagori": _2, "handa": _2, "hazu": _2, "hekinan": _2, "higashiura": _2, "ichinomiya": _2, "inazawa": _2, "inuyama": _2, "isshiki": _2, "iwakura": _2, "kanie": _2, "kariya": _2, "kasugai": _2, "kira": _2, "kiyosu": _2, "komaki": _2, "konan": _2, "kota": _2, "mihama": _2, "miyoshi": _2, "nishio": _2, "nisshin": _2, "obu": _2, "oguchi": _2, "oharu": _2, "okazaki": _2, "owariasahi": _2, "seto": _2, "shikatsu": _2, "shinshiro": _2, "shitara": _2, "tahara": _2, "takahama": _2, "tobishima": _2, "toei": _2, "togo": _2, "tokai": _2, "tokoname": _2, "toyoake": _2, "toyohashi": _2, "toyokawa": _2, "toyone": _2, "toyota": _2, "tsushima": _2, "yatomi": _2 }], "akita": [1, { "akita": _2, "daisen": _2, "fujisato": _2, "gojome": _2, "hachirogata": _2, "happou": _2, "higashinaruse": _2, "honjo": _2, "honjyo": _2, "ikawa": _2, "kamikoani": _2, "kamioka": _2, "katagami": _2, "kazuno": _2, "kitaakita": _2, "kosaka": _2, "kyowa": _2, "misato": _2, "mitane": _2, "moriyoshi": _2, "nikaho": _2, "noshiro": _2, "odate": _2, "oga": _2, "ogata": _2, "semboku": _2, "yokote": _2, "yurihonjo": _2 }], "aomori": [1, { "aomori": _2, "gonohe": _2, "hachinohe": _2, "hashikami": _2, "hiranai": _2, "hirosaki": _2, "itayanagi": _2, "kuroishi": _2, "misawa": _2, "mutsu": _2, "nakadomari": _2, "noheji": _2, "oirase": _2, "owani": _2, "rokunohe": _2, "sannohe": _2, "shichinohe": _2, "shingo": _2, "takko": _2, "towada": _2, "tsugaru": _2, "tsuruta": _2 }], "chiba": [1, { "abiko": _2, "asahi": _2, "chonan": _2, "chosei": _2, "choshi": _2, "chuo": _2, "funabashi": _2, "futtsu": _2, "hanamigawa": _2, "ichihara": _2, "ichikawa": _2, "ichinomiya": _2, "inzai": _2, "isumi": _2, "kamagaya": _2, "kamogawa": _2, "kashiwa": _2, "katori": _2, "katsuura": _2, "kimitsu": _2, "kisarazu": _2, "kozaki": _2, "kujukuri": _2, "kyonan": _2, "matsudo": _2, "midori": _2, "mihama": _2, "minamiboso": _2, "mobara": _2, "mutsuzawa": _2, "nagara": _2, "nagareyama": _2, "narashino": _2, "narita": _2, "noda": _2, "oamishirasato": _2, "omigawa": _2, "onjuku": _2, "otaki": _2, "sakae": _2, "sakura": _2, "shimofusa": _2, "shirako": _2, "shiroi": _2, "shisui": _2, "sodegaura": _2, "sosa": _2, "tako": _2, "tateyama": _2, "togane": _2, "tohnosho": _2, "tomisato": _2, "urayasu": _2, "yachimata": _2, "yachiyo": _2, "yokaichiba": _2, "yokoshibahikari": _2, "yotsukaido": _2 }], "ehime": [1, { "ainan": _2, "honai": _2, "ikata": _2, "imabari": _2, "iyo": _2, "kamijima": _2, "kihoku": _2, "kumakogen": _2, "masaki": _2, "matsuno": _2, "matsuyama": _2, "namikata": _2, "niihama": _2, "ozu": _2, "saijo": _2, "seiyo": _2, "shikokuchuo": _2, "tobe": _2, "toon": _2, "uchiko": _2, "uwajima": _2, "yawatahama": _2 }], "fukui": [1, { "echizen": _2, "eiheiji": _2, "fukui": _2, "ikeda": _2, "katsuyama": _2, "mihama": _2, "minamiechizen": _2, "obama": _2, "ohi": _2, "ono": _2, "sabae": _2, "sakai": _2, "takahama": _2, "tsuruga": _2, "wakasa": _2 }], "fukuoka": [1, { "ashiya": _2, "buzen": _2, "chikugo": _2, "chikuho": _2, "chikujo": _2, "chikushino": _2, "chikuzen": _2, "chuo": _2, "dazaifu": _2, "fukuchi": _2, "hakata": _2, "higashi": _2, "hirokawa": _2, "hisayama": _2, "iizuka": _2, "inatsuki": _2, "kaho": _2, "kasuga": _2, "kasuya": _2, "kawara": _2, "keisen": _2, "koga": _2, "kurate": _2, "kurogi": _2, "kurume": _2, "minami": _2, "miyako": _2, "miyama": _2, "miyawaka": _2, "mizumaki": _2, "munakata": _2, "nakagawa": _2, "nakama": _2, "nishi": _2, "nogata": _2, "ogori": _2, "okagaki": _2, "okawa": _2, "oki": _2, "omuta": _2, "onga": _2, "onojo": _2, "oto": _2, "saigawa": _2, "sasaguri": _2, "shingu": _2, "shinyoshitomi": _2, "shonai": _2, "soeda": _2, "sue": _2, "tachiarai": _2, "tagawa": _2, "takata": _2, "toho": _2, "toyotsu": _2, "tsuiki": _2, "ukiha": _2, "umi": _2, "usui": _2, "yamada": _2, "yame": _2, "yanagawa": _2, "yukuhashi": _2 }], "fukushima": [1, { "aizubange": _2, "aizumisato": _2, "aizuwakamatsu": _2, "asakawa": _2, "bandai": _2, "date": _2, "fukushima": _2, "furudono": _2, "futaba": _2, "hanawa": _2, "higashi": _2, "hirata": _2, "hirono": _2, "iitate": _2, "inawashiro": _2, "ishikawa": _2, "iwaki": _2, "izumizaki": _2, "kagamiishi": _2, "kaneyama": _2, "kawamata": _2, "kitakata": _2, "kitashiobara": _2, "koori": _2, "koriyama": _2, "kunimi": _2, "miharu": _2, "mishima": _2, "namie": _2, "nango": _2, "nishiaizu": _2, "nishigo": _2, "okuma": _2, "omotego": _2, "ono": _2, "otama": _2, "samegawa": _2, "shimogo": _2, "shirakawa": _2, "showa": _2, "soma": _2, "sukagawa": _2, "taishin": _2, "tamakawa": _2, "tanagura": _2, "tenei": _2, "yabuki": _2, "yamato": _2, "yamatsuri": _2, "yanaizu": _2, "yugawa": _2 }], "gifu": [1, { "anpachi": _2, "ena": _2, "gifu": _2, "ginan": _2, "godo": _2, "gujo": _2, "hashima": _2, "hichiso": _2, "hida": _2, "higashishirakawa": _2, "ibigawa": _2, "ikeda": _2, "kakamigahara": _2, "kani": _2, "kasahara": _2, "kasamatsu": _2, "kawaue": _2, "kitagata": _2, "mino": _2, "minokamo": _2, "mitake": _2, "mizunami": _2, "motosu": _2, "nakatsugawa": _2, "ogaki": _2, "sakahogi": _2, "seki": _2, "sekigahara": _2, "shirakawa": _2, "tajimi": _2, "takayama": _2, "tarui": _2, "toki": _2, "tomika": _2, "wanouchi": _2, "yamagata": _2, "yaotsu": _2, "yoro": _2 }], "gunma": [1, { "annaka": _2, "chiyoda": _2, "fujioka": _2, "higashiagatsuma": _2, "isesaki": _2, "itakura": _2, "kanna": _2, "kanra": _2, "katashina": _2, "kawaba": _2, "kiryu": _2, "kusatsu": _2, "maebashi": _2, "meiwa": _2, "midori": _2, "minakami": _2, "naganohara": _2, "nakanojo": _2, "nanmoku": _2, "numata": _2, "oizumi": _2, "ora": _2, "ota": _2, "shibukawa": _2, "shimonita": _2, "shinto": _2, "showa": _2, "takasaki": _2, "takayama": _2, "tamamura": _2, "tatebayashi": _2, "tomioka": _2, "tsukiyono": _2, "tsumagoi": _2, "ueno": _2, "yoshioka": _2 }], "hiroshima": [1, { "asaminami": _2, "daiwa": _2, "etajima": _2, "fuchu": _2, "fukuyama": _2, "hatsukaichi": _2, "higashihiroshima": _2, "hongo": _2, "jinsekikogen": _2, "kaita": _2, "kui": _2, "kumano": _2, "kure": _2, "mihara": _2, "miyoshi": _2, "naka": _2, "onomichi": _2, "osakikamijima": _2, "otake": _2, "saka": _2, "sera": _2, "seranishi": _2, "shinichi": _2, "shobara": _2, "takehara": _2 }], "hokkaido": [1, { "abashiri": _2, "abira": _2, "aibetsu": _2, "akabira": _2, "akkeshi": _2, "asahikawa": _2, "ashibetsu": _2, "ashoro": _2, "assabu": _2, "atsuma": _2, "bibai": _2, "biei": _2, "bifuka": _2, "bihoro": _2, "biratori": _2, "chippubetsu": _2, "chitose": _2, "date": _2, "ebetsu": _2, "embetsu": _2, "eniwa": _2, "erimo": _2, "esan": _2, "esashi": _2, "fukagawa": _2, "fukushima": _2, "furano": _2, "furubira": _2, "haboro": _2, "hakodate": _2, "hamatonbetsu": _2, "hidaka": _2, "higashikagura": _2, "higashikawa": _2, "hiroo": _2, "hokuryu": _2, "hokuto": _2, "honbetsu": _2, "horokanai": _2, "horonobe": _2, "ikeda": _2, "imakane": _2, "ishikari": _2, "iwamizawa": _2, "iwanai": _2, "kamifurano": _2, "kamikawa": _2, "kamishihoro": _2, "kamisunagawa": _2, "kamoenai": _2, "kayabe": _2, "kembuchi": _2, "kikonai": _2, "kimobetsu": _2, "kitahiroshima": _2, "kitami": _2, "kiyosato": _2, "koshimizu": _2, "kunneppu": _2, "kuriyama": _2, "kuromatsunai": _2, "kushiro": _2, "kutchan": _2, "kyowa": _2, "mashike": _2, "matsumae": _2, "mikasa": _2, "minamifurano": _2, "mombetsu": _2, "moseushi": _2, "mukawa": _2, "muroran": _2, "naie": _2, "nakagawa": _2, "nakasatsunai": _2, "nakatombetsu": _2, "nanae": _2, "nanporo": _2, "nayoro": _2, "nemuro": _2, "niikappu": _2, "niki": _2, "nishiokoppe": _2, "noboribetsu": _2, "numata": _2, "obihiro": _2, "obira": _2, "oketo": _2, "okoppe": _2, "otaru": _2, "otobe": _2, "otofuke": _2, "otoineppu": _2, "oumu": _2, "ozora": _2, "pippu": _2, "rankoshi": _2, "rebun": _2, "rikubetsu": _2, "rishiri": _2, "rishirifuji": _2, "saroma": _2, "sarufutsu": _2, "shakotan": _2, "shari": _2, "shibecha": _2, "shibetsu": _2, "shikabe": _2, "shikaoi": _2, "shimamaki": _2, "shimizu": _2, "shimokawa": _2, "shinshinotsu": _2, "shintoku": _2, "shiranuka": _2, "shiraoi": _2, "shiriuchi": _2, "sobetsu": _2, "sunagawa": _2, "taiki": _2, "takasu": _2, "takikawa": _2, "takinoue": _2, "teshikaga": _2, "tobetsu": _2, "tohma": _2, "tomakomai": _2, "tomari": _2, "toya": _2, "toyako": _2, "toyotomi": _2, "toyoura": _2, "tsubetsu": _2, "tsukigata": _2, "urakawa": _2, "urausu": _2, "uryu": _2, "utashinai": _2, "wakkanai": _2, "wassamu": _2, "yakumo": _2, "yoichi": _2 }], "hyogo": [1, { "aioi": _2, "akashi": _2, "ako": _2, "amagasaki": _2, "aogaki": _2, "asago": _2, "ashiya": _2, "awaji": _2, "fukusaki": _2, "goshiki": _2, "harima": _2, "himeji": _2, "ichikawa": _2, "inagawa": _2, "itami": _2, "kakogawa": _2, "kamigori": _2, "kamikawa": _2, "kasai": _2, "kasuga": _2, "kawanishi": _2, "miki": _2, "minamiawaji": _2, "nishinomiya": _2, "nishiwaki": _2, "ono": _2, "sanda": _2, "sannan": _2, "sasayama": _2, "sayo": _2, "shingu": _2, "shinonsen": _2, "shiso": _2, "sumoto": _2, "taishi": _2, "taka": _2, "takarazuka": _2, "takasago": _2, "takino": _2, "tamba": _2, "tatsuno": _2, "toyooka": _2, "yabu": _2, "yashiro": _2, "yoka": _2, "yokawa": _2 }], "ibaraki": [1, { "ami": _2, "asahi": _2, "bando": _2, "chikusei": _2, "daigo": _2, "fujishiro": _2, "hitachi": _2, "hitachinaka": _2, "hitachiomiya": _2, "hitachiota": _2, "ibaraki": _2, "ina": _2, "inashiki": _2, "itako": _2, "iwama": _2, "joso": _2, "kamisu": _2, "kasama": _2, "kashima": _2, "kasumigaura": _2, "koga": _2, "miho": _2, "mito": _2, "moriya": _2, "naka": _2, "namegata": _2, "oarai": _2, "ogawa": _2, "omitama": _2, "ryugasaki": _2, "sakai": _2, "sakuragawa": _2, "shimodate": _2, "shimotsuma": _2, "shirosato": _2, "sowa": _2, "suifu": _2, "takahagi": _2, "tamatsukuri": _2, "tokai": _2, "tomobe": _2, "tone": _2, "toride": _2, "tsuchiura": _2, "tsukuba": _2, "uchihara": _2, "ushiku": _2, "yachiyo": _2, "yamagata": _2, "yawara": _2, "yuki": _2 }], "ishikawa": [1, { "anamizu": _2, "hakui": _2, "hakusan": _2, "kaga": _2, "kahoku": _2, "kanazawa": _2, "kawakita": _2, "komatsu": _2, "nakanoto": _2, "nanao": _2, "nomi": _2, "nonoichi": _2, "noto": _2, "shika": _2, "suzu": _2, "tsubata": _2, "tsurugi": _2, "uchinada": _2, "wajima": _2 }], "iwate": [1, { "fudai": _2, "fujisawa": _2, "hanamaki": _2, "hiraizumi": _2, "hirono": _2, "ichinohe": _2, "ichinoseki": _2, "iwaizumi": _2, "iwate": _2, "joboji": _2, "kamaishi": _2, "kanegasaki": _2, "karumai": _2, "kawai": _2, "kitakami": _2, "kuji": _2, "kunohe": _2, "kuzumaki": _2, "miyako": _2, "mizusawa": _2, "morioka": _2, "ninohe": _2, "noda": _2, "ofunato": _2, "oshu": _2, "otsuchi": _2, "rikuzentakata": _2, "shiwa": _2, "shizukuishi": _2, "sumita": _2, "tanohata": _2, "tono": _2, "yahaba": _2, "yamada": _2 }], "kagawa": [1, { "ayagawa": _2, "higashikagawa": _2, "kanonji": _2, "kotohira": _2, "manno": _2, "marugame": _2, "mitoyo": _2, "naoshima": _2, "sanuki": _2, "tadotsu": _2, "takamatsu": _2, "tonosho": _2, "uchinomi": _2, "utazu": _2, "zentsuji": _2 }], "kagoshima": [1, { "akune": _2, "amami": _2, "hioki": _2, "isa": _2, "isen": _2, "izumi": _2, "kagoshima": _2, "kanoya": _2, "kawanabe": _2, "kinko": _2, "kouyama": _2, "makurazaki": _2, "matsumoto": _2, "minamitane": _2, "nakatane": _2, "nishinoomote": _2, "satsumasendai": _2, "soo": _2, "tarumizu": _2, "yusui": _2 }], "kanagawa": [1, { "aikawa": _2, "atsugi": _2, "ayase": _2, "chigasaki": _2, "ebina": _2, "fujisawa": _2, "hadano": _2, "hakone": _2, "hiratsuka": _2, "isehara": _2, "kaisei": _2, "kamakura": _2, "kiyokawa": _2, "matsuda": _2, "minamiashigara": _2, "miura": _2, "nakai": _2, "ninomiya": _2, "odawara": _2, "oi": _2, "oiso": _2, "sagamihara": _2, "samukawa": _2, "tsukui": _2, "yamakita": _2, "yamato": _2, "yokosuka": _2, "yugawara": _2, "zama": _2, "zushi": _2 }], "kochi": [1, { "aki": _2, "geisei": _2, "hidaka": _2, "higashitsuno": _2, "ino": _2, "kagami": _2, "kami": _2, "kitagawa": _2, "kochi": _2, "mihara": _2, "motoyama": _2, "muroto": _2, "nahari": _2, "nakamura": _2, "nankoku": _2, "nishitosa": _2, "niyodogawa": _2, "ochi": _2, "okawa": _2, "otoyo": _2, "otsuki": _2, "sakawa": _2, "sukumo": _2, "susaki": _2, "tosa": _2, "tosashimizu": _2, "toyo": _2, "tsuno": _2, "umaji": _2, "yasuda": _2, "yusuhara": _2 }], "kumamoto": [1, { "amakusa": _2, "arao": _2, "aso": _2, "choyo": _2, "gyokuto": _2, "kamiamakusa": _2, "kikuchi": _2, "kumamoto": _2, "mashiki": _2, "mifune": _2, "minamata": _2, "minamioguni": _2, "nagasu": _2, "nishihara": _2, "oguni": _2, "ozu": _2, "sumoto": _2, "takamori": _2, "uki": _2, "uto": _2, "yamaga": _2, "yamato": _2, "yatsushiro": _2 }], "kyoto": [1, { "ayabe": _2, "fukuchiyama": _2, "higashiyama": _2, "ide": _2, "ine": _2, "joyo": _2, "kameoka": _2, "kamo": _2, "kita": _2, "kizu": _2, "kumiyama": _2, "kyotamba": _2, "kyotanabe": _2, "kyotango": _2, "maizuru": _2, "minami": _2, "minamiyamashiro": _2, "miyazu": _2, "muko": _2, "nagaokakyo": _2, "nakagyo": _2, "nantan": _2, "oyamazaki": _2, "sakyo": _2, "seika": _2, "tanabe": _2, "uji": _2, "ujitawara": _2, "wazuka": _2, "yamashina": _2, "yawata": _2 }], "mie": [1, { "asahi": _2, "inabe": _2, "ise": _2, "kameyama": _2, "kawagoe": _2, "kiho": _2, "kisosaki": _2, "kiwa": _2, "komono": _2, "kumano": _2, "kuwana": _2, "matsusaka": _2, "meiwa": _2, "mihama": _2, "minamiise": _2, "misugi": _2, "miyama": _2, "nabari": _2, "shima": _2, "suzuka": _2, "tado": _2, "taiki": _2, "taki": _2, "tamaki": _2, "toba": _2, "tsu": _2, "udono": _2, "ureshino": _2, "watarai": _2, "yokkaichi": _2 }], "miyagi": [1, { "furukawa": _2, "higashimatsushima": _2, "ishinomaki": _2, "iwanuma": _2, "kakuda": _2, "kami": _2, "kawasaki": _2, "marumori": _2, "matsushima": _2, "minamisanriku": _2, "misato": _2, "murata": _2, "natori": _2, "ogawara": _2, "ohira": _2, "onagawa": _2, "osaki": _2, "rifu": _2, "semine": _2, "shibata": _2, "shichikashuku": _2, "shikama": _2, "shiogama": _2, "shiroishi": _2, "tagajo": _2, "taiwa": _2, "tome": _2, "tomiya": _2, "wakuya": _2, "watari": _2, "yamamoto": _2, "zao": _2 }], "miyazaki": [1, { "aya": _2, "ebino": _2, "gokase": _2, "hyuga": _2, "kadogawa": _2, "kawaminami": _2, "kijo": _2, "kitagawa": _2, "kitakata": _2, "kitaura": _2, "kobayashi": _2, "kunitomi": _2, "kushima": _2, "mimata": _2, "miyakonojo": _2, "miyazaki": _2, "morotsuka": _2, "nichinan": _2, "nishimera": _2, "nobeoka": _2, "saito": _2, "shiiba": _2, "shintomi": _2, "takaharu": _2, "takanabe": _2, "takazaki": _2, "tsuno": _2 }], "nagano": [1, { "achi": _2, "agematsu": _2, "anan": _2, "aoki": _2, "asahi": _2, "azumino": _2, "chikuhoku": _2, "chikuma": _2, "chino": _2, "fujimi": _2, "hakuba": _2, "hara": _2, "hiraya": _2, "iida": _2, "iijima": _2, "iiyama": _2, "iizuna": _2, "ikeda": _2, "ikusaka": _2, "ina": _2, "karuizawa": _2, "kawakami": _2, "kiso": _2, "kisofukushima": _2, "kitaaiki": _2, "komagane": _2, "komoro": _2, "matsukawa": _2, "matsumoto": _2, "miasa": _2, "minamiaiki": _2, "minamimaki": _2, "minamiminowa": _2, "minowa": _2, "miyada": _2, "miyota": _2, "mochizuki": _2, "nagano": _2, "nagawa": _2, "nagiso": _2, "nakagawa": _2, "nakano": _2, "nozawaonsen": _2, "obuse": _2, "ogawa": _2, "okaya": _2, "omachi": _2, "omi": _2, "ookuwa": _2, "ooshika": _2, "otaki": _2, "otari": _2, "sakae": _2, "sakaki": _2, "saku": _2, "sakuho": _2, "shimosuwa": _2, "shinanomachi": _2, "shiojiri": _2, "suwa": _2, "suzaka": _2, "takagi": _2, "takamori": _2, "takayama": _2, "tateshina": _2, "tatsuno": _2, "togakushi": _2, "togura": _2, "tomi": _2, "ueda": _2, "wada": _2, "yamagata": _2, "yamanouchi": _2, "yasaka": _2, "yasuoka": _2 }], "nagasaki": [1, { "chijiwa": _2, "futsu": _2, "goto": _2, "hasami": _2, "hirado": _2, "iki": _2, "isahaya": _2, "kawatana": _2, "kuchinotsu": _2, "matsuura": _2, "nagasaki": _2, "obama": _2, "omura": _2, "oseto": _2, "saikai": _2, "sasebo": _2, "seihi": _2, "shimabara": _2, "shinkamigoto": _2, "togitsu": _2, "tsushima": _2, "unzen": _2 }], "nara": [1, { "ando": _2, "gose": _2, "heguri": _2, "higashiyoshino": _2, "ikaruga": _2, "ikoma": _2, "kamikitayama": _2, "kanmaki": _2, "kashiba": _2, "kashihara": _2, "katsuragi": _2, "kawai": _2, "kawakami": _2, "kawanishi": _2, "koryo": _2, "kurotaki": _2, "mitsue": _2, "miyake": _2, "nara": _2, "nosegawa": _2, "oji": _2, "ouda": _2, "oyodo": _2, "sakurai": _2, "sango": _2, "shimoichi": _2, "shimokitayama": _2, "shinjo": _2, "soni": _2, "takatori": _2, "tawaramoto": _2, "tenkawa": _2, "tenri": _2, "uda": _2, "yamatokoriyama": _2, "yamatotakada": _2, "yamazoe": _2, "yoshino": _2 }], "niigata": [1, { "aga": _2, "agano": _2, "gosen": _2, "itoigawa": _2, "izumozaki": _2, "joetsu": _2, "kamo": _2, "kariwa": _2, "kashiwazaki": _2, "minamiuonuma": _2, "mitsuke": _2, "muika": _2, "murakami": _2, "myoko": _2, "nagaoka": _2, "niigata": _2, "ojiya": _2, "omi": _2, "sado": _2, "sanjo": _2, "seiro": _2, "seirou": _2, "sekikawa": _2, "shibata": _2, "tagami": _2, "tainai": _2, "tochio": _2, "tokamachi": _2, "tsubame": _2, "tsunan": _2, "uonuma": _2, "yahiko": _2, "yoita": _2, "yuzawa": _2 }], "oita": [1, { "beppu": _2, "bungoono": _2, "bungotakada": _2, "hasama": _2, "hiji": _2, "himeshima": _2, "hita": _2, "kamitsue": _2, "kokonoe": _2, "kuju": _2, "kunisaki": _2, "kusu": _2, "oita": _2, "saiki": _2, "taketa": _2, "tsukumi": _2, "usa": _2, "usuki": _2, "yufu": _2 }], "okayama": [1, { "akaiwa": _2, "asakuchi": _2, "bizen": _2, "hayashima": _2, "ibara": _2, "kagamino": _2, "kasaoka": _2, "kibichuo": _2, "kumenan": _2, "kurashiki": _2, "maniwa": _2, "misaki": _2, "nagi": _2, "niimi": _2, "nishiawakura": _2, "okayama": _2, "satosho": _2, "setouchi": _2, "shinjo": _2, "shoo": _2, "soja": _2, "takahashi": _2, "tamano": _2, "tsuyama": _2, "wake": _2, "yakage": _2 }], "okinawa": [1, { "aguni": _2, "ginowan": _2, "ginoza": _2, "gushikami": _2, "haebaru": _2, "higashi": _2, "hirara": _2, "iheya": _2, "ishigaki": _2, "ishikawa": _2, "itoman": _2, "izena": _2, "kadena": _2, "kin": _2, "kitadaito": _2, "kitanakagusuku": _2, "kumejima": _2, "kunigami": _2, "minamidaito": _2, "motobu": _2, "nago": _2, "naha": _2, "nakagusuku": _2, "nakijin": _2, "nanjo": _2, "nishihara": _2, "ogimi": _2, "okinawa": _2, "onna": _2, "shimoji": _2, "taketomi": _2, "tarama": _2, "tokashiki": _2, "tomigusuku": _2, "tonaki": _2, "urasoe": _2, "uruma": _2, "yaese": _2, "yomitan": _2, "yonabaru": _2, "yonaguni": _2, "zamami": _2 }], "osaka": [1, { "abeno": _2, "chihayaakasaka": _2, "chuo": _2, "daito": _2, "fujiidera": _2, "habikino": _2, "hannan": _2, "higashiosaka": _2, "higashisumiyoshi": _2, "higashiyodogawa": _2, "hirakata": _2, "ibaraki": _2, "ikeda": _2, "izumi": _2, "izumiotsu": _2, "izumisano": _2, "kadoma": _2, "kaizuka": _2, "kanan": _2, "kashiwara": _2, "katano": _2, "kawachinagano": _2, "kishiwada": _2, "kita": _2, "kumatori": _2, "matsubara": _2, "minato": _2, "minoh": _2, "misaki": _2, "moriguchi": _2, "neyagawa": _2, "nishi": _2, "nose": _2, "osakasayama": _2, "sakai": _2, "sayama": _2, "sennan": _2, "settsu": _2, "shijonawate": _2, "shimamoto": _2, "suita": _2, "tadaoka": _2, "taishi": _2, "tajiri": _2, "takaishi": _2, "takatsuki": _2, "tondabayashi": _2, "toyonaka": _2, "toyono": _2, "yao": _2 }], "saga": [1, { "ariake": _2, "arita": _2, "fukudomi": _2, "genkai": _2, "hamatama": _2, "hizen": _2, "imari": _2, "kamimine": _2, "kanzaki": _2, "karatsu": _2, "kashima": _2, "kitagata": _2, "kitahata": _2, "kiyama": _2, "kouhoku": _2, "kyuragi": _2, "nishiarita": _2, "ogi": _2, "omachi": _2, "ouchi": _2, "saga": _2, "shiroishi": _2, "taku": _2, "tara": _2, "tosu": _2, "yoshinogari": _2 }], "saitama": [1, { "arakawa": _2, "asaka": _2, "chichibu": _2, "fujimi": _2, "fujimino": _2, "fukaya": _2, "hanno": _2, "hanyu": _2, "hasuda": _2, "hatogaya": _2, "hatoyama": _2, "hidaka": _2, "higashichichibu": _2, "higashimatsuyama": _2, "honjo": _2, "ina": _2, "iruma": _2, "iwatsuki": _2, "kamiizumi": _2, "kamikawa": _2, "kamisato": _2, "kasukabe": _2, "kawagoe": _2, "kawaguchi": _2, "kawajima": _2, "kazo": _2, "kitamoto": _2, "koshigaya": _2, "kounosu": _2, "kuki": _2, "kumagaya": _2, "matsubushi": _2, "minano": _2, "misato": _2, "miyashiro": _2, "miyoshi": _2, "moroyama": _2, "nagatoro": _2, "namegawa": _2, "niiza": _2, "ogano": _2, "ogawa": _2, "ogose": _2, "okegawa": _2, "omiya": _2, "otaki": _2, "ranzan": _2, "ryokami": _2, "saitama": _2, "sakado": _2, "satte": _2, "sayama": _2, "shiki": _2, "shiraoka": _2, "soka": _2, "sugito": _2, "toda": _2, "tokigawa": _2, "tokorozawa": _2, "tsurugashima": _2, "urawa": _2, "warabi": _2, "yashio": _2, "yokoze": _2, "yono": _2, "yorii": _2, "yoshida": _2, "yoshikawa": _2, "yoshimi": _2 }], "shiga": [1, { "aisho": _2, "gamo": _2, "higashiomi": _2, "hikone": _2, "koka": _2, "konan": _2, "kosei": _2, "koto": _2, "kusatsu": _2, "maibara": _2, "moriyama": _2, "nagahama": _2, "nishiazai": _2, "notogawa": _2, "omihachiman": _2, "otsu": _2, "ritto": _2, "ryuoh": _2, "takashima": _2, "takatsuki": _2, "torahime": _2, "toyosato": _2, "yasu": _2 }], "shimane": [1, { "akagi": _2, "ama": _2, "gotsu": _2, "hamada": _2, "higashiizumo": _2, "hikawa": _2, "hikimi": _2, "izumo": _2, "kakinoki": _2, "masuda": _2, "matsue": _2, "misato": _2, "nishinoshima": _2, "ohda": _2, "okinoshima": _2, "okuizumo": _2, "shimane": _2, "tamayu": _2, "tsuwano": _2, "unnan": _2, "yakumo": _2, "yasugi": _2, "yatsuka": _2 }], "shizuoka": [1, { "arai": _2, "atami": _2, "fuji": _2, "fujieda": _2, "fujikawa": _2, "fujinomiya": _2, "fukuroi": _2, "gotemba": _2, "haibara": _2, "hamamatsu": _2, "higashiizu": _2, "ito": _2, "iwata": _2, "izu": _2, "izunokuni": _2, "kakegawa": _2, "kannami": _2, "kawanehon": _2, "kawazu": _2, "kikugawa": _2, "kosai": _2, "makinohara": _2, "matsuzaki": _2, "minamiizu": _2, "mishima": _2, "morimachi": _2, "nishiizu": _2, "numazu": _2, "omaezaki": _2, "shimada": _2, "shimizu": _2, "shimoda": _2, "shizuoka": _2, "susono": _2, "yaizu": _2, "yoshida": _2 }], "tochigi": [1, { "ashikaga": _2, "bato": _2, "haga": _2, "ichikai": _2, "iwafune": _2, "kaminokawa": _2, "kanuma": _2, "karasuyama": _2, "kuroiso": _2, "mashiko": _2, "mibu": _2, "moka": _2, "motegi": _2, "nasu": _2, "nasushiobara": _2, "nikko": _2, "nishikata": _2, "nogi": _2, "ohira": _2, "ohtawara": _2, "oyama": _2, "sakura": _2, "sano": _2, "shimotsuke": _2, "shioya": _2, "takanezawa": _2, "tochigi": _2, "tsuga": _2, "ujiie": _2, "utsunomiya": _2, "yaita": _2 }], "tokushima": [1, { "aizumi": _2, "anan": _2, "ichiba": _2, "itano": _2, "kainan": _2, "komatsushima": _2, "matsushige": _2, "mima": _2, "minami": _2, "miyoshi": _2, "mugi": _2, "nakagawa": _2, "naruto": _2, "sanagochi": _2, "shishikui": _2, "tokushima": _2, "wajiki": _2 }], "tokyo": [1, { "adachi": _2, "akiruno": _2, "akishima": _2, "aogashima": _2, "arakawa": _2, "bunkyo": _2, "chiyoda": _2, "chofu": _2, "chuo": _2, "edogawa": _2, "fuchu": _2, "fussa": _2, "hachijo": _2, "hachioji": _2, "hamura": _2, "higashikurume": _2, "higashimurayama": _2, "higashiyamato": _2, "hino": _2, "hinode": _2, "hinohara": _2, "inagi": _2, "itabashi": _2, "katsushika": _2, "kita": _2, "kiyose": _2, "kodaira": _2, "koganei": _2, "kokubunji": _2, "komae": _2, "koto": _2, "kouzushima": _2, "kunitachi": _2, "machida": _2, "meguro": _2, "minato": _2, "mitaka": _2, "mizuho": _2, "musashimurayama": _2, "musashino": _2, "nakano": _2, "nerima": _2, "ogasawara": _2, "okutama": _2, "ome": _2, "oshima": _2, "ota": _2, "setagaya": _2, "shibuya": _2, "shinagawa": _2, "shinjuku": _2, "suginami": _2, "sumida": _2, "tachikawa": _2, "taito": _2, "tama": _2, "toshima": _2 }], "tottori": [1, { "chizu": _2, "hino": _2, "kawahara": _2, "koge": _2, "kotoura": _2, "misasa": _2, "nanbu": _2, "nichinan": _2, "sakaiminato": _2, "tottori": _2, "wakasa": _2, "yazu": _2, "yonago": _2 }], "toyama": [1, { "asahi": _2, "fuchu": _2, "fukumitsu": _2, "funahashi": _2, "himi": _2, "imizu": _2, "inami": _2, "johana": _2, "kamiichi": _2, "kurobe": _2, "nakaniikawa": _2, "namerikawa": _2, "nanto": _2, "nyuzen": _2, "oyabe": _2, "taira": _2, "takaoka": _2, "tateyama": _2, "toga": _2, "tonami": _2, "toyama": _2, "unazuki": _2, "uozu": _2, "yamada": _2 }], "wakayama": [1, { "arida": _2, "aridagawa": _2, "gobo": _2, "hashimoto": _2, "hidaka": _2, "hirogawa": _2, "inami": _2, "iwade": _2, "kainan": _2, "kamitonda": _2, "katsuragi": _2, "kimino": _2, "kinokawa": _2, "kitayama": _2, "koya": _2, "koza": _2, "kozagawa": _2, "kudoyama": _2, "kushimoto": _2, "mihama": _2, "misato": _2, "nachikatsuura": _2, "shingu": _2, "shirahama": _2, "taiji": _2, "tanabe": _2, "wakayama": _2, "yuasa": _2, "yura": _2 }], "yamagata": [1, { "asahi": _2, "funagata": _2, "higashine": _2, "iide": _2, "kahoku": _2, "kaminoyama": _2, "kaneyama": _2, "kawanishi": _2, "mamurogawa": _2, "mikawa": _2, "murayama": _2, "nagai": _2, "nakayama": _2, "nanyo": _2, "nishikawa": _2, "obanazawa": _2, "oe": _2, "oguni": _2, "ohkura": _2, "oishida": _2, "sagae": _2, "sakata": _2, "sakegawa": _2, "shinjo": _2, "shirataka": _2, "shonai": _2, "takahata": _2, "tendo": _2, "tozawa": _2, "tsuruoka": _2, "yamagata": _2, "yamanobe": _2, "yonezawa": _2, "yuza": _2 }], "yamaguchi": [1, { "abu": _2, "hagi": _2, "hikari": _2, "hofu": _2, "iwakuni": _2, "kudamatsu": _2, "mitou": _2, "nagato": _2, "oshima": _2, "shimonoseki": _2, "shunan": _2, "tabuse": _2, "tokuyama": _2, "toyota": _2, "ube": _2, "yuu": _2 }], "yamanashi": [1, { "chuo": _2, "doshi": _2, "fuefuki": _2, "fujikawa": _2, "fujikawaguchiko": _2, "fujiyoshida": _2, "hayakawa": _2, "hokuto": _2, "ichikawamisato": _2, "kai": _2, "kofu": _2, "koshu": _2, "kosuge": _2, "minami-alps": _2, "minobu": _2, "nakamichi": _2, "nanbu": _2, "narusawa": _2, "nirasaki": _2, "nishikatsura": _2, "oshino": _2, "otsuki": _2, "showa": _2, "tabayama": _2, "tsuru": _2, "uenohara": _2, "yamanakako": _2, "yamanashi": _2 }], "xn--ehqz56n": _2, "三重": _2, "xn--1lqs03n": _2, "京都": _2, "xn--qqqt11m": _2, "佐賀": _2, "xn--f6qx53a": _2, "兵庫": _2, "xn--djrs72d6uy": _2, "北海道": _2, "xn--mkru45i": _2, "千葉": _2, "xn--0trq7p7nn": _2, "和歌山": _2, "xn--5js045d": _2, "埼玉": _2, "xn--kbrq7o": _2, "大分": _2, "xn--pssu33l": _2, "大阪": _2, "xn--ntsq17g": _2, "奈良": _2, "xn--uisz3g": _2, "宮城": _2, "xn--6btw5a": _2, "宮崎": _2, "xn--1ctwo": _2, "富山": _2, "xn--6orx2r": _2, "山口": _2, "xn--rht61e": _2, "山形": _2, "xn--rht27z": _2, "山梨": _2, "xn--nit225k": _2, "岐阜": _2, "xn--rht3d": _2, "岡山": _2, "xn--djty4k": _2, "岩手": _2, "xn--klty5x": _2, "島根": _2, "xn--kltx9a": _2, "広島": _2, "xn--kltp7d": _2, "徳島": _2, "xn--c3s14m": _2, "愛媛": _2, "xn--vgu402c": _2, "愛知": _2, "xn--efvn9s": _2, "新潟": _2, "xn--1lqs71d": _2, "東京": _2, "xn--4pvxs": _2, "栃木": _2, "xn--uuwu58a": _2, "沖縄": _2, "xn--zbx025d": _2, "滋賀": _2, "xn--8pvr4u": _2, "熊本": _2, "xn--5rtp49c": _2, "石川": _2, "xn--ntso0iqx3a": _2, "神奈川": _2, "xn--elqq16h": _2, "福井": _2, "xn--4it168d": _2, "福岡": _2, "xn--klt787d": _2, "福島": _2, "xn--rny31h": _2, "秋田": _2, "xn--7t0a264c": _2, "群馬": _2, "xn--uist22h": _2, "茨城": _2, "xn--8ltr62k": _2, "長崎": _2, "xn--2m4a15e": _2, "長野": _2, "xn--32vp30h": _2, "青森": _2, "xn--4it797k": _2, "静岡": _2, "xn--5rtq34k": _2, "香川": _2, "xn--k7yn95e": _2, "高知": _2, "xn--tor131o": _2, "鳥取": _2, "xn--d5qv7z876c": _2, "鹿児島": _2, "kawasaki": _20, "kitakyushu": _20, "kobe": _20, "nagoya": _20, "sapporo": _20, "sendai": _20, "yokohama": _20, "buyshop": _3, "fashionstore": _3, "handcrafted": _3, "kawaiishop": _3, "supersale": _3, "theshop": _3, "0am": _3, "0g0": _3, "0j0": _3, "0t0": _3, "mydns": _3, "pgw": _3, "wjg": _3, "usercontent": _3, "angry": _3, "babyblue": _3, "babymilk": _3, "backdrop": _3, "bambina": _3, "bitter": _3, "blush": _3, "boo": _3, "boy": _3, "boyfriend": _3, "but": _3, "candypop": _3, "capoo": _3, "catfood": _3, "cheap": _3, "chicappa": _3, "chillout": _3, "chips": _3, "chowder": _3, "chu": _3, "ciao": _3, "cocotte": _3, "coolblog": _3, "cranky": _3, "cutegirl": _3, "daa": _3, "deca": _3, "deci": _3, "digick": _3, "egoism": _3, "fakefur": _3, "fem": _3, "flier": _3, "floppy": _3, "fool": _3, "frenchkiss": _3, "girlfriend": _3, "girly": _3, "gloomy": _3, "gonna": _3, "greater": _3, "hacca": _3, "heavy": _3, "her": _3, "hiho": _3, "hippy": _3, "holy": _3, "hungry": _3, "icurus": _3, "itigo": _3, "jellybean": _3, "kikirara": _3, "kill": _3, "kilo": _3, "kuron": _3, "littlestar": _3, "lolipopmc": _3, "lolitapunk": _3, "lomo": _3, "lovepop": _3, "lovesick": _3, "main": _3, "mods": _3, "mond": _3, "mongolian": _3, "moo": _3, "namaste": _3, "nikita": _3, "nobushi": _3, "noor": _3, "oops": _3, "parallel": _3, "parasite": _3, "pecori": _3, "peewee": _3, "penne": _3, "pepper": _3, "perma": _3, "pigboat": _3, "pinoko": _3, "punyu": _3, "pupu": _3, "pussycat": _3, "pya": _3, "raindrop": _3, "readymade": _3, "sadist": _3, "schoolbus": _3, "secret": _3, "staba": _3, "stripper": _3, "sub": _3, "sunnyday": _3, "thick": _3, "tonkotsu": _3, "under": _3, "upper": _3, "velvet": _3, "verse": _3, "versus": _3, "vivian": _3, "watson": _3, "weblike": _3, "whitesnow": _3, "zombie": _3, "hateblo": _3, "hatenablog": _3, "hatenadiary": _3, "2-d": _3, "bona": _3, "crap": _3, "daynight": _3, "eek": _3, "flop": _3, "halfmoon": _3, "jeez": _3, "matrix": _3, "mimoza": _3, "netgamers": _3, "nyanta": _3, "o0o0": _3, "rdy": _3, "rgr": _3, "rulez": _3, "sakurastorage": [0, { "isk01": _58, "isk02": _58 }], "saloon": _3, "sblo": _3, "skr": _3, "tank": _3, "uh-oh": _3, "undo": _3, "webaccel": [0, { "rs": _3, "user": _3 }], "websozai": _3, "xii": _3 }], "ke": [1, { "ac": _2, "co": _2, "go": _2, "info": _2, "me": _2, "mobi": _2, "ne": _2, "or": _2, "sc": _2 }], "kg": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "us": _3, "xx": _3 }], "kh": _20, "ki": _59, "km": [1, { "ass": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "nom": _2, "org": _2, "prd": _2, "tm": _2, "asso": _2, "coop": _2, "gouv": _2, "medecin": _2, "notaires": _2, "pharmaciens": _2, "presse": _2, "veterinaire": _2 }], "kn": [1, { "edu": _2, "gov": _2, "net": _2, "org": _2 }], "kp": [1, { "com": _2, "edu": _2, "gov": _2, "org": _2, "rep": _2, "tra": _2 }], "kr": [1, { "ac": _2, "ai": _2, "co": _2, "es": _2, "go": _2, "hs": _2, "io": _2, "it": _2, "kg": _2, "me": _2, "mil": _2, "ms": _2, "ne": _2, "or": _2, "pe": _2, "re": _2, "sc": _2, "busan": _2, "chungbuk": _2, "chungnam": _2, "daegu": _2, "daejeon": _2, "gangwon": _2, "gwangju": _2, "gyeongbuk": _2, "gyeonggi": _2, "gyeongnam": _2, "incheon": _2, "jeju": _2, "jeonbuk": _2, "jeonnam": _2, "seoul": _2, "ulsan": _2, "c01": _3, "eliv-cdn": _3, "eliv-dns": _3, "mmv": _3, "vki": _3 }], "kw": [1, { "com": _2, "edu": _2, "emb": _2, "gov": _2, "ind": _2, "net": _2, "org": _2 }], "ky": _47, "kz": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "jcloud": _3 }], "la": [1, { "com": _2, "edu": _2, "gov": _2, "info": _2, "int": _2, "net": _2, "org": _2, "per": _2, "bnr": _3 }], "lb": _4, "lc": [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "oy": _3 }], "li": _2, "lk": [1, { "ac": _2, "assn": _2, "com": _2, "edu": _2, "gov": _2, "grp": _2, "hotel": _2, "int": _2, "ltd": _2, "net": _2, "ngo": _2, "org": _2, "sch": _2, "soc": _2, "web": _2 }], "lr": _4, "ls": [1, { "ac": _2, "biz": _2, "co": _2, "edu": _2, "gov": _2, "info": _2, "net": _2, "org": _2, "sc": _2 }], "lt": _10, "lu": [1, { "123website": _3 }], "lv": [1, { "asn": _2, "com": _2, "conf": _2, "edu": _2, "gov": _2, "id": _2, "mil": _2, "net": _2, "org": _2 }], "ly": [1, { "com": _2, "edu": _2, "gov": _2, "id": _2, "med": _2, "net": _2, "org": _2, "plc": _2, "sch": _2 }], "ma": [1, { "ac": _2, "co": _2, "gov": _2, "net": _2, "org": _2, "press": _2 }], "mc": [1, { "asso": _2, "tm": _2 }], "md": [1, { "ir": _3 }], "me": [1, { "ac": _2, "co": _2, "edu": _2, "gov": _2, "its": _2, "net": _2, "org": _2, "priv": _2, "c66": _3, "craft": _3, "edgestack": _3, "filegear": _3, "filegear-sg": _3, "lohmus": _3, "barsy": _3, "mcdir": _3, "brasilia": _3, "ddns": _3, "dnsfor": _3, "hopto": _3, "loginto": _3, "noip": _3, "webhop": _3, "soundcast": _3, "tcp4": _3, "vp4": _3, "diskstation": _3, "dscloud": _3, "i234": _3, "myds": _3, "synology": _3, "transip": _46, "nohost": _3 }], "mg": [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "nom": _2, "org": _2, "prd": _2 }], "mh": _2, "mil": _2, "mk": [1, { "com": _2, "edu": _2, "gov": _2, "inf": _2, "name": _2, "net": _2, "org": _2 }], "ml": [1, { "ac": _2, "art": _2, "asso": _2, "com": _2, "edu": _2, "gouv": _2, "gov": _2, "info": _2, "inst": _2, "net": _2, "org": _2, "pr": _2, "presse": _2 }], "mm": _20, "mn": [1, { "edu": _2, "gov": _2, "org": _2, "nyc": _3 }], "mo": _4, "mobi": [1, { "barsy": _3, "dscloud": _3 }], "mp": [1, { "ju": _3 }], "mq": _2, "mr": _10, "ms": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "minisite": _3 }], "mt": _47, "mu": [1, { "ac": _2, "co": _2, "com": _2, "gov": _2, "net": _2, "or": _2, "org": _2 }], "museum": _2, "mv": [1, { "aero": _2, "biz": _2, "com": _2, "coop": _2, "edu": _2, "gov": _2, "info": _2, "int": _2, "mil": _2, "museum": _2, "name": _2, "net": _2, "org": _2, "pro": _2 }], "mw": [1, { "ac": _2, "biz": _2, "co": _2, "com": _2, "coop": _2, "edu": _2, "gov": _2, "int": _2, "net": _2, "org": _2 }], "mx": [1, { "com": _2, "edu": _2, "gob": _2, "net": _2, "org": _2 }], "my": [1, { "biz": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "name": _2, "net": _2, "org": _2 }], "mz": [1, { "ac": _2, "adv": _2, "co": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2 }], "na": [1, { "alt": _2, "co": _2, "com": _2, "gov": _2, "net": _2, "org": _2 }], "name": [1, { "her": _62, "his": _62 }], "nc": [1, { "asso": _2, "nom": _2 }], "ne": _2, "net": [1, { "adobeaemcloud": _3, "adobeio-static": _3, "adobeioruntime": _3, "akadns": _3, "akamai": _3, "akamai-staging": _3, "akamaiedge": _3, "akamaiedge-staging": _3, "akamaihd": _3, "akamaihd-staging": _3, "akamaiorigin": _3, "akamaiorigin-staging": _3, "akamaized": _3, "akamaized-staging": _3, "edgekey": _3, "edgekey-staging": _3, "edgesuite": _3, "edgesuite-staging": _3, "alwaysdata": _3, "myamaze": _3, "cloudfront": _3, "appudo": _3, "atlassian-dev": [0, { "prod": _54 }], "myfritz": _3, "onavstack": _3, "shopselect": _3, "blackbaudcdn": _3, "boomla": _3, "bplaced": _3, "square7": _3, "cdn77": [0, { "r": _3 }], "cdn77-ssl": _3, "gb": _3, "hu": _3, "jp": _3, "se": _3, "uk": _3, "clickrising": _3, "ddns-ip": _3, "dns-cloud": _3, "dns-dynamic": _3, "cloudaccess": _3, "cloudflare": [2, { "cdn": _3 }], "cloudflareanycast": _54, "cloudflarecn": _54, "cloudflareglobal": _54, "ctfcloud": _3, "feste-ip": _3, "knx-server": _3, "static-access": _3, "cryptonomic": _6, "dattolocal": _3, "mydatto": _3, "debian": _3, "definima": _3, "deno": _3, "icp": _6, "at-band-camp": _3, "blogdns": _3, "broke-it": _3, "buyshouses": _3, "dnsalias": _3, "dnsdojo": _3, "does-it": _3, "dontexist": _3, "dynalias": _3, "dynathome": _3, "endofinternet": _3, "from-az": _3, "from-co": _3, "from-la": _3, "from-ny": _3, "gets-it": _3, "ham-radio-op": _3, "homeftp": _3, "homeip": _3, "homelinux": _3, "homeunix": _3, "in-the-band": _3, "is-a-chef": _3, "is-a-geek": _3, "isa-geek": _3, "kicks-ass": _3, "office-on-the": _3, "podzone": _3, "scrapper-site": _3, "selfip": _3, "sells-it": _3, "servebbs": _3, "serveftp": _3, "thruhere": _3, "webhop": _3, "casacam": _3, "dynu": _3, "dynv6": _3, "twmail": _3, "ru": _3, "channelsdvr": [2, { "u": _3 }], "fastly": [0, { "freetls": _3, "map": _3, "prod": [0, { "a": _3, "global": _3 }], "ssl": [0, { "a": _3, "b": _3, "global": _3 }] }], "fastlylb": [2, { "map": _3 }], "edgeapp": _3, "keyword-on": _3, "live-on": _3, "server-on": _3, "cdn-edges": _3, "heteml": _3, "cloudfunctions": _3, "grafana-dev": _3, "iobb": _3, "moonscale": _3, "in-dsl": _3, "in-vpn": _3, "oninferno": _3, "botdash": _3, "apps-1and1": _3, "ipifony": _3, "cloudjiffy": [2, { "fra1-de": _3, "west1-us": _3 }], "elastx": [0, { "jls-sto1": _3, "jls-sto2": _3, "jls-sto3": _3 }], "massivegrid": [0, { "paas": [0, { "fr-1": _3, "lon-1": _3, "lon-2": _3, "ny-1": _3, "ny-2": _3, "sg-1": _3 }] }], "saveincloud": [0, { "jelastic": _3, "nordeste-idc": _3 }], "scaleforce": _48, "kinghost": _3, "uni5": _3, "krellian": _3, "ggff": _3, "localcert": _3, "localto": _6, "barsy": _3, "luyani": _3, "memset": _3, "azure-api": _3, "azure-mobile": _3, "azureedge": _3, "azurefd": _3, "azurestaticapps": [2, { "1": _3, "2": _3, "3": _3, "4": _3, "5": _3, "6": _3, "7": _3, "centralus": _3, "eastasia": _3, "eastus2": _3, "westeurope": _3, "westus2": _3 }], "azurewebsites": _3, "cloudapp": _3, "trafficmanager": _3, "windows": [0, { "core": [0, { "blob": _3 }], "servicebus": _3 }], "mynetname": [0, { "sn": _3 }], "routingthecloud": _3, "bounceme": _3, "ddns": _3, "eating-organic": _3, "mydissent": _3, "myeffect": _3, "mymediapc": _3, "mypsx": _3, "mysecuritycamera": _3, "nhlfan": _3, "no-ip": _3, "pgafan": _3, "privatizehealthinsurance": _3, "redirectme": _3, "serveblog": _3, "serveminecraft": _3, "sytes": _3, "dnsup": _3, "hicam": _3, "now-dns": _3, "ownip": _3, "vpndns": _3, "cloudycluster": _3, "ovh": [0, { "hosting": _6, "webpaas": _6 }], "rackmaze": _3, "myradweb": _3, "in": _3, "subsc-pay": _3, "squares": _3, "schokokeks": _3, "firewall-gateway": _3, "seidat": _3, "senseering": _3, "siteleaf": _3, "mafelo": _3, "myspreadshop": _3, "vps-host": [2, { "jelastic": [0, { "atl": _3, "njs": _3, "ric": _3 }] }], "srcf": [0, { "soc": _3, "user": _3 }], "supabase": _3, "dsmynas": _3, "familyds": _3, "ts": [2, { "c": _6 }], "torproject": [2, { "pages": _3 }], "vusercontent": _3, "reserve-online": _3, "community-pro": _3, "meinforum": _3, "yandexcloud": [2, { "storage": _3, "website": _3 }], "za": _3, "zabc": _3 }], "nf": [1, { "arts": _2, "com": _2, "firm": _2, "info": _2, "net": _2, "other": _2, "per": _2, "rec": _2, "store": _2, "web": _2 }], "ng": [1, { "com": _2, "edu": _2, "gov": _2, "i": _2, "mil": _2, "mobi": _2, "name": _2, "net": _2, "org": _2, "sch": _2, "biz": [2, { "co": _3, "dl": _3, "go": _3, "lg": _3, "on": _3 }], "col": _3, "firm": _3, "gen": _3, "ltd": _3, "ngo": _3, "plc": _3 }], "ni": [1, { "ac": _2, "biz": _2, "co": _2, "com": _2, "edu": _2, "gob": _2, "in": _2, "info": _2, "int": _2, "mil": _2, "net": _2, "nom": _2, "org": _2, "web": _2 }], "nl": [1, { "co": _3, "hosting-cluster": _3, "gov": _3, "khplay": _3, "123website": _3, "myspreadshop": _3, "transurl": _6, "cistron": _3, "demon": _3 }], "no": [1, { "fhs": _2, "folkebibl": _2, "fylkesbibl": _2, "idrett": _2, "museum": _2, "priv": _2, "vgs": _2, "dep": _2, "herad": _2, "kommune": _2, "mil": _2, "stat": _2, "aa": _63, "ah": _63, "bu": _63, "fm": _63, "hl": _63, "hm": _63, "jan-mayen": _63, "mr": _63, "nl": _63, "nt": _63, "of": _63, "ol": _63, "oslo": _63, "rl": _63, "sf": _63, "st": _63, "svalbard": _63, "tm": _63, "tr": _63, "va": _63, "vf": _63, "akrehamn": _2, "xn--krehamn-dxa": _2, "åkrehamn": _2, "algard": _2, "xn--lgrd-poac": _2, "ålgård": _2, "arna": _2, "bronnoysund": _2, "xn--brnnysund-m8ac": _2, "brønnøysund": _2, "brumunddal": _2, "bryne": _2, "drobak": _2, "xn--drbak-wua": _2, "drøbak": _2, "egersund": _2, "fetsund": _2, "floro": _2, "xn--flor-jra": _2, "florø": _2, "fredrikstad": _2, "hokksund": _2, "honefoss": _2, "xn--hnefoss-q1a": _2, "hønefoss": _2, "jessheim": _2, "jorpeland": _2, "xn--jrpeland-54a": _2, "jørpeland": _2, "kirkenes": _2, "kopervik": _2, "krokstadelva": _2, "langevag": _2, "xn--langevg-jxa": _2, "langevåg": _2, "leirvik": _2, "mjondalen": _2, "xn--mjndalen-64a": _2, "mjøndalen": _2, "mo-i-rana": _2, "mosjoen": _2, "xn--mosjen-eya": _2, "mosjøen": _2, "nesoddtangen": _2, "orkanger": _2, "osoyro": _2, "xn--osyro-wua": _2, "osøyro": _2, "raholt": _2, "xn--rholt-mra": _2, "råholt": _2, "sandnessjoen": _2, "xn--sandnessjen-ogb": _2, "sandnessjøen": _2, "skedsmokorset": _2, "slattum": _2, "spjelkavik": _2, "stathelle": _2, "stavern": _2, "stjordalshalsen": _2, "xn--stjrdalshalsen-sqb": _2, "stjørdalshalsen": _2, "tananger": _2, "tranby": _2, "vossevangen": _2, "aarborte": _2, "aejrie": _2, "afjord": _2, "xn--fjord-lra": _2, "åfjord": _2, "agdenes": _2, "akershus": _64, "aknoluokta": _2, "xn--koluokta-7ya57h": _2, "ákŋoluokta": _2, "al": _2, "xn--l-1fa": _2, "ål": _2, "alaheadju": _2, "xn--laheadju-7ya": _2, "álaheadju": _2, "alesund": _2, "xn--lesund-hua": _2, "ålesund": _2, "alstahaug": _2, "alta": _2, "xn--lt-liac": _2, "áltá": _2, "alvdal": _2, "amli": _2, "xn--mli-tla": _2, "åmli": _2, "amot": _2, "xn--mot-tla": _2, "åmot": _2, "andasuolo": _2, "andebu": _2, "andoy": _2, "xn--andy-ira": _2, "andøy": _2, "ardal": _2, "xn--rdal-poa": _2, "årdal": _2, "aremark": _2, "arendal": _2, "xn--s-1fa": _2, "ås": _2, "aseral": _2, "xn--seral-lra": _2, "åseral": _2, "asker": _2, "askim": _2, "askoy": _2, "xn--asky-ira": _2, "askøy": _2, "askvoll": _2, "asnes": _2, "xn--snes-poa": _2, "åsnes": _2, "audnedaln": _2, "aukra": _2, "aure": _2, "aurland": _2, "aurskog-holand": _2, "xn--aurskog-hland-jnb": _2, "aurskog-høland": _2, "austevoll": _2, "austrheim": _2, "averoy": _2, "xn--avery-yua": _2, "averøy": _2, "badaddja": _2, "xn--bdddj-mrabd": _2, "bådåddjå": _2, "xn--brum-voa": _2, "bærum": _2, "bahcavuotna": _2, "xn--bhcavuotna-s4a": _2, "báhcavuotna": _2, "bahccavuotna": _2, "xn--bhccavuotna-k7a": _2, "báhccavuotna": _2, "baidar": _2, "xn--bidr-5nac": _2, "báidár": _2, "bajddar": _2, "xn--bjddar-pta": _2, "bájddar": _2, "balat": _2, "xn--blt-elab": _2, "bálát": _2, "balestrand": _2, "ballangen": _2, "balsfjord": _2, "bamble": _2, "bardu": _2, "barum": _2, "batsfjord": _2, "xn--btsfjord-9za": _2, "båtsfjord": _2, "bearalvahki": _2, "xn--bearalvhki-y4a": _2, "bearalváhki": _2, "beardu": _2, "beiarn": _2, "berg": _2, "bergen": _2, "berlevag": _2, "xn--berlevg-jxa": _2, "berlevåg": _2, "bievat": _2, "xn--bievt-0qa": _2, "bievát": _2, "bindal": _2, "birkenes": _2, "bjarkoy": _2, "xn--bjarky-fya": _2, "bjarkøy": _2, "bjerkreim": _2, "bjugn": _2, "bodo": _2, "xn--bod-2na": _2, "bodø": _2, "bokn": _2, "bomlo": _2, "xn--bmlo-gra": _2, "bømlo": _2, "bremanger": _2, "bronnoy": _2, "xn--brnny-wuac": _2, "brønnøy": _2, "budejju": _2, "buskerud": _64, "bygland": _2, "bykle": _2, "cahcesuolo": _2, "xn--hcesuolo-7ya35b": _2, "čáhcesuolo": _2, "davvenjarga": _2, "xn--davvenjrga-y4a": _2, "davvenjárga": _2, "davvesiida": _2, "deatnu": _2, "dielddanuorri": _2, "divtasvuodna": _2, "divttasvuotna": _2, "donna": _2, "xn--dnna-gra": _2, "dønna": _2, "dovre": _2, "drammen": _2, "drangedal": _2, "dyroy": _2, "xn--dyry-ira": _2, "dyrøy": _2, "eid": _2, "eidfjord": _2, "eidsberg": _2, "eidskog": _2, "eidsvoll": _2, "eigersund": _2, "elverum": _2, "enebakk": _2, "engerdal": _2, "etne": _2, "etnedal": _2, "evenassi": _2, "xn--eveni-0qa01ga": _2, "evenášši": _2, "evenes": _2, "evje-og-hornnes": _2, "farsund": _2, "fauske": _2, "fedje": _2, "fet": _2, "finnoy": _2, "xn--finny-yua": _2, "finnøy": _2, "fitjar": _2, "fjaler": _2, "fjell": _2, "fla": _2, "xn--fl-zia": _2, "flå": _2, "flakstad": _2, "flatanger": _2, "flekkefjord": _2, "flesberg": _2, "flora": _2, "folldal": _2, "forde": _2, "xn--frde-gra": _2, "førde": _2, "forsand": _2, "fosnes": _2, "xn--frna-woa": _2, "fræna": _2, "frana": _2, "frei": _2, "frogn": _2, "froland": _2, "frosta": _2, "froya": _2, "xn--frya-hra": _2, "frøya": _2, "fuoisku": _2, "fuossko": _2, "fusa": _2, "fyresdal": _2, "gaivuotna": _2, "xn--givuotna-8ya": _2, "gáivuotna": _2, "galsa": _2, "xn--gls-elac": _2, "gálsá": _2, "gamvik": _2, "gangaviika": _2, "xn--ggaviika-8ya47h": _2, "gáŋgaviika": _2, "gaular": _2, "gausdal": _2, "giehtavuoatna": _2, "gildeskal": _2, "xn--gildeskl-g0a": _2, "gildeskål": _2, "giske": _2, "gjemnes": _2, "gjerdrum": _2, "gjerstad": _2, "gjesdal": _2, "gjovik": _2, "xn--gjvik-wua": _2, "gjøvik": _2, "gloppen": _2, "gol": _2, "gran": _2, "grane": _2, "granvin": _2, "gratangen": _2, "grimstad": _2, "grong": _2, "grue": _2, "gulen": _2, "guovdageaidnu": _2, "ha": _2, "xn--h-2fa": _2, "hå": _2, "habmer": _2, "xn--hbmer-xqa": _2, "hábmer": _2, "hadsel": _2, "xn--hgebostad-g3a": _2, "hægebostad": _2, "hagebostad": _2, "halden": _2, "halsa": _2, "hamar": _2, "hamaroy": _2, "hammarfeasta": _2, "xn--hmmrfeasta-s4ac": _2, "hámmárfeasta": _2, "hammerfest": _2, "hapmir": _2, "xn--hpmir-xqa": _2, "hápmir": _2, "haram": _2, "hareid": _2, "harstad": _2, "hasvik": _2, "hattfjelldal": _2, "haugesund": _2, "hedmark": [0, { "os": _2, "valer": _2, "xn--vler-qoa": _2, "våler": _2 }], "hemne": _2, "hemnes": _2, "hemsedal": _2, "hitra": _2, "hjartdal": _2, "hjelmeland": _2, "hobol": _2, "xn--hobl-ira": _2, "hobøl": _2, "hof": _2, "hol": _2, "hole": _2, "holmestrand": _2, "holtalen": _2, "xn--holtlen-hxa": _2, "holtålen": _2, "hordaland": [0, { "os": _2 }], "hornindal": _2, "horten": _2, "hoyanger": _2, "xn--hyanger-q1a": _2, "høyanger": _2, "hoylandet": _2, "xn--hylandet-54a": _2, "høylandet": _2, "hurdal": _2, "hurum": _2, "hvaler": _2, "hyllestad": _2, "ibestad": _2, "inderoy": _2, "xn--indery-fya": _2, "inderøy": _2, "iveland": _2, "ivgu": _2, "jevnaker": _2, "jolster": _2, "xn--jlster-bya": _2, "jølster": _2, "jondal": _2, "kafjord": _2, "xn--kfjord-iua": _2, "kåfjord": _2, "karasjohka": _2, "xn--krjohka-hwab49j": _2, "kárášjohka": _2, "karasjok": _2, "karlsoy": _2, "karmoy": _2, "xn--karmy-yua": _2, "karmøy": _2, "kautokeino": _2, "klabu": _2, "xn--klbu-woa": _2, "klæbu": _2, "klepp": _2, "kongsberg": _2, "kongsvinger": _2, "kraanghke": _2, "xn--kranghke-b0a": _2, "kråanghke": _2, "kragero": _2, "xn--krager-gya": _2, "kragerø": _2, "kristiansand": _2, "kristiansund": _2, "krodsherad": _2, "xn--krdsherad-m8a": _2, "krødsherad": _2, "xn--kvfjord-nxa": _2, "kvæfjord": _2, "xn--kvnangen-k0a": _2, "kvænangen": _2, "kvafjord": _2, "kvalsund": _2, "kvam": _2, "kvanangen": _2, "kvinesdal": _2, "kvinnherad": _2, "kviteseid": _2, "kvitsoy": _2, "xn--kvitsy-fya": _2, "kvitsøy": _2, "laakesvuemie": _2, "xn--lrdal-sra": _2, "lærdal": _2, "lahppi": _2, "xn--lhppi-xqa": _2, "láhppi": _2, "lardal": _2, "larvik": _2, "lavagis": _2, "lavangen": _2, "leangaviika": _2, "xn--leagaviika-52b": _2, "leaŋgaviika": _2, "lebesby": _2, "leikanger": _2, "leirfjord": _2, "leka": _2, "leksvik": _2, "lenvik": _2, "lerdal": _2, "lesja": _2, "levanger": _2, "lier": _2, "lierne": _2, "lillehammer": _2, "lillesand": _2, "lindas": _2, "xn--linds-pra": _2, "lindås": _2, "lindesnes": _2, "loabat": _2, "xn--loabt-0qa": _2, "loabát": _2, "lodingen": _2, "xn--ldingen-q1a": _2, "lødingen": _2, "lom": _2, "loppa": _2, "lorenskog": _2, "xn--lrenskog-54a": _2, "lørenskog": _2, "loten": _2, "xn--lten-gra": _2, "løten": _2, "lund": _2, "lunner": _2, "luroy": _2, "xn--lury-ira": _2, "lurøy": _2, "luster": _2, "lyngdal": _2, "lyngen": _2, "malatvuopmi": _2, "xn--mlatvuopmi-s4a": _2, "málatvuopmi": _2, "malselv": _2, "xn--mlselv-iua": _2, "målselv": _2, "malvik": _2, "mandal": _2, "marker": _2, "marnardal": _2, "masfjorden": _2, "masoy": _2, "xn--msy-ula0h": _2, "måsøy": _2, "matta-varjjat": _2, "xn--mtta-vrjjat-k7af": _2, "mátta-várjjat": _2, "meland": _2, "meldal": _2, "melhus": _2, "meloy": _2, "xn--mely-ira": _2, "meløy": _2, "meraker": _2, "xn--merker-kua": _2, "meråker": _2, "midsund": _2, "midtre-gauldal": _2, "moareke": _2, "xn--moreke-jua": _2, "moåreke": _2, "modalen": _2, "modum": _2, "molde": _2, "more-og-romsdal": [0, { "heroy": _2, "sande": _2 }], "xn--mre-og-romsdal-qqb": [0, { "xn--hery-ira": _2, "sande": _2 }], "møre-og-romsdal": [0, { "herøy": _2, "sande": _2 }], "moskenes": _2, "moss": _2, "mosvik": _2, "muosat": _2, "xn--muost-0qa": _2, "muosát": _2, "naamesjevuemie": _2, "xn--nmesjevuemie-tcba": _2, "nååmesjevuemie": _2, "xn--nry-yla5g": _2, "nærøy": _2, "namdalseid": _2, "namsos": _2, "namsskogan": _2, "nannestad": _2, "naroy": _2, "narviika": _2, "narvik": _2, "naustdal": _2, "navuotna": _2, "xn--nvuotna-hwa": _2, "návuotna": _2, "nedre-eiker": _2, "nesna": _2, "nesodden": _2, "nesseby": _2, "nesset": _2, "nissedal": _2, "nittedal": _2, "nord-aurdal": _2, "nord-fron": _2, "nord-odal": _2, "norddal": _2, "nordkapp": _2, "nordland": [0, { "bo": _2, "xn--b-5ga": _2, "bø": _2, "heroy": _2, "xn--hery-ira": _2, "herøy": _2 }], "nordre-land": _2, "nordreisa": _2, "nore-og-uvdal": _2, "notodden": _2, "notteroy": _2, "xn--nttery-byae": _2, "nøtterøy": _2, "odda": _2, "oksnes": _2, "xn--ksnes-uua": _2, "øksnes": _2, "omasvuotna": _2, "oppdal": _2, "oppegard": _2, "xn--oppegrd-ixa": _2, "oppegård": _2, "orkdal": _2, "orland": _2, "xn--rland-uua": _2, "ørland": _2, "orskog": _2, "xn--rskog-uua": _2, "ørskog": _2, "orsta": _2, "xn--rsta-fra": _2, "ørsta": _2, "osen": _2, "osteroy": _2, "xn--ostery-fya": _2, "osterøy": _2, "ostfold": [0, { "valer": _2 }], "xn--stfold-9xa": [0, { "xn--vler-qoa": _2 }], "østfold": [0, { "våler": _2 }], "ostre-toten": _2, "xn--stre-toten-zcb": _2, "østre-toten": _2, "overhalla": _2, "ovre-eiker": _2, "xn--vre-eiker-k8a": _2, "øvre-eiker": _2, "oyer": _2, "xn--yer-zna": _2, "øyer": _2, "oygarden": _2, "xn--ygarden-p1a": _2, "øygarden": _2, "oystre-slidre": _2, "xn--ystre-slidre-ujb": _2, "øystre-slidre": _2, "porsanger": _2, "porsangu": _2, "xn--porsgu-sta26f": _2, "porsáŋgu": _2, "porsgrunn": _2, "rade": _2, "xn--rde-ula": _2, "råde": _2, "radoy": _2, "xn--rady-ira": _2, "radøy": _2, "xn--rlingen-mxa": _2, "rælingen": _2, "rahkkeravju": _2, "xn--rhkkervju-01af": _2, "ráhkkerávju": _2, "raisa": _2, "xn--risa-5na": _2, "ráisa": _2, "rakkestad": _2, "ralingen": _2, "rana": _2, "randaberg": _2, "rauma": _2, "rendalen": _2, "rennebu": _2, "rennesoy": _2, "xn--rennesy-v1a": _2, "rennesøy": _2, "rindal": _2, "ringebu": _2, "ringerike": _2, "ringsaker": _2, "risor": _2, "xn--risr-ira": _2, "risør": _2, "rissa": _2, "roan": _2, "rodoy": _2, "xn--rdy-0nab": _2, "rødøy": _2, "rollag": _2, "romsa": _2, "romskog": _2, "xn--rmskog-bya": _2, "rømskog": _2, "roros": _2, "xn--rros-gra": _2, "røros": _2, "rost": _2, "xn--rst-0na": _2, "røst": _2, "royken": _2, "xn--ryken-vua": _2, "røyken": _2, "royrvik": _2, "xn--ryrvik-bya": _2, "røyrvik": _2, "ruovat": _2, "rygge": _2, "salangen": _2, "salat": _2, "xn--slat-5na": _2, "sálat": _2, "xn--slt-elab": _2, "sálát": _2, "saltdal": _2, "samnanger": _2, "sandefjord": _2, "sandnes": _2, "sandoy": _2, "xn--sandy-yua": _2, "sandøy": _2, "sarpsborg": _2, "sauda": _2, "sauherad": _2, "sel": _2, "selbu": _2, "selje": _2, "seljord": _2, "siellak": _2, "sigdal": _2, "siljan": _2, "sirdal": _2, "skanit": _2, "xn--sknit-yqa": _2, "skánit": _2, "skanland": _2, "xn--sknland-fxa": _2, "skånland": _2, "skaun": _2, "skedsmo": _2, "ski": _2, "skien": _2, "skierva": _2, "xn--skierv-uta": _2, "skiervá": _2, "skiptvet": _2, "skjak": _2, "xn--skjk-soa": _2, "skjåk": _2, "skjervoy": _2, "xn--skjervy-v1a": _2, "skjervøy": _2, "skodje": _2, "smola": _2, "xn--smla-hra": _2, "smøla": _2, "snaase": _2, "xn--snase-nra": _2, "snåase": _2, "snasa": _2, "xn--snsa-roa": _2, "snåsa": _2, "snillfjord": _2, "snoasa": _2, "sogndal": _2, "sogne": _2, "xn--sgne-gra": _2, "søgne": _2, "sokndal": _2, "sola": _2, "solund": _2, "somna": _2, "xn--smna-gra": _2, "sømna": _2, "sondre-land": _2, "xn--sndre-land-0cb": _2, "søndre-land": _2, "songdalen": _2, "sor-aurdal": _2, "xn--sr-aurdal-l8a": _2, "sør-aurdal": _2, "sor-fron": _2, "xn--sr-fron-q1a": _2, "sør-fron": _2, "sor-odal": _2, "xn--sr-odal-q1a": _2, "sør-odal": _2, "sor-varanger": _2, "xn--sr-varanger-ggb": _2, "sør-varanger": _2, "sorfold": _2, "xn--srfold-bya": _2, "sørfold": _2, "sorreisa": _2, "xn--srreisa-q1a": _2, "sørreisa": _2, "sortland": _2, "sorum": _2, "xn--srum-gra": _2, "sørum": _2, "spydeberg": _2, "stange": _2, "stavanger": _2, "steigen": _2, "steinkjer": _2, "stjordal": _2, "xn--stjrdal-s1a": _2, "stjørdal": _2, "stokke": _2, "stor-elvdal": _2, "stord": _2, "stordal": _2, "storfjord": _2, "strand": _2, "stranda": _2, "stryn": _2, "sula": _2, "suldal": _2, "sund": _2, "sunndal": _2, "surnadal": _2, "sveio": _2, "svelvik": _2, "sykkylven": _2, "tana": _2, "telemark": [0, { "bo": _2, "xn--b-5ga": _2, "bø": _2 }], "time": _2, "tingvoll": _2, "tinn": _2, "tjeldsund": _2, "tjome": _2, "xn--tjme-hra": _2, "tjøme": _2, "tokke": _2, "tolga": _2, "tonsberg": _2, "xn--tnsberg-q1a": _2, "tønsberg": _2, "torsken": _2, "xn--trna-woa": _2, "træna": _2, "trana": _2, "tranoy": _2, "xn--trany-yua": _2, "tranøy": _2, "troandin": _2, "trogstad": _2, "xn--trgstad-r1a": _2, "trøgstad": _2, "tromsa": _2, "tromso": _2, "xn--troms-zua": _2, "tromsø": _2, "trondheim": _2, "trysil": _2, "tvedestrand": _2, "tydal": _2, "tynset": _2, "tysfjord": _2, "tysnes": _2, "xn--tysvr-vra": _2, "tysvær": _2, "tysvar": _2, "ullensaker": _2, "ullensvang": _2, "ulvik": _2, "unjarga": _2, "xn--unjrga-rta": _2, "unjárga": _2, "utsira": _2, "vaapste": _2, "vadso": _2, "xn--vads-jra": _2, "vadsø": _2, "xn--vry-yla5g": _2, "værøy": _2, "vaga": _2, "xn--vg-yiab": _2, "vågå": _2, "vagan": _2, "xn--vgan-qoa": _2, "vågan": _2, "vagsoy": _2, "xn--vgsy-qoa0j": _2, "vågsøy": _2, "vaksdal": _2, "valle": _2, "vang": _2, "vanylven": _2, "vardo": _2, "xn--vard-jra": _2, "vardø": _2, "varggat": _2, "xn--vrggt-xqad": _2, "várggát": _2, "varoy": _2, "vefsn": _2, "vega": _2, "vegarshei": _2, "xn--vegrshei-c0a": _2, "vegårshei": _2, "vennesla": _2, "verdal": _2, "verran": _2, "vestby": _2, "vestfold": [0, { "sande": _2 }], "vestnes": _2, "vestre-slidre": _2, "vestre-toten": _2, "vestvagoy": _2, "xn--vestvgy-ixa6o": _2, "vestvågøy": _2, "vevelstad": _2, "vik": _2, "vikna": _2, "vindafjord": _2, "voagat": _2, "volda": _2, "voss": _2, "co": _3, "123hjemmeside": _3, "myspreadshop": _3 }], "np": _20, "nr": _59, "nu": [1, { "merseine": _3, "mine": _3, "shacknet": _3, "enterprisecloud": _3 }], "nz": [1, { "ac": _2, "co": _2, "cri": _2, "geek": _2, "gen": _2, "govt": _2, "health": _2, "iwi": _2, "kiwi": _2, "maori": _2, "xn--mori-qsa": _2, "māori": _2, "mil": _2, "net": _2, "org": _2, "parliament": _2, "school": _2, "cloudns": _3 }], "om": [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "med": _2, "museum": _2, "net": _2, "org": _2, "pro": _2 }], "onion": _2, "org": [1, { "altervista": _3, "pimienta": _3, "poivron": _3, "potager": _3, "sweetpepper": _3, "cdn77": [0, { "c": _3, "rsc": _3 }], "cdn77-secure": [0, { "origin": [0, { "ssl": _3 }] }], "ae": _3, "cloudns": _3, "ip-dynamic": _3, "ddnss": _3, "dpdns": _3, "duckdns": _3, "tunk": _3, "blogdns": _3, "blogsite": _3, "boldlygoingnowhere": _3, "dnsalias": _3, "dnsdojo": _3, "doesntexist": _3, "dontexist": _3, "doomdns": _3, "dvrdns": _3, "dynalias": _3, "dyndns": [2, { "go": _3, "home": _3 }], "endofinternet": _3, "endoftheinternet": _3, "from-me": _3, "game-host": _3, "gotdns": _3, "hobby-site": _3, "homedns": _3, "homeftp": _3, "homelinux": _3, "homeunix": _3, "is-a-bruinsfan": _3, "is-a-candidate": _3, "is-a-celticsfan": _3, "is-a-chef": _3, "is-a-geek": _3, "is-a-knight": _3, "is-a-linux-user": _3, "is-a-patsfan": _3, "is-a-soxfan": _3, "is-found": _3, "is-lost": _3, "is-saved": _3, "is-very-bad": _3, "is-very-evil": _3, "is-very-good": _3, "is-very-nice": _3, "is-very-sweet": _3, "isa-geek": _3, "kicks-ass": _3, "misconfused": _3, "podzone": _3, "readmyblog": _3, "selfip": _3, "sellsyourhome": _3, "servebbs": _3, "serveftp": _3, "servegame": _3, "stuff-4-sale": _3, "webhop": _3, "accesscam": _3, "camdvr": _3, "freeddns": _3, "mywire": _3, "webredirect": _3, "twmail": _3, "eu": [2, { "al": _3, "asso": _3, "at": _3, "au": _3, "be": _3, "bg": _3, "ca": _3, "cd": _3, "ch": _3, "cn": _3, "cy": _3, "cz": _3, "de": _3, "dk": _3, "edu": _3, "ee": _3, "es": _3, "fi": _3, "fr": _3, "gr": _3, "hr": _3, "hu": _3, "ie": _3, "il": _3, "in": _3, "int": _3, "is": _3, "it": _3, "jp": _3, "kr": _3, "lt": _3, "lu": _3, "lv": _3, "me": _3, "mk": _3, "mt": _3, "my": _3, "net": _3, "ng": _3, "nl": _3, "no": _3, "nz": _3, "pl": _3, "pt": _3, "ro": _3, "ru": _3, "se": _3, "si": _3, "sk": _3, "tr": _3, "uk": _3, "us": _3 }], "fedorainfracloud": _3, "fedorapeople": _3, "fedoraproject": [0, { "cloud": _3, "os": _45, "stg": [0, { "os": _45 }] }], "freedesktop": _3, "hatenadiary": _3, "hepforge": _3, "in-dsl": _3, "in-vpn": _3, "js": _3, "barsy": _3, "mayfirst": _3, "routingthecloud": _3, "bmoattachments": _3, "cable-modem": _3, "collegefan": _3, "couchpotatofries": _3, "hopto": _3, "mlbfan": _3, "myftp": _3, "mysecuritycamera": _3, "nflfan": _3, "no-ip": _3, "read-books": _3, "ufcfan": _3, "zapto": _3, "dynserv": _3, "now-dns": _3, "is-local": _3, "httpbin": _3, "pubtls": _3, "jpn": _3, "my-firewall": _3, "myfirewall": _3, "spdns": _3, "small-web": _3, "dsmynas": _3, "familyds": _3, "teckids": _58, "tuxfamily": _3, "diskstation": _3, "hk": _3, "us": _3, "toolforge": _3, "wmcloud": [2, { "beta": _3 }], "wmflabs": _3, "za": _3 }], "pa": [1, { "abo": _2, "ac": _2, "com": _2, "edu": _2, "gob": _2, "ing": _2, "med": _2, "net": _2, "nom": _2, "org": _2, "sld": _2 }], "pe": [1, { "com": _2, "edu": _2, "gob": _2, "mil": _2, "net": _2, "nom": _2, "org": _2 }], "pf": [1, { "com": _2, "edu": _2, "org": _2 }], "pg": _20, "ph": [1, { "com": _2, "edu": _2, "gov": _2, "i": _2, "mil": _2, "net": _2, "ngo": _2, "org": _2, "cloudns": _3 }], "pk": [1, { "ac": _2, "biz": _2, "com": _2, "edu": _2, "fam": _2, "gkp": _2, "gob": _2, "gog": _2, "gok": _2, "gop": _2, "gos": _2, "gov": _2, "net": _2, "org": _2, "web": _2 }], "pl": [1, { "com": _2, "net": _2, "org": _2, "agro": _2, "aid": _2, "atm": _2, "auto": _2, "biz": _2, "edu": _2, "gmina": _2, "gsm": _2, "info": _2, "mail": _2, "media": _2, "miasta": _2, "mil": _2, "nieruchomosci": _2, "nom": _2, "pc": _2, "powiat": _2, "priv": _2, "realestate": _2, "rel": _2, "sex": _2, "shop": _2, "sklep": _2, "sos": _2, "szkola": _2, "targi": _2, "tm": _2, "tourism": _2, "travel": _2, "turystyka": _2, "gov": [1, { "ap": _2, "griw": _2, "ic": _2, "is": _2, "kmpsp": _2, "konsulat": _2, "kppsp": _2, "kwp": _2, "kwpsp": _2, "mup": _2, "mw": _2, "oia": _2, "oirm": _2, "oke": _2, "oow": _2, "oschr": _2, "oum": _2, "pa": _2, "pinb": _2, "piw": _2, "po": _2, "pr": _2, "psp": _2, "psse": _2, "pup": _2, "rzgw": _2, "sa": _2, "sdn": _2, "sko": _2, "so": _2, "sr": _2, "starostwo": _2, "ug": _2, "ugim": _2, "um": _2, "umig": _2, "upow": _2, "uppo": _2, "us": _2, "uw": _2, "uzs": _2, "wif": _2, "wiih": _2, "winb": _2, "wios": _2, "witd": _2, "wiw": _2, "wkz": _2, "wsa": _2, "wskr": _2, "wsse": _2, "wuoz": _2, "wzmiuw": _2, "zp": _2, "zpisdn": _2 }], "augustow": _2, "babia-gora": _2, "bedzin": _2, "beskidy": _2, "bialowieza": _2, "bialystok": _2, "bielawa": _2, "bieszczady": _2, "boleslawiec": _2, "bydgoszcz": _2, "bytom": _2, "cieszyn": _2, "czeladz": _2, "czest": _2, "dlugoleka": _2, "elblag": _2, "elk": _2, "glogow": _2, "gniezno": _2, "gorlice": _2, "grajewo": _2, "ilawa": _2, "jaworzno": _2, "jelenia-gora": _2, "jgora": _2, "kalisz": _2, "karpacz": _2, "kartuzy": _2, "kaszuby": _2, "katowice": _2, "kazimierz-dolny": _2, "kepno": _2, "ketrzyn": _2, "klodzko": _2, "kobierzyce": _2, "kolobrzeg": _2, "konin": _2, "konskowola": _2, "kutno": _2, "lapy": _2, "lebork": _2, "legnica": _2, "lezajsk": _2, "limanowa": _2, "lomza": _2, "lowicz": _2, "lubin": _2, "lukow": _2, "malbork": _2, "malopolska": _2, "mazowsze": _2, "mazury": _2, "mielec": _2, "mielno": _2, "mragowo": _2, "naklo": _2, "nowaruda": _2, "nysa": _2, "olawa": _2, "olecko": _2, "olkusz": _2, "olsztyn": _2, "opoczno": _2, "opole": _2, "ostroda": _2, "ostroleka": _2, "ostrowiec": _2, "ostrowwlkp": _2, "pila": _2, "pisz": _2, "podhale": _2, "podlasie": _2, "polkowice": _2, "pomorskie": _2, "pomorze": _2, "prochowice": _2, "pruszkow": _2, "przeworsk": _2, "pulawy": _2, "radom": _2, "rawa-maz": _2, "rybnik": _2, "rzeszow": _2, "sanok": _2, "sejny": _2, "skoczow": _2, "slask": _2, "slupsk": _2, "sosnowiec": _2, "stalowa-wola": _2, "starachowice": _2, "stargard": _2, "suwalki": _2, "swidnica": _2, "swiebodzin": _2, "swinoujscie": _2, "szczecin": _2, "szczytno": _2, "tarnobrzeg": _2, "tgory": _2, "turek": _2, "tychy": _2, "ustka": _2, "walbrzych": _2, "warmia": _2, "warszawa": _2, "waw": _2, "wegrow": _2, "wielun": _2, "wlocl": _2, "wloclawek": _2, "wodzislaw": _2, "wolomin": _2, "wroclaw": _2, "zachpomor": _2, "zagan": _2, "zarow": _2, "zgora": _2, "zgorzelec": _2, "art": _3, "gliwice": _3, "krakow": _3, "poznan": _3, "wroc": _3, "zakopane": _3, "beep": _3, "ecommerce-shop": _3, "cfolks": _3, "dfirma": _3, "dkonto": _3, "you2": _3, "shoparena": _3, "homesklep": _3, "sdscloud": _3, "unicloud": _3, "lodz": _3, "pabianice": _3, "plock": _3, "sieradz": _3, "skierniewice": _3, "zgierz": _3, "krasnik": _3, "leczna": _3, "lubartow": _3, "lublin": _3, "poniatowa": _3, "swidnik": _3, "co": _3, "torun": _3, "simplesite": _3, "myspreadshop": _3, "gda": _3, "gdansk": _3, "gdynia": _3, "med": _3, "sopot": _3, "bielsko": _3 }], "pm": [1, { "own": _3, "name": _3 }], "pn": [1, { "co": _2, "edu": _2, "gov": _2, "net": _2, "org": _2 }], "post": _2, "pr": [1, { "biz": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "isla": _2, "name": _2, "net": _2, "org": _2, "pro": _2, "ac": _2, "est": _2, "prof": _2 }], "pro": [1, { "aaa": _2, "aca": _2, "acct": _2, "avocat": _2, "bar": _2, "cpa": _2, "eng": _2, "jur": _2, "law": _2, "med": _2, "recht": _2, "12chars": _3, "cloudns": _3, "barsy": _3, "ngrok": _3 }], "ps": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "plo": _2, "sec": _2 }], "pt": [1, { "com": _2, "edu": _2, "gov": _2, "int": _2, "net": _2, "nome": _2, "org": _2, "publ": _2, "123paginaweb": _3 }], "pw": [1, { "gov": _2, "cloudns": _3, "x443": _3 }], "py": [1, { "com": _2, "coop": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2 }], "qa": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "sch": _2 }], "re": [1, { "asso": _2, "com": _2, "netlib": _3, "can": _3 }], "ro": [1, { "arts": _2, "com": _2, "firm": _2, "info": _2, "nom": _2, "nt": _2, "org": _2, "rec": _2, "store": _2, "tm": _2, "www": _2, "co": _3, "shop": _3, "barsy": _3 }], "rs": [1, { "ac": _2, "co": _2, "edu": _2, "gov": _2, "in": _2, "org": _2, "brendly": _19, "barsy": _3, "ox": _3 }], "ru": [1, { "ac": _3, "edu": _3, "gov": _3, "int": _3, "mil": _3, "eurodir": _3, "adygeya": _3, "bashkiria": _3, "bir": _3, "cbg": _3, "com": _3, "dagestan": _3, "grozny": _3, "kalmykia": _3, "kustanai": _3, "marine": _3, "mordovia": _3, "msk": _3, "mytis": _3, "nalchik": _3, "nov": _3, "pyatigorsk": _3, "spb": _3, "vladikavkaz": _3, "vladimir": _3, "na4u": _3, "mircloud": _3, "myjino": [2, { "hosting": _6, "landing": _6, "spectrum": _6, "vps": _6 }], "cldmail": [0, { "hb": _3 }], "mcdir": _11, "mcpre": _3, "net": _3, "org": _3, "pp": _3, "lk3": _3, "ras": _3 }], "rw": [1, { "ac": _2, "co": _2, "coop": _2, "gov": _2, "mil": _2, "net": _2, "org": _2 }], "sa": [1, { "com": _2, "edu": _2, "gov": _2, "med": _2, "net": _2, "org": _2, "pub": _2, "sch": _2 }], "sb": _4, "sc": _4, "sd": [1, { "com": _2, "edu": _2, "gov": _2, "info": _2, "med": _2, "net": _2, "org": _2, "tv": _2 }], "se": [1, { "a": _2, "ac": _2, "b": _2, "bd": _2, "brand": _2, "c": _2, "d": _2, "e": _2, "f": _2, "fh": _2, "fhsk": _2, "fhv": _2, "g": _2, "h": _2, "i": _2, "k": _2, "komforb": _2, "kommunalforbund": _2, "komvux": _2, "l": _2, "lanbib": _2, "m": _2, "n": _2, "naturbruksgymn": _2, "o": _2, "org": _2, "p": _2, "parti": _2, "pp": _2, "press": _2, "r": _2, "s": _2, "t": _2, "tm": _2, "u": _2, "w": _2, "x": _2, "y": _2, "z": _2, "com": _3, "iopsys": _3, "123minsida": _3, "itcouldbewor": _3, "myspreadshop": _3 }], "sg": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "enscaled": _3 }], "sh": [1, { "com": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "hashbang": _3, "botda": _3, "lovable": _3, "platform": [0, { "ent": _3, "eu": _3, "us": _3 }], "now": _3 }], "si": [1, { "f5": _3, "gitapp": _3, "gitpage": _3 }], "sj": _2, "sk": _2, "sl": _4, "sm": _2, "sn": [1, { "art": _2, "com": _2, "edu": _2, "gouv": _2, "org": _2, "perso": _2, "univ": _2 }], "so": [1, { "com": _2, "edu": _2, "gov": _2, "me": _2, "net": _2, "org": _2, "surveys": _3 }], "sr": _2, "ss": [1, { "biz": _2, "co": _2, "com": _2, "edu": _2, "gov": _2, "me": _2, "net": _2, "org": _2, "sch": _2 }], "st": [1, { "co": _2, "com": _2, "consulado": _2, "edu": _2, "embaixada": _2, "mil": _2, "net": _2, "org": _2, "principe": _2, "saotome": _2, "store": _2, "helioho": _3, "kirara": _3, "noho": _3 }], "su": [1, { "abkhazia": _3, "adygeya": _3, "aktyubinsk": _3, "arkhangelsk": _3, "armenia": _3, "ashgabad": _3, "azerbaijan": _3, "balashov": _3, "bashkiria": _3, "bryansk": _3, "bukhara": _3, "chimkent": _3, "dagestan": _3, "east-kazakhstan": _3, "exnet": _3, "georgia": _3, "grozny": _3, "ivanovo": _3, "jambyl": _3, "kalmykia": _3, "kaluga": _3, "karacol": _3, "karaganda": _3, "karelia": _3, "khakassia": _3, "krasnodar": _3, "kurgan": _3, "kustanai": _3, "lenug": _3, "mangyshlak": _3, "mordovia": _3, "msk": _3, "murmansk": _3, "nalchik": _3, "navoi": _3, "north-kazakhstan": _3, "nov": _3, "obninsk": _3, "penza": _3, "pokrovsk": _3, "sochi": _3, "spb": _3, "tashkent": _3, "termez": _3, "togliatti": _3, "troitsk": _3, "tselinograd": _3, "tula": _3, "tuva": _3, "vladikavkaz": _3, "vladimir": _3, "vologda": _3 }], "sv": [1, { "com": _2, "edu": _2, "gob": _2, "org": _2, "red": _2 }], "sx": _10, "sy": _5, "sz": [1, { "ac": _2, "co": _2, "org": _2 }], "tc": _2, "td": _2, "tel": _2, "tf": [1, { "sch": _3 }], "tg": _2, "th": [1, { "ac": _2, "co": _2, "go": _2, "in": _2, "mi": _2, "net": _2, "or": _2, "online": _3, "shop": _3 }], "tj": [1, { "ac": _2, "biz": _2, "co": _2, "com": _2, "edu": _2, "go": _2, "gov": _2, "int": _2, "mil": _2, "name": _2, "net": _2, "nic": _2, "org": _2, "test": _2, "web": _2 }], "tk": _2, "tl": _10, "tm": [1, { "co": _2, "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "nom": _2, "org": _2 }], "tn": [1, { "com": _2, "ens": _2, "fin": _2, "gov": _2, "ind": _2, "info": _2, "intl": _2, "mincom": _2, "nat": _2, "net": _2, "org": _2, "perso": _2, "tourism": _2, "orangecloud": _3 }], "to": [1, { "611": _3, "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "oya": _3, "x0": _3, "quickconnect": _27, "vpnplus": _3 }], "tr": [1, { "av": _2, "bbs": _2, "bel": _2, "biz": _2, "com": _2, "dr": _2, "edu": _2, "gen": _2, "gov": _2, "info": _2, "k12": _2, "kep": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "pol": _2, "tel": _2, "tsk": _2, "tv": _2, "web": _2, "nc": _10 }], "tt": [1, { "biz": _2, "co": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "mil": _2, "name": _2, "net": _2, "org": _2, "pro": _2 }], "tv": [1, { "better-than": _3, "dyndns": _3, "on-the-web": _3, "worse-than": _3, "from": _3, "sakura": _3 }], "tw": [1, { "club": _2, "com": [1, { "mymailer": _3 }], "ebiz": _2, "edu": _2, "game": _2, "gov": _2, "idv": _2, "mil": _2, "net": _2, "org": _2, "url": _3, "mydns": _3 }], "tz": [1, { "ac": _2, "co": _2, "go": _2, "hotel": _2, "info": _2, "me": _2, "mil": _2, "mobi": _2, "ne": _2, "or": _2, "sc": _2, "tv": _2 }], "ua": [1, { "com": _2, "edu": _2, "gov": _2, "in": _2, "net": _2, "org": _2, "cherkassy": _2, "cherkasy": _2, "chernigov": _2, "chernihiv": _2, "chernivtsi": _2, "chernovtsy": _2, "ck": _2, "cn": _2, "cr": _2, "crimea": _2, "cv": _2, "dn": _2, "dnepropetrovsk": _2, "dnipropetrovsk": _2, "donetsk": _2, "dp": _2, "if": _2, "ivano-frankivsk": _2, "kh": _2, "kharkiv": _2, "kharkov": _2, "kherson": _2, "khmelnitskiy": _2, "khmelnytskyi": _2, "kiev": _2, "kirovograd": _2, "km": _2, "kr": _2, "kropyvnytskyi": _2, "krym": _2, "ks": _2, "kv": _2, "kyiv": _2, "lg": _2, "lt": _2, "lugansk": _2, "luhansk": _2, "lutsk": _2, "lv": _2, "lviv": _2, "mk": _2, "mykolaiv": _2, "nikolaev": _2, "od": _2, "odesa": _2, "odessa": _2, "pl": _2, "poltava": _2, "rivne": _2, "rovno": _2, "rv": _2, "sb": _2, "sebastopol": _2, "sevastopol": _2, "sm": _2, "sumy": _2, "te": _2, "ternopil": _2, "uz": _2, "uzhgorod": _2, "uzhhorod": _2, "vinnica": _2, "vinnytsia": _2, "vn": _2, "volyn": _2, "yalta": _2, "zakarpattia": _2, "zaporizhzhe": _2, "zaporizhzhia": _2, "zhitomir": _2, "zhytomyr": _2, "zp": _2, "zt": _2, "cc": _3, "inf": _3, "ltd": _3, "cx": _3, "biz": _3, "co": _3, "pp": _3, "v": _3 }], "ug": [1, { "ac": _2, "co": _2, "com": _2, "edu": _2, "go": _2, "gov": _2, "mil": _2, "ne": _2, "or": _2, "org": _2, "sc": _2, "us": _2 }], "uk": [1, { "ac": _2, "co": [1, { "bytemark": [0, { "dh": _3, "vm": _3 }], "layershift": _48, "barsy": _3, "barsyonline": _3, "retrosnub": _57, "nh-serv": _3, "no-ip": _3, "adimo": _3, "myspreadshop": _3 }], "gov": [1, { "api": _3, "campaign": _3, "service": _3 }], "ltd": _2, "me": _2, "net": _2, "nhs": _2, "org": [1, { "glug": _3, "lug": _3, "lugs": _3, "affinitylottery": _3, "raffleentry": _3, "weeklylottery": _3 }], "plc": _2, "police": _2, "sch": _20, "conn": _3, "copro": _3, "hosp": _3, "independent-commission": _3, "independent-inquest": _3, "independent-inquiry": _3, "independent-panel": _3, "independent-review": _3, "public-inquiry": _3, "royal-commission": _3, "pymnt": _3, "barsy": _3, "nimsite": _3, "oraclegovcloudapps": _6 }], "us": [1, { "dni": _2, "isa": _2, "nsn": _2, "ak": _65, "al": _65, "ar": _65, "as": _65, "az": _65, "ca": _65, "co": _65, "ct": _65, "dc": _65, "de": _66, "fl": _65, "ga": _65, "gu": _65, "hi": _67, "ia": _65, "id": _65, "il": _65, "in": _65, "ks": _65, "ky": _65, "la": _65, "ma": [1, { "k12": [1, { "chtr": _2, "paroch": _2, "pvt": _2 }], "cc": _2, "lib": _2 }], "md": _65, "me": _65, "mi": [1, { "k12": _2, "cc": _2, "lib": _2, "ann-arbor": _2, "cog": _2, "dst": _2, "eaton": _2, "gen": _2, "mus": _2, "tec": _2, "washtenaw": _2 }], "mn": _65, "mo": _65, "ms": [1, { "k12": _2, "cc": _2 }], "mt": _65, "nc": _65, "nd": _67, "ne": _65, "nh": _65, "nj": _65, "nm": _65, "nv": _65, "ny": _65, "oh": _65, "ok": _65, "or": _65, "pa": _65, "pr": _65, "ri": _67, "sc": _65, "sd": _67, "tn": _65, "tx": _65, "ut": _65, "va": _65, "vi": _65, "vt": _65, "wa": _65, "wi": _65, "wv": _66, "wy": _65, "cloudns": _3, "is-by": _3, "land-4-sale": _3, "stuff-4-sale": _3, "heliohost": _3, "enscaled": [0, { "phx": _3 }], "mircloud": _3, "ngo": _3, "golffan": _3, "noip": _3, "pointto": _3, "freeddns": _3, "srv": [2, { "gh": _3, "gl": _3 }], "platterp": _3, "servername": _3 }], "uy": [1, { "com": _2, "edu": _2, "gub": _2, "mil": _2, "net": _2, "org": _2 }], "uz": [1, { "co": _2, "com": _2, "net": _2, "org": _2 }], "va": _2, "vc": [1, { "com": _2, "edu": _2, "gov": _2, "mil": _2, "net": _2, "org": _2, "gv": [2, { "d": _3 }], "0e": _6, "mydns": _3 }], "ve": [1, { "arts": _2, "bib": _2, "co": _2, "com": _2, "e12": _2, "edu": _2, "emprende": _2, "firm": _2, "gob": _2, "gov": _2, "info": _2, "int": _2, "mil": _2, "net": _2, "nom": _2, "org": _2, "rar": _2, "rec": _2, "store": _2, "tec": _2, "web": _2 }], "vg": [1, { "edu": _2 }], "vi": [1, { "co": _2, "com": _2, "k12": _2, "net": _2, "org": _2 }], "vn": [1, { "ac": _2, "ai": _2, "biz": _2, "com": _2, "edu": _2, "gov": _2, "health": _2, "id": _2, "info": _2, "int": _2, "io": _2, "name": _2, "net": _2, "org": _2, "pro": _2, "angiang": _2, "bacgiang": _2, "backan": _2, "baclieu": _2, "bacninh": _2, "baria-vungtau": _2, "bentre": _2, "binhdinh": _2, "binhduong": _2, "binhphuoc": _2, "binhthuan": _2, "camau": _2, "cantho": _2, "caobang": _2, "daklak": _2, "daknong": _2, "danang": _2, "dienbien": _2, "dongnai": _2, "dongthap": _2, "gialai": _2, "hagiang": _2, "haiduong": _2, "haiphong": _2, "hanam": _2, "hanoi": _2, "hatinh": _2, "haugiang": _2, "hoabinh": _2, "hungyen": _2, "khanhhoa": _2, "kiengiang": _2, "kontum": _2, "laichau": _2, "lamdong": _2, "langson": _2, "laocai": _2, "longan": _2, "namdinh": _2, "nghean": _2, "ninhbinh": _2, "ninhthuan": _2, "phutho": _2, "phuyen": _2, "quangbinh": _2, "quangnam": _2, "quangngai": _2, "quangninh": _2, "quangtri": _2, "soctrang": _2, "sonla": _2, "tayninh": _2, "thaibinh": _2, "thainguyen": _2, "thanhhoa": _2, "thanhphohochiminh": _2, "thuathienhue": _2, "tiengiang": _2, "travinh": _2, "tuyenquang": _2, "vinhlong": _2, "vinhphuc": _2, "yenbai": _2 }], "vu": _47, "wf": [1, { "biz": _3, "sch": _3 }], "ws": [1, { "com": _2, "edu": _2, "gov": _2, "net": _2, "org": _2, "advisor": _6, "cloud66": _3, "dyndns": _3, "mypets": _3 }], "yt": [1, { "org": _3 }], "xn--mgbaam7a8h": _2, "امارات": _2, "xn--y9a3aq": _2, "հայ": _2, "xn--54b7fta0cc": _2, "বাংলা": _2, "xn--90ae": _2, "бг": _2, "xn--mgbcpq6gpa1a": _2, "البحرين": _2, "xn--90ais": _2, "бел": _2, "xn--fiqs8s": _2, "中国": _2, "xn--fiqz9s": _2, "中國": _2, "xn--lgbbat1ad8j": _2, "الجزائر": _2, "xn--wgbh1c": _2, "مصر": _2, "xn--e1a4c": _2, "ею": _2, "xn--qxa6a": _2, "ευ": _2, "xn--mgbah1a3hjkrd": _2, "موريتانيا": _2, "xn--node": _2, "გე": _2, "xn--qxam": _2, "ελ": _2, "xn--j6w193g": [1, { "xn--gmqw5a": _2, "xn--55qx5d": _2, "xn--mxtq1m": _2, "xn--wcvs22d": _2, "xn--uc0atv": _2, "xn--od0alg": _2 }], "香港": [1, { "個人": _2, "公司": _2, "政府": _2, "教育": _2, "組織": _2, "網絡": _2 }], "xn--2scrj9c": _2, "ಭಾರತ": _2, "xn--3hcrj9c": _2, "ଭାରତ": _2, "xn--45br5cyl": _2, "ভাৰত": _2, "xn--h2breg3eve": _2, "भारतम्": _2, "xn--h2brj9c8c": _2, "भारोत": _2, "xn--mgbgu82a": _2, "ڀارت": _2, "xn--rvc1e0am3e": _2, "ഭാരതം": _2, "xn--h2brj9c": _2, "भारत": _2, "xn--mgbbh1a": _2, "بارت": _2, "xn--mgbbh1a71e": _2, "بھارت": _2, "xn--fpcrj9c3d": _2, "భారత్": _2, "xn--gecrj9c": _2, "ભારત": _2, "xn--s9brj9c": _2, "ਭਾਰਤ": _2, "xn--45brj9c": _2, "ভারত": _2, "xn--xkc2dl3a5ee0h": _2, "இந்தியா": _2, "xn--mgba3a4f16a": _2, "ایران": _2, "xn--mgba3a4fra": _2, "ايران": _2, "xn--mgbtx2b": _2, "عراق": _2, "xn--mgbayh7gpa": _2, "الاردن": _2, "xn--3e0b707e": _2, "한국": _2, "xn--80ao21a": _2, "қаз": _2, "xn--q7ce6a": _2, "ລາວ": _2, "xn--fzc2c9e2c": _2, "ලංකා": _2, "xn--xkc2al3hye2a": _2, "இலங்கை": _2, "xn--mgbc0a9azcg": _2, "المغرب": _2, "xn--d1alf": _2, "мкд": _2, "xn--l1acc": _2, "мон": _2, "xn--mix891f": _2, "澳門": _2, "xn--mix082f": _2, "澳门": _2, "xn--mgbx4cd0ab": _2, "مليسيا": _2, "xn--mgb9awbf": _2, "عمان": _2, "xn--mgbai9azgqp6j": _2, "پاکستان": _2, "xn--mgbai9a5eva00b": _2, "پاكستان": _2, "xn--ygbi2ammx": _2, "فلسطين": _2, "xn--90a3ac": [1, { "xn--80au": _2, "xn--90azh": _2, "xn--d1at": _2, "xn--c1avg": _2, "xn--o1ac": _2, "xn--o1ach": _2 }], "срб": [1, { "ак": _2, "обр": _2, "од": _2, "орг": _2, "пр": _2, "упр": _2 }], "xn--p1ai": _2, "рф": _2, "xn--wgbl6a": _2, "قطر": _2, "xn--mgberp4a5d4ar": _2, "السعودية": _2, "xn--mgberp4a5d4a87g": _2, "السعودیة": _2, "xn--mgbqly7c0a67fbc": _2, "السعودیۃ": _2, "xn--mgbqly7cvafr": _2, "السعوديه": _2, "xn--mgbpl2fh": _2, "سودان": _2, "xn--yfro4i67o": _2, "新加坡": _2, "xn--clchc0ea0b2g2a9gcd": _2, "சிங்கப்பூர்": _2, "xn--ogbpf8fl": _2, "سورية": _2, "xn--mgbtf8fl": _2, "سوريا": _2, "xn--o3cw4h": [1, { "xn--o3cyx2a": _2, "xn--12co0c3b4eva": _2, "xn--m3ch0j3a": _2, "xn--h3cuzk1di": _2, "xn--12c1fe0br": _2, "xn--12cfi8ixb8l": _2 }], "ไทย": [1, { "ทหาร": _2, "ธุรกิจ": _2, "เน็ต": _2, "รัฐบาล": _2, "ศึกษา": _2, "องค์กร": _2 }], "xn--pgbs0dh": _2, "تونس": _2, "xn--kpry57d": _2, "台灣": _2, "xn--kprw13d": _2, "台湾": _2, "xn--nnx388a": _2, "臺灣": _2, "xn--j1amh": _2, "укр": _2, "xn--mgb2ddes": _2, "اليمن": _2, "xxx": _2, "ye": _5, "za": [0, { "ac": _2, "agric": _2, "alt": _2, "co": _2, "edu": _2, "gov": _2, "grondar": _2, "law": _2, "mil": _2, "net": _2, "ngo": _2, "nic": _2, "nis": _2, "nom": _2, "org": _2, "school": _2, "tm": _2, "web": _2 }], "zm": [1, { "ac": _2, "biz": _2, "co": _2, "com": _2, "edu": _2, "gov": _2, "info": _2, "mil": _2, "net": _2, "org": _2, "sch": _2 }], "zw": [1, { "ac": _2, "co": _2, "gov": _2, "mil": _2, "org": _2 }], "aaa": _2, "aarp": _2, "abb": _2, "abbott": _2, "abbvie": _2, "abc": _2, "able": _2, "abogado": _2, "abudhabi": _2, "academy": [1, { "official": _3 }], "accenture": _2, "accountant": _2, "accountants": _2, "aco": _2, "actor": _2, "ads": _2, "adult": _2, "aeg": _2, "aetna": _2, "afl": _2, "africa": _2, "agakhan": _2, "agency": _2, "aig": _2, "airbus": _2, "airforce": _2, "airtel": _2, "akdn": _2, "alibaba": _2, "alipay": _2, "allfinanz": _2, "allstate": _2, "ally": _2, "alsace": _2, "alstom": _2, "amazon": _2, "americanexpress": _2, "americanfamily": _2, "amex": _2, "amfam": _2, "amica": _2, "amsterdam": _2, "analytics": _2, "android": _2, "anquan": _2, "anz": _2, "aol": _2, "apartments": _2, "app": [1, { "adaptable": _3, "aiven": _3, "beget": _6, "brave": _7, "clerk": _3, "clerkstage": _3, "wnext": _3, "csb": [2, { "preview": _3 }], "convex": _3, "deta": _3, "ondigitalocean": _3, "easypanel": _3, "encr": [2, { "frontend": _3 }], "evervault": _8, "expo": [2, { "staging": _3 }], "edgecompute": _3, "on-fleek": _3, "flutterflow": _3, "e2b": _3, "framer": _3, "github": _3, "hosted": _6, "run": [0, { "*": _3, "mtls": _6 }], "web": _3, "hackclub": _3, "hasura": _3, "botdash": _3, "loginline": _3, "lovable": _3, "luyani": _3, "medusajs": _3, "messerli": _3, "netfy": _3, "netlify": _3, "ngrok": _3, "ngrok-free": _3, "developer": _6, "noop": _3, "northflank": _6, "upsun": _6, "railway": [0, { "up": _3 }], "replit": _9, "nyat": _3, "snowflake": [0, { "*": _3, "privatelink": _6 }], "streamlit": _3, "storipress": _3, "telebit": _3, "typedream": _3, "vercel": _3, "wal": _3, "bookonline": _3, "wdh": _3, "windsurf": _3, "zeabur": _3, "zerops": _6 }], "apple": _2, "aquarelle": _2, "arab": _2, "aramco": _2, "archi": _2, "army": _2, "art": _2, "arte": _2, "asda": _2, "associates": _2, "athleta": _2, "attorney": _2, "auction": _2, "audi": _2, "audible": _2, "audio": _2, "auspost": _2, "author": _2, "auto": _2, "autos": _2, "aws": [1, { "on": [0, { "af-south-1": _12, "ap-east-1": _12, "ap-northeast-1": _12, "ap-northeast-2": _12, "ap-northeast-3": _12, "ap-south-1": _12, "ap-south-2": _12, "ap-southeast-1": _12, "ap-southeast-2": _12, "ap-southeast-3": _12, "ap-southeast-4": _12, "ap-southeast-5": _12, "ca-central-1": _12, "ca-west-1": _12, "eu-central-1": _12, "eu-central-2": _12, "eu-north-1": _12, "eu-south-1": _12, "eu-south-2": _12, "eu-west-1": _12, "eu-west-2": _12, "eu-west-3": _12, "il-central-1": _12, "me-central-1": _12, "me-south-1": _12, "sa-east-1": _12, "us-east-1": _12, "us-east-2": _12, "us-west-1": _12, "us-west-2": _12, "us-gov-east-1": _13, "us-gov-west-1": _13 }], "sagemaker": [0, { "ap-northeast-1": _15, "ap-northeast-2": _15, "ap-south-1": _15, "ap-southeast-1": _15, "ap-southeast-2": _15, "ca-central-1": _17, "eu-central-1": _15, "eu-west-1": _15, "eu-west-2": _15, "us-east-1": _17, "us-east-2": _17, "us-west-2": _17, "af-south-1": _14, "ap-east-1": _14, "ap-northeast-3": _14, "ap-south-2": _16, "ap-southeast-3": _14, "ap-southeast-4": _16, "ca-west-1": [0, { "notebook": _3, "notebook-fips": _3 }], "eu-central-2": _14, "eu-north-1": _14, "eu-south-1": _14, "eu-south-2": _14, "eu-west-3": _14, "il-central-1": _14, "me-central-1": _14, "me-south-1": _14, "sa-east-1": _14, "us-gov-east-1": _18, "us-gov-west-1": _18, "us-west-1": [0, { "notebook": _3, "notebook-fips": _3, "studio": _3 }], "experiments": _6 }], "repost": [0, { "private": _6 }] }], "axa": _2, "azure": _2, "baby": _2, "baidu": _2, "banamex": _2, "band": _2, "bank": _2, "bar": _2, "barcelona": _2, "barclaycard": _2, "barclays": _2, "barefoot": _2, "bargains": _2, "baseball": _2, "basketball": [1, { "aus": _3, "nz": _3 }], "bauhaus": _2, "bayern": _2, "bbc": _2, "bbt": _2, "bbva": _2, "bcg": _2, "bcn": _2, "beats": _2, "beauty": _2, "beer": _2, "berlin": _2, "best": _2, "bestbuy": _2, "bet": _2, "bharti": _2, "bible": _2, "bid": _2, "bike": _2, "bing": _2, "bingo": _2, "bio": _2, "black": _2, "blackfriday": _2, "blockbuster": _2, "blog": _2, "bloomberg": _2, "blue": _2, "bms": _2, "bmw": _2, "bnpparibas": _2, "boats": _2, "boehringer": _2, "bofa": _2, "bom": _2, "bond": _2, "boo": _2, "book": _2, "booking": _2, "bosch": _2, "bostik": _2, "boston": _2, "bot": _2, "boutique": _2, "box": _2, "bradesco": _2, "bridgestone": _2, "broadway": _2, "broker": _2, "brother": _2, "brussels": _2, "build": [1, { "v0": _3, "windsurf": _3 }], "builders": [1, { "cloudsite": _3 }], "business": _21, "buy": _2, "buzz": _2, "bzh": _2, "cab": _2, "cafe": _2, "cal": _2, "call": _2, "calvinklein": _2, "cam": _2, "camera": _2, "camp": [1, { "emf": [0, { "at": _3 }] }], "canon": _2, "capetown": _2, "capital": _2, "capitalone": _2, "car": _2, "caravan": _2, "cards": _2, "care": _2, "career": _2, "careers": _2, "cars": _2, "casa": [1, { "nabu": [0, { "ui": _3 }] }], "case": _2, "cash": _2, "casino": _2, "catering": _2, "catholic": _2, "cba": _2, "cbn": _2, "cbre": _2, "center": _2, "ceo": _2, "cern": _2, "cfa": _2, "cfd": _2, "chanel": _2, "channel": _2, "charity": _2, "chase": _2, "chat": _2, "cheap": _2, "chintai": _2, "christmas": _2, "chrome": _2, "church": _2, "cipriani": _2, "circle": _2, "cisco": _2, "citadel": _2, "citi": _2, "citic": _2, "city": _2, "claims": _2, "cleaning": _2, "click": _2, "clinic": _2, "clinique": _2, "clothing": _2, "cloud": [1, { "convex": _3, "elementor": _3, "encoway": [0, { "eu": _3 }], "statics": _6, "ravendb": _3, "axarnet": [0, { "es-1": _3 }], "diadem": _3, "jelastic": [0, { "vip": _3 }], "jele": _3, "jenv-aruba": [0, { "aruba": [0, { "eur": [0, { "it1": _3 }] }], "it1": _3 }], "keliweb": [2, { "cs": _3 }], "oxa": [2, { "tn": _3, "uk": _3 }], "primetel": [2, { "uk": _3 }], "reclaim": [0, { "ca": _3, "uk": _3, "us": _3 }], "trendhosting": [0, { "ch": _3, "de": _3 }], "jote": _3, "jotelulu": _3, "kuleuven": _3, "laravel": _3, "linkyard": _3, "magentosite": _6, "matlab": _3, "observablehq": _3, "perspecta": _3, "vapor": _3, "on-rancher": _6, "scw": [0, { "baremetal": [0, { "fr-par-1": _3, "fr-par-2": _3, "nl-ams-1": _3 }], "fr-par": [0, { "cockpit": _3, "ddl": _3, "dtwh": _3, "fnc": [2, { "functions": _3 }], "ifr": _3, "k8s": _23, "kafk": _3, "mgdb": _3, "rdb": _3, "s3": _3, "s3-website": _3, "scbl": _3, "whm": _3 }], "instances": [0, { "priv": _3, "pub": _3 }], "k8s": _3, "nl-ams": [0, { "cockpit": _3, "ddl": _3, "dtwh": _3, "ifr": _3, "k8s": _23, "kafk": _3, "mgdb": _3, "rdb": _3, "s3": _3, "s3-website": _3, "scbl": _3, "whm": _3 }], "pl-waw": [0, { "cockpit": _3, "ddl": _3, "dtwh": _3, "ifr": _3, "k8s": _23, "kafk": _3, "mgdb": _3, "rdb": _3, "s3": _3, "s3-website": _3, "scbl": _3 }], "scalebook": _3, "smartlabeling": _3 }], "servebolt": _3, "onstackit": [0, { "runs": _3 }], "trafficplex": _3, "unison-services": _3, "urown": _3, "voorloper": _3, "zap": _3 }], "club": [1, { "cloudns": _3, "jele": _3, "barsy": _3 }], "clubmed": _2, "coach": _2, "codes": [1, { "owo": _6 }], "coffee": _2, "college": _2, "cologne": _2, "commbank": _2, "community": [1, { "nog": _3, "ravendb": _3, "myforum": _3 }], "company": _2, "compare": _2, "computer": _2, "comsec": _2, "condos": _2, "construction": _2, "consulting": _2, "contact": _2, "contractors": _2, "cooking": _2, "cool": [1, { "elementor": _3, "de": _3 }], "corsica": _2, "country": _2, "coupon": _2, "coupons": _2, "courses": _2, "cpa": _2, "credit": _2, "creditcard": _2, "creditunion": _2, "cricket": _2, "crown": _2, "crs": _2, "cruise": _2, "cruises": _2, "cuisinella": _2, "cymru": _2, "cyou": _2, "dad": _2, "dance": _2, "data": _2, "date": _2, "dating": _2, "datsun": _2, "day": _2, "dclk": _2, "dds": _2, "deal": _2, "dealer": _2, "deals": _2, "degree": _2, "delivery": _2, "dell": _2, "deloitte": _2, "delta": _2, "democrat": _2, "dental": _2, "dentist": _2, "desi": _2, "design": [1, { "graphic": _3, "bss": _3 }], "dev": [1, { "12chars": _3, "myaddr": _3, "panel": _3, "lcl": _6, "lclstage": _6, "stg": _6, "stgstage": _6, "pages": _3, "r2": _3, "workers": _3, "deno": _3, "deno-staging": _3, "deta": _3, "lp": [2, { "api": _3, "objects": _3 }], "evervault": _8, "fly": _3, "githubpreview": _3, "gateway": _6, "botdash": _3, "inbrowser": _6, "is-a-good": _3, "is-a": _3, "iserv": _3, "runcontainers": _3, "localcert": [0, { "user": _6 }], "loginline": _3, "barsy": _3, "mediatech": _3, "modx": _3, "ngrok": _3, "ngrok-free": _3, "is-a-fullstack": _3, "is-cool": _3, "is-not-a": _3, "localplayer": _3, "xmit": _3, "platter-app": _3, "replit": [2, { "archer": _3, "bones": _3, "canary": _3, "global": _3, "hacker": _3, "id": _3, "janeway": _3, "kim": _3, "kira": _3, "kirk": _3, "odo": _3, "paris": _3, "picard": _3, "pike": _3, "prerelease": _3, "reed": _3, "riker": _3, "sisko": _3, "spock": _3, "staging": _3, "sulu": _3, "tarpit": _3, "teams": _3, "tucker": _3, "wesley": _3, "worf": _3 }], "crm": [0, { "d": _6, "w": _6, "wa": _6, "wb": _6, "wc": _6, "wd": _6, "we": _6, "wf": _6 }], "erp": _50, "vercel": _3, "webhare": _6, "hrsn": _3 }], "dhl": _2, "diamonds": _2, "diet": _2, "digital": [1, { "cloudapps": [2, { "london": _3 }] }], "direct": [1, { "libp2p": _3 }], "directory": _2, "discount": _2, "discover": _2, "dish": _2, "diy": _2, "dnp": _2, "docs": _2, "doctor": _2, "dog": _2, "domains": _2, "dot": _2, "download": _2, "drive": _2, "dtv": _2, "dubai": _2, "dunlop": _2, "dupont": _2, "durban": _2, "dvag": _2, "dvr": _2, "earth": _2, "eat": _2, "eco": _2, "edeka": _2, "education": _21, "email": [1, { "crisp": [0, { "on": _3 }], "tawk": _52, "tawkto": _52 }], "emerck": _2, "energy": _2, "engineer": _2, "engineering": _2, "enterprises": _2, "epson": _2, "equipment": _2, "ericsson": _2, "erni": _2, "esq": _2, "estate": [1, { "compute": _6 }], "eurovision": _2, "eus": [1, { "party": _53 }], "events": [1, { "koobin": _3, "co": _3 }], "exchange": _2, "expert": _2, "exposed": _2, "express": _2, "extraspace": _2, "fage": _2, "fail": _2, "fairwinds": _2, "faith": _2, "family": _2, "fan": _2, "fans": _2, "farm": [1, { "storj": _3 }], "farmers": _2, "fashion": _2, "fast": _2, "fedex": _2, "feedback": _2, "ferrari": _2, "ferrero": _2, "fidelity": _2, "fido": _2, "film": _2, "final": _2, "finance": _2, "financial": _21, "fire": _2, "firestone": _2, "firmdale": _2, "fish": _2, "fishing": _2, "fit": _2, "fitness": _2, "flickr": _2, "flights": _2, "flir": _2, "florist": _2, "flowers": _2, "fly": _2, "foo": _2, "food": _2, "football": _2, "ford": _2, "forex": _2, "forsale": _2, "forum": _2, "foundation": _2, "fox": _2, "free": _2, "fresenius": _2, "frl": _2, "frogans": _2, "frontier": _2, "ftr": _2, "fujitsu": _2, "fun": _2, "fund": _2, "furniture": _2, "futbol": _2, "fyi": _2, "gal": _2, "gallery": _2, "gallo": _2, "gallup": _2, "game": _2, "games": [1, { "pley": _3, "sheezy": _3 }], "gap": _2, "garden": _2, "gay": [1, { "pages": _3 }], "gbiz": _2, "gdn": [1, { "cnpy": _3 }], "gea": _2, "gent": _2, "genting": _2, "george": _2, "ggee": _2, "gift": _2, "gifts": _2, "gives": _2, "giving": _2, "glass": _2, "gle": _2, "global": [1, { "appwrite": _3 }], "globo": _2, "gmail": _2, "gmbh": _2, "gmo": _2, "gmx": _2, "godaddy": _2, "gold": _2, "goldpoint": _2, "golf": _2, "goo": _2, "goodyear": _2, "goog": [1, { "cloud": _3, "translate": _3, "usercontent": _6 }], "google": _2, "gop": _2, "got": _2, "grainger": _2, "graphics": _2, "gratis": _2, "green": _2, "gripe": _2, "grocery": _2, "group": [1, { "discourse": _3 }], "gucci": _2, "guge": _2, "guide": _2, "guitars": _2, "guru": _2, "hair": _2, "hamburg": _2, "hangout": _2, "haus": _2, "hbo": _2, "hdfc": _2, "hdfcbank": _2, "health": [1, { "hra": _3 }], "healthcare": _2, "help": _2, "helsinki": _2, "here": _2, "hermes": _2, "hiphop": _2, "hisamitsu": _2, "hitachi": _2, "hiv": _2, "hkt": _2, "hockey": _2, "holdings": _2, "holiday": _2, "homedepot": _2, "homegoods": _2, "homes": _2, "homesense": _2, "honda": _2, "horse": _2, "hospital": _2, "host": [1, { "cloudaccess": _3, "freesite": _3, "easypanel": _3, "fastvps": _3, "myfast": _3, "tempurl": _3, "wpmudev": _3, "iserv": _3, "jele": _3, "mircloud": _3, "wp2": _3, "half": _3 }], "hosting": [1, { "opencraft": _3 }], "hot": _2, "hotel": _2, "hotels": _2, "hotmail": _2, "house": _2, "how": _2, "hsbc": _2, "hughes": _2, "hyatt": _2, "hyundai": _2, "ibm": _2, "icbc": _2, "ice": _2, "icu": _2, "ieee": _2, "ifm": _2, "ikano": _2, "imamat": _2, "imdb": _2, "immo": _2, "immobilien": _2, "inc": _2, "industries": _2, "infiniti": _2, "ing": _2, "ink": _2, "institute": _2, "insurance": _2, "insure": _2, "international": _2, "intuit": _2, "investments": _2, "ipiranga": _2, "irish": _2, "ismaili": _2, "ist": _2, "istanbul": _2, "itau": _2, "itv": _2, "jaguar": _2, "java": _2, "jcb": _2, "jeep": _2, "jetzt": _2, "jewelry": _2, "jio": _2, "jll": _2, "jmp": _2, "jnj": _2, "joburg": _2, "jot": _2, "joy": _2, "jpmorgan": _2, "jprs": _2, "juegos": _2, "juniper": _2, "kaufen": _2, "kddi": _2, "kerryhotels": _2, "kerryproperties": _2, "kfh": _2, "kia": _2, "kids": _2, "kim": _2, "kindle": _2, "kitchen": _2, "kiwi": _2, "koeln": _2, "komatsu": _2, "kosher": _2, "kpmg": _2, "kpn": _2, "krd": [1, { "co": _3, "edu": _3 }], "kred": _2, "kuokgroup": _2, "kyoto": _2, "lacaixa": _2, "lamborghini": _2, "lamer": _2, "land": _2, "landrover": _2, "lanxess": _2, "lasalle": _2, "lat": _2, "latino": _2, "latrobe": _2, "law": _2, "lawyer": _2, "lds": _2, "lease": _2, "leclerc": _2, "lefrak": _2, "legal": _2, "lego": _2, "lexus": _2, "lgbt": _2, "lidl": _2, "life": _2, "lifeinsurance": _2, "lifestyle": _2, "lighting": _2, "like": _2, "lilly": _2, "limited": _2, "limo": _2, "lincoln": _2, "link": [1, { "myfritz": _3, "cyon": _3, "dweb": _6, "inbrowser": _6, "nftstorage": _60, "mypep": _3, "storacha": _60, "w3s": _60 }], "live": [1, { "aem": _3, "hlx": _3, "ewp": _6 }], "living": _2, "llc": _2, "llp": _2, "loan": _2, "loans": _2, "locker": _2, "locus": _2, "lol": [1, { "omg": _3 }], "london": _2, "lotte": _2, "lotto": _2, "love": _2, "lpl": _2, "lplfinancial": _2, "ltd": _2, "ltda": _2, "lundbeck": _2, "luxe": _2, "luxury": _2, "madrid": _2, "maif": _2, "maison": _2, "makeup": _2, "man": _2, "management": _2, "mango": _2, "map": _2, "market": _2, "marketing": _2, "markets": _2, "marriott": _2, "marshalls": _2, "mattel": _2, "mba": _2, "mckinsey": _2, "med": _2, "media": _61, "meet": _2, "melbourne": _2, "meme": _2, "memorial": _2, "men": _2, "menu": [1, { "barsy": _3, "barsyonline": _3 }], "merck": _2, "merckmsd": _2, "miami": _2, "microsoft": _2, "mini": _2, "mint": _2, "mit": _2, "mitsubishi": _2, "mlb": _2, "mls": _2, "mma": _2, "mobile": _2, "moda": _2, "moe": _2, "moi": _2, "mom": _2, "monash": _2, "money": _2, "monster": _2, "mormon": _2, "mortgage": _2, "moscow": _2, "moto": _2, "motorcycles": _2, "mov": _2, "movie": _2, "msd": _2, "mtn": _2, "mtr": _2, "music": _2, "nab": _2, "nagoya": _2, "navy": _2, "nba": _2, "nec": _2, "netbank": _2, "netflix": _2, "network": [1, { "aem": _3, "alces": _6, "co": _3, "arvo": _3, "azimuth": _3, "tlon": _3 }], "neustar": _2, "new": _2, "news": [1, { "noticeable": _3 }], "next": _2, "nextdirect": _2, "nexus": _2, "nfl": _2, "ngo": _2, "nhk": _2, "nico": _2, "nike": _2, "nikon": _2, "ninja": _2, "nissan": _2, "nissay": _2, "nokia": _2, "norton": _2, "now": _2, "nowruz": _2, "nowtv": _2, "nra": _2, "nrw": _2, "ntt": _2, "nyc": _2, "obi": _2, "observer": _2, "office": _2, "okinawa": _2, "olayan": _2, "olayangroup": _2, "ollo": _2, "omega": _2, "one": [1, { "kin": _6, "service": _3 }], "ong": [1, { "obl": _3 }], "onl": _2, "online": [1, { "eero": _3, "eero-stage": _3, "websitebuilder": _3, "barsy": _3 }], "ooo": _2, "open": _2, "oracle": _2, "orange": [1, { "tech": _3 }], "organic": _2, "origins": _2, "osaka": _2, "otsuka": _2, "ott": _2, "ovh": [1, { "nerdpol": _3 }], "page": [1, { "aem": _3, "hlx": _3, "translated": _3, "codeberg": _3, "heyflow": _3, "prvcy": _3, "rocky": _3, "pdns": _3, "plesk": _3 }], "panasonic": _2, "paris": _2, "pars": _2, "partners": _2, "parts": _2, "party": _2, "pay": _2, "pccw": _2, "pet": _2, "pfizer": _2, "pharmacy": _2, "phd": _2, "philips": _2, "phone": _2, "photo": _2, "photography": _2, "photos": _61, "physio": _2, "pics": _2, "pictet": _2, "pictures": [1, { "1337": _3 }], "pid": _2, "pin": _2, "ping": _2, "pink": _2, "pioneer": _2, "pizza": [1, { "ngrok": _3 }], "place": _21, "play": _2, "playstation": _2, "plumbing": _2, "plus": _2, "pnc": _2, "pohl": _2, "poker": _2, "politie": _2, "porn": _2, "praxi": _2, "press": _2, "prime": _2, "prod": _2, "productions": _2, "prof": _2, "progressive": _2, "promo": _2, "properties": _2, "property": _2, "protection": _2, "pru": _2, "prudential": _2, "pub": [1, { "id": _6, "kin": _6, "barsy": _3 }], "pwc": _2, "qpon": _2, "quebec": _2, "quest": _2, "racing": _2, "radio": _2, "read": _2, "realestate": _2, "realtor": _2, "realty": _2, "recipes": _2, "red": _2, "redumbrella": _2, "rehab": _2, "reise": _2, "reisen": _2, "reit": _2, "reliance": _2, "ren": _2, "rent": _2, "rentals": _2, "repair": _2, "report": _2, "republican": _2, "rest": _2, "restaurant": _2, "review": _2, "reviews": [1, { "aem": _3 }], "rexroth": _2, "rich": _2, "richardli": _2, "ricoh": _2, "ril": _2, "rio": _2, "rip": [1, { "clan": _3 }], "rocks": [1, { "myddns": _3, "stackit": _3, "lima-city": _3, "webspace": _3 }], "rodeo": _2, "rogers": _2, "room": _2, "rsvp": _2, "rugby": _2, "ruhr": _2, "run": [1, { "appwrite": _6, "development": _3, "ravendb": _3, "liara": [2, { "iran": _3 }], "lovable": _3, "build": _6, "code": _6, "database": _6, "migration": _6, "onporter": _3, "repl": _3, "stackit": _3, "val": _50, "vercel": _3, "wix": _3 }], "rwe": _2, "ryukyu": _2, "saarland": _2, "safe": _2, "safety": _2, "sakura": _2, "sale": _2, "salon": _2, "samsclub": _2, "samsung": _2, "sandvik": _2, "sandvikcoromant": _2, "sanofi": _2, "sap": _2, "sarl": _2, "sas": _2, "save": _2, "saxo": _2, "sbi": _2, "sbs": _2, "scb": _2, "schaeffler": _2, "schmidt": _2, "scholarships": _2, "school": _2, "schule": _2, "schwarz": _2, "science": _2, "scot": [1, { "gov": [2, { "service": _3 }] }], "search": _2, "seat": _2, "secure": _2, "security": _2, "seek": _2, "select": _2, "sener": _2, "services": [1, { "loginline": _3 }], "seven": _2, "sew": _2, "sex": _2, "sexy": _2, "sfr": _2, "shangrila": _2, "sharp": _2, "shell": _2, "shia": _2, "shiksha": _2, "shoes": _2, "shop": [1, { "base": _3, "hoplix": _3, "barsy": _3, "barsyonline": _3, "shopware": _3 }], "shopping": _2, "shouji": _2, "show": _2, "silk": _2, "sina": _2, "singles": _2, "site": [1, { "square": _3, "canva": _24, "cloudera": _6, "convex": _3, "cyon": _3, "caffeine": _3, "fastvps": _3, "figma": _3, "preview": _3, "heyflow": _3, "jele": _3, "jouwweb": _3, "loginline": _3, "barsy": _3, "notion": _3, "omniwe": _3, "opensocial": _3, "madethis": _3, "support": _3, "platformsh": _6, "tst": _6, "byen": _3, "srht": _3, "novecore": _3, "cpanel": _3, "wpsquared": _3, "sourcecraft": _3 }], "ski": _2, "skin": _2, "sky": _2, "skype": _2, "sling": _2, "smart": _2, "smile": _2, "sncf": _2, "soccer": _2, "social": _2, "softbank": _2, "software": _2, "sohu": _2, "solar": _2, "solutions": _2, "song": _2, "sony": _2, "soy": _2, "spa": _2, "space": [1, { "myfast": _3, "heiyu": _3, "hf": [2, { "static": _3 }], "app-ionos": _3, "project": _3, "uber": _3, "xs4all": _3 }], "sport": _2, "spot": _2, "srl": _2, "stada": _2, "staples": _2, "star": _2, "statebank": _2, "statefarm": _2, "stc": _2, "stcgroup": _2, "stockholm": _2, "storage": _2, "store": [1, { "barsy": _3, "sellfy": _3, "shopware": _3, "storebase": _3 }], "stream": _2, "studio": _2, "study": _2, "style": _2, "sucks": _2, "supplies": _2, "supply": _2, "support": [1, { "barsy": _3 }], "surf": _2, "surgery": _2, "suzuki": _2, "swatch": _2, "swiss": _2, "sydney": _2, "systems": [1, { "knightpoint": _3 }], "tab": _2, "taipei": _2, "talk": _2, "taobao": _2, "target": _2, "tatamotors": _2, "tatar": _2, "tattoo": _2, "tax": _2, "taxi": _2, "tci": _2, "tdk": _2, "team": [1, { "discourse": _3, "jelastic": _3 }], "tech": [1, { "cleverapps": _3 }], "technology": _21, "temasek": _2, "tennis": _2, "teva": _2, "thd": _2, "theater": _2, "theatre": _2, "tiaa": _2, "tickets": _2, "tienda": _2, "tips": _2, "tires": _2, "tirol": _2, "tjmaxx": _2, "tjx": _2, "tkmaxx": _2, "tmall": _2, "today": [1, { "prequalifyme": _3 }], "tokyo": _2, "tools": [1, { "addr": _49, "myaddr": _3 }], "top": [1, { "ntdll": _3, "wadl": _6 }], "toray": _2, "toshiba": _2, "total": _2, "tours": _2, "town": _2, "toyota": _2, "toys": _2, "trade": _2, "trading": _2, "training": _2, "travel": _2, "travelers": _2, "travelersinsurance": _2, "trust": _2, "trv": _2, "tube": _2, "tui": _2, "tunes": _2, "tushu": _2, "tvs": _2, "ubank": _2, "ubs": _2, "unicom": _2, "university": _2, "uno": _2, "uol": _2, "ups": _2, "vacations": _2, "vana": _2, "vanguard": _2, "vegas": _2, "ventures": _2, "verisign": _2, "versicherung": _2, "vet": _2, "viajes": _2, "video": _2, "vig": _2, "viking": _2, "villas": _2, "vin": _2, "vip": [1, { "hidns": _3 }], "virgin": _2, "visa": _2, "vision": _2, "viva": _2, "vivo": _2, "vlaanderen": _2, "vodka": _2, "volvo": _2, "vote": _2, "voting": _2, "voto": _2, "voyage": _2, "wales": _2, "walmart": _2, "walter": _2, "wang": _2, "wanggou": _2, "watch": _2, "watches": _2, "weather": _2, "weatherchannel": _2, "webcam": _2, "weber": _2, "website": _61, "wed": _2, "wedding": _2, "weibo": _2, "weir": _2, "whoswho": _2, "wien": _2, "wiki": _61, "williamhill": _2, "win": _2, "windows": _2, "wine": _2, "winners": _2, "wme": _2, "wolterskluwer": _2, "woodside": _2, "work": _2, "works": _2, "world": _2, "wow": _2, "wtc": _2, "wtf": _2, "xbox": _2, "xerox": _2, "xihuan": _2, "xin": _2, "xn--11b4c3d": _2, "कॉम": _2, "xn--1ck2e1b": _2, "セール": _2, "xn--1qqw23a": _2, "佛山": _2, "xn--30rr7y": _2, "慈善": _2, "xn--3bst00m": _2, "集团": _2, "xn--3ds443g": _2, "在线": _2, "xn--3pxu8k": _2, "点看": _2, "xn--42c2d9a": _2, "คอม": _2, "xn--45q11c": _2, "八卦": _2, "xn--4gbrim": _2, "موقع": _2, "xn--55qw42g": _2, "公益": _2, "xn--55qx5d": _2, "公司": _2, "xn--5su34j936bgsg": _2, "香格里拉": _2, "xn--5tzm5g": _2, "网站": _2, "xn--6frz82g": _2, "移动": _2, "xn--6qq986b3xl": _2, "我爱你": _2, "xn--80adxhks": _2, "москва": _2, "xn--80aqecdr1a": _2, "католик": _2, "xn--80asehdb": _2, "онлайн": _2, "xn--80aswg": _2, "сайт": _2, "xn--8y0a063a": _2, "联通": _2, "xn--9dbq2a": _2, "קום": _2, "xn--9et52u": _2, "时尚": _2, "xn--9krt00a": _2, "微博": _2, "xn--b4w605ferd": _2, "淡马锡": _2, "xn--bck1b9a5dre4c": _2, "ファッション": _2, "xn--c1avg": _2, "орг": _2, "xn--c2br7g": _2, "नेट": _2, "xn--cck2b3b": _2, "ストア": _2, "xn--cckwcxetd": _2, "アマゾン": _2, "xn--cg4bki": _2, "삼성": _2, "xn--czr694b": _2, "商标": _2, "xn--czrs0t": _2, "商店": _2, "xn--czru2d": _2, "商城": _2, "xn--d1acj3b": _2, "дети": _2, "xn--eckvdtc9d": _2, "ポイント": _2, "xn--efvy88h": _2, "新闻": _2, "xn--fct429k": _2, "家電": _2, "xn--fhbei": _2, "كوم": _2, "xn--fiq228c5hs": _2, "中文网": _2, "xn--fiq64b": _2, "中信": _2, "xn--fjq720a": _2, "娱乐": _2, "xn--flw351e": _2, "谷歌": _2, "xn--fzys8d69uvgm": _2, "電訊盈科": _2, "xn--g2xx48c": _2, "购物": _2, "xn--gckr3f0f": _2, "クラウド": _2, "xn--gk3at1e": _2, "通販": _2, "xn--hxt814e": _2, "网店": _2, "xn--i1b6b1a6a2e": _2, "संगठन": _2, "xn--imr513n": _2, "餐厅": _2, "xn--io0a7i": _2, "网络": _2, "xn--j1aef": _2, "ком": _2, "xn--jlq480n2rg": _2, "亚马逊": _2, "xn--jvr189m": _2, "食品": _2, "xn--kcrx77d1x4a": _2, "飞利浦": _2, "xn--kput3i": _2, "手机": _2, "xn--mgba3a3ejt": _2, "ارامكو": _2, "xn--mgba7c0bbn0a": _2, "العليان": _2, "xn--mgbab2bd": _2, "بازار": _2, "xn--mgbca7dzdo": _2, "ابوظبي": _2, "xn--mgbi4ecexp": _2, "كاثوليك": _2, "xn--mgbt3dhd": _2, "همراه": _2, "xn--mk1bu44c": _2, "닷컴": _2, "xn--mxtq1m": _2, "政府": _2, "xn--ngbc5azd": _2, "شبكة": _2, "xn--ngbe9e0a": _2, "بيتك": _2, "xn--ngbrx": _2, "عرب": _2, "xn--nqv7f": _2, "机构": _2, "xn--nqv7fs00ema": _2, "组织机构": _2, "xn--nyqy26a": _2, "健康": _2, "xn--otu796d": _2, "招聘": _2, "xn--p1acf": [1, { "xn--90amc": _3, "xn--j1aef": _3, "xn--j1ael8b": _3, "xn--h1ahn": _3, "xn--j1adp": _3, "xn--c1avg": _3, "xn--80aaa0cvac": _3, "xn--h1aliz": _3, "xn--90a1af": _3, "xn--41a": _3 }], "рус": [1, { "биз": _3, "ком": _3, "крым": _3, "мир": _3, "мск": _3, "орг": _3, "самара": _3, "сочи": _3, "спб": _3, "я": _3 }], "xn--pssy2u": _2, "大拿": _2, "xn--q9jyb4c": _2, "みんな": _2, "xn--qcka1pmc": _2, "グーグル": _2, "xn--rhqv96g": _2, "世界": _2, "xn--rovu88b": _2, "書籍": _2, "xn--ses554g": _2, "网址": _2, "xn--t60b56a": _2, "닷넷": _2, "xn--tckwe": _2, "コム": _2, "xn--tiq49xqyj": _2, "天主教": _2, "xn--unup4y": _2, "游戏": _2, "xn--vermgensberater-ctb": _2, "vermögensberater": _2, "xn--vermgensberatung-pwb": _2, "vermögensberatung": _2, "xn--vhquv": _2, "企业": _2, "xn--vuq861b": _2, "信息": _2, "xn--w4r85el8fhu5dnra": _2, "嘉里大酒店": _2, "xn--w4rs40l": _2, "嘉里": _2, "xn--xhq521b": _2, "广东": _2, "xn--zfr164b": _2, "政务": _2, "xyz": [1, { "botdash": _3, "telebit": _6 }], "yachts": _2, "yahoo": _2, "yamaxun": _2, "yandex": _2, "yodobashi": _2, "yoga": _2, "yokohama": _2, "you": _2, "youtube": _2, "yun": _2, "zappos": _2, "zara": _2, "zero": _2, "zip": _2, "zone": [1, { "triton": _6, "stackit": _3, "lima": _3 }], "zuerich": _2 }];
    return rules2;
  })();
  function lookupInTrie(parts, trie, index2, allowedMask) {
    let result = null;
    let node = trie;
    while (node !== void 0) {
      if ((node[0] & allowedMask) !== 0) {
        result = {
          index: index2 + 1,
          isIcann: node[0] === 1,
          isPrivate: node[0] === 2
        };
      }
      if (index2 === -1) {
        break;
      }
      const succ = node[1];
      node = Object.prototype.hasOwnProperty.call(succ, parts[index2]) ? succ[parts[index2]] : succ["*"];
      index2 -= 1;
    }
    return result;
  }
  function suffixLookup(hostname, options, out) {
    var _a2;
    if (fastPathLookup(hostname, options, out)) {
      return;
    }
    const hostnameParts = hostname.split(".");
    const allowedMask = (options.allowPrivateDomains ? 2 : 0) | (options.allowIcannDomains ? 1 : 0);
    const exceptionMatch = lookupInTrie(hostnameParts, exceptions, hostnameParts.length - 1, allowedMask);
    if (exceptionMatch !== null) {
      out.isIcann = exceptionMatch.isIcann;
      out.isPrivate = exceptionMatch.isPrivate;
      out.publicSuffix = hostnameParts.slice(exceptionMatch.index + 1).join(".");
      return;
    }
    const rulesMatch = lookupInTrie(hostnameParts, rules, hostnameParts.length - 1, allowedMask);
    if (rulesMatch !== null) {
      out.isIcann = rulesMatch.isIcann;
      out.isPrivate = rulesMatch.isPrivate;
      out.publicSuffix = hostnameParts.slice(rulesMatch.index).join(".");
      return;
    }
    out.isIcann = false;
    out.isPrivate = false;
    out.publicSuffix = (_a2 = hostnameParts[hostnameParts.length - 1]) !== null && _a2 !== void 0 ? _a2 : null;
  }
  const RESULT = getEmptyResult();
  function parse$1(url, options = {}) {
    return parseImpl(url, 5, suffixLookup, options, getEmptyResult());
  }
  function getHostname(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 0, suffixLookup, options, RESULT).hostname;
  }
  function getPublicSuffix(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 2, suffixLookup, options, RESULT).publicSuffix;
  }
  function getDomain(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 3, suffixLookup, options, RESULT).domain;
  }
  function getSubdomain(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 4, suffixLookup, options, RESULT).subdomain;
  }
  function getDomainWithoutSuffix(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 5, suffixLookup, options, RESULT).domainWithoutSuffix;
  }
  const es6 = Object.freeze( Object.defineProperty({
    __proto__: null,
    getDomain,
    getDomainWithoutSuffix,
    getHostname,
    getPublicSuffix,
    getSubdomain,
    parse: parse$1
  }, Symbol.toStringTag, { value: "Module" }));
  const require$$0 = getAugmentedNamespace(es6);
  var dist$1;
  var hasRequiredDist$1;
  function requireDist$1() {
    if (hasRequiredDist$1) return dist$1;
    hasRequiredDist$1 = 1;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    __export(index_exports, {
      Cookie: () => Cookie,
      CookieJar: () => CookieJar,
      MemoryCookieStore: () => MemoryCookieStore,
      ParameterError: () => ParameterError,
      PrefixSecurityEnum: () => PrefixSecurityEnum,
      Store: () => Store,
      canonicalDomain: () => canonicalDomain,
      cookieCompare: () => cookieCompare,
      defaultPath: () => defaultPath,
      domainMatch: () => domainMatch,
      formatDate: () => formatDate,
      fromJSON: () => fromJSON2,
      getPublicSuffix: () => getPublicSuffix2,
      parse: () => parse22,
      parseDate: () => parseDate,
      pathMatch: () => pathMatch,
      permuteDomain: () => permuteDomain,
      permutePath: () => permutePath,
      version: () => version
    });
    dist$1 = __toCommonJS(index_exports);
    function pathMatch(reqPath, cookiePath) {
      if (cookiePath === reqPath) {
        return true;
      }
      const idx = reqPath.indexOf(cookiePath);
      if (idx === 0) {
        if (cookiePath[cookiePath.length - 1] === "/") {
          return true;
        }
        if (reqPath.startsWith(cookiePath) && reqPath[cookiePath.length] === "/") {
          return true;
        }
      }
      return false;
    }
    var import_tldts = require$$0;
    var SPECIAL_USE_DOMAINS = ["local", "example", "invalid", "localhost", "test"];
    var SPECIAL_TREATMENT_DOMAINS = ["localhost", "invalid"];
    var defaultGetPublicSuffixOptions = {
      allowSpecialUseDomain: false,
      ignoreError: false
    };
    function getPublicSuffix2(domain, options = {}) {
      options = { ...defaultGetPublicSuffixOptions, ...options };
      const domainParts = domain.split(".");
      const topLevelDomain = domainParts[domainParts.length - 1];
      const allowSpecialUseDomain = !!options.allowSpecialUseDomain;
      const ignoreError = !!options.ignoreError;
      if (allowSpecialUseDomain && topLevelDomain !== void 0 && SPECIAL_USE_DOMAINS.includes(topLevelDomain)) {
        if (domainParts.length > 1) {
          const secondLevelDomain = domainParts[domainParts.length - 2];
          return `${secondLevelDomain}.${topLevelDomain}`;
        } else if (SPECIAL_TREATMENT_DOMAINS.includes(topLevelDomain)) {
          return topLevelDomain;
        }
      }
      if (!ignoreError && topLevelDomain !== void 0 && SPECIAL_USE_DOMAINS.includes(topLevelDomain)) {
        throw new Error(
          `Cookie has domain set to the public suffix "${topLevelDomain}" which is a special use domain. To allow this, configure your CookieJar with {allowSpecialUseDomain: true, rejectPublicSuffixes: false}.`
        );
      }
      const publicSuffix = (0, import_tldts.getDomain)(domain, {
        allowIcannDomains: true,
        allowPrivateDomains: true
      });
      if (publicSuffix) return publicSuffix;
    }
    function permuteDomain(domain, allowSpecialUseDomain) {
      const pubSuf = getPublicSuffix2(domain, {
        allowSpecialUseDomain
      });
      if (!pubSuf) {
        return void 0;
      }
      if (pubSuf == domain) {
        return [domain];
      }
      if (domain.slice(-1) == ".") {
        domain = domain.slice(0, -1);
      }
      const prefix = domain.slice(0, -(pubSuf.length + 1));
      const parts = prefix.split(".").reverse();
      let cur = pubSuf;
      const permutations = [cur];
      while (parts.length) {
        const part = parts.shift();
        cur = `${part}.${cur}`;
        permutations.push(cur);
      }
      return permutations;
    }
    var Store = class {
      constructor() {
        this.synchronous = false;
      }
findCookie(_domain, _path, _key, _callback) {
        throw new Error("findCookie is not implemented");
      }
findCookies(_domain, _path, _allowSpecialUseDomain = false, _callback) {
        throw new Error("findCookies is not implemented");
      }
putCookie(_cookie, _callback) {
        throw new Error("putCookie is not implemented");
      }
updateCookie(_oldCookie, _newCookie, _callback) {
        throw new Error("updateCookie is not implemented");
      }
removeCookie(_domain, _path, _key, _callback) {
        throw new Error("removeCookie is not implemented");
      }
removeCookies(_domain, _path, _callback) {
        throw new Error("removeCookies is not implemented");
      }
removeAllCookies(_callback) {
        throw new Error("removeAllCookies is not implemented");
      }
getAllCookies(_callback) {
        throw new Error(
          "getAllCookies is not implemented (therefore jar cannot be serialized)"
        );
      }
    };
    var objectToString = (obj) => Object.prototype.toString.call(obj);
    var safeArrayToString = (arr, seenArrays) => {
      if (typeof arr.join !== "function") return objectToString(arr);
      seenArrays.add(arr);
      const mapped = arr.map(
        (val2) => val2 === null || val2 === void 0 || seenArrays.has(val2) ? "" : safeToStringImpl(val2, seenArrays)
      );
      return mapped.join();
    };
    var safeToStringImpl = (val2, seenArrays = new WeakSet()) => {
      if (typeof val2 !== "object" || val2 === null) {
        return String(val2);
      } else if (typeof val2.toString === "function") {
        return Array.isArray(val2) ? (
safeArrayToString(val2, seenArrays)
        ) : (
String(val2)
        );
      } else {
        return objectToString(val2);
      }
    };
    var safeToString = (val2) => safeToStringImpl(val2);
    function createPromiseCallback(cb) {
      let callback;
      let resolve;
      let reject;
      const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });
      if (typeof cb === "function") {
        callback = (err, result) => {
          try {
            if (err) cb(err);
            else cb(null, result);
          } catch (e) {
            reject(e instanceof Error ? e : new Error());
          }
        };
      } else {
        callback = (err, result) => {
          try {
            if (err) reject(err);
            else resolve(result);
          } catch (e) {
            reject(e instanceof Error ? e : new Error());
          }
        };
      }
      return {
        promise,
        callback,
        resolve: (value) => {
          callback(null, value);
          return promise;
        },
        reject: (error2) => {
          callback(error2);
          return promise;
        }
      };
    }
    function inOperator(k, o) {
      return k in o;
    }
    var MemoryCookieStore = class extends Store {
constructor() {
        super();
        this.synchronous = true;
        this.idx = Object.create(null);
      }
findCookie(domain, path, key, callback) {
        const promiseCallback = createPromiseCallback(callback);
        if (domain == null || path == null || key == null) {
          return promiseCallback.resolve(void 0);
        }
        const result = this.idx[domain]?.[path]?.[key];
        return promiseCallback.resolve(result);
      }
findCookies(domain, path, allowSpecialUseDomain = false, callback) {
        if (typeof allowSpecialUseDomain === "function") {
          callback = allowSpecialUseDomain;
          allowSpecialUseDomain = true;
        }
        const results = [];
        const promiseCallback = createPromiseCallback(callback);
        if (!domain) {
          return promiseCallback.resolve([]);
        }
        let pathMatcher;
        if (!path) {
          pathMatcher = function matchAll(domainIndex) {
            for (const curPath in domainIndex) {
              const pathIndex = domainIndex[curPath];
              for (const key in pathIndex) {
                const value = pathIndex[key];
                if (value) {
                  results.push(value);
                }
              }
            }
          };
        } else {
          pathMatcher = function matchRFC(domainIndex) {
            for (const cookiePath in domainIndex) {
              if (pathMatch(path, cookiePath)) {
                const pathIndex = domainIndex[cookiePath];
                for (const key in pathIndex) {
                  const value = pathIndex[key];
                  if (value) {
                    results.push(value);
                  }
                }
              }
            }
          };
        }
        const domains = permuteDomain(domain, allowSpecialUseDomain) || [domain];
        const idx = this.idx;
        domains.forEach((curDomain) => {
          const domainIndex = idx[curDomain];
          if (!domainIndex) {
            return;
          }
          pathMatcher(domainIndex);
        });
        return promiseCallback.resolve(results);
      }
putCookie(cookie, callback) {
        const promiseCallback = createPromiseCallback(callback);
        const { domain, path, key } = cookie;
        if (domain == null || path == null || key == null) {
          return promiseCallback.resolve(void 0);
        }
        const domainEntry = this.idx[domain] ?? Object.create(null);
        this.idx[domain] = domainEntry;
        const pathEntry = domainEntry[path] ?? Object.create(null);
        domainEntry[path] = pathEntry;
        pathEntry[key] = cookie;
        return promiseCallback.resolve(void 0);
      }
updateCookie(_oldCookie, newCookie, callback) {
        if (callback) this.putCookie(newCookie, callback);
        else return this.putCookie(newCookie);
      }
removeCookie(domain, path, key, callback) {
        const promiseCallback = createPromiseCallback(callback);
        delete this.idx[domain]?.[path]?.[key];
        return promiseCallback.resolve(void 0);
      }
removeCookies(domain, path, callback) {
        const promiseCallback = createPromiseCallback(callback);
        const domainEntry = this.idx[domain];
        if (domainEntry) {
          if (path) {
            delete domainEntry[path];
          } else {
            delete this.idx[domain];
          }
        }
        return promiseCallback.resolve(void 0);
      }
removeAllCookies(callback) {
        const promiseCallback = createPromiseCallback(callback);
        this.idx = Object.create(null);
        return promiseCallback.resolve(void 0);
      }
getAllCookies(callback) {
        const promiseCallback = createPromiseCallback(callback);
        const cookies = [];
        const idx = this.idx;
        const domains = Object.keys(idx);
        domains.forEach((domain) => {
          const domainEntry = idx[domain] ?? {};
          const paths = Object.keys(domainEntry);
          paths.forEach((path) => {
            const pathEntry = domainEntry[path] ?? {};
            const keys = Object.keys(pathEntry);
            keys.forEach((key) => {
              const keyEntry = pathEntry[key];
              if (keyEntry != null) {
                cookies.push(keyEntry);
              }
            });
          });
        });
        cookies.sort((a, b) => {
          return (a.creationIndex || 0) - (b.creationIndex || 0);
        });
        return promiseCallback.resolve(cookies);
      }
    };
    function isNonEmptyString(data2) {
      return isString(data2) && data2 !== "";
    }
    function isEmptyString(data2) {
      return data2 === "" || data2 instanceof String && data2.toString() === "";
    }
    function isString(data2) {
      return typeof data2 === "string" || data2 instanceof String;
    }
    function isObject(data2) {
      return objectToString(data2) === "[object Object]";
    }
    function validate(bool, cbOrMessage, message) {
      if (bool) return;
      const cb = typeof cbOrMessage === "function" ? cbOrMessage : void 0;
      let options = typeof cbOrMessage === "function" ? message : cbOrMessage;
      if (!isObject(options)) options = "[object Object]";
      const err = new ParameterError(safeToString(options));
      if (cb) cb(err);
      else throw err;
    }
    var ParameterError = class extends Error {
    };
    var version = "6.0.0";
    var PrefixSecurityEnum = {
      SILENT: "silent",
      STRICT: "strict",
      DISABLED: "unsafe-disabled"
    };
    Object.freeze(PrefixSecurityEnum);
    var IP_V6_REGEX = `
\\[?(?:
(?:[a-fA-F\\d]{1,4}:){7}(?:[a-fA-F\\d]{1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|:[a-fA-F\\d]{1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,2}|:)|
(?:[a-fA-F\\d]{1,4}:){4}(?:(?::[a-fA-F\\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,3}|:)|
(?:[a-fA-F\\d]{1,4}:){3}(?:(?::[a-fA-F\\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,4}|:)|
(?:[a-fA-F\\d]{1,4}:){2}(?:(?::[a-fA-F\\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,5}|:)|
(?:[a-fA-F\\d]{1,4}:){1}(?:(?::[a-fA-F\\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,6}|:)|
(?::(?:(?::[a-fA-F\\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}|(?::[a-fA-F\\d]{1,4}){1,7}|:))
)(?:%[0-9a-zA-Z]{1,})?\\]?
`.replace(/\s*\/\/.*$/gm, "").replace(/\n/g, "").trim();
    var IP_V6_REGEX_OBJECT = new RegExp(`^${IP_V6_REGEX}$`);
    var IP_V4_REGEX = `(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])`;
    var IP_V4_REGEX_OBJECT = new RegExp(`^${IP_V4_REGEX}$`);
    function domainToASCII(domain) {
      return new URL(`http://${domain}`).hostname;
    }
    function canonicalDomain(domainName) {
      if (domainName == null) {
        return void 0;
      }
      let str = domainName.trim().replace(/^\./, "");
      if (IP_V6_REGEX_OBJECT.test(str)) {
        if (!str.startsWith("[")) {
          str = "[" + str;
        }
        if (!str.endsWith("]")) {
          str = str + "]";
        }
        return domainToASCII(str).slice(1, -1);
      }
      if (/[^\u0001-\u007f]/.test(str)) {
        return domainToASCII(str);
      }
      return str.toLowerCase();
    }
    function formatDate(date) {
      return date.toUTCString();
    }
    var DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/;
    var MONTH_TO_NUM = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11
    };
    function parseDigits(token, minDigits, maxDigits, trailingOK) {
      let count = 0;
      while (count < token.length) {
        const c = token.charCodeAt(count);
        if (c <= 47 || c >= 58) {
          break;
        }
        count++;
      }
      if (count < minDigits || count > maxDigits) {
        return;
      }
      if (!trailingOK && count != token.length) {
        return;
      }
      return parseInt(token.slice(0, count), 10);
    }
    function parseTime(token) {
      const parts = token.split(":");
      const result = [0, 0, 0];
      if (parts.length !== 3) {
        return;
      }
      for (let i = 0; i < 3; i++) {
        const trailingOK = i == 2;
        const numPart = parts[i];
        if (numPart === void 0) {
          return;
        }
        const num = parseDigits(numPart, 1, 2, trailingOK);
        if (num === void 0) {
          return;
        }
        result[i] = num;
      }
      return result;
    }
    function parseMonth(token) {
      token = String(token).slice(0, 3).toLowerCase();
      switch (token) {
        case "jan":
          return MONTH_TO_NUM.jan;
        case "feb":
          return MONTH_TO_NUM.feb;
        case "mar":
          return MONTH_TO_NUM.mar;
        case "apr":
          return MONTH_TO_NUM.apr;
        case "may":
          return MONTH_TO_NUM.may;
        case "jun":
          return MONTH_TO_NUM.jun;
        case "jul":
          return MONTH_TO_NUM.jul;
        case "aug":
          return MONTH_TO_NUM.aug;
        case "sep":
          return MONTH_TO_NUM.sep;
        case "oct":
          return MONTH_TO_NUM.oct;
        case "nov":
          return MONTH_TO_NUM.nov;
        case "dec":
          return MONTH_TO_NUM.dec;
        default:
          return;
      }
    }
    function parseDate(cookieDate) {
      if (!cookieDate) {
        return;
      }
      const tokens = cookieDate.split(DATE_DELIM);
      let hour;
      let minute;
      let second;
      let dayOfMonth;
      let month;
      let year;
      for (let i = 0; i < tokens.length; i++) {
        const token = (tokens[i] ?? "").trim();
        if (!token.length) {
          continue;
        }
        if (second === void 0) {
          const result = parseTime(token);
          if (result) {
            hour = result[0];
            minute = result[1];
            second = result[2];
            continue;
          }
        }
        if (dayOfMonth === void 0) {
          const result = parseDigits(token, 1, 2, true);
          if (result !== void 0) {
            dayOfMonth = result;
            continue;
          }
        }
        if (month === void 0) {
          const result = parseMonth(token);
          if (result !== void 0) {
            month = result;
            continue;
          }
        }
        if (year === void 0) {
          const result = parseDigits(token, 2, 4, true);
          if (result !== void 0) {
            year = result;
            if (year >= 70 && year <= 99) {
              year += 1900;
            } else if (year >= 0 && year <= 69) {
              year += 2e3;
            }
          }
        }
      }
      if (dayOfMonth === void 0 || month === void 0 || year === void 0 || hour === void 0 || minute === void 0 || second === void 0 || dayOfMonth < 1 || dayOfMonth > 31 || year < 1601 || hour > 23 || minute > 59 || second > 59) {
        return;
      }
      return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
    }
    var COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;
    var PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/;
    var CONTROL_CHARS = /[\x00-\x1F]/;
    var TERMINATORS = ["\n", "\r", "\0"];
    function trimTerminator(str) {
      if (isEmptyString(str)) return str;
      for (let t = 0; t < TERMINATORS.length; t++) {
        const terminator = TERMINATORS[t];
        const terminatorIdx = terminator ? str.indexOf(terminator) : -1;
        if (terminatorIdx !== -1) {
          str = str.slice(0, terminatorIdx);
        }
      }
      return str;
    }
    function parseCookiePair(cookiePair, looseMode) {
      cookiePair = trimTerminator(cookiePair);
      let firstEq = cookiePair.indexOf("=");
      if (looseMode) {
        if (firstEq === 0) {
          cookiePair = cookiePair.substring(1);
          firstEq = cookiePair.indexOf("=");
        }
      } else {
        if (firstEq <= 0) {
          return void 0;
        }
      }
      let cookieName, cookieValue;
      if (firstEq <= 0) {
        cookieName = "";
        cookieValue = cookiePair.trim();
      } else {
        cookieName = cookiePair.slice(0, firstEq).trim();
        cookieValue = cookiePair.slice(firstEq + 1).trim();
      }
      if (CONTROL_CHARS.test(cookieName) || CONTROL_CHARS.test(cookieValue)) {
        return void 0;
      }
      const c = new Cookie();
      c.key = cookieName;
      c.value = cookieValue;
      return c;
    }
    function parse2(str, options) {
      if (isEmptyString(str) || !isString(str)) {
        return void 0;
      }
      str = str.trim();
      const firstSemi = str.indexOf(";");
      const cookiePair = firstSemi === -1 ? str : str.slice(0, firstSemi);
      const c = parseCookiePair(cookiePair, options?.loose ?? false);
      if (!c) {
        return void 0;
      }
      if (firstSemi === -1) {
        return c;
      }
      const unparsed = str.slice(firstSemi + 1).trim();
      if (unparsed.length === 0) {
        return c;
      }
      const cookie_avs = unparsed.split(";");
      while (cookie_avs.length) {
        const av = (cookie_avs.shift() ?? "").trim();
        if (av.length === 0) {
          continue;
        }
        const av_sep = av.indexOf("=");
        let av_key, av_value;
        if (av_sep === -1) {
          av_key = av;
          av_value = null;
        } else {
          av_key = av.slice(0, av_sep);
          av_value = av.slice(av_sep + 1);
        }
        av_key = av_key.trim().toLowerCase();
        if (av_value) {
          av_value = av_value.trim();
        }
        switch (av_key) {
          case "expires":
            if (av_value) {
              const exp = parseDate(av_value);
              if (exp) {
                c.expires = exp;
              }
            }
            break;
          case "max-age":
            if (av_value) {
              if (/^-?[0-9]+$/.test(av_value)) {
                const delta = parseInt(av_value, 10);
                c.setMaxAge(delta);
              }
            }
            break;
          case "domain":
            if (av_value) {
              const domain = av_value.trim().replace(/^\./, "");
              if (domain) {
                c.domain = domain.toLowerCase();
              }
            }
            break;
          case "path":
            c.path = av_value && av_value[0] === "/" ? av_value : null;
            break;
          case "secure":
            c.secure = true;
            break;
          case "httponly":
            c.httpOnly = true;
            break;
          case "samesite":
            switch (av_value ? av_value.toLowerCase() : "") {
              case "strict":
                c.sameSite = "strict";
                break;
              case "lax":
                c.sameSite = "lax";
                break;
              case "none":
                c.sameSite = "none";
                break;
              default:
                c.sameSite = void 0;
                break;
            }
            break;
          default:
            c.extensions = c.extensions || [];
            c.extensions.push(av);
            break;
        }
      }
      return c;
    }
    function fromJSON(str) {
      if (!str || isEmptyString(str)) {
        return void 0;
      }
      let obj;
      if (typeof str === "string") {
        try {
          obj = JSON.parse(str);
        } catch {
          return void 0;
        }
      } else {
        obj = str;
      }
      const c = new Cookie();
      Cookie.serializableProperties.forEach((prop2) => {
        if (obj && typeof obj === "object" && inOperator(prop2, obj)) {
          const val2 = obj[prop2];
          if (val2 === void 0) {
            return;
          }
          if (inOperator(prop2, cookieDefaults) && val2 === cookieDefaults[prop2]) {
            return;
          }
          switch (prop2) {
            case "key":
            case "value":
            case "sameSite":
              if (typeof val2 === "string") {
                c[prop2] = val2;
              }
              break;
            case "expires":
            case "creation":
            case "lastAccessed":
              if (typeof val2 === "number" || typeof val2 === "string" || val2 instanceof Date) {
                c[prop2] = obj[prop2] == "Infinity" ? "Infinity" : new Date(val2);
              } else if (val2 === null) {
                c[prop2] = null;
              }
              break;
            case "maxAge":
              if (typeof val2 === "number" || val2 === "Infinity" || val2 === "-Infinity") {
                c[prop2] = val2;
              }
              break;
            case "domain":
            case "path":
              if (typeof val2 === "string" || val2 === null) {
                c[prop2] = val2;
              }
              break;
            case "secure":
            case "httpOnly":
              if (typeof val2 === "boolean") {
                c[prop2] = val2;
              }
              break;
            case "extensions":
              if (Array.isArray(val2) && val2.every((item) => typeof item === "string")) {
                c[prop2] = val2;
              }
              break;
            case "hostOnly":
            case "pathIsDefault":
              if (typeof val2 === "boolean" || val2 === null) {
                c[prop2] = val2;
              }
              break;
          }
        }
      });
      return c;
    }
    var cookieDefaults = {
key: "",
      value: "",
      expires: "Infinity",
      maxAge: null,
      domain: null,
      path: null,
      secure: false,
      httpOnly: false,
      extensions: null,
hostOnly: null,
      pathIsDefault: null,
      creation: null,
      lastAccessed: null,
      sameSite: void 0
    };
    var _Cookie = class _Cookie2 {
constructor(options = {}) {
        this.key = options.key ?? cookieDefaults.key;
        this.value = options.value ?? cookieDefaults.value;
        this.expires = options.expires ?? cookieDefaults.expires;
        this.maxAge = options.maxAge ?? cookieDefaults.maxAge;
        this.domain = options.domain ?? cookieDefaults.domain;
        this.path = options.path ?? cookieDefaults.path;
        this.secure = options.secure ?? cookieDefaults.secure;
        this.httpOnly = options.httpOnly ?? cookieDefaults.httpOnly;
        this.extensions = options.extensions ?? cookieDefaults.extensions;
        this.creation = options.creation ?? cookieDefaults.creation;
        this.hostOnly = options.hostOnly ?? cookieDefaults.hostOnly;
        this.pathIsDefault = options.pathIsDefault ?? cookieDefaults.pathIsDefault;
        this.lastAccessed = options.lastAccessed ?? cookieDefaults.lastAccessed;
        this.sameSite = options.sameSite ?? cookieDefaults.sameSite;
        this.creation = options.creation ?? new Date();
        Object.defineProperty(this, "creationIndex", {
          configurable: false,
          enumerable: false,
writable: true,
          value: ++_Cookie2.cookiesCreated
        });
        this.creationIndex = _Cookie2.cookiesCreated;
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        const now = Date.now();
        const hostOnly = this.hostOnly != null ? this.hostOnly.toString() : "?";
        const createAge = this.creation && this.creation !== "Infinity" ? `${String(now - this.creation.getTime())}ms` : "?";
        const accessAge = this.lastAccessed && this.lastAccessed !== "Infinity" ? `${String(now - this.lastAccessed.getTime())}ms` : "?";
        return `Cookie="${this.toString()}; hostOnly=${hostOnly}; aAge=${accessAge}; cAge=${createAge}"`;
      }
toJSON() {
        const obj = {};
        for (const prop2 of _Cookie2.serializableProperties) {
          const val2 = this[prop2];
          if (val2 === cookieDefaults[prop2]) {
            continue;
          }
          switch (prop2) {
            case "key":
            case "value":
            case "sameSite":
              if (typeof val2 === "string") {
                obj[prop2] = val2;
              }
              break;
            case "expires":
            case "creation":
            case "lastAccessed":
              if (typeof val2 === "number" || typeof val2 === "string" || val2 instanceof Date) {
                obj[prop2] = val2 == "Infinity" ? "Infinity" : new Date(val2).toISOString();
              } else if (val2 === null) {
                obj[prop2] = null;
              }
              break;
            case "maxAge":
              if (typeof val2 === "number" || val2 === "Infinity" || val2 === "-Infinity") {
                obj[prop2] = val2;
              }
              break;
            case "domain":
            case "path":
              if (typeof val2 === "string" || val2 === null) {
                obj[prop2] = val2;
              }
              break;
            case "secure":
            case "httpOnly":
              if (typeof val2 === "boolean") {
                obj[prop2] = val2;
              }
              break;
            case "extensions":
              if (Array.isArray(val2)) {
                obj[prop2] = val2;
              }
              break;
            case "hostOnly":
            case "pathIsDefault":
              if (typeof val2 === "boolean" || val2 === null) {
                obj[prop2] = val2;
              }
              break;
          }
        }
        return obj;
      }
clone() {
        return fromJSON(this.toJSON());
      }
validate() {
        if (!this.value || !COOKIE_OCTETS.test(this.value)) {
          return false;
        }
        if (this.expires != "Infinity" && !(this.expires instanceof Date) && !parseDate(this.expires)) {
          return false;
        }
        if (this.maxAge != null && this.maxAge !== "Infinity" && (this.maxAge === "-Infinity" || this.maxAge <= 0)) {
          return false;
        }
        if (this.path != null && !PATH_VALUE.test(this.path)) {
          return false;
        }
        const cdomain = this.cdomain();
        if (cdomain) {
          if (cdomain.match(/\.$/)) {
            return false;
          }
          const suffix = getPublicSuffix2(cdomain);
          if (suffix == null) {
            return false;
          }
        }
        return true;
      }
setExpires(exp) {
        if (exp instanceof Date) {
          this.expires = exp;
        } else {
          this.expires = parseDate(exp) || "Infinity";
        }
      }
setMaxAge(age) {
        if (age === Infinity) {
          this.maxAge = "Infinity";
        } else if (age === -Infinity) {
          this.maxAge = "-Infinity";
        } else {
          this.maxAge = age;
        }
      }
cookieString() {
        const val2 = this.value || "";
        if (this.key) {
          return `${this.key}=${val2}`;
        }
        return val2;
      }
toString() {
        let str = this.cookieString();
        if (this.expires != "Infinity") {
          if (this.expires instanceof Date) {
            str += `; Expires=${formatDate(this.expires)}`;
          }
        }
        if (this.maxAge != null && this.maxAge != Infinity) {
          str += `; Max-Age=${String(this.maxAge)}`;
        }
        if (this.domain && !this.hostOnly) {
          str += `; Domain=${this.domain}`;
        }
        if (this.path) {
          str += `; Path=${this.path}`;
        }
        if (this.secure) {
          str += "; Secure";
        }
        if (this.httpOnly) {
          str += "; HttpOnly";
        }
        if (this.sameSite && this.sameSite !== "none") {
          if (this.sameSite.toLowerCase() === _Cookie2.sameSiteCanonical.lax.toLowerCase()) {
            str += `; SameSite=${_Cookie2.sameSiteCanonical.lax}`;
          } else if (this.sameSite.toLowerCase() === _Cookie2.sameSiteCanonical.strict.toLowerCase()) {
            str += `; SameSite=${_Cookie2.sameSiteCanonical.strict}`;
          } else {
            str += `; SameSite=${this.sameSite}`;
          }
        }
        if (this.extensions) {
          this.extensions.forEach((ext) => {
            str += `; ${ext}`;
          });
        }
        return str;
      }
TTL(now = Date.now()) {
        if (this.maxAge != null && typeof this.maxAge === "number") {
          return this.maxAge <= 0 ? 0 : this.maxAge * 1e3;
        }
        const expires = this.expires;
        if (expires === "Infinity") {
          return Infinity;
        }
        return (expires?.getTime() ?? now) - (now || Date.now());
      }
expiryTime(now) {
        if (this.maxAge != null) {
          const relativeTo = now || this.lastAccessed || new Date();
          const maxAge = typeof this.maxAge === "number" ? this.maxAge : -Infinity;
          const age = maxAge <= 0 ? -Infinity : maxAge * 1e3;
          if (relativeTo === "Infinity") {
            return Infinity;
          }
          return relativeTo.getTime() + age;
        }
        if (this.expires == "Infinity") {
          return Infinity;
        }
        return this.expires ? this.expires.getTime() : void 0;
      }
expiryDate(now) {
        const millisec = this.expiryTime(now);
        if (millisec == Infinity) {
          return new Date(2147483647e3);
        } else if (millisec == -Infinity) {
          return new Date(0);
        } else {
          return millisec == void 0 ? void 0 : new Date(millisec);
        }
      }
isPersistent() {
        return this.maxAge != null || this.expires != "Infinity";
      }
canonicalizedDomain() {
        return canonicalDomain(this.domain);
      }
cdomain() {
        return canonicalDomain(this.domain);
      }
static parse(str, options) {
        return parse2(str, options);
      }
static fromJSON(str) {
        return fromJSON(str);
      }
    };
    _Cookie.cookiesCreated = 0;
    _Cookie.sameSiteLevel = {
      strict: 3,
      lax: 2,
      none: 1
    };
    _Cookie.sameSiteCanonical = {
      strict: "Strict",
      lax: "Lax"
    };
    _Cookie.serializableProperties = [
      "key",
      "value",
      "expires",
      "maxAge",
      "domain",
      "path",
      "secure",
      "httpOnly",
      "extensions",
      "hostOnly",
      "pathIsDefault",
      "creation",
      "lastAccessed",
      "sameSite"
    ];
    var Cookie = _Cookie;
    var MAX_TIME = 2147483647e3;
    function cookieCompare(a, b) {
      let cmp;
      const aPathLen = a.path ? a.path.length : 0;
      const bPathLen = b.path ? b.path.length : 0;
      cmp = bPathLen - aPathLen;
      if (cmp !== 0) {
        return cmp;
      }
      const aTime = a.creation && a.creation instanceof Date ? a.creation.getTime() : MAX_TIME;
      const bTime = b.creation && b.creation instanceof Date ? b.creation.getTime() : MAX_TIME;
      cmp = aTime - bTime;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = (a.creationIndex || 0) - (b.creationIndex || 0);
      return cmp;
    }
    function defaultPath(path) {
      if (!path || path.slice(0, 1) !== "/") {
        return "/";
      }
      if (path === "/") {
        return path;
      }
      const rightSlash = path.lastIndexOf("/");
      if (rightSlash === 0) {
        return "/";
      }
      return path.slice(0, rightSlash);
    }
    var IP_REGEX_LOWERCASE = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-f\d]{1,4}:){7}(?:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,2}|:)|(?:[a-f\d]{1,4}:){4}(?:(?::[a-f\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,3}|:)|(?:[a-f\d]{1,4}:){3}(?:(?::[a-f\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,4}|:)|(?:[a-f\d]{1,4}:){2}(?:(?::[a-f\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,5}|:)|(?:[a-f\d]{1,4}:){1}(?:(?::[a-f\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,6}|:)|(?::(?:(?::[a-f\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,7}|:)))$)/;
    function domainMatch(domain, cookieDomain, canonicalize) {
      if (domain == null || cookieDomain == null) {
        return void 0;
      }
      let _str;
      let _domStr;
      if (canonicalize !== false) {
        _str = canonicalDomain(domain);
        _domStr = canonicalDomain(cookieDomain);
      } else {
        _str = domain;
        _domStr = cookieDomain;
      }
      if (_str == null || _domStr == null) {
        return void 0;
      }
      if (_str == _domStr) {
        return true;
      }
      const idx = _str.lastIndexOf(_domStr);
      if (idx <= 0) {
        return false;
      }
      if (_str.length !== _domStr.length + idx) {
        return false;
      }
      if (_str.substring(idx - 1, idx) !== ".") {
        return false;
      }
      return !IP_REGEX_LOWERCASE.test(_str);
    }
    function isLoopbackV4(address) {
      const octets = address.split(".");
      return octets.length === 4 && octets[0] !== void 0 && parseInt(octets[0], 10) === 127;
    }
    function isLoopbackV6(address) {
      return address === "::1";
    }
    function isNormalizedLocalhostTLD(lowerHost) {
      return lowerHost.endsWith(".localhost");
    }
    function isLocalHostname(host) {
      const lowerHost = host.toLowerCase();
      return lowerHost === "localhost" || isNormalizedLocalhostTLD(lowerHost);
    }
    function hostNoBrackets(host) {
      if (host.length >= 2 && host.startsWith("[") && host.endsWith("]")) {
        return host.substring(1, host.length - 1);
      }
      return host;
    }
    function isPotentiallyTrustworthy(inputUrl, allowSecureOnLocal = true) {
      let url;
      if (typeof inputUrl === "string") {
        try {
          url = new URL(inputUrl);
        } catch {
          return false;
        }
      } else {
        url = inputUrl;
      }
      const scheme = url.protocol.replace(":", "").toLowerCase();
      const hostname = hostNoBrackets(url.hostname).replace(/\.+$/, "");
      if (scheme === "https" || scheme === "wss") {
        return true;
      }
      if (!allowSecureOnLocal) {
        return false;
      }
      if (IP_V4_REGEX_OBJECT.test(hostname)) {
        return isLoopbackV4(hostname);
      }
      if (IP_V6_REGEX_OBJECT.test(hostname)) {
        return isLoopbackV6(hostname);
      }
      return isLocalHostname(hostname);
    }
    var defaultSetCookieOptions = {
      loose: false,
      sameSiteContext: void 0,
      ignoreError: false,
      http: true
    };
    var defaultGetCookieOptions = {
      http: true,
      expire: true,
      allPaths: false,
      sameSiteContext: void 0,
      sort: void 0
    };
    var SAME_SITE_CONTEXT_VAL_ERR = 'Invalid sameSiteContext option for getCookies(); expected one of "strict", "lax", or "none"';
    function getCookieContext(url) {
      if (url && typeof url === "object" && "hostname" in url && typeof url.hostname === "string" && "pathname" in url && typeof url.pathname === "string" && "protocol" in url && typeof url.protocol === "string") {
        return {
          hostname: url.hostname,
          pathname: url.pathname,
          protocol: url.protocol
        };
      } else if (typeof url === "string") {
        try {
          return new URL(decodeURI(url));
        } catch {
          return new URL(url);
        }
      } else {
        throw new ParameterError("`url` argument is not a string or URL.");
      }
    }
    function checkSameSiteContext(value) {
      const context = String(value).toLowerCase();
      if (context === "none" || context === "lax" || context === "strict") {
        return context;
      } else {
        return void 0;
      }
    }
    function isSecurePrefixConditionMet(cookie) {
      const startsWithSecurePrefix = typeof cookie.key === "string" && cookie.key.startsWith("__Secure-");
      return !startsWithSecurePrefix || cookie.secure;
    }
    function isHostPrefixConditionMet(cookie) {
      const startsWithHostPrefix = typeof cookie.key === "string" && cookie.key.startsWith("__Host-");
      return !startsWithHostPrefix || Boolean(
        cookie.secure && cookie.hostOnly && cookie.path != null && cookie.path === "/"
      );
    }
    function getNormalizedPrefixSecurity(prefixSecurity) {
      const normalizedPrefixSecurity = prefixSecurity.toLowerCase();
      switch (normalizedPrefixSecurity) {
        case PrefixSecurityEnum.STRICT:
        case PrefixSecurityEnum.SILENT:
        case PrefixSecurityEnum.DISABLED:
          return normalizedPrefixSecurity;
        default:
          return PrefixSecurityEnum.SILENT;
      }
    }
    var CookieJar = class _CookieJar {
constructor(store, options) {
        if (typeof options === "boolean") {
          options = { rejectPublicSuffixes: options };
        }
        this.rejectPublicSuffixes = options?.rejectPublicSuffixes ?? true;
        this.enableLooseMode = options?.looseMode ?? false;
        this.allowSpecialUseDomain = options?.allowSpecialUseDomain ?? true;
        this.allowSecureOnLocal = options?.allowSecureOnLocal ?? true;
        this.prefixSecurity = getNormalizedPrefixSecurity(
          options?.prefixSecurity ?? "silent"
        );
        this.store = store ?? new MemoryCookieStore();
      }
      callSync(fn) {
        if (!this.store.synchronous) {
          throw new Error(
            "CookieJar store is not synchronous; use async API instead."
          );
        }
        let syncErr = null;
        let syncResult = void 0;
        try {
          fn.call(this, (error2, result) => {
            syncErr = error2;
            syncResult = result;
          });
        } catch (err) {
          syncErr = err;
        }
        if (syncErr) throw syncErr;
        return syncResult;
      }
setCookie(cookie, url, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = void 0;
        }
        const promiseCallback = createPromiseCallback(callback);
        const cb = promiseCallback.callback;
        let context;
        try {
          if (typeof url === "string") {
            validate(
              isNonEmptyString(url),
              callback,
              safeToString(options)
            );
          }
          context = getCookieContext(url);
          if (typeof url === "function") {
            return promiseCallback.reject(new Error("No URL was specified"));
          }
          if (typeof options === "function") {
            options = defaultSetCookieOptions;
          }
          validate(typeof cb === "function", cb);
          if (!isNonEmptyString(cookie) && !isObject(cookie) && cookie instanceof String && cookie.length == 0) {
            return promiseCallback.resolve(void 0);
          }
        } catch (err) {
          return promiseCallback.reject(err);
        }
        const host = canonicalDomain(context.hostname) ?? null;
        const loose = options?.loose || this.enableLooseMode;
        let sameSiteContext = null;
        if (options?.sameSiteContext) {
          sameSiteContext = checkSameSiteContext(options.sameSiteContext);
          if (!sameSiteContext) {
            return promiseCallback.reject(new Error(SAME_SITE_CONTEXT_VAL_ERR));
          }
        }
        if (typeof cookie === "string" || cookie instanceof String) {
          const parsedCookie = Cookie.parse(cookie.toString(), { loose });
          if (!parsedCookie) {
            const err = new Error("Cookie failed to parse");
            return options?.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
          }
          cookie = parsedCookie;
        } else if (!(cookie instanceof Cookie)) {
          const err = new Error(
            "First argument to setCookie must be a Cookie object or string"
          );
          return options?.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
        }
        const now = options?.now || new Date();
        if (this.rejectPublicSuffixes && cookie.domain) {
          try {
            const cdomain = cookie.cdomain();
            const suffix = typeof cdomain === "string" ? getPublicSuffix2(cdomain, {
              allowSpecialUseDomain: this.allowSpecialUseDomain,
              ignoreError: options?.ignoreError
            }) : null;
            if (suffix == null && !IP_V6_REGEX_OBJECT.test(cookie.domain)) {
              const err = new Error("Cookie has domain set to a public suffix");
              return options?.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
            }
          } catch (err) {
            return options?.ignoreError ? promiseCallback.resolve(void 0) : (
promiseCallback.reject(err)
            );
          }
        }
        if (cookie.domain) {
          if (!domainMatch(host ?? void 0, cookie.cdomain() ?? void 0, false)) {
            const err = new Error(
              `Cookie not in this host's domain. Cookie:${cookie.cdomain() ?? "null"} Request:${host ?? "null"}`
            );
            return options?.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
          }
          if (cookie.hostOnly == null) {
            cookie.hostOnly = false;
          }
        } else {
          cookie.hostOnly = true;
          cookie.domain = host;
        }
        if (!cookie.path || cookie.path[0] !== "/") {
          cookie.path = defaultPath(context.pathname);
          cookie.pathIsDefault = true;
        }
        if (options?.http === false && cookie.httpOnly) {
          const err = new Error("Cookie is HttpOnly and this isn't an HTTP API");
          return options.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
        }
        if (cookie.sameSite !== "none" && cookie.sameSite !== void 0 && sameSiteContext) {
          if (sameSiteContext === "none") {
            const err = new Error(
              "Cookie is SameSite but this is a cross-origin request"
            );
            return options?.ignoreError ? promiseCallback.resolve(void 0) : promiseCallback.reject(err);
          }
        }
        const ignoreErrorForPrefixSecurity = this.prefixSecurity === PrefixSecurityEnum.SILENT;
        const prefixSecurityDisabled = this.prefixSecurity === PrefixSecurityEnum.DISABLED;
        if (!prefixSecurityDisabled) {
          let errorFound = false;
          let errorMsg;
          if (!isSecurePrefixConditionMet(cookie)) {
            errorFound = true;
            errorMsg = "Cookie has __Secure prefix but Secure attribute is not set";
          } else if (!isHostPrefixConditionMet(cookie)) {
            errorFound = true;
            errorMsg = "Cookie has __Host prefix but either Secure or HostOnly attribute is not set or Path is not '/'";
          }
          if (errorFound) {
            return options?.ignoreError || ignoreErrorForPrefixSecurity ? promiseCallback.resolve(void 0) : promiseCallback.reject(new Error(errorMsg));
          }
        }
        const store = this.store;
        if (!store.updateCookie) {
          store.updateCookie = async function(_oldCookie, newCookie, cb2) {
            return this.putCookie(newCookie).then(
              () => cb2?.(null),
              (error2) => cb2?.(error2)
            );
          };
        }
        const withCookie = function withCookie2(err, oldCookie) {
          if (err) {
            cb(err);
            return;
          }
          const next2 = function(err2) {
            if (err2) {
              cb(err2);
            } else if (typeof cookie === "string") {
              cb(null, void 0);
            } else {
              cb(null, cookie);
            }
          };
          if (oldCookie) {
            if (options && "http" in options && options.http === false && oldCookie.httpOnly) {
              err = new Error("old Cookie is HttpOnly and this isn't an HTTP API");
              if (options.ignoreError) cb(null, void 0);
              else cb(err);
              return;
            }
            if (cookie instanceof Cookie) {
              cookie.creation = oldCookie.creation;
              cookie.creationIndex = oldCookie.creationIndex;
              cookie.lastAccessed = now;
              store.updateCookie(oldCookie, cookie, next2);
            }
          } else {
            if (cookie instanceof Cookie) {
              cookie.creation = cookie.lastAccessed = now;
              store.putCookie(cookie, next2);
            }
          }
        };
        store.findCookie(cookie.domain, cookie.path, cookie.key, withCookie);
        return promiseCallback.promise;
      }
setCookieSync(cookie, url, options) {
        const setCookieFn = options ? this.setCookie.bind(this, cookie, url, options) : this.setCookie.bind(this, cookie, url);
        return this.callSync(setCookieFn);
      }
getCookies(url, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = defaultGetCookieOptions;
        } else if (options === void 0) {
          options = defaultGetCookieOptions;
        }
        const promiseCallback = createPromiseCallback(callback);
        const cb = promiseCallback.callback;
        let context;
        try {
          if (typeof url === "string") {
            validate(isNonEmptyString(url), cb, url);
          }
          context = getCookieContext(url);
          validate(
            isObject(options),
            cb,
            safeToString(options)
          );
          validate(typeof cb === "function", cb);
        } catch (parameterError) {
          return promiseCallback.reject(parameterError);
        }
        const host = canonicalDomain(context.hostname);
        const path = context.pathname || "/";
        const potentiallyTrustworthy = isPotentiallyTrustworthy(
          url,
          this.allowSecureOnLocal
        );
        let sameSiteLevel = 0;
        if (options.sameSiteContext) {
          const sameSiteContext = checkSameSiteContext(options.sameSiteContext);
          if (sameSiteContext == null) {
            return promiseCallback.reject(new Error(SAME_SITE_CONTEXT_VAL_ERR));
          }
          sameSiteLevel = Cookie.sameSiteLevel[sameSiteContext];
          if (!sameSiteLevel) {
            return promiseCallback.reject(new Error(SAME_SITE_CONTEXT_VAL_ERR));
          }
        }
        const http2 = options.http ?? true;
        const now = Date.now();
        const expireCheck = options.expire ?? true;
        const allPaths = options.allPaths ?? false;
        const store = this.store;
        function matchingCookie(c) {
          if (c.hostOnly) {
            if (c.domain != host) {
              return false;
            }
          } else {
            if (!domainMatch(host ?? void 0, c.domain ?? void 0, false)) {
              return false;
            }
          }
          if (!allPaths && typeof c.path === "string" && !pathMatch(path, c.path)) {
            return false;
          }
          if (c.secure && !potentiallyTrustworthy) {
            return false;
          }
          if (c.httpOnly && !http2) {
            return false;
          }
          if (sameSiteLevel) {
            let cookieLevel;
            if (c.sameSite === "lax") {
              cookieLevel = Cookie.sameSiteLevel.lax;
            } else if (c.sameSite === "strict") {
              cookieLevel = Cookie.sameSiteLevel.strict;
            } else {
              cookieLevel = Cookie.sameSiteLevel.none;
            }
            if (cookieLevel > sameSiteLevel) {
              return false;
            }
          }
          const expiryTime = c.expiryTime();
          if (expireCheck && expiryTime != void 0 && expiryTime <= now) {
            store.removeCookie(c.domain, c.path, c.key, () => {
            });
            return false;
          }
          return true;
        }
        store.findCookies(
          host,
          allPaths ? null : path,
          this.allowSpecialUseDomain,
          (err, cookies) => {
            if (err) {
              cb(err);
              return;
            }
            if (cookies == null) {
              cb(null, []);
              return;
            }
            cookies = cookies.filter(matchingCookie);
            if ("sort" in options && options.sort !== false) {
              cookies = cookies.sort(cookieCompare);
            }
            const now2 = new Date();
            for (const cookie of cookies) {
              cookie.lastAccessed = now2;
            }
            cb(null, cookies);
          }
        );
        return promiseCallback.promise;
      }
getCookiesSync(url, options) {
        return this.callSync(this.getCookies.bind(this, url, options)) ?? [];
      }
getCookieString(url, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = void 0;
        }
        const promiseCallback = createPromiseCallback(callback);
        const next2 = function(err, cookies) {
          if (err) {
            promiseCallback.callback(err);
          } else {
            promiseCallback.callback(
              null,
              cookies?.sort(cookieCompare).map((c) => c.cookieString()).join("; ")
            );
          }
        };
        this.getCookies(url, options, next2);
        return promiseCallback.promise;
      }
getCookieStringSync(url, options) {
        return this.callSync(
          options ? this.getCookieString.bind(this, url, options) : this.getCookieString.bind(this, url)
        ) ?? "";
      }
getSetCookieStrings(url, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = void 0;
        }
        const promiseCallback = createPromiseCallback(
          callback
        );
        const next2 = function(err, cookies) {
          if (err) {
            promiseCallback.callback(err);
          } else {
            promiseCallback.callback(
              null,
              cookies?.map((c) => {
                return c.toString();
              })
            );
          }
        };
        this.getCookies(url, options, next2);
        return promiseCallback.promise;
      }
getSetCookieStringsSync(url, options = {}) {
        return this.callSync(this.getSetCookieStrings.bind(this, url, options)) ?? [];
      }
serialize(callback) {
        const promiseCallback = createPromiseCallback(callback);
        let type = this.store.constructor.name;
        if (isObject(type)) {
          type = null;
        }
        const serialized = {


version: `tough-cookie@${version}`,
storeType: type,
rejectPublicSuffixes: this.rejectPublicSuffixes,
          enableLooseMode: this.enableLooseMode,
          allowSpecialUseDomain: this.allowSpecialUseDomain,
          prefixSecurity: getNormalizedPrefixSecurity(this.prefixSecurity),
cookies: []
        };
        if (typeof this.store.getAllCookies !== "function") {
          return promiseCallback.reject(
            new Error(
              "store does not support getAllCookies and cannot be serialized"
            )
          );
        }
        this.store.getAllCookies((err, cookies) => {
          if (err) {
            promiseCallback.callback(err);
            return;
          }
          if (cookies == null) {
            promiseCallback.callback(null, serialized);
            return;
          }
          serialized.cookies = cookies.map((cookie) => {
            const serializedCookie = cookie.toJSON();
            delete serializedCookie.creationIndex;
            return serializedCookie;
          });
          promiseCallback.callback(null, serialized);
        });
        return promiseCallback.promise;
      }
serializeSync() {
        return this.callSync((callback) => {
          this.serialize(callback);
        });
      }
toJSON() {
        return this.serializeSync();
      }
_importCookies(serialized, callback) {
        let cookies = void 0;
        if (serialized && typeof serialized === "object" && inOperator("cookies", serialized) && Array.isArray(serialized.cookies)) {
          cookies = serialized.cookies;
        }
        if (!cookies) {
          callback(new Error("serialized jar has no cookies array"), void 0);
          return;
        }
        cookies = cookies.slice();
        const putNext = (err) => {
          if (err) {
            callback(err, void 0);
            return;
          }
          if (Array.isArray(cookies)) {
            if (!cookies.length) {
              callback(err, this);
              return;
            }
            let cookie;
            try {
              cookie = Cookie.fromJSON(cookies.shift());
            } catch (e) {
              callback(e instanceof Error ? e : new Error(), void 0);
              return;
            }
            if (cookie === void 0) {
              putNext(null);
              return;
            }
            this.store.putCookie(cookie, putNext);
          }
        };
        putNext(null);
      }
_importCookiesSync(serialized) {
        this.callSync(this._importCookies.bind(this, serialized));
      }
clone(newStore, callback) {
        if (typeof newStore === "function") {
          callback = newStore;
          newStore = void 0;
        }
        const promiseCallback = createPromiseCallback(callback);
        const cb = promiseCallback.callback;
        this.serialize((err, serialized) => {
          if (err) {
            return promiseCallback.reject(err);
          }
          return _CookieJar.deserialize(serialized ?? "", newStore, cb);
        });
        return promiseCallback.promise;
      }
_cloneSync(newStore) {
        const cloneFn = newStore && typeof newStore !== "function" ? this.clone.bind(this, newStore) : this.clone.bind(this);
        return this.callSync((callback) => {
          cloneFn(callback);
        });
      }
cloneSync(newStore) {
        if (!newStore) {
          return this._cloneSync();
        }
        if (!newStore.synchronous) {
          throw new Error(
            "CookieJar clone destination store is not synchronous; use async API instead."
          );
        }
        return this._cloneSync(newStore);
      }
removeAllCookies(callback) {
        const promiseCallback = createPromiseCallback(callback);
        const cb = promiseCallback.callback;
        const store = this.store;
        if (typeof store.removeAllCookies === "function" && store.removeAllCookies !== Store.prototype.removeAllCookies) {
          store.removeAllCookies(cb);
          return promiseCallback.promise;
        }
        store.getAllCookies((err, cookies) => {
          if (err) {
            cb(err);
            return;
          }
          if (!cookies) {
            cookies = [];
          }
          if (cookies.length === 0) {
            cb(null, void 0);
            return;
          }
          let completedCount = 0;
          const removeErrors = [];
          const removeCookieCb = function removeCookieCb2(removeErr) {
            if (removeErr) {
              removeErrors.push(removeErr);
            }
            completedCount++;
            if (completedCount === cookies.length) {
              if (removeErrors[0]) cb(removeErrors[0]);
              else cb(null, void 0);
              return;
            }
          };
          cookies.forEach((cookie) => {
            store.removeCookie(
              cookie.domain,
              cookie.path,
              cookie.key,
              removeCookieCb
            );
          });
        });
        return promiseCallback.promise;
      }
removeAllCookiesSync() {
        this.callSync((callback) => {
          this.removeAllCookies(callback);
        });
      }
static deserialize(strOrObj, store, callback) {
        if (typeof store === "function") {
          callback = store;
          store = void 0;
        }
        const promiseCallback = createPromiseCallback(callback);
        let serialized;
        if (typeof strOrObj === "string") {
          try {
            serialized = JSON.parse(strOrObj);
          } catch (e) {
            return promiseCallback.reject(e instanceof Error ? e : new Error());
          }
        } else {
          serialized = strOrObj;
        }
        const readSerializedProperty = (property) => {
          return serialized && typeof serialized === "object" && inOperator(property, serialized) ? serialized[property] : void 0;
        };
        const readSerializedBoolean = (property) => {
          const value = readSerializedProperty(property);
          return typeof value === "boolean" ? value : void 0;
        };
        const readSerializedString = (property) => {
          const value = readSerializedProperty(property);
          return typeof value === "string" ? value : void 0;
        };
        const jar = new _CookieJar(store, {
          rejectPublicSuffixes: readSerializedBoolean("rejectPublicSuffixes"),
          looseMode: readSerializedBoolean("enableLooseMode"),
          allowSpecialUseDomain: readSerializedBoolean("allowSpecialUseDomain"),
          prefixSecurity: getNormalizedPrefixSecurity(
            readSerializedString("prefixSecurity") ?? "silent"
          )
        });
        jar._importCookies(serialized, (err) => {
          if (err) {
            promiseCallback.callback(err);
            return;
          }
          promiseCallback.callback(null, jar);
        });
        return promiseCallback.promise;
      }
static deserializeSync(strOrObj, store) {
        const serialized = typeof strOrObj === "string" ? JSON.parse(strOrObj) : strOrObj;
        const readSerializedProperty = (property) => {
          return serialized && typeof serialized === "object" && inOperator(property, serialized) ? serialized[property] : void 0;
        };
        const readSerializedBoolean = (property) => {
          const value = readSerializedProperty(property);
          return typeof value === "boolean" ? value : void 0;
        };
        const readSerializedString = (property) => {
          const value = readSerializedProperty(property);
          return typeof value === "string" ? value : void 0;
        };
        const jar = new _CookieJar(store, {
          rejectPublicSuffixes: readSerializedBoolean("rejectPublicSuffixes"),
          looseMode: readSerializedBoolean("enableLooseMode"),
          allowSpecialUseDomain: readSerializedBoolean("allowSpecialUseDomain"),
          prefixSecurity: getNormalizedPrefixSecurity(
            readSerializedString("prefixSecurity") ?? "silent"
          )
        });
        if (!jar.store.synchronous) {
          throw new Error(
            "CookieJar store is not synchronous; use async API instead."
          );
        }
        jar._importCookiesSync(serialized);
        return jar;
      }
static fromJSON(jsonString, store) {
        return _CookieJar.deserializeSync(jsonString, store);
      }
    };
    function permutePath(path) {
      if (path === "/") {
        return ["/"];
      }
      const permutations = [path];
      while (path.length > 1) {
        const lindex = path.lastIndexOf("/");
        if (lindex === 0) {
          break;
        }
        path = path.slice(0, lindex);
        permutations.push(path);
      }
      permutations.push("/");
      return permutations;
    }
    function parse22(str, options) {
      return Cookie.parse(str, options);
    }
    function fromJSON2(str) {
      return Cookie.fromJSON(str);
    }
return dist$1;
  }
  var browser;
  var hasRequiredBrowser;
  function requireBrowser() {
    if (hasRequiredBrowser) return browser;
    hasRequiredBrowser = 1;
    browser = typeof self === "object" ? self.FormData : window.FormData;
    return browser;
  }
  var mobileCommon = {};
  function wrapper(axios) {
    return axios;
  }
  const noop = Object.freeze( Object.defineProperty({
    __proto__: null,
    wrapper
  }, Symbol.toStringTag, { value: "Module" }));
  const require$$1 = getAugmentedNamespace(noop);
  const __viteBrowserExternal = {};
  const __viteBrowserExternal$1 = Object.freeze( Object.defineProperty({
    __proto__: null,
    default: __viteBrowserExternal
  }, Symbol.toStringTag, { value: "Module" }));
  const require$$4 = getAugmentedNamespace(__viteBrowserExternal$1);
  var hasRequiredMobileCommon;
  function requireMobileCommon() {
    if (hasRequiredMobileCommon) return mobileCommon;
    hasRequiredMobileCommon = 1;
    (function(exports) {
      var __createBinding = mobileCommon && mobileCommon.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = mobileCommon && mobileCommon.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = mobileCommon && mobileCommon.__importStar || (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      var __importDefault = mobileCommon && mobileCommon.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.AJAX_HEADERS = exports.HTML_HEADERS = exports.DEFAULT_MOBILE_UA = exports.DELETE_COMMENT_ENDPOINT = exports.DELETE_POST_ENDPOINT = exports.WRITE_UPLOAD_URL = exports.WRITE_BASE_URL = void 0;
      exports.createMobileClient = createMobileClient;
      exports.getCookiesAsync = getCookiesAsync;
      exports.getWithRedirect = getWithRedirect;
      exports.findBlockOrConKey = findBlockOrConKey;
      exports.parseRedirectFromHtml = parseRedirectFromHtml;
      const axios_12 = __importDefault( requireAxios());
      const axios_cookiejar_support_1 = require$$1;
      const cheerio = __importStar(require$$3);
      const node_url_1 = require$$4;
      exports.WRITE_BASE_URL = "https://m.dcinside.com";
      exports.WRITE_UPLOAD_URL = "https://mupload.dcinside.com/write_new.php";
      exports.DELETE_POST_ENDPOINT = "https://m.dcinside.com/del/board";
      exports.DELETE_COMMENT_ENDPOINT = "https://m.dcinside.com/del/comment";
      exports.DEFAULT_MOBILE_UA = "Mozilla/5.0 (Linux; Android 10; SM-G973N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36";
      exports.HTML_HEADERS = {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "ko,en-US;q=0.9,en;q=0.8",
        "Upgrade-Insecure-Requests": "1"
      };
      exports.AJAX_HEADERS = {
        accept: "*/*",
        "accept-language": "ko,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      };
      function createMobileClient(jar, userAgent) {
        const client = axios_12.default.create({
          jar,
          withCredentials: true,
          timeout: 15e3,
          headers: {
            ...exports.HTML_HEADERS,
            "User-Agent": userAgent || exports.DEFAULT_MOBILE_UA,
            "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"'
          },
          maxRedirects: 0
        });
        return (0, axios_cookiejar_support_1.wrapper)(client);
      }
      function getCookiesAsync(jar, url) {
        return new Promise((resolve, reject) => {
          jar.getCookies(url, (err, cookies) => {
            if (err)
              reject(err);
            else
              resolve(cookies);
          });
        });
      }
      async function getWithRedirect(client, url, options = {}, maxRedirects = 5) {
        let currentUrl = url;
        let redirects = 0;
        const baseOptions = {
          validateStatus: (status) => status >= 200 && status < 400,
          ...options
        };
        let response;
        while (redirects <= maxRedirects) {
          response = await client.get(currentUrl, baseOptions);
          if (response.status >= 300 && response.status < 400) {
            const location2 = response.headers?.location || response.headers?.Location;
            if (!location2)
              break;
            currentUrl = new node_url_1.URL(location2, currentUrl).toString();
            redirects += 1;
            continue;
          }
          break;
        }
        return response;
      }
      function findBlockOrConKey(data2) {
        if (!data2)
          return void 0;
        if (typeof data2 === "string") {
          try {
            return findBlockOrConKey(JSON.parse(data2));
          } catch (_) {
            return void 0;
          }
        }
        return data2.Block_key || data2.block_key || data2.con_key || data2.Con_key || void 0;
      }
      function parseRedirectFromHtml(html2) {
        if (!html2)
          return {};
        const locationMatch = html2.match(/location\.(?:href|replace)\s*\(\s*['"]([^'";]+)['"]/);
        const alertMatch = html2.match(/alert\((['"])(.*?)\1\)/);
        let message = alertMatch ? alertMatch[2] : void 0;
        if (!message) {
          try {
            const $2 = cheerio.load(html2);
            const alertText = $2(".alert-box .txt").first().text().trim();
            if (alertText)
              message = alertText;
          } catch (err) {
          }
        }
        const redirectUrl = locationMatch ? locationMatch[1] : void 0;
        const postMatch = redirectUrl?.match(/\/(\d+)(?:\?|$)/);
        return {
          url: redirectUrl,
          postId: postMatch ? postMatch[1] : void 0,
          message
        };
      }
    })(mobileCommon);
    return mobileCommon;
  }
  var hasRequiredMobileWrite;
  function requireMobileWrite() {
    if (hasRequiredMobileWrite) return mobileWrite;
    hasRequiredMobileWrite = 1;
    var __createBinding = mobileWrite && mobileWrite.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = mobileWrite && mobileWrite.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = mobileWrite && mobileWrite.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __importDefault = mobileWrite && mobileWrite.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(mobileWrite, "__esModule", { value: true });
    mobileWrite.createMobilePost = createMobilePost;
    mobileWrite.deleteMobilePost = deleteMobilePost;
    const tough_cookie_1 = requireDist$1();
    const cheerio = __importStar(require$$3);
    const form_data_1 = __importDefault(requireBrowser());
    const mobileCommon_1 = requireMobileCommon();
    function collectFormFields(html2) {
      const $2 = cheerio.load(html2);
      const form = $2("#writeForm");
      if (!form.length)
        throw new Error("글쓰기 폼을 찾을 수 없습니다.");
      const csrfToken = $2('meta[name="csrf-token"]').attr("content") || "";
      const fields = {};
      form.find("input[name], textarea[name], select[name]").each((_, el) => {
        const name = $2(el).attr("name");
        if (!name)
          return;
        if ($2(el).is("textarea")) {
          fields[name] = $2(el).text() || "";
        } else if ($2(el).is("select")) {
          const selected = $2(el).find("option:selected");
          fields[name] = selected.attr("value") ?? $2(el).attr("value") ?? "";
        } else {
          fields[name] = $2(el).attr("value") ?? "";
        }
      });
      return { fields, csrfToken };
    }
    function applyGuestFields(fields, nickname, password) {
      if ("name" in fields)
        fields.name = nickname;
      if ("password" in fields)
        fields.password = password;
      if ("gall_nickname" in fields)
        fields.gall_nickname = nickname;
      if ("use_gall_nickname" in fields)
        fields.use_gall_nickname = "0";
      if ("user_id" in fields)
        fields.user_id = fields.user_id || "";
    }
    function normaliseHeadText(value, current) {
      if (value === void 0 || value === null)
        return current ?? "0";
      if (typeof value === "number")
        return String(value);
      return value;
    }
    async function createMobilePost(options) {
      const { galleryId, subject, content, headText, nickname, password, useGallNickname, jar: providedJar, userAgent, extraFields } = options;
      if (!galleryId)
        throw new Error("galleryId는 필수입니다.");
      if (!subject)
        throw new Error("subject는 필수입니다.");
      if (!content)
        throw new Error("content는 필수입니다.");
      const usingLogin = Boolean(providedJar);
      if (!usingLogin) {
        if (!nickname)
          throw new Error("비로그인 글쓰기는 nickname이 필요합니다.");
        if (!password)
          throw new Error("비로그인 글쓰기는 password가 필요합니다.");
      }
      const jar = providedJar || new tough_cookie_1.CookieJar();
      const client = (0, mobileCommon_1.createMobileClient)(jar, userAgent);
      const writeUrl = `${mobileCommon_1.WRITE_BASE_URL}/write/${encodeURIComponent(galleryId)}`;
      const refererBoard = `${mobileCommon_1.WRITE_BASE_URL}/board/${encodeURIComponent(galleryId)}`;
      if (usingLogin) {
        try {
          await (0, mobileCommon_1.getWithRedirect)(client, refererBoard, {
            headers: {
              ...mobileCommon_1.HTML_HEADERS,
              Referer: `${mobileCommon_1.WRITE_BASE_URL}/`
            },
            responseType: "text"
          });
        } catch (err) {
        }
      }
      const writePage = await (0, mobileCommon_1.getWithRedirect)(client, writeUrl, {
        headers: {
          ...mobileCommon_1.HTML_HEADERS,
          Referer: refererBoard
        },
        responseType: "text"
      });
      const { fields, csrfToken } = collectFormFields(writePage.data);
      if (!csrfToken)
        throw new Error("CSRF 토큰을 찾을 수 없습니다.");
      fields.id = galleryId;
      fields.route_id = fields.route_id || galleryId;
      fields.subject = subject;
      fields.memo = content;
      fields.headtext = normaliseHeadText(headText, fields.headtext);
      if (useGallNickname !== void 0 && "use_gall_nickname" in fields) {
        fields.use_gall_nickname = useGallNickname ? "1" : "0";
      }
      if (!usingLogin && nickname && password) {
        applyGuestFields(fields, nickname, password);
      } else if (usingLogin) {
        if ("password" in fields)
          delete fields.password;
        if ("name" in fields)
          delete fields.name;
        if (nickname && "gall_nickname" in fields)
          fields.gall_nickname = nickname;
      }
      const honeyFieldName = Object.keys(fields).find((key) => key.startsWith("honey_"));
      if (honeyFieldName) {
        fields.GEY3JWF = honeyFieldName;
      }
      if (extraFields) {
        for (const [key, value] of Object.entries(extraFields)) {
          if (value === void 0)
            continue;
          fields[key] = value;
        }
      }
      const resolvedNickname = nickname || fields.gall_nickname || fields.user_id || "";
      if (resolvedNickname && !usingLogin) {
        if ("gall_nickname" in fields && !fields.gall_nickname)
          fields.gall_nickname = resolvedNickname;
        if ("name" in fields && !fields.name)
          fields.name = resolvedNickname;
      }
      const ajaxHeaders = {
        ...mobileCommon_1.AJAX_HEADERS,
        "x-csrf-token": csrfToken,
        Referer: writeUrl
      };
      const accessRes = await client.post(`${mobileCommon_1.WRITE_BASE_URL}/ajax/access`, new URLSearchParams({ token_verify: "dc_check2" }).toString(), {
        headers: ajaxHeaders,
        validateStatus: (status) => status >= 200 && status < 400
      });
      const accessKey = (0, mobileCommon_1.findBlockOrConKey)(accessRes.data);
      if (accessKey)
        fields.Block_key = accessKey;
      const filterPayload = new URLSearchParams({
        subject,
        memo: content,
        id: galleryId,
        mode: "write",
        is_mini: "0",
        is_person: "0"
      });
      const filterRes = await client.post(`${mobileCommon_1.WRITE_BASE_URL}/ajax/w_filter`, filterPayload.toString(), {
        headers: ajaxHeaders,
        validateStatus: (status) => status >= 200 && status < 400
      });
      const blockKey = (0, mobileCommon_1.findBlockOrConKey)(filterRes.data);
      if (blockKey)
        fields.Block_key = blockKey;
      if (!fields.dcblock) {
        const cookiesAfterFilter = await (0, mobileCommon_1.getCookiesAsync)(jar, mobileCommon_1.WRITE_BASE_URL);
        const dcblockCookie = cookiesAfterFilter.find((cookie) => cookie.key && cookie.key.length >= 30 && /^\w+$/.test(cookie.key));
        if (dcblockCookie) {
          fields.dcblock = dcblockCookie.value || "";
          if (!fields.Block_key)
            fields.Block_key = dcblockCookie.value || "";
        }
      }
      const form = new form_data_1.default();
      for (const [key, value] of Object.entries(fields)) {
        const val2 = value ?? "";
        if (key === "files")
          continue;
        form.append(key, val2);
      }
      form.append("files", Buffer.from(""), { filename: "", contentType: "application/octet-stream" });
      const submitHeaders = {
        ...form.getHeaders(),
        ...mobileCommon_1.HTML_HEADERS,
        Referer: writeUrl,
        "User-Agent": userAgent || mobileCommon_1.DEFAULT_MOBILE_UA,
        "x-csrf-token": csrfToken,
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "sec-fetch-user": "?1"
      };
      const submitRes = await client.post(mobileCommon_1.WRITE_UPLOAD_URL, form, {
        headers: submitHeaders,
        responseType: "text",
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      const html2 = submitRes.data;
      const { url: redirectUrl, postId, message } = (0, mobileCommon_1.parseRedirectFromHtml)(html2);
      const success = submitRes.status >= 200 && submitRes.status < 400 && (!message || /등록되었습니다/.test(message));
      return {
        success,
        postId,
        redirectUrl,
        message,
        finalHtml: html2,
        responseStatus: submitRes.status
      };
    }
    async function deleteMobilePost(options) {
      const { galleryId, postId, jar: providedJar, password, userAgent } = options;
      if (!galleryId)
        throw new Error("galleryId는 필수입니다.");
      if (postId === void 0 || postId === null)
        throw new Error("postId는 필수입니다.");
      const jar = providedJar || new tough_cookie_1.CookieJar();
      const client = (0, mobileCommon_1.createMobileClient)(jar, userAgent);
      const postUrl = `${mobileCommon_1.WRITE_BASE_URL}/board/${encodeURIComponent(galleryId)}/${encodeURIComponent(String(postId))}`;
      const boardReferer = `${mobileCommon_1.WRITE_BASE_URL}/board/${encodeURIComponent(galleryId)}`;
      const usingLogin = Boolean(providedJar);
      if (usingLogin) {
        try {
          await (0, mobileCommon_1.getWithRedirect)(client, boardReferer, {
            headers: {
              ...mobileCommon_1.HTML_HEADERS,
              Referer: `${mobileCommon_1.WRITE_BASE_URL}/`
            },
            responseType: "text"
          });
        } catch (err) {
        }
      }
      const viewRes = await (0, mobileCommon_1.getWithRedirect)(client, postUrl, {
        headers: {
          ...mobileCommon_1.HTML_HEADERS,
          Referer: boardReferer
        },
        responseType: "text"
      });
      const $2 = cheerio.load(viewRes.data);
      const csrfToken = $2('meta[name="csrf-token"]').attr("content") || "";
      if (!csrfToken)
        throw new Error("CSRF 토큰을 찾을 수 없습니다.");
      const accessHeaders = {
        ...mobileCommon_1.AJAX_HEADERS,
        "x-csrf-token": csrfToken,
        Referer: postUrl
      };
      const accessRes = await client.post(`${mobileCommon_1.WRITE_BASE_URL}/ajax/access`, new URLSearchParams({ token_verify: "board_Del" }).toString(), {
        headers: accessHeaders,
        validateStatus: (status) => status >= 200 && status < 400
      });
      const conKey = (0, mobileCommon_1.findBlockOrConKey)(accessRes.data);
      if (!conKey)
        throw new Error("삭제용 키(con_key)를 얻지 못했습니다.");
      const deleteParams = new URLSearchParams({
        id: galleryId,
        no: String(postId),
        con_key: conKey
      });
      if (password) {
        deleteParams.set("password", password);
      }
      const deleteRes = await client.post(mobileCommon_1.DELETE_POST_ENDPOINT, deleteParams.toString(), {
        headers: accessHeaders,
        responseType: "text",
        validateStatus: (status) => status >= 200 && status < 400
      });
      const responseHtml = deleteRes.data;
      let success = deleteRes.status >= 200 && deleteRes.status < 400;
      let message;
      if (responseHtml) {
        const trimmed = responseHtml.trim();
        if (trimmed.startsWith("{")) {
          try {
            const json = JSON.parse(trimmed);
            if (typeof json.result !== "undefined") {
              success = Boolean(json.result);
            }
            message = json.cause || json.message || message;
          } catch (err) {
          }
        }
        if (!message) {
          const parsed = (0, mobileCommon_1.parseRedirectFromHtml)(responseHtml);
          message = parsed.message;
          if (parsed.message && !/삭제되었습니다|완료/.test(parsed.message)) {
            success = false;
          }
        }
      }
      return {
        success,
        message,
        finalHtml: responseHtml,
        responseStatus: deleteRes.status
      };
    }
    return mobileWrite;
  }
  var mobileComment = {};
  var hasRequiredMobileComment;
  function requireMobileComment() {
    if (hasRequiredMobileComment) return mobileComment;
    hasRequiredMobileComment = 1;
    var __createBinding = mobileComment && mobileComment.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = mobileComment && mobileComment.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = mobileComment && mobileComment.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(mobileComment, "__esModule", { value: true });
    mobileComment.deleteMobileComment = deleteMobileComment;
    const cheerio = __importStar(require$$3);
    const tough_cookie_1 = requireDist$1();
    const mobileCommon_1 = requireMobileCommon();
    async function deleteMobileComment(options) {
      const { galleryId, postId, commentId, jar: providedJar, password, userAgent } = options;
      if (!galleryId)
        throw new Error("galleryId는 필수입니다.");
      if (postId === void 0 || postId === null)
        throw new Error("postId는 필수입니다.");
      if (!commentId)
        throw new Error("commentId는 필수입니다.");
      const jar = providedJar || new tough_cookie_1.CookieJar();
      const client = (0, mobileCommon_1.createMobileClient)(jar, userAgent);
      const postUrl = `${mobileCommon_1.WRITE_BASE_URL}/board/${encodeURIComponent(galleryId)}/${encodeURIComponent(String(postId))}`;
      const boardReferer = `${mobileCommon_1.WRITE_BASE_URL}/board/${encodeURIComponent(galleryId)}`;
      const viewRes = await (0, mobileCommon_1.getWithRedirect)(client, postUrl, {
        headers: {
          ...mobileCommon_1.HTML_HEADERS,
          Referer: boardReferer
        },
        responseType: "text"
      });
      const $2 = cheerio.load(viewRes.data);
      const csrfToken = $2('meta[name="csrf-token"]').attr("content") || "";
      if (!csrfToken)
        throw new Error("CSRF 토큰을 찾을 수 없습니다.");
      const accessHeaders = {
        ...mobileCommon_1.AJAX_HEADERS,
        "x-csrf-token": csrfToken,
        Referer: postUrl
      };
      const conKeyPayload = new URLSearchParams({ token_verify: "com_submitDel" }).toString();
      const accessRes = await client.post(`${mobileCommon_1.WRITE_BASE_URL}/ajax/access`, conKeyPayload, {
        headers: accessHeaders,
        validateStatus: (status) => status >= 200 && status < 400
      });
      const conKey = (0, mobileCommon_1.findBlockOrConKey)(accessRes.data);
      if (!conKey)
        throw new Error("댓글 삭제용 키(con_key)를 얻지 못했습니다.");
      const boardId = $2('input[name="board_id"]').attr("value") || "";
      const bestChk = $2('input[name="best_chk"]').attr("value");
      const deleteParams = new URLSearchParams({
        id: galleryId,
        no: String(postId),
        comment_no: String(commentId),
        con_key: conKey
      });
      if (boardId)
        deleteParams.set("board_id", boardId);
      if (bestChk !== void 0)
        deleteParams.set("best_chk", bestChk || "");
      if (password)
        deleteParams.set("password", password);
      const deleteRes = await client.post(mobileCommon_1.DELETE_COMMENT_ENDPOINT, deleteParams.toString(), {
        headers: accessHeaders,
        responseType: "text",
        validateStatus: (status) => status >= 200 && status < 400
      });
      const responseHtml = deleteRes.data;
      const { message } = (0, mobileCommon_1.parseRedirectFromHtml)(responseHtml || "");
      const success = deleteRes.status >= 200 && deleteRes.status < 400 && (!message || /삭제되었습니다|완료/.test(message));
      return {
        success,
        message,
        finalHtml: responseHtml,
        responseStatus: deleteRes.status
      };
    }
    return mobileComment;
  }
  var post;
  var hasRequiredPost;
  function requirePost() {
    if (hasRequiredPost) return post;
    hasRequiredPost = 1;
    const { getPostContent } = requirePost$1();
    const { getCommentsForPost } = requireComments();
    const { extractText, replaceImagesWithPlaceholder, processImages } = requireHtml();
    const { getMobilePostContent, parseMobilePostHtml } = requireMobilePost();
    const { createMobilePost, deleteMobilePost } = requireMobileWrite();
    const { deleteMobileComment } = requireMobileComment();
    post = {
getPostContent,
      getCommentsForPost,
      extractText,
      replaceImagesWithPlaceholder,
      processImages,
getMobilePostContent,
      parseMobilePostHtml,
      createMobilePost,
      deleteMobilePost,
      deleteMobileComment
    };
    return post;
  }
  var scraper;
  var hasRequiredScraper;
  function requireScraper() {
    if (hasRequiredScraper) return scraper;
    hasRequiredScraper = 1;
    const board2 = requireBoard();
    const post2 = requirePost();
    scraper = {
scrapeBoardPages: board2.scrapeBoardPage,
      scrapeBoardPage: board2.scrapeBoardPage,
scrapeBoardPageLegacy: board2.scrapeBoardPageLegacy,

getPostContent: post2.getPostContent,
      getCommentsForPost: post2.getCommentsForPost,
      extractText: post2.extractText,
      replaceImagesWithPlaceholder: post2.replaceImagesWithPlaceholder,
      processImages: post2.processImages,
getMobilePostContent: post2.getMobilePostContent,
      parseMobilePostHtml: post2.parseMobilePostHtml,
      createMobilePost: post2.createMobilePost,
      deleteMobilePost: post2.deleteMobilePost,
      deleteMobileComment: post2.deleteMobileComment
    };
    return scraper;
  }
  var autocomplete;
  var hasRequiredAutocomplete;
  function requireAutocomplete() {
    if (hasRequiredAutocomplete) return autocomplete;
    hasRequiredAutocomplete = 1;
    const util_1 = requireUtil();
    const config = requireConfig();
    const http_1 = requireHttp();
    const { USER_AGENT } = config.HTTP;
    const DEFAULT_HEADERS = {
      "User-Agent": USER_AGENT,
      "Accept": "*/*",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Referer": "https://www.dcinside.com/"
    };
    function encodeAutocompleteKey(query) {
      if (typeof query !== "string")
        return "";
      const bytes = Buffer.from(query, "utf8");
      return Array.from(bytes).map((b) => "." + b.toString(16).toUpperCase().padStart(2, "0")).join("");
    }
    function buildJsonpCallback() {
      const ts = Date.now();
      const rand = Math.floor(Math.random() * 1e17).toString().padStart(17, "0");
      return { callback: `jQuery${rand}_${ts}`, ts };
    }
    async function fetchWithRetry(url, options = {}) {
      return (0, http_1.getWithRetry)(url, { ...options, headers: { ...DEFAULT_HEADERS, ...options.headers || {} } });
    }
    async function getAutocomplete(query) {
      if (!query || typeof query !== "string") {
        throw new util_1.CrawlError("유효한 검색어(query)가 필요합니다.", "parse");
      }
      const { callback, ts } = buildJsonpCallback();
      const url = "https://search.dcinside.com/autocomplete";
      const params = {
        callback,
        t: ts,
        k: encodeAutocompleteKey(query),
        _: ts
      };
      try {
        const data2 = await fetchWithRetry(url, {
          params,
          responseType: "text"
        });
        if (typeof data2 !== "string") {
          throw new util_1.CrawlError("자동완성 응답이 문자열이 아닙니다.", "parse");
        }
        const start = data2.indexOf("(");
        const end2 = data2.lastIndexOf(")");
        if (start === -1 || end2 === -1 || end2 <= start) {
          throw new util_1.CrawlError("자동완성 JSONP 파싱 실패", "parse", null, { snippet: data2.slice(0, 120) });
        }
        const jsonText = data2.slice(start + 1, end2).trim();
        return JSON.parse(jsonText);
      } catch (error2) {
        if (error2 instanceof util_1.CrawlError)
          throw error2;
        throw new util_1.CrawlError(`자동완성 처리 중 오류: ${error2.message}`, "unknown", error2);
      }
    }
    autocomplete = { getAutocomplete, encodeAutocompleteKey };
    return autocomplete;
  }
  var parse = {};
  var hasRequiredParse;
  function requireParse() {
    if (hasRequiredParse) return parse;
    hasRequiredParse = 1;
    var __createBinding = parse && parse.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = parse && parse.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = parse && parse.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(parse, "__esModule", { value: true });
    parse.parseSearchHtml = parseSearchHtml;
    const cheerio = __importStar(require$$3);
    const util_1 = requireUtil();
    function parseSearchHtml(html2, baseUrl = "https://search.dcinside.com") {
      if (typeof html2 !== "string" || !html2.trim()) {
        throw new util_1.CrawlError("검색 응답이 비어있습니다.", "parse");
      }
      const $2 = cheerio.load(html2);
      const query = $2("input.in_keyword").attr("value") || void 0;
      const galleries = [];
      const seenGalleryLinks = new Set();
      const gallContainerSelector = "li, .result, .sch_result, .box_result, tr, .wrap_result, .gall_result, .result_item";
      const gallAnchorSelector = 'a[href*="/board/lists/?id="], a[href*="/mgallery/board/lists/?id="], a[href*="/mini/board/lists/?id="]';
      $2(gallContainerSelector).each((_, el) => {
        const container = $2(el);
        const anchors = container.find(gallAnchorSelector);
        if (!anchors.length)
          return;
        let a = anchors.filter((_2, x) => $2(x).text().trim().length > 0).first();
        if (!a.length)
          a = anchors.first();
        const link = a.attr("href");
        if (!link || seenGalleryLinks.has(link))
          return;
        let name = a.text().trim();
        if (!name)
          name = container.find(".tit, .title, .name, strong, a").first().text().trim();
        let id, type, galleryType;
        try {
          const u = new URL(link, baseUrl);
          id = u.searchParams.get("id") || void 0;
          if (u.pathname.includes("/mgallery/"))
            type = "mgallery";
          else if (u.pathname.includes("/mini/"))
            type = "mini";
          else if (u.pathname.includes("/person/"))
            type = "person";
          else
            type = "board";
          galleryType = type === "board" ? "main" : type;
        } catch {
        }
        const rankEl = container.find('.rank, [class*="rank"]').first();
        const toNum = (t) => {
          const s = (t || "").replace(/[^\d]/g, "");
          return s ? Number(s) : void 0;
        };
        const rank = rankEl.length ? toNum(rankEl.text()) : void 0;
        const fullText = container.text().replace(/\s+/g, " ").trim();
        let new_post, total_post;
        const m = fullText.match(/\s*글\s*([\d,]+)\s*\/\s*([\d,]+)/);
        if (m) {
          new_post = Number(m[1].replace(/,/g, ""));
          total_post = Number(m[2].replace(/,/g, ""));
        }
        galleries.push({ name, id, type, galleryType, link, rank, new_post, total_post });
        seenGalleryLinks.add(link);
      });
      const posts = [];
      const seenLinks = new Set();
      const containerSelector = ".sch_result li";
      $2(containerSelector).each((_, el) => {
        const container = $2(el);
        const anchors = container.find('a[href*="/board/view/?id="]');
        if (!anchors.length)
          return;
        let a = container.find('a.tit_txt[href*="/board/view/?id="]').first();
        if (!a.length)
          a = anchors.filter((_2, x) => {
            const t = $2(x).text().trim();
            return t && !/갤러리/.test(t);
          }).first();
        if (!a.length)
          a = anchors.first();
        const link = a.attr("href");
        if (!link || seenLinks.has(link))
          return;
        let title = a.text().trim();
        if (!title)
          title = container.find(".tit, .title, strong, a").first().text().trim();
        let content = container.find("p.link_dsc_txt:not(.dsc_sub)").first().text().replace(/\s+/g, " ").trim();
        if (!content) {
          const noiseRe = /(최신|정확|검색|공식)/;
          const arr = [];
          container.find(".desc, .txt, .cont, p").each((_2, x) => {
            const t = $2(x).text().replace(/\s+/g, " ").trim();
            if (t && t.length >= 8 && !noiseRe.test(t))
              arr.push(t);
          });
          if (arr.length) {
            arr.sort((a2, b) => b.length - a2.length);
            content = arr[0];
          }
        }
        let date = "";
        const ds = container.find("span.date_time").first().text().trim();
        const ct = container.text().replace(/\s+/g, " ");
        const dm = ds || ct.match(/(\d{4}|\d{2})[./-](\d{1,2})[./-](\d{1,2})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/);
        if (dm)
          date = typeof dm === "string" ? dm : dm[0];
        let galleryId, galleryName, galleryType;
        try {
          const u = new URL(link, baseUrl);
          galleryId = u.searchParams.get("id") || void 0;
          if (u.pathname.includes("/mgallery/"))
            galleryType = "mgallery";
          else if (u.pathname.includes("/mini/"))
            galleryType = "mini";
          else if (u.pathname.includes("/person/"))
            galleryType = "person";
          else
            galleryType = "main";
        } catch {
        }
        const nameFromSub = container.find("p.link_dsc_txt.dsc_sub a.sub_txt").first().text().trim();
        const nameFromCate = !nameFromSub ? container.find(".gall, .board, .name, .cate a, .cate, .category").first().text().trim() : "";
        const nameFromSuffix = !nameFromSub ? container.find("*").filter((_2, x) => /갤러리/.test($2(x).text().trim())).first().text().trim() : "";
        galleryName = nameFromSub || nameFromCate || nameFromSuffix || void 0;
        posts.push({ title, content, galleryName, galleryId, galleryType, date, link });
        seenLinks.add(link);
      });
      return { query, galleries, posts };
    }
    return parse;
  }
  var search_1;
  var hasRequiredSearch;
  function requireSearch() {
    if (hasRequiredSearch) return search_1;
    hasRequiredSearch = 1;
    const config = requireConfig();
    const http_1 = requireHttp();
    const util_1 = requireUtil();
    const { encodeAutocompleteKey } = requireAutocomplete();
    const parse_1 = requireParse();
    const DEFAULT_HEADERS = {
      "User-Agent": config.HTTP.USER_AGENT,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Referer": "https://www.dcinside.com/"
    };
    async function fetchWithRetry(url, options = {}) {
      return (0, http_1.getWithRetry)(url, { ...options, headers: { ...DEFAULT_HEADERS, ...options.headers || {} }, responseType: "text" });
    }
    async function search(query, options = {}) {
      if (!query || typeof query !== "string")
        throw new util_1.CrawlError("유효한 검색어(query)가 필요합니다", "parse");
      const k = encodeAutocompleteKey(query);
      const sort = options && (options.sort === "latest" || options.sort === "accuracy") ? options.sort : void 0;
      const sortPath = sort ? `/sort/${sort}` : "";
      const url = `https://search.dcinside.com/combine${sortPath}/q/${k}`;
      const html2 = await fetchWithRetry(url);
      return (0, parse_1.parseSearchHtml)(html2, "https://search.dcinside.com");
    }
    search_1 = { search, parseSearchHtml: parse_1.parseSearchHtml };
    return search_1;
  }
  var mobileLogin = {};
  var hasRequiredMobileLogin;
  function requireMobileLogin() {
    if (hasRequiredMobileLogin) return mobileLogin;
    hasRequiredMobileLogin = 1;
    var __createBinding = mobileLogin && mobileLogin.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = mobileLogin && mobileLogin.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = mobileLogin && mobileLogin.__importStar || (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __importDefault = mobileLogin && mobileLogin.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(mobileLogin, "__esModule", { value: true });
    mobileLogin.MOBILE_LOGIN_DEFAULTS = void 0;
    mobileLogin.mobileLogin = mobileLogin$1;
    const axios_12 = __importDefault( requireAxios());
    const axios_cookiejar_support_1 = require$$1;
    const tough_cookie_1 = requireDist$1();
    const cheerio = __importStar(require$$3);
    const node_url_1 = require$$4;
    const config = requireConfig();
    const LOGIN_ORIGIN = "https://msign.dcinside.com";
    const LOGIN_PATH = "/login";
    const LOGIN_URL = `${LOGIN_ORIGIN}${LOGIN_PATH}`;
    const LOGIN_ACCESS_URL = `${LOGIN_ORIGIN}/login/access`;
    const DEFAULT_RETURN_URL = "https://m.dcinside.com";
    const DEFAULT_MOBILE_UA = "Mozilla/5.0 (Linux; Android 10; SM-G973N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36";
    const MOBILE_HTML_HEADERS = {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "ko,en-US;q=0.9,en;q=0.8",
      "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-site",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    };
    const AJAX_HEADERS = {
      accept: "*/*",
      "accept-language": "ko,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      origin: LOGIN_ORIGIN
    };
    const getCookiesAsync = async (jar, url) => {
      return await jar.getCookies(url);
    };
    const toCookieInfo = (cookie) => {
      let expires;
      const rawExpires = cookie.expires;
      if (rawExpires && typeof rawExpires !== "string" && typeof rawExpires.getTime === "function") {
        const time = rawExpires.getTime();
        if (Number.isFinite(time)) {
          expires = new Date(time).toISOString();
        }
      }
      return {
        key: cookie.key,
        value: cookie.value,
        domain: cookie.domain || "",
        path: cookie.path || "/",
        httpOnly: Boolean(cookie.httpOnly),
        secure: Boolean(cookie.secure),
        expires
      };
    };
    const resolveLocation = (fromUrl, location2) => {
      try {
        return new node_url_1.URL(location2, fromUrl).toString();
      } catch (_) {
        return location2;
      }
    };
    const createMobileAxios = (jar, userAgent) => {
      const headersUA = userAgent || DEFAULT_MOBILE_UA;
      return (0, axios_cookiejar_support_1.wrapper)(axios_12.default.create({
        timeout: config.HTTP.TIMEOUT,
        withCredentials: true,
        headers: {
          ...MOBILE_HTML_HEADERS,
          "User-Agent": headersUA
        },
        jar,
        maxRedirects: 0
      }));
    };
    const extractLoginTokens = (html2, fallbackReturnUrl) => {
      const $2 = cheerio.load(html2);
      const csrfToken = $2('meta[name="csrf-token"]').attr("content") || "";
      const conKey = $2("#conKey").attr("value") || "";
      const rUrl = $2("#r_url").attr("value") || fallbackReturnUrl;
      const formToken = $2('input[name="_token"]').attr("value") || "";
      if (!csrfToken || !conKey) {
        throw new Error("로그인 페이지에서 토큰을 추출하지 못했습니다.");
      }
      return {
        tokens: {
          csrfToken,
          conKey,
          formToken,
          returnUrl: rUrl
        },
        html: html2
      };
    };
    const fetchLoginPage = async (client, returnUrl, referer) => {
      const response = await client.get(`${LOGIN_URL}?r_url=${encodeURIComponent(returnUrl)}`, {
        responseType: "text",
        headers: {
          ...MOBILE_HTML_HEADERS,
          referer
        }
      });
      return extractLoginTokens(response.data, returnUrl);
    };
    const preflightAccessCheck = async (client, tokens, code) => {
      const payload = new URLSearchParams({
        token_verify: "dc_login",
        conKey: tokens.conKey,
        code,
        randcode: "undefined"
      });
      const response = await client.post(LOGIN_ACCESS_URL, payload.toString(), {
        headers: {
          ...AJAX_HEADERS,
          "x-csrf-token": tokens.csrfToken,
          referer: `${LOGIN_URL}?r_url=${encodeURIComponent(tokens.returnUrl)}`
        },
        validateStatus: (status) => status >= 200 && status < 300
      });
      return typeof response.data === "object" && response.data || {};
    };
    const extractFailureMessage = (html2) => {
      if (!html2)
        return void 0;
      try {
        const $2 = cheerio.load(html2);
        const candidate = $2(".login-alert, .login-error, #error_msg").first().text().trim();
        if (candidate)
          return candidate;
      } catch (err) {
      }
      const alertMatch = html2.match(/alert\((['"])(.*?)\1\)/);
      if (alertMatch && alertMatch[2]) {
        return alertMatch[2];
      }
      return void 0;
    };
    const sanitizeHeaders = (headers = {}) => {
      const out = {};
      Object.keys(headers || {}).forEach((key) => {
        if (!key)
          return;
        const lower = key.toLowerCase();
        if (lower === "content-length" || lower === "accept-encoding")
          return;
        out[key] = headers[key];
      });
      return out;
    };
    const resolveSecFetchSite = (fromUrl, toUrl) => {
      try {
        const base = new node_url_1.URL(fromUrl);
        const target = new node_url_1.URL(toUrl, fromUrl);
        if (base.origin === target.origin) {
          return "same-origin";
        }
        const baseDomain = base.hostname.split(".").slice(-2).join(".");
        const targetDomain = target.hostname.split(".").slice(-2).join(".");
        if (baseDomain && baseDomain === targetDomain) {
          return "same-site";
        }
      } catch (_) {
      }
      return "cross-site";
    };
    const followRedirectChain = async (client, initialResponse, baseHeaders) => {
      let currentResponse = initialResponse;
      let currentUrl = currentResponse.config?.url ? currentResponse.config.url : LOGIN_URL;
      let redirects = 0;
      const initialHeaders = currentResponse.config?.headers || {};
      const initialReferer = initialHeaders.referer || initialHeaders.Referer;
      while (currentResponse.status >= 300 && currentResponse.status < 400) {
        const location2 = currentResponse.headers?.location || currentResponse.headers?.Location;
        if (!location2)
          break;
        if (redirects > 10) {
          throw new Error("로그인 처리 중 리다이렉트가 과도하게 발생했습니다.");
        }
        const absoluteUrl = resolveLocation(currentUrl, location2);
        const prevConfig = currentResponse.config || {};
        const method = (prevConfig.method || "get").toString().toLowerCase();
        const repeatMethod = currentResponse.status === 307 || currentResponse.status === 308;
        const shouldRepeatPost = repeatMethod && method === "post";
        const prevHeaders = prevConfig.headers || {};
        const referer = prevHeaders.referer || prevHeaders.Referer || initialReferer || currentUrl;
        const normalizedPrevHeaders = { ...prevHeaders };
        delete normalizedPrevHeaders.referer;
        delete normalizedPrevHeaders.Referer;
        const headers = sanitizeHeaders({
          ...MOBILE_HTML_HEADERS,
          ...shouldRepeatPost ? normalizedPrevHeaders : {},
          ...baseHeaders,
          referer
        });
        headers["sec-fetch-site"] = resolveSecFetchSite(currentUrl, absoluteUrl);
        if (shouldRepeatPost) {
          currentResponse = await client.post(absoluteUrl, prevConfig.data, {
            headers,
            validateStatus: (status) => status >= 200 && status < 400,
            responseType: "text"
          });
        } else {
          currentResponse = await client.get(absoluteUrl, {
            headers,
            validateStatus: (status) => status >= 200 && status < 400,
            responseType: "text"
          });
        }
        currentUrl = absoluteUrl;
        redirects += 1;
      }
      return {
        finalResponse: currentResponse,
        finalUrl: currentUrl,
        redirectCount: redirects
      };
    };
    const gatherCookies = async (jar) => {
      const targets = [
        "https://m.dcinside.com",
        "https://msign.dcinside.com",
        "https://gall.dcinside.com",
        "https://www.dcinside.com"
      ];
      const seen = new Map();
      for (const url of targets) {
        const cookies = await getCookiesAsync(jar, url);
        for (const cookie of cookies) {
          const key = `${cookie.domain}|${cookie.path}|${cookie.key}`;
          if (!seen.has(key)) {
            seen.set(key, toCookieInfo(cookie));
          }
        }
      }
      return Array.from(seen.values());
    };
    const buildCookieHeader = async (jar, url) => {
      const cookies = await getCookiesAsync(jar, url);
      return cookies.map((c) => `${c.key}=${c.value}`).join("; ");
    };
    async function mobileLogin$1(options) {
      const { code, password, keepLoggedIn = true, returnUrl = DEFAULT_RETURN_URL, userAgent, jar: providedJar } = options || {};
      if (!code)
        throw new Error("code(식별 코드)는 필수 입력 값입니다.");
      if (!password)
        throw new Error("password(비밀번호)는 필수 입력 값입니다.");
      const jar = providedJar || new tough_cookie_1.CookieJar();
      const client = createMobileAxios(jar, userAgent);
      const { tokens, html: html2 } = await fetchLoginPage(client, returnUrl, DEFAULT_RETURN_URL);
      const preflight = await preflightAccessCheck(client, tokens, code);
      if (preflight?.result === false) {
        return {
          success: false,
          reason: preflight?.message || "로그인 사전 검증 단계에서 실패했습니다.",
          tokens,
          jar,
          cookies: [],
          cookieHeader: "",
          redirectCount: 0,
          finalUrl: LOGIN_URL,
          finalStatus: 0,
          preflight,
          loginPageHtml: html2
        };
      }
      if (preflight && typeof preflight.Block_key === "string" && preflight.Block_key) {
        tokens.conKey = preflight.Block_key;
      }
      const payload = new URLSearchParams({
        code,
        password,
        loginCash: keepLoggedIn ? "on" : "",
        conKey: tokens.conKey,
        r_url: tokens.returnUrl || returnUrl,
        _token: tokens.formToken || tokens.csrfToken || ""
      });
      const loginResponse = await client.post(LOGIN_URL, payload.toString(), {
        headers: {
          ...MOBILE_HTML_HEADERS,
          "content-type": "application/x-www-form-urlencoded",
          origin: LOGIN_ORIGIN,
          "sec-fetch-site": "same-origin",
          referer: `${LOGIN_URL}?r_url=${encodeURIComponent(tokens.returnUrl || returnUrl)}`,
          "x-csrf-token": tokens.csrfToken
        },
        validateStatus: (status) => status === 200 || status === 302 || status === 303 || status === 307,
        responseType: "text"
      });
      if (loginResponse.status === 200) {
        const message = extractFailureMessage(loginResponse.data) || "아이디 또는 비밀번호가 올바르지 않습니다.";
        return {
          success: false,
          reason: message,
          tokens,
          jar,
          cookies: [],
          cookieHeader: "",
          redirectCount: 0,
          finalUrl: LOGIN_URL,
          finalStatus: loginResponse.status,
          preflight,
          loginPageHtml: loginResponse.data,
          finalHtml: loginResponse.data
        };
      }
      const { finalResponse, finalUrl, redirectCount } = await followRedirectChain(client, loginResponse, {
        "User-Agent": userAgent || DEFAULT_MOBILE_UA
      });
      const cookies = await gatherCookies(jar);
      const cookieHeader = await buildCookieHeader(jar, DEFAULT_RETURN_URL);
      const hasLoginCookie = cookies.some((cookie) => ["dc_m_login", "m_dcinside", "remember_secret"].includes(cookie.key));
      const success = hasLoginCookie && finalResponse.status >= 200 && finalResponse.status < 400;
      const finalHtml = typeof finalResponse.data === "string" ? finalResponse.data : void 0;
      return {
        success,
        reason: success ? void 0 : "로그인 최종 단계에서 인증 쿠키를 받지 못했습니다.",
        tokens,
        jar,
        cookies,
        cookieHeader,
        redirectCount,
        finalUrl,
        finalStatus: finalResponse.status,
        finalHtml,
        preflight,
        loginPageHtml: html2
      };
    }
    mobileLogin.MOBILE_LOGIN_DEFAULTS = {
      loginUrl: LOGIN_URL,
      loginAccessUrl: LOGIN_ACCESS_URL,
      defaultReturnUrl: DEFAULT_RETURN_URL,
      defaultUserAgent: DEFAULT_MOBILE_UA
    };
    return mobileLogin;
  }
  var auth;
  var hasRequiredAuth;
  function requireAuth() {
    if (hasRequiredAuth) return auth;
    hasRequiredAuth = 1;
    const mobileLogin_1 = requireMobileLogin();
    auth = {
      mobileLogin: mobileLogin_1.mobileLogin,
      MOBILE_LOGIN_DEFAULTS: mobileLogin_1.MOBILE_LOGIN_DEFAULTS
    };
    return auth;
  }
  var dist;
  var hasRequiredDist;
  function requireDist() {
    if (hasRequiredDist) return dist;
    hasRequiredDist = 1;
    const scraper2 = requireScraper();
    const { delay, getRandomUserAgent } = requireUtil();
    const autocomplete2 = requireAutocomplete();
    const searchModule = requireSearch();
    const auth2 = requireAuth();
    async function getPostList({ page, galleryId, boardType = "all" }) {
      return scraper2.scrapeBoardPage(page, galleryId, { boardType });
    }
    async function getPostListLegacy({ page, galleryId, boardType = "all" }) {
      return scraper2.scrapeBoardPageLegacy(page, galleryId, { boardType });
    }
    async function getPost({ galleryId, postNo, ...rest }) {
      return scraper2.getMobilePostContent(galleryId, postNo, rest);
    }
    async function getPostLegacy({ galleryId, postNo, ...rest }) {
      return scraper2.getPostContent(galleryId, postNo, rest);
    }
    async function getPosts({ galleryId, postNumbers, delayMs = 100, onProgress, ...rest }) {
      const out = [];
      for (let i = 0; i < postNumbers.length; i++) {
        let no = postNumbers[i];
        if (typeof no !== "string" && typeof no !== "number") {
          if (no && typeof no === "object" && (typeof no.id === "string" || typeof no.id === "number"))
            no = no.id;
          else {
            console.warn("Invalid post number entry, skip");
            continue;
          }
        }
        try {
          const post2 = await scraper2.getMobilePostContent(galleryId, no, rest);
          if (post2)
            out.push(post2);
        } catch (e) {
          console.error(`post ${no} error: ${e.message}`);
        }
        if (typeof onProgress === "function")
          onProgress(i + 1, postNumbers.length);
        if (i < postNumbers.length - 1)
          await delay(delayMs);
      }
      return out;
    }
    async function getAutocomplete(query) {
      return autocomplete2.getAutocomplete(query);
    }
    async function search(query, options = {}) {
      return searchModule.search(query, options);
    }
    async function mobileLogin2(options) {
      return auth2.mobileLogin(options);
    }
    async function createPost(options) {
      return scraper2.createMobilePost(options);
    }
    async function deletePost(options) {
      return scraper2.deleteMobilePost(options);
    }
    async function deleteComment(options) {
      return scraper2.deleteMobileComment(options);
    }
    dist = {
      getPostList,
      getPost,
      getPostListLegacy,
      getPostLegacy,
      getPosts,
      getAutocomplete,
      search,
      mobileLogin: mobileLogin2,
      createPost,
      deletePost,
      deleteComment,
      getPostNumbers: getPostList,
      delay,
      getRandomUserAgent,
      raw: { ...scraper2, ...autocomplete2, ...searchModule, ...auth2 }
    };
    return dist;
  }
  var distExports = requireDist();
  let oldLM;
  let currentPage;
  function getPostAuthorIdOrIp() {
    if ((location.pathname.startsWith("/board/") || location.pathname.startsWith("/mini/")) && !location.href.includes("serval=") && document.getElementById("listMore")) {
      oldLM = list_more;
      list_more = async function() {
        oldLM();
        await sleep(0.25);
        currentPage++;
        getPostAuthorId$1();
      };
      currentPage = Number.parseInt(location.href.split("page=")[1]);
      if (Number.isNaN(currentPage)) {
        currentPage = 1;
      }
      getPostAuthorId$1();
    }
  }
  function getPostAuthorId$1() {
    if (!Setting.settings.postList.showPostListAuthorId.value) {
      return;
    }
    Array.from(document.getElementsByClassName("gall-detail-lst")).forEach(async (lst) => {
      const gonickPosts = Array.from(lst.children).filter((e) => !e.classList.contains("adv-inner")).map((e) => {
        const lnktb = Array.from(e.children).find((ce) => ce.classList.contains("gall-detail-lnktb"));
        if (!lnktb) {
          console.warn("gall-detail-lnktb not found");
          return null;
        }
        const lt = Array.from(lnktb.children).find((ce) => ce.classList.contains("lt"));
        if (!lt) {
          console.warn("lt not found");
          return null;
        }
        const ginfo = Array.from(lt.children).find((ce) => ce.classList.contains("ginfo"));
        if (!ginfo) {
          console.warn("ginfo not found");
          return null;
        }
        const spnick = Array.from(ginfo.children).flatMap((ce) => Array.from(ce.children)).find((ce) => ce.classList.contains("sp-nick") || ce.classList.contains("icon_event"));
        return spnick ? { postId: lt.href.split("/")[5], spnick } : null;
      }).filter((e) => e !== null);
      const pis = await distExports.getPostList({
        page: currentPage,
        galleryId: location.pathname.split("/")[2],
        boardType: location.href.includes("recommend=1") ? "recommend" : "all"
      });
      pis.forEach((pi) => {
        const id = pi.id;
        const userId = pi.author.userId;
        if (userId.length === 0) {
          return;
        }
        const spnicks = gonickPosts.filter((gp) => gp.postId.startsWith(id)).map((gp) => gp.spnick);
        spnicks.forEach((thisSpnick) => {
          const parent2 = thisSpnick.parentElement;
          if (!parent2 || Array.from(parent2.children).some((ce) => ce.classList.contains("mdcm-user-id"))) {
            return;
          }
          const span = document.createElement("span");
          span.className = "mdcm-user-id";
          span.textContent = `(${userId})`;
          parent2.appendChild(span);
        });
      });
    });
  }
  function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1e3));
  }
  function getPostAuthorIdOrIpInPost() {
    if (location.pathname.split("/").length === 4) {
      getPostAuthorId();
      getCommentsAuthorId();
      hideUnwantedItems();
    }
  }
  function getPostAuthorId() {
    if (!Setting.settings.post.showPostAuthorId.value) {
      return;
    }
    const ginfo2 = document.getElementsByClassName("ginfo2").item(0);
    if (!ginfo2) {
      console.warn("ginfo2 not found");
      return;
    }
    const li = ginfo2.children.item(0);
    if (!li) {
      console.warn("li not found");
      return;
    }
    const a = li.children.item(0);
    if (!a) {
      return;
    }
    const spnick = Array.from(a.children).find((ce) => ce.classList.contains("sp-nick") || ce.classList.contains("icon_event"));
    if (!spnick) {
      console.warn("sp-nick not found");
      return;
    }
    const span = document.createElement("span");
    span.className = "mdcm-user-id";
    span.textContent = `(${a.href.split("/").pop()})`;
    a.appendChild(span);
  }
  function getCommentsAuthorId() {
    if (!Setting.settings.post.showCommentAuthorId.value) {
      return;
    }
    const nicks = Array.from(document.getElementsByClassName("nick"));
    nicks.forEach((nick) => {
      const a = nick;
      const spnick = Array.from(a.children).find((ce) => ce.classList.contains("sp-nick") || ce.classList.contains("icon_event"));
      if (!spnick) {
        return;
      }
      const span = document.createElement("span");
      span.className = "mdcm-user-id";
      span.textContent = `(${a.href.split("/").pop()})`;
      a.appendChild(span);
    });
  }
  function hideUnwantedItems() {
    if (Setting.settings.post.hideBottomContents.value) {
      const btmcon = document.getElementsByClassName("view-btm-con").item(0);
      if (!btmcon) {
        console.warn("하단 콘텐츠를 찾을 수 없습니다.");
        return;
      }
      const container = btmcon.parentElement;
      if (!container) {
        console.warn("btmcon parent");
        return;
      }
      container.remove();
    }
  }
  function hideDaum() {
    if (Setting.settings.hideDaum.value) {
      const daumTit = Array.from(document.getElementsByClassName("md-tit")).find((e) => e.textContent === "다음 검색");
      if (!daumTit) {
        return;
      }
      const container = daumTit.parentElement?.parentElement;
      if (!container) {
        console.warn("daum parent");
        return;
      }
      container.remove();
    }
  }
  setDarkModeDefault();
  hideUnwantedMenuItems();
  hideUnwantedContents();
  addMoreDCMSetting();
  getPostAuthorIdOrIp();
  getPostAuthorIdOrIpInPost();
  hideDaum();

})();