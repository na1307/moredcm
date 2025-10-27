import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: 'MoreDCM',
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'npm/vite-plugin-monkey',
                match: ['https://m.dcinside.com/*'],
                grant: ['GM_getValue', 'GM_setValue', 'GM_deleteValue', 'GM_cookie']
            }
        })
    ]
})
