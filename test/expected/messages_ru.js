'use strict';

angular.module('wixTranslations')
  .service('locale.ru', function () {
    var locale = {
      'a': 'b',
      'c': {
        'y': 'e',
        'x': 'd'
      }
    };
    return locale;
  });
