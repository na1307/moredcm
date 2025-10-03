import {setDarkModeDefault} from "./darkmode";
import {hideUnwantedMenuItems} from "./topmenu";
import {hideUnwantedContents} from "./mainpage"
import {addMoreDCMSetting} from "./aside"
import {getPostAuthorIdOrIp} from "./postlist";
import {getPostAuthorIdOrIpInPost} from "./post";

setDarkModeDefault()
hideUnwantedMenuItems()
hideUnwantedContents()
addMoreDCMSetting()
getPostAuthorIdOrIp()
getPostAuthorIdOrIpInPost()
