/**
 * Created by GiantX on 2017/6/2.
 */
var app = require('express')() // 创建express服务
var bodyParser = require('body-parser'); // 请求主体解析模块
var fs = require('fs'); // 文件操作模块

app.use(require('cors')()) // 跨域模块
app.use(bodyParser.json({ limit: '1024kb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//  小说存储路径
const NOVEL_DIR = './novel';

// 判断小说目录是否存在
fs.exists(NOVEL_DIR, exists => {
    if (!exists) {
        fs.mkdirSync(NOVEL_DIR);
        console.log('已创建目录: ' + NOVEL_DIR);
    }
})


app.get('*', function(req, res, next) {
    /* 响应数据*/
    res.send('Api接口,请勿使用浏览器访问')
})

/* 接受 post 请求 */
app.post('/novel', function(req, res, next) {
    //  请求数据
    let data = req.body;
    if (data.isEnd === 'true') {
        console.log(`${new Date().toLocaleString()} 传输完毕.`);
        return false;
    }
    //  文件路径
    const path = `${NOVEL_DIR}/${data.name}.txt`;
    //  写入方法
    const method = data.isNew === 'true' ? 　'writeFileSync' : 'appendFileSync';
    //  写入文件
    fs[method](path, data.content);
    //  响应数据
    res.json({ msg: 'success' });
    //  输出Log
    console.log(`${new Date().toLocaleString()} ${data.isNew === 'true' ? '新建' : '写入'}: ${path} - ${data.chapter} - 成功`);
})

app.listen(80, function() {
    console.log('服务器已开启, 正在监听http://localhost')
})

// http://m.31xs.net

/**
 * 小说类
 * @param {String}  name      小说名
 * @param {String}  startPath 小说首章地址 或当前location.href
 * @param {Boolean} isNew     是否为新, 默认为新
 */
function N(name, startPath, isNew) {
    startPath = startPath || location.href;
    isNew === undefined && (isNew = true);
    //  DOM暂存容器
    $(document.body).append('<div id="app" style="display:none"></div>');
    //  调用
    getText(startPath);

    //  递归函数
    function getText(url) {
        var nextLink = url.replace(/(.+\/)(\d+)(\.html$)/, ($0, $1, $2, $3) => {
            return $1 + (Number($2) + 1) + $3;
        });
        $.get(url, function(res) {
            // 存入DOM容器
            $('#app').html(res.replace(/\n/g, '').replace(/<script.*\/script>/g, '').replace(/<link.*>/, ''));

            // 标题
            var titleArr = $('#app .am-article-hd h3').text();

            // 序号
            var chapter = titleArr.split(' ')[1];

            // 章节名
            var title = titleArr.split(' ')[2];

            // 拼接内容
            var content = titleArr + '\n' + $('#app .am-article-bd').text().replace(/(^\s*) | (\s+加入书签\s*)/g, '') + '\n';

            // 下一章链接
            var u = res.match(/href="(.+)">下一章/)[1];

            // 最后一章判断
            if (u.split('/')[3] === '') {
                console.log('传输完毕');
                $.post('http://localhost/novel', { isEnd: true });
                return false;
            }

            // 输出当前进度
            console.log('当前章节: ' + titleArr, u)

            // 发送至本机服务器
            $.post('http://localhost/novel', { content: content, isNew: isNew, name: name, chapter: chapter + title }, res => {
                isNew = false;
                console.log('传输状态: ', res.msg);
                // 递归调用
                u && getText(u);
            })
        }).fail(() => {
            //  请求失败调取下一个链接
            console.log('获取失败,正在请求下一个地址: ', nextLink);
            nextLink && getText(nextLink);
        })
    }
}
