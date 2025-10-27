import { describe, expect, it, vi, vitest } from 'vitest'
import * as darkmode from '../src/darkmode.ts'
import * as topmenu from '../src/topmenu.ts'
import * as mainpage from '../src/mainpage.ts'
import * as aside from '../src/aside.ts'
import * as postlist from '../src/postlist'
import * as post from '../src/post'
import * as daum from '../src/daum'

// Mock Setting
vi.mock('../src/Setting', () => ({}))

const setDarkModeDefaultMock = vitest.spyOn(darkmode, 'setDarkModeDefault').mockImplementation(() => {})
const sethideUnwantedMenuItemsMock = vitest.spyOn(topmenu, 'hideUnwantedMenuItems').mockImplementation(() => {})
const hideUnwantedContentsMock = vitest.spyOn(mainpage, 'hideUnwantedContents').mockImplementation(() => {})
const addMoreDCMSettingMock = vitest.spyOn(aside, 'addMoreDCMSetting').mockImplementation(() => {})
const postListFunctionMock = vitest.spyOn(postlist, 'postListFunction').mockImplementation(() => Promise.resolve())
const postFunctionMock = vitest.spyOn(post, 'postFunction').mockImplementation(() => {})
const hideDaumMock = vitest.spyOn(daum, 'hideDaum').mockImplementation(() => {})

describe('main.ts', () => {
    it('call functions', async () => {
        await import('../src/main.ts')

        expect(setDarkModeDefaultMock).toHaveBeenCalled()
        expect(sethideUnwantedMenuItemsMock).toHaveBeenCalled()
        expect(hideUnwantedContentsMock).toHaveBeenCalled()
        expect(addMoreDCMSettingMock).toHaveBeenCalled()
        expect(postListFunctionMock).toHaveBeenCalled()
        expect(postFunctionMock).toHaveBeenCalled()
        expect(hideDaumMock).toHaveBeenCalled()
    })
})
