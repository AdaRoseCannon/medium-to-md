# Medium To Markdown
Export your medium article to markdown

## Installation

npm install medium-to-md -D
    
## Usage

Command Line
```
$ npx med2md https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e
```

In Js
```
const med2md = require('./index.js');
med2Md('https://medium.com/@allenhwkim/angular-syntax-highlighted-code-with-prism-4b9fce7364dd')
  .then(o => console.log(o));
```
