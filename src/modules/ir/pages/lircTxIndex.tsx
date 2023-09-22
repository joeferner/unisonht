import JSX, { JSXElement } from "../../../helpers/jsx";
import { Key, keyToShortDisplayName } from "../../../keys";
import { ButtonLayout, LircRemote } from "../LircRemote";

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

function keyToHtml(key: Key | string): JSXElement {
  switch (key) {
    case Key.DIR_UP:
      return <i class="fa-solid fa-caret-up"></i>;
    case Key.DIR_LEFT:
      return <i class="fa-solid fa-caret-left"></i>;
    case Key.DIR_RIGHT:
      return <i class="fa-solid fa-caret-right"></i>;
    case Key.DIR_DOWN:
      return <i class="fa-solid fa-caret-down"></i>;
  }
  return keyToShortDisplayName(key);
}

function Remote(params: RemoteParams): JSXElement {
  let otherKeys: string[];
  let buttonLayoutElem: JSXElement | undefined;
  let buttonLayout: ButtonLayout | undefined;
  if (params.remote.buttonLayout) {
    buttonLayout = params.remote.buttonLayout;
    const buttonLayoutKeys = (params.remote.buttonLayout?.buttons ?? []).map((b) => b.key);
    otherKeys = params.remote.keyNames.filter((name) => !buttonLayoutKeys.includes(name));
  } else {
    buttonLayout = {
      width: 300,
      height: 0,
      buttons: [],
    };
    otherKeys = [...params.remote.keyNames];
    let top = 0;

    const removeOtherKey = (key: Key): boolean => {
      const idx = otherKeys.indexOf(key);
      if (idx < 0) {
        return false;
      }
      otherKeys.splice(idx, 1);
      return true;
    };

    const addRow = (keys: Key[]): void => {
      if (!buttonLayout) {
        throw new Error("invalid state");
      }
      const validKeys = keys.map((k) => removeOtherKey(k));
      const validKeyCount = validKeys.filter((b) => b).length;
      if (validKeyCount) {
        const itemWidth = 1 / validKeyCount;
        let left = 0;
        for (let i = 0; i < keys.length; i++) {
          if (validKeys[i]) {
            buttonLayout.buttons.push({
              top,
              left,
              key: keys[i],
              width: itemWidth,
              height: 0,
              displayName: "???",
            });
            left += itemWidth;
          }
        }
        buttonLayout.height += 50;
        top++;
      }
    };

    addRow([Key.POWER_OFF, Key.POWER_ON, Key.POWER_TOGGLE]);
    addRow([Key.NUM_1, Key.NUM_2, Key.NUM_3]);
    addRow([Key.NUM_4, Key.NUM_5, Key.NUM_6]);
    addRow([Key.NUM_7, Key.NUM_8, Key.NUM_9]);
    addRow([Key.NUM_0]);
    addRow([Key.VOLUME_UP, Key.CHANNEL_UP]);
    addRow([Key.VOLUME_DOWN, Key.CHANNEL_DOWN]);
    addRow([Key.MUTE]);
    addRow([Key.DIR_UP]);
    addRow([Key.DIR_LEFT, Key.SELECT, Key.DIR_RIGHT]);
    addRow([Key.DIR_DOWN]);

    const itemHeight = 1 / top;
    for (const b of buttonLayout.buttons) {
      b.top = b.top * itemHeight;
      b.height = itemHeight;
    }
  }

  if (buttonLayout) {
    buttonLayoutElem = (
      <div
        className="lirc-tx-button-layout"
        style={{ width: `${buttonLayout.width}px`, height: `${buttonLayout.height}px` }}
      >
        {buttonLayout.buttons.map((button) => (
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
              {button.displayName === "???" ? keyToHtml(button.key) : button.displayName}
            </button>
          </div>
        ))}
      </div>
    );
  } else {
    buttonLayoutElem = undefined;
  }

  const remainingKeys = [];
  while (otherKeys.length > 0) {
    remainingKeys.push(otherKeys.splice(0, 4));
  }

  return (
    <div className="lirc-tx">
      {buttonLayoutElem}
      {remainingKeys.length > 0 ? (
        <div className="remaining-keys">
          {remainingKeys.map((row) => (
            <div>
              {row.map((key) => (
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick={`lircButtonPress('${params.moduleName}', '${params.remote.name}', '${key}')"`}
                >
                  {keyToHtml(key)}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
