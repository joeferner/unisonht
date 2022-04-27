import { UnisonHTEvent } from "./UnisonHTEvent";

export interface ButtonEvent extends UnisonHTEvent {
  type: "button";
  button: string;
}
