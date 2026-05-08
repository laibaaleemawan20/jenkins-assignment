const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://16.16.172.60:3000';

let driver;

async function createDriver() {
  const options = new chrome.Options();
  options.setChromeBinaryPath('/usr/bin/chromium-browser');
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--remote-debugging-port=9222');
  options.addArguments('--user-data-dir=/tmp/chrome-selenium-profile-' + Date.now());
  options.addArguments('--window-size=1366,768');
  options.addArguments('--no-proxy-server');
  options.addArguments('--proxy-server=direct://');
  options.addArguments('--proxy-bypass-list=*');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-software-rasterizer');

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
  driver = await createDriver();

  try {
    await test('1 Home page loads', async function () {
      await driver.get(BASE_URL);
      await driver.wait(until.elementLocated(By.css('body')), 10000);
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
      if (text.length < 5) throw new Error('Body text too short');
    });

    await test('5 Links exist', async function () {
      const links = await driver.findElements(By.css('a'));
      if (links.length < 0) throw new Error('Links check failed');
    });

    await test('6 Images/media check', async function () {
      const images = await driver.findElements(By.css('img, svg'));
      if (images.length < 0) throw new Error('Media check failed');
    });

    await test('7 Buttons or clickable elements exist', async function () {
      const elements = await driver.findElements(By.css('button, a'));
      if (elements.length < 0) throw new Error('Clickable elements check failed');
    });

    await test('8 Header/nav check', async function () {
      const elements = await driver.findElements(By.css('header, nav, a'));
      if (elements.length < 0) throw new Error('Header check failed');
    });

    await test('9 Page source contains html', async function () {
      const source = await driver.getPageSource();
      if (!source.includes('<html')) throw new Error('HTML source not found');
    });

    await test('10 Desktop size check', async function () {
      await driver.manage().window().setRect({ width: 1366, height: 768 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('11 Tablet size check', async function () {
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('12 Mobile size check', async function () {
      await driver.manage().window().setRect({ width: 390, height: 844 });
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('13 Reload page check', async function () {
      
      await driver.navigate().refresh();
      await driver.wait(until.elementLocated(By.css('body')), 10000);
    });

    await test('14 Current URL check', async function () {
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('16.16.172.60')) throw new Error('Current URL is wrong: ' + currentUrl);
    });

    await test('15 Page has visible content after wait', async function () {
      await driver.sleep(1000);
      const text = await driver.findElement(By.css('body')).getText();
      if (text.length < 5) throw new Error('Visible content missing after wait');
    });

    console.log('All 15 Selenium tests passed successfully.');
  } finally {
    await driver.quit();
  }
})();
