'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');
const marked = require('marked');
const ect = require('ect');

function md2html(filePath, cb) {
  fs.readFile(filePath, 'utf8', (err, mdString) => {
    if (err) {
      cb(err);
      return;
    }
    const markedRenderer = new marked.Renderer();
    markedRenderer.image = function (href, title, text) {
      if (!isAbsolute(url.parse(href))) {
        href = path.resolve(path.dirname(filePath), href);
      }
      return marked.Renderer.prototype.image.call(this, href, title, text);
    };
    const content = marked(mdString, {
      renderer: markedRenderer,
      highlight: code => {
        return require('highlight.js').highlightAuto(code).value;
      }
    });
    const data = {title: filePath, content: content, dirname: __dirname};
    const renderer = ect({root: __dirname});
    const html = renderer.render('template.ect', data);
    cb(null, html);
  });
}

function isAbsolute(url) {
  return url.protocol || url.host || path.isAbsolute(url.path);
}

function toHtmlFile(mdFilePath, cb) {
  md2html(mdFilePath, (err, html) => {
    if (err) {
      cb(err);
      return;
    }
    const name = path.basename(mdFilePath, path.extname(mdFilePath));
    const htmlPath = path.join(os.tmpdir(), `${name}.html`);
    fs.writeFile(htmlPath, html, err => {
      cb(err, htmlPath);
    });
  });
}

exports.toHtmlFile = toHtmlFile;
