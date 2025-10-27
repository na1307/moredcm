// MoreDCM 메인 진입점
// 모든 기능을 초기화하고 실행하는 파일

import { setDarkModeDefault } from './darkmode'
import { hideUnwantedMenuItems } from './topmenu'
import { hideUnwantedContents } from './mainpage'
import { addMoreDCMSetting } from './aside'
import { postListFunction } from './postlist'
import { postFunction } from './post'
import { hideDaum } from './daum'

// 다크 모드 자동 설정
setDarkModeDefault()
// 상단 메뉴 항목 숨기기
hideUnwantedMenuItems()
// 메인 페이지 콘텐츠 숨기기
hideUnwantedContents()
// 설정 페이지에 MoreDCM 설정 추가
addMoreDCMSetting()
// 게시글 목록
postListFunction()
// 게시글 내
postFunction()
// 다음 검색 영역 숨기기
hideDaum()
