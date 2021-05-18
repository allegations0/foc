// v1.0.0
'use strict';

Macro.add('uequipslot', {
  handler : function () {
    var wrapper = $(document.createElement('span'))

    var unit = this.args[0]
    if (setup.isString(unit)) unit = State.variables.unit[unit]

    var slotkey = this.args[1]
    if (!(slotkey in setup.equipmentslot)) {
      throw new Error(`unrecognized slot key: ${slotkey} for uequipslot`)
    }

    var eq = setup.Text.Unit.Equipment.getEquipmentAt(unit, setup.equipmentslot[slotkey])
    if (eq) {
      wrapper.wiki(eq.rep())
    } else {
      wrapper.wiki(`<<u${slotkey} "${unit.key}">>`)
    }

    wrapper.appendTo(this.output)
  }
});

