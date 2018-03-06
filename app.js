const request = require('request');
const cheerio = require('cheerio');
const captchaParser = require('./captchaParser');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let cookieJar = request.jar();

let customRequest = request.defaults({
    headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0'},
    jar: cookieJar
});

const urls = {
    vtop: 'https://vtopbeta.vit.ac.in/vtop/',
    executeApp: 'https://vtopbeta.vit.ac.in/vtop/executeApp/?gsid=',
    getLogin: 'https://vtopbeta.vit.ac.in/vtop/getLogin',
    processLogin: 'https://vtopbeta.vit.ac.in/vtop/processLogin'
};

function getAuthCookie(regno, password, callback){
    getGsidValue(urls.vtop, function (gsid) {
        getAppPage(urls.executeApp + gsid, function () {
            getLoginPage(urls.getLogin, function (captcha) {
                login(urls.processLogin, captcha, regno, password, function () {
                    callback(cookieJar);
                });
            })
        });
    });
}

function getGsidValue(url, callback) {
    customRequest.get(url, function (error, response, body) {
        var res = body.match(/gsid=(.*);/g);
        findgsidvalue(res, function (gsid) {
            callback(gsid);
        })
    });
}

function getAppPage(url, callback) {
    customRequest.get(url, function (error2, response2, body2) {
        callback()
    })
}

function getLoginPage(url, callback) {
    customRequest.post(url, function (error3, response3, body3) {
        const $ = cheerio.load(body3);

        captchaParser.getCaptcha($('img[alt="vtopCaptcha"]')[0].attribs.src)
            .then(data => {
                callback(data);
            });

    })
}

function login(url, captcha, regno, password, callback) {
    customRequest.post({
        url: url, form: {uname: regno, passwd: password, captchaCheck: captcha}
    }, function (error4, response4, body4) {
        callback();
    });
}


function findgsidvalue(res, callback) {

    let status = false;

    res.forEach(function (value) {
        if (value.indexOf('+') == -1) {
            let gsid = value.split('=')[1].slice(0, -1);
            if (!status) {
                callback(gsid);
                status = true;
            }
        }
    });
}

module.exports = {getAuthCookie: getAuthCookie};