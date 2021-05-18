// v1.0.0
'use strict';

// lowercase title
Macro.add('titlelow', {
  handler : function () {
    var textnode = $(document.createTextNode(String(this.args[0].getTitle().toLowerCase())))
    textnode.appendTo(this.output)
  }
});

Macro.add('titlefull', {
  handler : function () {
    var adj = setup.Text.Unit.Trait.adjectiveRandom(this.args[0])
    var title = `${adj} ${this.args[0].getTitle().toLowerCase()}`
    var textnode = $(document.createTextNode(String(title)))
    textnode.appendTo(this.output)
  }
});
