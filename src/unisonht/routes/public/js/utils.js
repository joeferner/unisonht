window.visitSvgDomNodes = (elem, fn) => {
  for (const child of elem.childNodes) {
    fn(child);
    window.visitSvgDomNodes(child, fn);
  }
};

window.addSvgButtonHandlers = (elem, urlPrefix) => {
  if (elem.current && elem.current.contentDocument) {
    elem = elem.current.contentDocument;
  }
  visitSvgDomNodes(elem, (elem) => {
    if (elem.id && elem.id.startsWith('button_')) {
      elem.style.cursor = 'pointer';
      elem.addEventListener('click', () => {
        const button = elem.id.substring('button_'.length).replace(/_\d+$/, '');
        axios.post(`${urlPrefix}/button`, { button })
          .then((res) => {
            // OK
          })
          .catch((err) => {
            console.error(`failed pressing button: ${button}`, err);
          });
      });
    }
  });
};

