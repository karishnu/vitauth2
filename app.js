const request = require('request-promise-native');
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

function getAuthCookie(regno, password) {
    return new Promise((resolve, reject) => {
        return resolve(customRequest.get(urls.vtop));
    }).then(findgsidvalue).then(gsid => {
        return customRequest.get(urls.executeApp + gsid);
    }).then(() => {
        return customRequest.post(urls.getLogin)
    }).then((body) => {
        const $ = cheerio.load(body);
        return captchaParser.getCaptcha($('img[alt="vtopCaptcha"]')[0].attribs.src);
    }).then(captchacode => {
        return customRequest.post({url: urls.processLogin, form: {uname: regno, passwd: password, captchaCheck: captchacode}});
    }).then(() => {
        return cookieJar;
    })
}


function findgsidvalue(body) {

    return new Promise((resolve) => {

        let res = body.match(/gsid=(.*);/g);

        let status = false;

        res.forEach(function (value) {
            if (value.indexOf('+') == -1) {
                let gsid = value.split('=')[1].slice(0, -1);
                if (!status) {
                    status = true;
                    return resolve(gsid);
                }
            }
        });
    })
}

module.exports = {getAuthCookie: getAuthCookie};