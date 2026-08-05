(() => {
  const globalNavItems = [...document.querySelectorAll('.global-nav-item[data-nav]')];
  const globalPages = [...document.querySelectorAll('.device-workspace > [data-page]')];

  const showGlobalPage = (target) => {
    const targetPage = globalPages.find((page) => page.dataset.page === target);
    if (!targetPage) return;

    globalPages.forEach((page) => {
      page.hidden = page.dataset.page !== target;
    });
    globalNavItems.forEach((item) => {
      const activePage = targetPage.dataset.parentNav || target;
      const isActive = item.dataset.nav === activePage;
      item.classList.toggle('is-active', isActive);
      if (isActive) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  };

  document.querySelectorAll('[data-nav]').forEach((item) => {
    item.addEventListener('click', () => showGlobalPage(item.dataset.nav));
  });
  showGlobalPage('device');

  const taskTabs = [...document.querySelectorAll('[data-task-tab]')];
  const taskPanels = [...document.querySelectorAll('[data-task-panel]')];

  if (taskTabs.length && taskPanels.length) {
    const selectTaskTab = (selectedTab, moveFocus = false) => {
      const selectedName = selectedTab.dataset.taskTab;

      taskTabs.forEach((tab) => {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });
      taskPanels.forEach((panel) => {
        panel.hidden = panel.dataset.taskPanel !== selectedName;
      });

      if (moveFocus) selectedTab.focus();
    };

    taskTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTaskTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + offset + taskTabs.length) % taskTabs.length;
        selectTaskTab(taskTabs[nextIndex], true);
      });
    });
  }

  const SIDEBAR_COLLAPSED_STORAGE_KEY = 'xkprint.sidebarCollapsed';
  const workspace = document.querySelector('.device-workspace');
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const deviceMenuButton = document.querySelector('[data-device-menu]');
  const deviceSubmenu = document.querySelector('.device-submenu');
  const deviceList = document.querySelector('.device-list');
  const activeDevice = document.querySelector('[data-active-device]');

  const setDeviceMenuExpanded = (isExpanded) => {
    if (!deviceMenuButton || !deviceSubmenu) return;
    deviceMenuButton.setAttribute('aria-expanded', String(isExpanded));
    deviceSubmenu.hidden = !isExpanded;
  };

  const setSidebarCollapsed = (isCollapsed, persist = true) => {
    if (!workspace || !sidebarToggle) return;
    workspace.classList.toggle('is-sidebar-collapsed', isCollapsed);
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? '展开侧边栏' : '折叠侧边栏');
    sidebarToggle.dataset.tooltip = isCollapsed ? '展开侧边栏' : '折叠侧边栏';
    if (isCollapsed) setDeviceMenuExpanded(false);
    if (!persist) return;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isCollapsed));
    } catch {}
  };

  let isSidebarInitiallyCollapsed = false;
  try {
    isSidebarInitiallyCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {}
  setSidebarCollapsed(isSidebarInitiallyCollapsed, false);

  sidebarToggle?.addEventListener('click', () => {
    setSidebarCollapsed(!workspace.classList.contains('is-sidebar-collapsed'));
  });

  if (deviceMenuButton && deviceSubmenu) {
    deviceMenuButton.addEventListener('click', () => {
      if (workspace?.classList.contains('is-sidebar-collapsed')) {
        setSidebarCollapsed(false);
        setDeviceMenuExpanded(true);
        return;
      }
      setDeviceMenuExpanded(deviceMenuButton.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (deviceList && activeDevice) {
    const selectDevice = (device) => {
      const devices = [...deviceList.querySelectorAll('[data-device-name]')];
      devices.forEach((item) => {
        item.setAttribute('aria-selected', String(item === device));
      });

      activeDevice.querySelector('b').textContent = device.dataset.deviceName;
      activeDevice.querySelector('em').textContent = device.dataset.deviceStatus;
      activeDevice.classList.toggle('is-offline', device.dataset.deviceStatus === '离线');
    };

    deviceList.addEventListener('click', (event) => {
      const device = event.target.closest('[data-device-name]');
      if (device) selectDevice(device);
    });

  }


  const lightSwitches = [...document.querySelectorAll('[data-light]')];
  const lightSummary = document.querySelector('[data-light-summary]');
  const lightStatsTrigger = document.querySelector('[data-popup-trigger="light"]');

  const syncLightSummary = () => {
    const enabledLights = lightSwitches.filter((light) => light.getAttribute('aria-checked') === 'true');
    const enabledNames = enabledLights.map((light) => light.dataset.light === 'rgb' ? 'RGB 灯' : '照明灯');
    if (lightSummary) lightSummary.textContent = `${enabledLights.length} 路开启`;
    if (lightStatsTrigger) {
      lightStatsTrigger.setAttribute('aria-label', enabledNames.length ? `照明设置，${enabledNames.join('和')}开启` : '照明设置，灯光均关闭');
      lightStatsTrigger.querySelector('.rgb-status-dot')?.classList.toggle('is-off', !enabledNames.includes('RGB 灯'));
      lightStatsTrigger.querySelector('.white-status-dot')?.classList.toggle('is-off', !enabledNames.includes('照明灯'));
    }
  };

  lightSwitches.forEach((lightSwitch) => {
    lightSwitch.addEventListener('click', () => {
      const isEnabled = lightSwitch.getAttribute('aria-checked') === 'true';
      lightSwitch.setAttribute('aria-checked', String(!isEnabled));
      lightSwitch.querySelector('span').textContent = isEnabled ? '关闭' : '开启';
      syncLightSummary();
    });
  });

  const controlPopups = [...document.querySelectorAll('.control-popup')];
  const popupTriggers = [...document.querySelectorAll('[data-popup-trigger]')];
  const motionPanel = document.querySelector('.motion-panel');
  let openPopupName = null;

  const setPopup = (name, trigger = null) => {
    controlPopups.forEach((popup) => {
      popup.hidden = popup.dataset.popup !== name;
    });
    popupTriggers.forEach((t) => {
      t.setAttribute('aria-expanded', String(t.dataset.popupTrigger === name));
    });
    openPopupName = name;

    const popup = name ? controlPopups.find((p) => p.dataset.popup === name) : null;
    if (popup && trigger && motionPanel) {
      popup.style.top = 'auto';
      popup.style.height = 'auto';
      const panelRect = motionPanel.getBoundingClientRect();
      const rowRect = trigger.getBoundingClientRect();
      const rowTop = rowRect.top - panelRect.top;
      const naturalHeight = popup.offsetHeight;
      const maxTop = panelRect.height - 42 - naturalHeight;
      popup.style.top = `${Math.max(42, Math.min(rowTop, maxTop))}px`;
      popup.style.height = `${naturalHeight}px`;
    }
  };

  const repositionOpenPopup = () => {
    if (!openPopupName) return;
    const trigger = popupTriggers.find((item) => item.dataset.popupTrigger === openPopupName);
    if (trigger) setPopup(openPopupName, trigger);
  };

  window.addEventListener('resize', repositionOpenPopup);

  popupTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const name = trigger.dataset.popupTrigger;
      setPopup(openPopupName === name ? null : name, trigger);
    });
  });

  document.querySelectorAll('[data-close-popup]').forEach((button) => {
    button.addEventListener('click', () => setPopup(null));
  });

  const fanStatsTrigger = document.querySelector('[data-popup-trigger="fan"]');
  const fanLabels = { part: '部件', aux: '辅助', case: '机箱' };
  const fanValues = {};

  const syncFanSummary = (fan, value) => {
    fanValues[fan] = value;
    const summary = document.querySelector(`[data-fan-summary="${fan}"]`);
    if (summary) {
      summary.textContent = `${value}%`;
      summary.nextElementSibling?.style.setProperty('--fan-level', `${value}%`);
    }
    if (fanStatsTrigger) {
      fanStatsTrigger.setAttribute('aria-label', `风扇状态，${Object.entries(fanLabels).map(([key, label]) => `${label} ${fanValues[key]}%`).join('，')}`);
    }
  };

  document.querySelectorAll('[data-fan]').forEach((slider) => {
    const output = document.querySelector(`[data-fan-output="${slider.dataset.fan}"]`);
    syncFanSummary(slider.dataset.fan, slider.value);
    if (!output) return;
    slider.addEventListener('input', () => {
      output.textContent = `${slider.value}%`;
      syncFanSummary(slider.dataset.fan, slider.value);
    });
  });

  const speedButtons = [...document.querySelectorAll('.speed-mode')];
  const speedInput = document.querySelector('[data-speed-input]');
  const speedStatsTrigger = document.querySelector('[data-popup-trigger="speed"]');

  const syncSpeedPresets = (value) => {
    const match = speedButtons.find((button) => Number(button.dataset.speed) === value);
    speedButtons.forEach((button) => {
      const isActive = button === match;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const applySpeed = (value) => {
    if (speedStatsTrigger) {
      speedStatsTrigger.querySelector('strong').textContent = `${value}%`;
      speedStatsTrigger.setAttribute('aria-label', `打印速度，当前 ${value}%`);
    }
  };

  speedButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.speed);
      syncSpeedPresets(value);
      if (speedInput) speedInput.value = value;
      applySpeed(value);
    });
  });

  speedInput?.addEventListener('input', () => {
    const raw = speedInput.value.trim();
    if (raw === '') return;
    const value = Math.min(400, Math.max(1, Number(raw)));
    if (!Number.isFinite(value)) return;
    syncSpeedPresets(value);
    applySpeed(value);
  });

  const taskViewButtons = [...document.querySelectorAll('[data-task-view]')];
  const taskViewPanels = [...document.querySelectorAll('[data-task-view-panel]')];

  taskViewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedView = button.dataset.taskView;

      taskViewButtons.forEach((option) => {
        option.setAttribute('aria-pressed', String(option === button));
      });
      taskViewPanels.forEach((panel) => {
        panel.hidden = panel.dataset.taskViewPanel !== selectedView;
      });
    });
  });

  document.querySelectorAll('[data-print-task]').forEach((task) => {
    const state = task.querySelector('[data-task-state]');
    const startButton = task.querySelector('[data-print-action="start"]');
    const pauseButton = task.querySelector('[data-print-action="pause"]');
    if (!state || !startButton || !pauseButton) return;

    const setPrintState = (nextState) => {
      const isPrinting = nextState === 'printing';
      task.dataset.printState = isPrinting ? 'printing' : 'paused';
      state.textContent = isPrinting ? '正在打印' : '已暂停';
      state.classList.toggle('printing', isPrinting);
      state.classList.toggle('paused', !isPrinting);
      startButton.disabled = isPrinting;
      pauseButton.disabled = !isPrinting;
    };

    startButton.addEventListener('click', () => setPrintState('printing'));
    pauseButton.addEventListener('click', () => setPrintState('paused'));
    setPrintState(task.dataset.printState);
  });

  const materialHeads = [...document.querySelectorAll('[data-material-head]')];
  const materialDetails = document.querySelector('.material-details');
  const selectedHeadLabel = document.querySelector('[data-selected-head]');
  const closeMaterialButton = document.querySelector('[data-close-material]');
  const colorWheelTrigger = document.querySelector('[data-color-wheel-trigger]');
  const colorWheelPicker = document.querySelector('#custom-color-picker');

  const setColorWheelExpanded = (isExpanded) => {
    if (!colorWheelTrigger || !colorWheelPicker) return;
    colorWheelTrigger.setAttribute('aria-expanded', String(isExpanded));
    colorWheelPicker.hidden = !isExpanded;
  };

  if (materialHeads.length && materialDetails && selectedHeadLabel) {
    const selectMaterialHead = (head) => {
      materialHeads.forEach((option) => {
        const isSelected = option === head;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
      });
      selectedHeadLabel.textContent = head.dataset.materialHead;
      materialDetails.hidden = false;
      materialDetails.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      setColorWheelExpanded(false);
    };

    materialHeads.forEach((head) => {
      head.addEventListener('click', () => selectMaterialHead(head));
    });


    colorWheelTrigger?.addEventListener('click', () => {
      const isExpanded = colorWheelTrigger.getAttribute('aria-expanded') === 'true';
      setColorWheelExpanded(!isExpanded);
      if (!isExpanded) colorWheelPicker?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    closeMaterialButton?.addEventListener('click', () => {
      materialDetails.hidden = true;
      setColorWheelExpanded(false);
      materialHeads.forEach((head) => {
        head.classList.remove('is-selected');
        head.setAttribute('aria-pressed', 'false');
      });
    });
  }

  let modelDetailReturnPage = 'models';
  const modelDetailPage = document.querySelector('[data-page="model-detail"]');
  const modelDetailImage = modelDetailPage?.querySelector('[data-model-detail-image]');
  const modelDetailFields = ['title', 'author', 'description', 'format', 'size', 'estimate', 'status'];

  document.querySelectorAll('[data-model-card]').forEach((card) => {
    card.querySelector('[data-model-open]')?.addEventListener('click', () => {
      modelDetailReturnPage = card.closest('[data-page]')?.dataset.page || 'models';
      modelDetailFields.forEach((field) => {
        const target = modelDetailPage?.querySelector(`[data-model-detail-${field}]`);
        if (!target) return;
        target.textContent = field === 'author' ? `作者 · ${card.dataset.modelAuthor}` : card.dataset[`model${field[0].toUpperCase()}${field.slice(1)}`];
      });
      const cardImage = card.querySelector('img');
      if (modelDetailImage && cardImage) {
        modelDetailImage.src = cardImage.src;
        modelDetailImage.alt = `${card.dataset.modelTitle}预览`;
      }
      showGlobalPage('model-detail');
    });
  });

  document.querySelector('[data-model-detail-back]')?.addEventListener('click', () => showGlobalPage(modelDetailReturnPage));

  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const isFavorite = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!isFavorite));
    });
  });

  document.querySelectorAll('[data-model-filter]').forEach((filter) => {
    filter.addEventListener('click', () => {
      document.querySelectorAll('[data-model-filter]').forEach((option) => {
        const isSelected = option === filter;
        option.classList.toggle('is-active', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
      });
      document.querySelectorAll('[data-page="models"] [data-model-card]').forEach((card) => {
        card.hidden = filter.dataset.modelFilter === 'favorite' && card.querySelector('[data-favorite]')?.getAttribute('aria-pressed') !== 'true';
      });
    });
  });

  document.querySelectorAll('.model-search input').forEach((input) => {
    input.addEventListener('input', () => {
      const page = input.closest('[data-page]');
      const query = input.value.trim().toLocaleLowerCase('zh-CN');
      page?.querySelectorAll('[data-model-card]').forEach((card) => {
        card.hidden = !`${card.dataset.modelTitle} ${card.dataset.modelAuthor}`.toLocaleLowerCase('zh-CN').includes(query);
      });
    });
  });

  window.lucide?.createIcons();
})();
