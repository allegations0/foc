setup.qresImpl.BestFriends = class BestFriends extends setup.Restriction {
  constructor(actor_name1, actor_name2) {
    super()

    this.actor_name1 = actor_name1
    this.actor_name2 = actor_name2
  }

  text() {
    return `setup.qres.BestFriends('${this.actor_name1}', '${this.actor_name2}')`
  }

  explain(quest) {
    return `${this.actor_name1} must be best friends with ${this.actor_name2}`
  }

  isOk(quest) {
    const unit1 = quest.getActorUnit(this.actor_name1)
    const unit2 = quest.getActorUnit(this.actor_name2)
    return unit1.getBestFriend() == unit2
  }
}
