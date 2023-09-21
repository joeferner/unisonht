import JSX, { JSXElement } from "../../../helpers/jsx";
import { LircRemote } from "../LircRemote";

export interface LircTxIndexParams {
  moduleName: string;
  remotes: LircRemote[];
}

export function lircTxIndex(params: LircTxIndexParams): JSXElement {
  return (
    <div>
      <nav>
        <div class="tabs" role="tablist">
          {params.remotes.map((remote, index) => (
            <button
              class={index === 0 ? "active" : ""}
              data-tab={`tab_${remote.name}`}
              onclick="tabClick(event)"
              type="button"
              role="tab"
            >
              {remote.displayName}
            </button>
          ))}
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        {params.remotes.map((remote, index) => (
          <div class={index === 0 ? "active" : ""} id={`tab_${remote.name}`} role="tabpanel">
            <Remote moduleName={params.moduleName} remote={remote}></Remote>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RemoteParams {
  moduleName: string;
  remote: LircRemote;
}

function Remote(params: RemoteParams): JSXElement {
  const buttonLayoutKeys = (params.remote.buttonLayout?.buttons ?? []).map((b) => b.key);
  const otherButtons = params.remote.keyNames.filter((name) => !buttonLayoutKeys.includes(name));

  let buttonLayout: JSXElement | undefined;
  if (params.remote.buttonLayout) {
    buttonLayout = (
      <div className="lirc-tx-button-layout">
        {params.remote.buttonLayout.buttons.map((button) => (
          <div
            style={{
              top: `${button.top * 100}%`,
              left: `${button.left * 100}%`,
              width: `${button.width * 100}%`,
              height: `${button.height * 100}%`,
            }}
          >
            <button
              type="button"
              class="btn btn-primary"
              onclick={`lircButtonPress('${params.moduleName}', '${params.remote.name}', '${button.key}')"`}
            >
              {button.displayName}
            </button>
          </div>
        ))}
      </div>
    );
  } else {
    buttonLayout = undefined;
  }

  return (
    <div>
      {buttonLayout}
      <ul>
        {otherButtons.map((key) => (
          <li>
            <button
              type="button"
              class="btn btn-primary"
              onclick={`lircButtonPress('${params.moduleName}', '${params.remote.name}', '${key}')"`}
            >
              {key}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
