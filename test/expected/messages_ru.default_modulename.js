'use strict';

angular.module('app.i18n')
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
