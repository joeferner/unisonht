function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [Content, setContent] = React.useState(null);
  const [contentUrlPrefix, setContentUrlPrefix] = React.useState(null);
  const [modes, setModes] = React.useState(null);
  const [devices, setDevices] = React.useState(null);
  const [currentMode, setCurrentMode] = React.useState(null);
  const [futureMode, setFutureMode] = React.useState(null);

  function handleOpenMenuClick() {
    setMenuOpen(!menuOpen);
  }

  function handleMenuItemClick(path) {
    loadModule(path)
      .then(m => {
        setContent(() => m);
        setMenuOpen(false);
      });
  }

  function handleModeClick(mode) {
    setFutureMode(mode.name);
    axios.post('/mode', {
      mode: mode.name,
    })
      .then((res) => {
        setFutureMode(null);
        setCurrentMode(res.data.mode);
      })
      .catch((err) => {
        console.error('set mode', err);
        setFutureMode(null);
      });
  }

  function handleDeviceClick(device) {
    history.pushState(null, null, `#${device.urlPrefix}`);
    loadModule(device.urlPrefix)
      .then(m => {
        setContentUrlPrefix(device.urlPrefix);
        setContent(() => m);
        setMenuOpen(false);
      })
      .catch(err => {
        console.error(`load device ${device.name}`, err);
      });
  }

  function refreshModes() {
    return axios.get('/mode')
      .then(res => {
        setModes(res.data.modes);
        return res.data.modes;
      });
  }

  function refreshDevices() {
    return axios.get('/device')
      .then(res => {
        setDevices(res.data.devices);
        return res.data.devices;
      });
  }

  function refreshStatus() {
    return axios.get('/status')
      .then(res => {
        setCurrentMode(res.data.currentMode);
      });
  }

  React.useEffect(() => {
    Promise.all([
      refreshModes(),
      refreshDevices(),
      refreshStatus(),
    ]).then(([modes, devices]) => {
      let moduleToLoad = '/js/Home.jsx';
      const hash = window.location.hash;
      if (hash.startsWith('#/device/')) {
        const device = devices.filter(device => device.urlPrefix === hash.substring(1))[0];
        setContentUrlPrefix(device.urlPrefix);
        moduleToLoad = device.urlPrefix;
      }

      loadModule(moduleToLoad)
        .then(m => {
          setContent(() => m);
        });
    });
  }, []);

  const modeRows = modes
    ? modes.map(mode => {
      return {
        title: mode.name,
        onClick: () => handleModeClick(mode),
        active: currentMode === mode.name,
        future: futureMode === mode.name,
      };
    })
    : [{
      title: 'Loading…',
    }];

  const deviceRows = devices
    ? devices.map(device => {
      return {
        title: device.name,
        onClick: () => handleDeviceClick(device),
      };
    })
    : [{
      title: 'Loading…',
    }];

  const rows = [
    {
      title: 'Home',
      onClick: () => handleMenuItemClick('/js/Home.jsx'),
    },
    {
      title: 'Modes',
      header: true,
    },
    ...modeRows,
    {
      title: 'Devices',
      header: true,
    },
    ...deviceRows,
  ];

  return (<Ons.Splitter>
    <Ons.SplitterSide
      isOpen={menuOpen}
      onOpen={() => setMenuOpen(true)}
      onClose={() => setMenuOpen(false)}
      side="left"
      width={220}
      collapse
      swipeable
    >
      <Ons.Page>
        <Ons.List
          dataSource={rows}
          renderRow={(row, idx) => {
            if (row.header) {
              return (<Ons.ListHeader>{row.title}</Ons.ListHeader>);
            }
            return (<Ons.ListItem
              onClick={row.onClick}
              tappable
              modifier='nodivider'
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', width: '100%' }}>
                <div style={{ flexGrow: 1 }}>{row.title}</div>
                {(row.active || row.future) ? (<div>
                  {row.active ? (<Ons.Icon icon="fa-check-circle"/>) : null}
                  {row.future ? (<Ons.Icon icon="fa-bolt"/>) : null}
                </div>) : null}
              </div>
            </Ons.ListItem>);
          }}
        />
      </Ons.Page>
    </Ons.SplitterSide>
    <Ons.SplitterContent>
      <Ons.Page renderToolbar={() =>
        <Ons.Toolbar>
          <div className="left">
            <Ons.ToolbarButton onClick={() => handleOpenMenuClick()}>
              <Ons.Icon icon="md-menu"/>
            </Ons.ToolbarButton>
          </div>
          <div className="center">
            {Content ? Content.name : 'Loading…'}
          </div>
        </Ons.Toolbar>
      }>
        <div>
          {Content ? (<Content urlPrefix={contentUrlPrefix}/>) : 'Loading…'}
        </div>
      </Ons.Page>
    </Ons.SplitterContent>
  </Ons.Splitter>);
}

module.exports = App;
