export class ButtonNotFoundError extends Error {
  private readonly _button: string;

  constructor(button: string) {
    super(`"${button}" not found`);
    this._button = button;
  }

  get button(): string {
    return this._button;
  }
}
