// v1.0.0
'use strict';

Macro.add('exp', {
  handler : function () {
    var textnode = $(document.createTextNode(String(this.args[0]) + ' exp'))
    var content = $(document.createElement('span'))
    content.addClass('expspan')
    content.append(textnode)
    content.appendTo(this.output)
  }
});
