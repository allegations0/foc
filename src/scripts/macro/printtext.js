// v1.0.0
'use strict';

/**
 * Print a text, no wikification going on.
 */
Macro.add('printtext', {
  handler : function () {
    var textnode = $(document.createTextNode(this.args[0]))
    textnode.appendTo(this.output)
  }
});

/**
 * Attach a HTML element to output
 */
Macro.add('attach', {
  handler : function () {
    if (this.args[0]) {
      this.output.append(this.args[0])
    }
  }
});


