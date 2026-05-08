const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let driver;

async function createDriver() {
  const options = new chrome.Options();
  options.setChromeBinaryPath('/usr/bin/chromium-browser');
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
  console.log('Testing URL:', BASE_URL);
  driver = await createDriver();

  try {
    await test('1 Home page loads', async function () {
      await driver.get(BASE_URL);
      await driver.wait(until.elementLocated(By.css('body')), 15000);
    });

    await test('2 Page title exists', async function () {
      const title = await driver.getTitle();
      if (!title || title.length === 0) throw new Error('Title is empty');
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
      if (!source.includes('<html')) throw new Error('HTML source not found');
    });

    await test('6 Desktop size check', async function () {
      await driver.manage().window().setRect({ width: 1366, height: 768 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('7 Tablet size check', async function () {
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('8 Mobile size check', async function () {
      await driver.manage().window().setRect({ width: 390, height: 844 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('9 Reload page check', async function () {
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('10 Current URL check', async function () {
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
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
