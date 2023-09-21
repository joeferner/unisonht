declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module JSX {
    type Element = JSXElement;
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elemName: string]: any;
    }
  }
}

export type JSXElement = string | string[] | JSXFunction;
export type JSXFunction = (props: { [id: string]: string }) => JSXElement;

export const JSX = {
  createElement(
    nameOrFunc: string | JSXFunction,
    props: { [id: string]: string },
    ...content: JSXElement[]
  ): JSXElement {
    props = props || {};
    let propsStr = Object.keys(props)
      .map((key) => {
        const value = props[key];
        if (key === "style" && typeof value === "object") {
          return `${key}="${styleObjectToString(value)}"`;
        } else if (key === "className") {
          return `class="${value}"`;
        } else {
          return `${key}="${value}"`;
        }
      })
      .join(" ");
    if (propsStr.length > 0) {
      propsStr = ` ${propsStr}`;
    }

    if (typeof nameOrFunc === "function") {
      return nameOrFunc(props);
    }

    const contentStr = content
      .map((c) => {
        if (Array.isArray(c)) {
          return c.join("");
        }
        return c;
      })
      .join("");
    return `<${nameOrFunc}${propsStr}>${contentStr}</${nameOrFunc}>`;
  },
};

export function renderJSXElement(elem: JSXElement): string {
  if (typeof elem === "string") {
    return elem;
  }
  throw new Error("unhandled type");
}

function styleObjectToString(obj: { [key: string]: unknown }): string {
  const styles: string[] = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    styles.push(`${key}:${value};`);
  }
  return styles.join("");
}

export default JSX;
