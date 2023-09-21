import JSX from "../../../helpers/jsx";
import { LircRemote } from "../LircRemote";

export interface LircTxIndexParams {
  moduleName: string;
  remotes: LircRemote[];
}

export function lircTxIndex(params: LircTxIndexParams): string {
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
            <ul>
              {remote.keyNames.map((key) => (
                <li>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onclick={`lircButtonPress('${params.moduleName}', '${remote.name}', '${key}')"`}
                  >
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
