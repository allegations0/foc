//
// File that defines custom types to override some of SugarCube
//   Base on SugarCube's offical types "userdata.d.ts" file
//   See: https://www.motoslave.net/sugarcube/2/docs/#guide-typescript
//    
// Note: the types at 'types/sugarcube/' are copied from official package
//       "@types/twine-sugarcube" but they have been slightly modified to 
//       prevent issues such that it "seals off" the setup global, and all attempts
//       to define stuff there report type errors "X does not exist in setup"
//
// Modifications applied to files from "@types/twine-sugarcube":
//   - globals.d.ts: comment out "const setup: SugarCubeSetupObject;"
//   - sugarcube.d.ts: comment out "readonly setup: SugarCubeSetupObject;"
//   - userdata.d.ts: replace all the content of the file by:
//       export * from "../sugarcube-custom"
//   - macro.d.ts: append at the end inside of block "export interface MacroContext {":
//       createShadowWrapper<P, R>(callback: (...args: P) => R): ((...args: P) => R)
//

export interface SugarCubeSetupObject {}

export interface SugarCubeStoryVariables extends StateVariables {}

export interface SugarCubeTemporaryVariables {
  [x: string]: any
}

export interface SugarCubeSettingVariables {}


//
// Fixes for official SugarCube types (lel...)
//

import { MacroAPI } from "./sugarcube/macro"
import { StateAPI } from "./sugarcube/state"
import { EngineAPI } from "./sugarcube/engine"

declare global {
  
  const Macro: MacroAPI & {
    add(name: string, alias: string)
  }

  const State: StateAPI & {
    history: any[]
    activeIndex: number
  }

  const Story: StoryAPI & {
  }
  
  const Engine: EngineAPI & {
    minDomActionDelay: number
  }

  declare interface StorageAPI {
    has(key: string): boolean
    get(key: string): any|null
    set(key: string, value: any): boolean
    delete(key: string): boolean
  }
  const storage: StorageAPI


  declare class Wikifier {
    constructor(element: HTMLElement|DocumentFragment, contents: string)
    output: ParentNode|null
  }

}

