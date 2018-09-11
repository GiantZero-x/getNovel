const now = Date.now();
// 网站地址
const baseUrl = 'http://m.31xs.net';
// 小说id
const id = '0/144';
// 目录选择器，选出list数组
const contentsClass = '.am-list-news-bd a';
// 正文选择器，选出正文根节点
const contentClass = '.am-article-bd';
// 文件操作
const fs = require("fs");
// dom处理
const cheerio = require("cheerio");
// 编码转换
const iconv = require("iconv-lite");
// 同步请求
const request = require('sync-request');
// 下载文件
const downloadFile = require('./downloadFile');
// 详情地址
const detailUrl = `${baseUrl}/${id}`;
// 目录地址
const contentsUrl = `${baseUrl}/${id}/index.htm`;
// 正文
let totalContent = '';
/**
 * 请求并且解析html
 * @param {String} url 请求URL
 */
const get = url => {
  const res = request('GET', url);
  const html = iconv.decode(res.body, 'gb2312');

  return cheerio.load(html, { decodeEntities: false });
}
/**
 * 获取每章内容
 * @param {String} src 章节正文链接
 * @param {String} title 章节名
 */
const getContent = ({ src, title }) => {
  // 请求详情页
  const $content = get(src);
  // 获取正文
  const content = $content(contentClass).text().replace(/ /g, '');

  //拼接正文
  totalContent += `### ${title}\n${content}\n`
  console.log(`${title} -> 抓取成功`);
}
// 获取文章属性
const getAttr = ($, name) => {
  return $(`meta[property="og:${name}"]`).attr('content')
}
const $detail = get(detailUrl);
// 获取作者姓名
const bookAuthor = getAttr($detail, 'novel:author');
// 获取书名
const bookTitle = `${getAttr($detail, 'title')} - ${bookAuthor}`;
// 获取封面
const bookPoster = getAttr($detail, 'image');

console.log(`${bookTitle}：信息获取完成`);
downloadFile(bookPoster, `./novel/${bookTitle}.jpg`, () => console.log(`${bookTitle}：封面获取完成`))

// 请求目录页
const $contents = get(contentsUrl);
// 获取目录列表
const list = $contents(contentsClass);

console.log(`${bookTitle}：目录获取完成`);
// 循环同步获取内容
list.each((i, elem) => {
  const $this = $contents(elem);
  // 获取章节名
  const title = $this.text();
  // 获取章节地址
  const src = `${baseUrl}${$this.attr('href')}`
  // 获取内容
  getContent({ title, src })
})

console.log(`${bookTitle}：抓取完成💥💥💥💥`);
fs.writeFileSync(`./novel/${bookTitle}.txt`, totalContent);
console.log(`${bookTitle}：写入完成🌹🌹🌹🌹，总用时：${Date.now() - now}`);
