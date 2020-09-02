# Medium To Markdown
Export your medium article to markdown

This is a fork and simplified version of mediumexporter, which seems not maintained, https://github.com/xdamman/mediumexporter, enhanced with;

* Enabled Javascript usage
* Synchrous call
* Added html export
* Added json export

## Installation

npm install medium-to-md -g
    
## Usage

Command Line
```
$ med2md https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e
$ med2md -o html https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e
$ med2md -o json https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e
```

In Js
```
const fs = require('fs');
const med2md = require('./index.js');
med2Md('https://medium.com/@allenhwkim/angular-syntax-highlighted-code-with-prism-4b9fce7364dd')
  .then(result => {
    console.log('html', result.html);
    console.log('json', result.json);
    console.log('markdown', result.markdown);
    fs.writeFileSync('output.markdown', ''+result.markdown);
  });
```
