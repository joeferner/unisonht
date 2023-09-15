declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module JSX {
    type Element = string;
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elemName: string]: any;
    }
  }
}

export const JSX = {
  createElement(name: string, props: { [id: string]: string }, ...content: string[]): string {
    props = props || {};
    let propsStr = Object.keys(props)
      .map((key) => {
        const value = props[key];
        if (key === "className") {
          return `class="${value}"`;
        } else {
          return `${key}="${value}"`;
        }
      })
      .join(" ");
    if (propsStr.length > 0) {
      propsStr = ` ${propsStr}`;
    }
    const contentStr = content
      .map((c) => {
        if (Array.isArray(c)) {
          return c.join("");
        }
        return c;
      })
      .join("");
    return `<${name}${propsStr}>${contentStr}</${name}>`;
  },
};

export default JSX;
