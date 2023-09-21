import JSX, { JSXElement } from "../../../helpers/jsx";

export interface ModePageParams {
  moduleName: string;
  modes: string[];
  currentMode: string;
}

export function modePage(params: ModePageParams): JSXElement {
  return (
    <div>
      <div id="error-mode" class="alert alert-danger display-none" role="alert">
        Failed to switch modes!
      </div>

      {params.modes.map((mode) => {
        return (
          <button
            type="button"
            class="btn btn-primary btn-switch-mode"
            onclick={`modeSwitch('${params.moduleName}', '${mode}')"`}
          >
            {mode}
            {mode == params.currentMode ? " (current)" : ""}
          </button>
        );
      })}
    </div>
  );
}
