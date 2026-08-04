(() => {
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

  const deviceMenuButton = document.querySelector('[data-device-menu]');
  const deviceSubmenu = document.querySelector('.device-submenu');
  const deviceList = document.querySelector('.device-list');
  const activeDevice = document.querySelector('[data-active-device]');

  if (deviceMenuButton && deviceSubmenu) {
    deviceMenuButton.addEventListener('click', () => {
      const isExpanded = deviceMenuButton.getAttribute('aria-expanded') === 'true';
      deviceMenuButton.setAttribute('aria-expanded', String(!isExpanded));
      deviceSubmenu.hidden = isExpanded;
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

  document.querySelectorAll('[data-print-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const task = button.closest('[data-print-task]');
      const state = task?.querySelector('[data-task-state]');
      if (!task || !state) return;

      const isPaused = button.getAttribute('aria-pressed') === 'true';
      const nextIsPaused = !isPaused;
      button.setAttribute('aria-pressed', String(nextIsPaused));
      button.setAttribute('aria-label', `${nextIsPaused ? '开始' : '暂停'}螺旋花器打印`);
      button.innerHTML = `<i data-lucide="${nextIsPaused ? 'play' : 'pause'}" aria-hidden="true"></i><span>${nextIsPaused ? '开始' : '暂停'}</span>`;
      state.textContent = nextIsPaused ? '已暂停' : '正在打印';
      state.classList.toggle('printing', !nextIsPaused);
      state.classList.toggle('ready', nextIsPaused);
      window.lucide?.createIcons();
    });
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


  window.lucide?.createIcons();
})();
