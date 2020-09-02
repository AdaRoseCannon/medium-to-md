#! /usr/bin/env node

var program = require('commander'),
  YAML = require('yaml'),
  marked = require('marked'),
  utils = require('./utils'),
  package = require('./package.json');

program
  .version(package.version)
  .description(package.description)
  .usage('[options] <medium post url>')
  .option('-o, --output <type>', 'output type. markdown, json, or html', 'markdown');

program.parse(process.argv);
const url = program.args[0];
if (url) {
  med2md(url).then(o => {
    if (program.output) {
      console.log(o[program.output]);  
    } else {
      console.log(o);
    }
  });
}

async function med2md(url) {

  const mediumURL = url;
  const json = await utils.loadMediumJson(mediumURL);

  if (!json.success) {
    return json; 
  }

  const payload = json.payload.value;
  const markdown = [];

  const story = payload.content.bodyModel;

  var sections = [];
  for(let i=0;i<story.sections.length;i++) {
    const s = story.sections[i];
    const section = utils.processSection(s);
    sections[s.startIndex] = section;
  }

  markdown.push("\n# "+payload.title.replace(/\n/g,'\n# '));
  if (payload.content.subtitle) {
    markdown.push("\n"+payload.content.subtitle.replace(/#+/,''));
  }

  for(var i=2;i<story.paragraphs.length;i++) {
    
    if(sections[i]) {
      markdown.push(sections[i]);
    }

    var p = story.paragraphs[i];
    const result = utils.processParagraph(p, function(err, text) {
      return text == markdown[i] ? undefined: text; // Avoid double title/subtitle
    });
    markdown.push(result);
  }

  const html = marked( markdown.join('\n') );

  return { markdown: markdown.join('\n'), html, json };
}

module.exports = med2md;
