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
      const isActive = item.dataset.nav === target;
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

  document.querySelectorAll('[data-fan]').forEach((slider) => {
    const output = document.querySelector(`[data-fan-output="${slider.dataset.fan}"]`);
    if (!output) return;
    slider.addEventListener('input', () => {
      output.textContent = `${slider.value}%`;
      if (slider.dataset.fan === 'part' && fanStatsTrigger) {
        fanStatsTrigger.querySelector('strong').textContent = `${slider.value}%`;
        fanStatsTrigger.setAttribute('aria-label', `部件风扇，当前 ${slider.value}%`);
      }
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


  /* ----- 子页面交互（移植自根版 app.js） ----- */

  const initAccountSecurity = () => {
    const agreement = document.querySelector('[data-delete-agreement]');
    const submitButton = document.querySelector('[data-delete-submit]');
    if (!agreement || !submitButton) return;

    agreement.addEventListener('change', () => {
      submitButton.disabled = !agreement.checked;
    });
  };

  const initSettingsPreviews = () => {
    const clearButton = document.querySelector('[data-clear-cache]');
    const toast = document.querySelector('[data-cache-toast]');
    let toastTimer;
    if (!clearButton || !toast) return;

    clearButton.addEventListener('click', () => {
      window.clearTimeout(toastTimer);
      toast.classList.add('is-visible');
      toast.setAttribute('aria-hidden', 'false');
      toastTimer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.setAttribute('aria-hidden', 'true');
      }, 1800);
    });
  };

  const initDeviceSettings = () => {
    const nameInput = document.querySelector('[data-device-name-input]');
    const editButton = document.querySelector('[data-device-name-edit]');
    const nameDisplay = document.querySelector('[data-device-name-display]');
    const editLabel = editButton && editButton.querySelector('span');
    let previousName = '';

    if (!nameInput || !editButton || !nameDisplay) return;

    const setEditing = (editing) => {
      nameInput.readOnly = !editing;
      editButton.setAttribute('aria-label', editing ? '保存设备名称' : '编辑设备名称');
      if (editLabel) editLabel.textContent = editing ? '保存' : '编辑';
      if (editing) {
        previousName = nameInput.value;
        nameInput.focus();
        nameInput.select();
      }
    };

    const saveName = () => {
      const name = nameInput.value.trim() || previousName;
      nameInput.value = name;
      nameDisplay.textContent = name;
      setEditing(false);
    };

    editButton.addEventListener('click', () => {
      if (nameInput.readOnly) setEditing(true);
      else saveName();
    });
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveName();
      }
      if (event.key === 'Escape') {
        nameInput.value = previousName;
        setEditing(false);
      }
    });
    nameInput.addEventListener('blur', (event) => {
      if (!nameInput.readOnly && event.relatedTarget !== editButton) saveName();
    });
  };

  const initSoftwareUpdate = () => {
    const checkButton = document.querySelector('[data-check-update]');
    const dialog = document.querySelector('[data-update-dialog]');
    const confirmDialog = document.querySelector('[data-update-confirm]');
    if (!checkButton || !dialog || !confirmDialog) return;

    const views = [...dialog.querySelectorAll('[data-update-view]')];
    const progress = dialog.querySelector('[data-update-progress]');
    const progressFill = dialog.querySelector('[data-update-progress-fill]');
    const percent = dialog.querySelector('[data-update-percent]');
    const stage = dialog.querySelector('[data-update-stage]');
    const currentVersion = document.querySelector('[data-current-software-version]');
    const versionStatus = document.querySelector('[data-software-version-status]');
    let checkTimer;
    let upgradeTimer;
    let upgradeStartedAt = 0;
    let elapsedBeforePause = 0;
    let activeView = 'checking';
    let closeAfterCancel = false;

    const showView = (name) => {
      activeView = name;
      views.forEach((view) => { view.hidden = view.dataset.updateView !== name; });
    };

    const stopUpgradeTimer = () => {
      window.clearInterval(upgradeTimer);
      upgradeTimer = null;
      if (upgradeStartedAt) elapsedBeforePause += Date.now() - upgradeStartedAt;
      upgradeStartedAt = 0;
    };

    const renderProgress = (value) => {
      const rounded = Math.min(100, Math.round(value));
      progressFill.style.width = `${rounded}%`;
      percent.textContent = `${rounded}%`;
      progress.setAttribute('aria-valuenow', String(rounded));
      stage.textContent = rounded < 72 ? '正在下载更新包，请保持设备在线' : '正在安装更新，请勿关闭设备';
    };

    const runUpgrade = () => {
      upgradeStartedAt = Date.now();
      upgradeTimer = window.setInterval(() => {
        const value = ((elapsedBeforePause + Date.now() - upgradeStartedAt) / 5000) * 100;
        renderProgress(value);
        if (value >= 100) {
          stopUpgradeTimer();
          showView('complete');
        }
      }, 80);
    };

    const requestCancelUpgrade = (shouldClose) => {
      if (confirmDialog.open) return;
      closeAfterCancel = shouldClose;
      stopUpgradeTimer();
      confirmDialog.showModal();
    };

    const closeUpdateDialog = () => {
      window.clearTimeout(checkTimer);
      if (activeView === 'upgrading') stopUpgradeTimer();
      if (dialog.open) dialog.close();
    };

    checkButton.addEventListener('click', () => {
      window.clearTimeout(checkTimer);
      showView('checking');
      dialog.showModal();
      checkTimer = window.setTimeout(() => showView('available'), 1500);
    });
    dialog.querySelector('[data-update-start]').addEventListener('click', () => {
      elapsedBeforePause = 0;
      renderProgress(0);
      showView('upgrading');
      runUpgrade();
    });
    dialog.querySelector('[data-update-cancel]').addEventListener('click', () => {
      requestCancelUpgrade(false);
    });
    confirmDialog.querySelector('[data-update-continue]').addEventListener('click', () => {
      confirmDialog.close();
      closeAfterCancel = false;
      runUpgrade();
    });
    confirmDialog.querySelector('[data-update-confirm-cancel]').addEventListener('click', () => {
      confirmDialog.close();
      elapsedBeforePause = 0;
      renderProgress(0);
      showView('available');
      if (closeAfterCancel && dialog.open) dialog.close();
      closeAfterCancel = false;
    });
    dialog.querySelector('[data-update-done]').addEventListener('click', () => {
      currentVersion.textContent = 'v1.5.0';
      versionStatus.textContent = '当前已是最新版本';
      checkButton.textContent = '再次检查';
      dialog.close();
    });
    dialog.querySelector('[data-update-close]').addEventListener('click', () => {
      if (activeView === 'upgrading') requestCancelUpgrade(true);
      else closeUpdateDialog();
    });
    dialog.querySelector('[data-update-later]').addEventListener('click', closeUpdateDialog);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      if (activeView === 'upgrading') requestCancelUpgrade(true);
      else closeUpdateDialog();
    });
    confirmDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      confirmDialog.close();
      closeAfterCancel = false;
      runUpgrade();
    });
  };

  const initLogoutConfirmation = () => {
    const trigger = document.querySelector('[data-settings-logout]');
    const dialog = document.querySelector('[data-logout-confirm]');
    if (!trigger || !dialog) return;

    const closeDialog = () => {
      dialog.close();
      trigger.focus();
    };

    trigger.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-logout-cancel]').addEventListener('click', closeDialog);
    dialog.querySelector('[data-logout-submit]').addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  };

  const initHelpFeedback = () => {
    const page = document.querySelector('[data-page="help-feedback"]');
    if (!page) return;

    const search = page.querySelector('[data-help-search]');
    const items = [...page.querySelectorAll('[data-help-faq]')];
    const list = page.querySelector('[data-help-faq-list]');
    const empty = page.querySelector('[data-help-empty]');
    if (!search || !list || !empty) return;

    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('zh-CN');
      let visibleCount = 0;

      items.forEach((item) => {
        const searchableText = (item.textContent + ' ' + item.dataset.helpKeywords).toLocaleLowerCase('zh-CN');
        const matches = !query || searchableText.includes(query);
        item.hidden = !matches;
        if (!matches) item.open = false;
        if (matches) visibleCount += 1;
      });

      list.hidden = visibleCount === 0;
      empty.hidden = visibleCount !== 0;
    });
  };

  initAccountSecurity();
  initSettingsPreviews();
  initDeviceSettings();
  initSoftwareUpdate();
  initLogoutConfirmation();
  initHelpFeedback();

  window.lucide?.createIcons();
})();
