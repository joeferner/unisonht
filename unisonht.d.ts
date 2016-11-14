/// <reference path="./typings/index.d.ts" />

interface Mode {
  buttonMap?: {
    [name: string]: ()=>Promise<void>
  },
  onEnter?: ()=>Promise<void>,
  onExit?: ()=>Promise<void>,
  defaultDevice?: string
}
