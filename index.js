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
  .option('-f, --frontmatter', 'output post information as frontmatter')
  .option('-H, --html', 'output as html');

program.parse(process.argv);
const url = program.args[0];
url && m2md(url, program).then(o => console.log(o));;

function m2md(url, options={frontmatter: 0, html: 0}) {

  const mediumURL = url;

  return utils.loadMediumPost(mediumURL, async function(err, json) {
    const payload = json.payload.value;
    const markdown = [];

    if(options.frontmatter) {
      const doc = new YAML.Document();
      doc.contents = payload;
      markdown.push('---', doc.toString(), '---');
    }

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

    let output = markdown.join('\n');
    if (options.html) {
      output = output.replace(/^---($.*^)---$/ms, '');
      output = marked(output); 
    } 
    return output;
  });
}

module.exports = m2md;
