setup.SexLocationClass.Bedchamber = class Bedchamber extends setup.SexLocation {
  /**
   * @param {setup.Bedchamber} bedchamber 
   * @param {boolean} [is_high]
   */
  constructor(bedchamber, is_high) {
    super(
      'bedchamber',
      [  /* tags  */
      ],
      'A bedchamber',
      'A bedchamber',
    )
    this.bedchamber_key = setup.keyOrSelf(bedchamber)
    this.is_high = is_high
  }

  /**
   * @returns {setup.Bedchamber}
   */
  getBedchamber() {
    return State.variables.bedchamber[this.bedchamber_key]
  }

  getFurnitures(slot) {
    /**
     * @type {Object<string, setup.Furniture>}
     */
    const res = {}
    const bedchamber = this.getBedchamber()
    for (const slot of Object.values(setup.furnitureslot)) {
      res[slot.key] = bedchamber.getFurniture(slot)
    }
    return res
  }

  getRestrictions() {
    return [
      setup.qres.SexBedchamberUsable(this.getBedchamber())
    ]
  }

  /**
   * @returns {string}
   */
  getTitle() {
    const bedchamber = this.getBedchamber()
    let floor
    if (this.isHigh()) {
      floor = 'Bed'
    } else {
      floor = 'Floor'
    }
    return `${bedchamber.getSlaver().rep()}'s ${bedchamber.rep()} (${floor})`
  }

  /**
   * @returns {string}
   */
  getDescription() {
    let bed = this.getFurnitureAt(setup.furnitureslot.slaverbed).getName()
    if (!this.isHigh()) {
      bed = this.getFurnitureAt(setup.furnitureslot.tile).getName()
    }
    return `The ${bed} in ${this.getBedchamber().getName()}`
  }

  isHigh() {
    return this.is_high
  }

  /**
   * Describes the room. Moves to the center of the ...
   * @param {setup.SexInstance} sex 
   * @returns {string}
   */
  repRoom(sex) {
    return this.getBedchamber().getName()
  }

  repRawGazeAt(sex) {
    const base = [
      `the bedchamber walls`,
      `the bedchamber door`,
      `a stain on the walls`,
      `the windows`,
    ]

    const slavebed = this.getSlaveBed()
    if (slavebed.isBasic()) {
      base.push(
        `the empty spot on the floor where the slaves sleep in`,
      )
    }

    return base
  }

  repRawAmbience(sex) {
    const base = [
      `the strong smell of arousal permeates the room`,
      `the distinct sound of sex can be heard from a nearby room`,
      `looking outside the window, your other slavers are going on their usual daily business`,
      `outside of this room, business is going as usual in the fort`,

      `a muffled sound can be heard coming from somewhere inside your fort`,
      `a visitor can be seen walking around your fort from the window`,
      `a bird perches on the bechamber's window`,
    ]

    if (State.variables.fort.player.isHasBuilding('market')) {
      base.push(
        `the bustling sound of merchant can be heard from your market`,
      )
    }

    return base
  }

  /**
   * A sentence for starting a sex here.
   * @param {setup.SexInstance} sex 
   * @returns {string | string[]}
   */
  rawRepStart(sex) {
    if (this.isHigh()) {
      const bed = this.getFurnitureAt(setup.furnitureslot.slaverbed).rep()
      return [
        `a|They a|go into ${this.getTitle()}, before going up the ${bed} for some action.`,
        `After going to the bedchamber area, a|they go inside ${this.getTitle()} and prepare to tumble on the ${bed}.`,
        `${this.getTitle()} is just perfect for the kind of play a|rep a|have in mind today.`,
      ]
    } else {
      const floor = this.getFurnitureAt(setup.furnitureslot.tile).rep()
      return [
        `a|They a|go into ${this.getTitle()}, before going on the ${floor} for some rough action.`,
        `After going to the bedchamber area, a|they go inside ${this.getTitle()} and prepare to tumble on the ${floor}.`,
        `${this.getTitle()} is just perfect for the kind of play a|rep a|have in mind today.`,
      ]
    }
  }
}
