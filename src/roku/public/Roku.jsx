function Roku({ urlPrefix }) {
  const svg = React.createRef(null);

  function handleOnLoad() {
    addSvgButtonHandlers(svg, urlPrefix);
  }

  return (<div>
    <object ref={svg}
            onLoad={() => handleOnLoad()}
            type="image/svg+xml"
            data={`${urlPrefix}/roku-remote.svg`}
            style={{ border: '1px solid white;', width: '100%', maxWidth: '300px' }}/>
  </div>);
}

module.exports = Roku;
