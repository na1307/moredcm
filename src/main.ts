// MoreDCM 메인 진입점
// 모든 기능을 초기화하고 실행하는 파일

import { setDarkModeDefault } from './darkmode'
import { hideUnwantedMenuItems } from './topmenu'
import { hideUnwantedContents } from './mainpage'
import { addMoreDCMSetting } from './aside'
import { getPostAuthorIdOrIp } from './postlist'
import { getPostAuthorIdOrIpInPost } from './post'
import { hideDaum } from './daum'

// 다크 모드 자동 설정
setDarkModeDefault()
// 상단 메뉴 항목 숨기기
hideUnwantedMenuItems()
// 메인 페이지 콘텐츠 숨기기
hideUnwantedContents()
// 설정 페이지에 MoreDCM 설정 추가
addMoreDCMSetting()
// 게시글 목록에서 작성자 ID 표시
getPostAuthorIdOrIp()
// 게시글 내에서 작성자 ID 표시
getPostAuthorIdOrIpInPost()
// 다음 검색 영역 숨기기
hideDaum()
