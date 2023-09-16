import JSX from "../../../helpers/jsx";
import { LircRemote } from "../LircRemote";

export interface LircTxIndexParams {
  moduleName: string;
  remotes: LircRemote[];
}

export function lircTxIndex(params: LircTxIndexParams): string {
  return (
    <ul>
      {params.remotes.map((remote) => (
        <li>
          <div>{remote.name}</div>
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
        </li>
      ))}
    </ul>
  );
}
