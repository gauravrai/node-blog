const puppeteer = require('puppeteer')

const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

let browser, page

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    })
    page  = await browser.newPage()
    await page.goto('localhost:3000')
})

afterEach(async () => {
    await browser.close()
})

test('Header has correct logo text', async () => {
    
    const text = await page.$eval('a.brand-logo', el => el.innerHTML)
    expect(text).toEqual('Blogster')
})

test('Click login start OAuth flow', async () => {
    await page.click('.right a')
    const url = await page.url()
    expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in show logout button', async () => {
    const id = '625232acc4a39c3640326834'
    
    const user = await userFactory()
    const { session, sig } = sessionFactory(user);

    console.log(session, sig)

    await page.setCookie({
        name: 'session',
        value: session
    })
    await page.setCookie({
        name: 'session.sig',
        value: sig
    })
    await page.goto('localhost:3000')
    await page.waitFor('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
    
    expect(text).toEqual('Logout')
})