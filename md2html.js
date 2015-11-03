'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const marked = require('marked');
const ECT = require('ect');

function md2html(filePath, cb) {
  fs.readFile(filePath, 'utf8', (err, mdString) => {
    if (err) {
      cb(err);
      return;
    }
    const markedRenderer = new marked.Renderer();
    markedRenderer.image = function(href, title, text) {
      const imgAbsolutePath = path.resolve(path.dirname(filePath), href);
      return marked.Renderer.prototype.image.call(this, imgAbsolutePath, title, text);
    }
    const content = marked(mdString, {
      renderer: markedRenderer,
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    });
    const data = { title: filePath, content : content, dirname : __dirname };
    const renderer = ECT({ root : __dirname });
    const html = renderer.render('template.ect', data);
    cb(null, html);
  });
}

function toHtmlFile(mdFilePath, cb) {
  md2html(mdFilePath, (err, html) => {
    if (err) {
      cb(err);
      return;
    }
    const name = path.basename(mdFilePath, path.extname(mdFilePath))
    const htmlPath = path.join(os.tmpdir(), name + '.html');
    fs.writeFile(htmlPath, html, (err) => {
      cb(err, htmlPath)
    });
  });
}

exports.toHtmlFile = toHtmlFile;
