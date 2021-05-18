setup.qresImpl.BestFriendExist = class BestFriendExist extends setup.Restriction {
  constructor() {
    super()
  }

  text() {
    return `setup.qres.BestFriendExist()`
  }

  explain() {
    return `Unit must have a best friend/lover` 
  }

  /**
   * @param {setup.Unit} unit 
   */
  isOk(unit) {
    return !!unit.getBestFriend()
  }
}
