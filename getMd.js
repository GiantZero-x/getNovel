const puppeteer = require('puppeteer');
const fs = require('fs');
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const exec = require('child_process').exec;

const url = 'https://ninghao.net/blog/2834';

(async () => {
  // 创建一个浏览器实例 Browser 对象
  console.log('开始...');
  const browser = await puppeteer.launch();
  // 通过浏览器实例 Browser 对象创建页面 Page 对象
  const page = await browser.newPage();
  // 通过url参数打开指定的页面
  await page.goto(url);
  // 获取标题
  const title = await page.$eval('title', title => title.innerText);
  // 抓取正文
  const content = await page.$eval('.node-content .content', content => content.innerHTML);
  // 关闭浏览器
  await browser.close();

  let markdown = turndownService.turndown(content.trim());

  markdown += `\n\n> 转载自[${title}](${url})`;

  console.log('抓取完成🌹');
  fs.writeFileSync(`./temp.md`, markdown);
  console.log('写入完成🌹🌹');
  exec('pbcopy < ./temp.md', (error, stdout, stderr) => {
    if (error) throw err;

    fs.unlink('./temp.md', (err) => {
      if (err) throw err;

      console.log('复制完成🌹🌹🌹');
    });
  });
})();