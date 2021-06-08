var request = require('request');

var MEDIUM_IMG_CDN = "https://cdn-images-1.medium.com/max/";

var utils = {
  loadMediumJson: async function(mediumURL) {
    return new Promise(resolve => {
      if (mediumURL.match(/^http/i)) {
        mediumURL = mediumURL.replace(/#.+$/, '');
        request(mediumURL+"?format=json", function(err, res, body) {
          if(err) return cb(err);
          
          const begin = body.indexOf('{');
          const end = body.indexOf('</script>', begin);
          const json_string = end === -1 ? body.substr(begin) : body.substr(begin, end-begin);
          const json = JSON.parse(json_string); 
          resolve(json);
        });
      } else {
        reject('Invalid url');
      }
    });
    return result;
  },
  processSection: function(s) {
    var section = "";
    if(s.backgroundImage) {
      var imgwidth = parseInt(s.backgroundImage.originalWidth,10);
      var imgsrc = MEDIUM_IMG_CDN+Math.max(imgwidth*2,2000)+"/"+s.backgroundImage.id;
      section = "\n![]("+imgsrc+")";
    }
    return section;
  },
  getYouTubeEmbed: function(iframesrc, cb) {
    request(iframesrc, function(err, res) {
      var tokens = res.body.match(/youtube.com%2Fembed%2F([^%]+)%3F/);
      if (tokens && tokens.length > 1) {
        var videoId = tokens[1];
        return cb(null, `<center><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></center>`);
      }
      cb(null, `<iframe src="${iframesrc}" frameborder=0></iframe>`);
    });
  },
  processParagraph: function(p, cb) {

    var markups_array = utils.createMarkupsArray(p.markups);

    if(markups_array.length > 0) {
      var previousIndex=0, text=p.text, tokens=[];
      for(var j=0;j<markups_array.length;j++) {
        if(markups_array[j]) {
          token = text.substring(previousIndex, j);
          previousIndex = j;
          tokens.push(token);
          tokens.push(markups_array[j]);
        }
      }
      tokens.push(text.substring(j-1));
      p.text = tokens.join('');
    }

    var markup = "";
    switch(p.type) {
      case 1:
        markup = "\n";
        break;
      case 2:
        p.text = "\n# "+p.text.replace(/\n/g,'\n# ');
        break;
      case 3:
        p.text = "\n## "+p.text.replace(/\n/g,'\n## ');
        break;
      case 4: // image & caption
        var imgwidth = parseInt(p.metadata.originalWidth,10);
        var imgsrc = MEDIUM_IMG_CDN+Math.max(imgwidth*2,2000)+"/"+p.metadata.id;
        var text = "\n!["+p.text+"]("+imgsrc+")";
        if (p.text) {
          text += "*"+p.text+"*";
        }
        p.text = text;
        break;
      case 6:
        markup = "> ";
        break;
      case 7: // quote
        p.text = "> # "+p.text.replace(/\n/g,'\n> # ');
        break;
      case 8:
        p.text = "\n    "+p.text.replace(/\n/g,'\n    ');
        break;
      case 9:
        markup = "\n* ";
        break;
      case 10:
        markup = "\n1. ";
        break;
      case 11:
        return utils.getYouTubeEmbed('https://medium.com/media/'+p.iframe.mediaResourceId, function(err, embed) {
          cb(null, `\n${embed}`);
        });
      case 13:
        markup = "\n### ";
        break;
      case 15: // caption for section image
        p.text = "*"+p.text+"*";
        break;
    }

    p.text = markup + p.text;

    if(p.alignment == 2&& p.type != 6 && p.type != 7) p.text = "<center>" + p.text + "</center>";

    return cb(null, p.text);
  },
  addMarkup: function(markups_array, open, close, start, end) {
    if(markups_array[start])
      markups_array[start] += open;
    else
      markups_array[start] = open;

    if(markups_array[end])
      markups_array[end] += close;
    else
      markups_array[end] = close;

    return markups_array;
  },
  createMarkupsArray: function(markups) {
    if(!markups || markups.length == 0) return [];
    var markups_array = [];
    for(var j=0;j<markups.length;j++) {
      var m = markups[j];
      switch(m.type) {
        case 1: // bold
          utils.addMarkup(markups_array, "**","**",m.start,m.end);
          break;
        case 2: // italic
          utils.addMarkup(markups_array, "*","*",m.start,m.end);
          break;
        case 3: // anchor tag
          if (m.userId) {
            const user = mentionedUsers.find(u => u.userId === m.userId)
            if (user.twitterScreenName) {
              utils.addMarkup(
                markups_array,
                `[`,
                `](https://twitter.com/${user.twitterScreenName})`,
                m.start,
                m.end
              )
            } else {
              utils.addMarkup(
                markups_array,
                `[`,
                `](https://medium.com/@${user.username})`,
                m.start,
                m.end
              )
            }
          } else {
            utils.addMarkup(markups_array, '[', '](' + m.href + ')', m.start, m.end)
          }
          break
        case 10: // code
          utils.addMarkup(markups_array, '`', '`', m.start, m.end)
          break
        default:
          console.error("Unknown markup type "+m.type, m);
          break;
      }
    }
    return markups_array;
  }
}

module.exports = utils;
