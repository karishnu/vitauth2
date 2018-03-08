[![College Code](https://img.shields.io/badge/CollegeCode-Repo-red.svg)](https://github.com/CollegeCODE)

# vitauth2

# Usage

```

const app = require(vitauth2);

const request = require('request-promise-native');

app.getAuthCookie('regno_no', 'password')
.then(data => {
    let customRequest = request.defaults({
        headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0'},
        jar: data
    });

    return customRequest.post({url: 'https://vtopbeta.vit.ac.in/vtop/processViewTimeTable', form: {semesterSubId: 'VL2017185'}})
}).then(body => {
    console.log(body);
});

```
