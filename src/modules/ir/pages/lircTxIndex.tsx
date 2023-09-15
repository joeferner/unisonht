import JSX from "../../../helpers/jsx";
import { LircRemote } from "../LircRemote";

export function lircTxIndex(params: { moduleName: string; remotes: LircRemote[] }): string {
  const script = `<script>
      function doButton(remoteName, key) {
        console.log(remoteName, key);
        fetch('/module/${params.moduleName}/' + remoteName + '?key=' + encodeURIComponent(key), {
          method: "POST"
        });
      }
    </script>`;

  return (
    script +
    (
      <ul>
        {params.remotes.map((remote) => (
          <li>
            <div>{remote.name}</div>
            <ul>
              {remote.keyNames.map((key) => (
                <li>
                  <button onclick={`doButton('${remote.name}', '${key}')"`}>{key}</button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )
  );
}
