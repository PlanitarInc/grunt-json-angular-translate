/*
 * grunt-json-angular-translate
 *
 *
 * Copyright (c) 2014 Shahar Talmi
 * Licensed under the MIT license.
 */

'use strict';

var multiline = require('multiline');
var jbfunc = 'js_beautify';
var jb = require('js-beautify')[jbfunc];
var toSingleQuotes = require('to-single-quotes-shahata');
var extend = require('util')._extend;

function merge(base, add) {
  var key = Object.keys(add)[0];
  if (typeof(add[key]) === 'object' && base[key]) {
    merge(base[key], add[key]);
  } else {
    base[key] = add[key];
  }
  return base;
}

function unflatten(json) {
  return Object.keys(json).reduceRight(function(prev, key) {
    return merge(prev, key.split('.').reduceRight(function (prev, curr) {
      var obj = {};
      obj[curr] = prev;
      return obj;
    }, json[key]));
  }, {});
}

function reverse(json) {
  return Object.keys(json).reduceRight(function (newObject, value) {
    newObject[value] = json[value];
    return newObject;
  }, {});
}

module.exports = function (grunt) {
  grunt.registerMultiTask('plntrLocale', 'The best Grunt plugin ever.', function () {
    var extractLanguage;
    var options = this.options({
      moduleName: 'app.i18n',
      extractLanguage: /..(?=\.[^.]*$)/,
      createNestedKeys: true
    });

    if (typeof(options.extractLanguage) === 'function') {
      extractLanguage = options.extractLanguage;
    } else {
      extractLanguage = function (filepath) {
        return filepath.match(options.extractLanguage)[0];
      };
    }

    this.files.forEach(function (file) {
      // Concat specified files.
      var language,
          keys;
      var src = file.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        // Read file source.
        var currLanguage = extractLanguage(filepath);
        if (language && language !== currLanguage) {
          throw 'inconsistent language: ' + filepath + ' (' + currLanguage + ' !== ' + language + ')';
        }
        language = currLanguage;

        var processor = (options.createNestedKeys ? unflatten : reverse);
        return processor(grunt.file.readYAML(filepath));
      }).reduce(extend, {});

      src = grunt.template.process(multiline(function(){/*
'use strict';

angular.module('<%= moduleName %>')
  .service('locale.<%= language %>', function () {
    var locale = <%= text %>;
    return locale;
  });
*/
      }), {data: {
        language: language,
        moduleName: options.moduleName,
        text: toSingleQuotes(JSON.stringify(src))},
      });

      src = jb(src, {'indent_size': 2, 'jslint_happy': true}) + '\n';

      grunt.file.write(file.dest, src);

      grunt.log.writeln('Created locale file: "' + file.src +'" -> "' + file.dest + '"');
    });
  });

};
