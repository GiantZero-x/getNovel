const now = Date.now();
const puppeteer = require('puppeteer');
const ProgressBar = require('progress');
// 文件操作
const fs = require("fs");
// 目录URL
const url = 'https://m.kayege.com/book/17948/';
// 正文
let totalContent = '';

(async () => {
  // 创建一个浏览器实例 Browser 对象
  const browser = await puppeteer.launch();
  // 通过浏览器实例 Browser 对象创建页面 Page 对象
  const page = await browser.newPage();

  // 通过url参数打开指定的页面
  await page.goto(url);

  // 获取文章属性
  const getAttr = async name => await page.$eval(`meta[property="og:${name}"]`, meta => meta.getAttribute('content'));

  const downloadImage = async (src, path, callback = () => { }) => {
    // 通过浏览器实例 Browser 对象创建页面 Page 对象
    const page = await browser.newPage();
    // 通过url参数打开指定的页面
    await page.goto(src);
    // 设置页面视口的大小
    await page.setViewport({ width: 240, height: 320 });
    // 对页面进行截图
    await page.screenshot({ path });
    // 完成回调
    callback();
    // 关闭tab
    await page.close();
  }

  const getContent = async ({ src, title }) => {
    // 通过浏览器实例 Browser 对象创建页面 Page 对象
    const page = await browser.newPage();
    // 通过url参数打开指定的页面
    await page.goto(src);
    // 抓取正文
    const content = await page.$eval('.page-content', content => content.innerText);
    // 关闭tab
    await page.close();
    // 拼接正文
    totalContent += `### ${title}\n\n${content}\n`
  }

  // 获取作者姓名
  const bookAuthor = await getAttr('novel:author');
  // 获取书名
  const bookTitle = `${await getAttr('title')} - ${bookAuthor}`;
  // 获取封面
  const bookPoster = await getAttr('image');
  console.log(`${bookTitle}：信息获取完成`);

  await downloadImage(bookPoster, `./novel/${bookTitle}.jpg`, () => console.log(`${bookTitle}：封面获取完成`))

  const contentsList = await page.$$eval('.block .bd a', list => {
    return list.map(elem => ({
      title: elem.innerText,
      src: elem.getAttribute('href')
    }));
  });

  const len = contentsList.length;
  const bar = new ProgressBar(`${bookTitle} [:bar] :current/:total :percent :etas`, {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: len
  });

  for (let i = 0; i < len; i++) {
    await getContent(contentsList[i]);
    bar.tick();
  }

  console.log(`${bookTitle}：抓取完成💥💥💥💥`);
  fs.writeFileSync(`./novel/${bookTitle}.txt`, totalContent);
  console.log(`${bookTitle}：写入完成🌹🌹🌹🌹，总用时：${Date.now() - now}`);

  // 关闭浏览器
  await browser.close();
})();