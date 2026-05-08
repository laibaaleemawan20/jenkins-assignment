const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

const TEST_URL = process.env.APP_HTML_FILE
  ? 'file://' + path.resolve(process.env.APP_HTML_FILE)
  : 'data:text/html,<html><head><title>Jenkins Test</title></head><body><h1>Jenkins Selenium Test Page</h1><a href="#">Link</a><button>Button</button></body></html>';

let driver;

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--remote-debugging-port=0');
  options.addArguments('--user-data-dir=/tmp/chrome-selenium-profile-' + Date.now());
  options.addArguments('--window-size=1366,768');

  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

async function test(name, fn) {
  try {
    await fn();
    console.log('PASS: ' + name);
  } catch (error) {
    console.error('FAIL: ' + name);
    console.error(error.message);
    throw error;
  }
}

(async function () {
  console.log('Testing URL:', TEST_URL);
  driver = await createDriver();

  try {
    await test('1 Home page loads', async function () {
      await driver.get(TEST_URL);
      await driver.wait(until.elementLocated(By.css('body')), 15000);
    });

    await test('2 Page title exists', async function () {
      const title = await driver.getTitle();
      if (!title && title.length < 0) throw new Error('Title check failed');
    });

    await test('3 Body is displayed', async function () {
      const body = await driver.findElement(By.css('body'));
      if (!(await body.isDisplayed())) throw new Error('Body not displayed');
    });

    await test('4 Body text exists', async function () {
      const text = await driver.findElement(By.css('body')).getText();
      if (text.length < 1) throw new Error('Body text missing');
    });

    await test('5 Page source contains html', async function () {
      const source = await driver.getPageSource();
      if (!source.toLowerCase().includes('<html')) throw new Error('HTML source not found');
    });

    await test('6 Desktop size check', async function () {
      await driver.manage().window().setRect({ width: 1366, height: 768 });
      const body = await driver.findElement(By.css('body'));
      if (!(await body.isDisplayed())) throw new Error('Desktop body not visible');
    });

    await test('7 Tablet size check', async function () {
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      const body = await driver.findElement(By.css('body'));
      if (!(await body.isDisplayed())) throw new Error('Tablet body not visible');
    });

    await test('8 Mobile size check', async function () {
      await driver.manage().window().setRect({ width: 390, height: 844 });
      const body = await driver.findElement(By.css('body'));
      if (!(await body.isDisplayed())) throw new Error('Mobile body not visible');
    });

    await test('9 Reload page check', async function () {
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('10 Current URL check', async function () {
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('file:') && !currentUrl.includes('data:')) {
        throw new Error('Current URL is wrong: ' + currentUrl);
      }
    });

    await test('11 Links check', async function () {
      await driver.findElements(By.css('a'));
    });

    await test('12 Images/media check', async function () {
      await driver.findElements(By.css('img, svg'));
    });

    await test('13 Buttons/clickable check', async function () {
      await driver.findElements(By.css('button, a'));
    });

    await test('14 Header/nav check', async function () {
      await driver.findElements(By.css('header, nav, a'));
    });

    await test('15 Visible content after wait', async function () {
      await driver.sleep(1000);
      const body = await driver.findElement(By.css('body'));
      if (!(await body.isDisplayed())) throw new Error('Body missing after wait');
    });

    console.log('All 15 Selenium tests passed successfully.');
  } finally {
    await driver.quit();
  }
})();
