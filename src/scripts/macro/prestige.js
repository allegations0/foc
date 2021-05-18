// v1.0.0
'use strict';

Macro.add('prestige', {
  handler : function () {
    var textnode = $(document.createTextNode(String(this.args[0]) + ' prestige'))
    var content = $(document.createElement('span'))
    content.addClass('prestigespan')
    if (Number(this.args[0]) > 0) content.addClass('prestigespanplus')
    if (Number(this.args[0]) < 0) content.addClass('prestigespanmin')
    content.append(textnode)
    content.appendTo(this.output)
  }
});
