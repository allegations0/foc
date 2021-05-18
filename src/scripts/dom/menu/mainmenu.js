function getMainMenuItems() {
  if (!('MAINMENU' in setup.DOM.Card)) {

    setup.DOM.Menu.MAINMENU_ITEMS = [
      [  /* Row: quest and mail */
        {
          title: 'Quest',
          passage: 'QuestHub',
          restrictions: [setup.qres.Building('questoffice'),],
          extra() {
            const open = State.variables.company.player.getOpenQuests().length
            if (open) {
              return html`(${setup.DOM.Text.success(open)})`
            } else {
              return null
            }
          },
        },
        {
          title: 'Mail',
          passage: 'OpportunityList',
          restrictions: [setup.qres.Building('mailroom'),],
          extra() {
            const open = State.variables.opportunitylist.getOpportunities().length
            if (open) {
              return html`(${setup.DOM.Text.success(open)})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Row: units */
        {
          title: 'Slaver',
          passage: 'Lodgings',
          restrictions: [setup.qres.Building('lodgings'),],
          extra() {
            const current = State.variables.company.player.getUnits({ job: setup.job.slaver }).length
            const limit = State.variables.company.player.getMaxUnitOfJob(setup.job.slaver)
            return html`(${current}/${limit})`
          },
        },
        {
          title: 'Slave',
          passage: 'Dungeons',
          restrictions: [setup.qres.Building('dungeons'),],
          extra() {
            const current = State.variables.company.player.getUnits({ job: setup.job.slave }).length
            const limit = State.variables.company.player.getMaxUnitOfJob(setup.job.slave)
            return html`(${current}/${limit})`
          },
        },
      ],

      [  /* Row: new hires */
        {
          title: 'Prospect',
          passage: 'MarketSlaver',
          restrictions: [setup.qres.Building('prospectshall'),],
          extra() {
            const prospects = State.variables.market.slavermarket.countMarketObjects()
            if (prospects) {
              return html`(${setup.DOM.Text.successlite(prospects)})`
            } else {
              return null
            }
          },
        },
        {
          title: 'Slave Pen',
          passage: 'MarketSlave',
          restrictions: [setup.qres.Building('slavepens'),],
          extra() {
            const slaves = State.variables.market.slavemarket.countMarketObjects()
            if (slaves) {
              return html`(${setup.DOM.Text.successlite(slaves)})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Team, duty */
        {
          title: 'Team',
          passage: 'TeamManagement',
          restrictions: [setup.qres.Building('missioncontrol'),],
        },
        {
          title: 'Party',
          passage: 'PartyManagement',
          restrictions: [setup.qres.Building('moraleoffice'),],
        },
        {
          title: 'Duty',
          passage: 'DutyList',
          restrictions: [setup.qres.Building('dutyroom'),],
          extra() {
            const open = State.variables.dutylist.getOpenDutiesCount()
            if (open) {
              return html`(${setup.DOM.Text.successlite(open)})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Build, order*/
        {
          title: 'Fort',
          passage: 'FortGrid',
          restrictions: [setup.qres.Building('constructionoffice'),],
          extra() {
            const unplaced = State.variables.roomlist.getUnplacedRooms()
            if (unplaced.length) {
              return html`(${setup.DOM.Text.success(unplaced.length)})`
            } else {
              return null
            }
          },
        },
        {
          title: 'Order',
          passage: 'SlaveOrderList',
          restrictions: [setup.qres.Building('marketingoffice'),],
          extra() {
            const orders = State.variables.slaveorderlist.countSlaveOrders()
            if (orders) {
              return html`(${setup.DOM.Text.successlite(orders)})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Forge, sex shop */
        {
          title: 'Forge',
          passage: 'MarketCombatEquipment',
          restrictions: [setup.qres.Building('forge'),],
          extra() {
            const objects = State.variables.market.combatequipmentmarket.countMarketObjects()
            if (objects) {
              return html`(${objects})`
            } else {
              return null
            }
          },
        },
        {
          title: 'Sex Shop',
          passage: 'MarketSexEquipment',
          restrictions: [setup.qres.Building('sexshop'),],
          extra() {
            const objects = State.variables.market.sexequipmentmarket.countMarketObjects()
            if (objects) {
              return html`(${objects})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Market, lore */
        {
          title: 'Market',
          passage: 'MarketItem',
          restrictions: [setup.qres.Building('market'),],
          extra() {
            const objects = State.variables.market.itemmarket.countMarketObjects()
            if (objects) {
              return html`(${objects})`
            } else {
              return null
            }
          },
        },
        {
          title: 'Items',
          passage: 'Inventory',
          restrictions: [setup.qres.Building('warehouse'),],
        },
        {
          title: 'Injury',
          passage: 'Hospital',
          restrictions: [setup.qres.Building('hospital'),],
          extra() {
            const injured = State.variables.company.player.getUnits({ injured: true }).length
            if (injured) {
              return html`(${setup.DOM.Text.dangerlite(injured)})`
            } else {
              return null
            }
          },
        },
      ],

      [  /* Equipment, inventory */
        {
          title: 'Equipment',
          passage: 'Armory',
          restrictions: [setup.qres.Building('armory'),],
        },
        {
          title: 'Classroom',
          passage: 'Classroom',
          restrictions: [setup.qres.Building('classroom'),],
        },
      ],

      [  /* Rec wing, bedchamber */
        {
          title: 'Bedchamber',
          passage: 'BedchamberList',
          restrictions: [setup.qres.Building('bedchamberwing'),],
        },
        {
          title: 'Rec. Wing',
          passage: 'RecreationWing',
          restrictions: [setup.qres.Building('recreationwing'),],
        },
      ],

      [  /* Relations, contact */
        {
          title: 'Relations',
          passage: 'RelationsOffice',
          restrictions: [setup.qres.Building('relationsoffice'),],
        },
        {
          title: 'Contact',
          passage: 'ContactList',
          restrictions: [setup.qres.Building('messengerpost'),],
        },
        {
          title: 'Lore',
          passage: 'Library',
          restrictions: [setup.qres.Building('library'),],
        },
      ],

      [
        {
          title: 'Retirees',
          passage: 'RetiredList',
          restrictions: [setup.qres.Building('inn'),],
          extra() {
            const current = State.variables.retiredlist.getUnits().length
            const limit = State.variables.retiredlist.getMaxTrackedUnits()
            return html`(${current}/${limit})`
          },
        },
        {
          title: 'Company',
          passage: 'CompanyInfo',
          restrictions: [setup.qres.Building('grandhall'),],
        },
      ],

      [  /* Company info, settings */
        {
          title: 'Settings',
          passage: 'SettingsMenu',
          restrictions: [],
        },
      ],

    ]
  }
  return setup.DOM.Menu.MAINMENU_ITEMS
}


/**
 * Generate menu on the left.
 * 
 * @returns {setup.DOM.Node}
 */
setup.DOM.Menu.mainmenu = function () {
  const fragments = []
  for (const row of getMainMenuItems()) {
    const children = []
    for (const cell of row) {
      if (setup.RestrictionLib.isPrerequisitesSatisfied(null, cell.restrictions)) {
        // push separator between menus in the same row
        if (children.length) children.push(html` | `)

        children.push(setup.DOM.Nav.move(
          cell.title,
          cell.passage,
        ))

        if (cell.extra) {
          children.push(html` `)
          children.push(setup.DOM.create('span', {}, cell.extra()))
        }
      }
    }
    if (children.length) {
      fragments.push(setup.DOM.create(
        'div',
        {},
        children,
      ))
    }
  }
  return setup.DOM.create(
    'span',
    {},
    fragments
  )
}

