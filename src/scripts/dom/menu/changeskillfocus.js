/**
 * @param {setup.Unit} unit
 * @returns {setup.DOM.Node}
 */
setup.DOM.Menu.changeskillfocus = function (unit) {
  const fragments = []
  fragments.push(html`
    <div>
      Change ${unit.rep()}'s skill focuses.
      ${setup.DOM.Util.help(`
        Skill focus is the priority skill that the unit will try to focus on.
        If a skill is one of the skill focuses, then it is guaranteed to gain at least one point per
        level up, but can sometimes gain more than one:
        Each skill focus grants a ${(setup.SKILL_FOCUS_MULTI_INCREASE_CHANCE * 100).toFixed(0)}% chance
        the skill will get another extra point at level up.
        You can select the same skills multiple times as a skill focus, which will increase the chance further.
        For example,
        [${setup.skill.brawn.rep()}${setup.skill.brawn.rep()}${setup.skill.arcane.rep()}]
        means the unit will always gain
        ${setup.skill.brawn.rep()}${setup.skill.arcane.rep()}
        on level up.
        It has roughly
        ${setup.DOM.Util.help(html`
          Each skill focus chance is calculated independently. So
          [${setup.skill.brawn.rep()}${setup.skill.brawn.rep()}${setup.skill.arcane.rep()}]
          means that there are two chances, each with
          ${(setup.SKILL_FOCUS_MULTI_INCREASE_CHANCE * 100).toFixed(0)}% probability,
          that the unit will get an extra
          ${setup.skill.brawn.rep()}
          point.
          This means there is a small chance the unit will get
          ${setup.skill.brawn.rep()}${setup.skill.brawn.rep()}${setup.skill.brawn.rep()}
          during one level up.
        `)}
        ${(2 * setup.SKILL_FOCUS_MULTI_INCREASE_CHANCE * 100).toFixed(0)}%
        chhance to get
        an extra ${setup.skill.brawn.rep()} point, and
        ${(setup.SKILL_FOCUS_MULTI_INCREASE_CHANCE * 100).toFixed(0)}% chance to get
        an extra ${setup.skill.arcane.rep()} point.
        The order of the skill focuses does not matter.
        Note that a unit always gain six skill points on level up -- the remaining points
        after the skill focuses are assigned to random skills.
      `)
    }
    </div>
  `)

  fragments.push(setup.DOM.Card.unit(
    unit, /* hide actions = */ true
  ))

  const skill_base = unit.getSkillsBase()
  const skill_add = unit.getSkillsAdd()
  const skill_mod = unit.getSkillModifiers()
  const skill_modadd = unit.getSkillAdditives()

  const focuses = unit.getSkillFocuses(/* no sort = */ true)
  let z = []
  for (let i = 0; i < focuses.length; ++i) {
    z.push(i)
  }
  z.forEach(i => {
    const focus = focuses[i]
    const inner = []
    inner.push(html`
      <div>
      Change focus #${i + 1} from
      ${setup.SkillHelper.explainSkillWithAdditive({
      val: skill_base[focus.key],
      add: skill_add[focus.key],
      modifier: skill_mod[focus.key],
      modifier_add: skill_modadd[focus.key],
      skill: focus,
    })}
      to: (click the icon below to change)
      </div>
    `)
    const veryin = []
    setup.skill.forEach(skill => {
      veryin.push(setup.DOM.Util.onEvent(
        'click',
        html`[${setup.SkillHelper.explainSkillWithAdditive({
          val: skill_base[skill.key],
          add: skill_add[skill.key],
          modifier: skill_mod[skill.key],
          modifier_add: skill_add[skill.key],
          skill: skill,
        })}]
        `,
        () => {
          unit.setSkillFocus(i, skill)
          setup.DOM.Nav.goto()
        }))
    })
    inner.push(setup.DOM.create('div', {}, veryin))
    fragments.push(setup.DOM.create('div', {}, inner))
  })

  fragments.push(html`
    <div>
      ${setup.DOM.Nav.return('(Confirm)')}
    </div>
  `)

  setup.DOM.Nav.topLeftNavigation(setup.DOM.Nav.return(`Confirm`))

  return setup.DOM.create('div', {}, fragments)
}
