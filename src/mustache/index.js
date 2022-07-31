var Mustache = require('mustache');

var view = {
  title: "&",
  calc: function () {
    return 2 + 4;
  },
  '&': '123',
};

var output = Mustache.render("{{{}}} spends {{calc}}", view);
console.log(output)