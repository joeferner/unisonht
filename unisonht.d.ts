/// <reference path="./typings/index.d.ts" />

type ButtonFunction = ()=>Promise<void>;

interface Mode {
  buttonMap?: {
    [name: string]: ButtonFunction
  },
  onEnter?: ()=>Promise<void>,
  onExit?: ()=>Promise<void>,
  defaultDevice?: string
}

interface InputData {
  remote?: string,
  button: string,
  repeat?: number
}