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


  const lightSwitch = document.querySelector('.stat-switch');

  lightSwitch?.addEventListener('click', () => {
    const isEnabled = lightSwitch.getAttribute('aria-checked') === 'true';
    lightSwitch.setAttribute('aria-checked', String(!isEnabled));
    lightSwitch.querySelector('span').textContent = isEnabled ? '关闭' : '开启';
  });

  const controlPopups = [...document.querySelectorAll('.control-popup')];
  const popupTriggers = [...document.querySelectorAll('[data-popup-trigger]')];
  let openPopupName = null;

  const setPopup = (name) => {
    controlPopups.forEach((popup) => {
      popup.hidden = popup.dataset.popup !== name;
    });
    popupTriggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', String(trigger.dataset.popupTrigger === name));
    });
    openPopupName = name;
  };

  popupTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const name = trigger.dataset.popupTrigger;
      setPopup(openPopupName === name ? null : name);
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

  const materialHeads = [...document.querySelectorAll('[data-material-head]')];
  const statsCells = [...document.querySelectorAll('.stat-cell')];
  const materialDetails = document.querySelector('.material-details');
  const selectedHeadLabel = document.querySelector('[data-selected-head]');
  const closeMaterialButton = document.querySelector('[data-close-material]');

  if (materialHeads.length && materialDetails && selectedHeadLabel) {
    const selectMaterialHead = (head) => {
      materialHeads.forEach((option) => {
        const isSelected = option === head;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
      });
      statsCells.forEach((cell) => {
        cell.classList.toggle('is-selected', cell.dataset.materialHead === head.dataset.materialHead);
      });
      selectedHeadLabel.textContent = head.dataset.materialHead;
      materialDetails.hidden = false;
      materialDetails.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    materialHeads.forEach((head) => {
      head.addEventListener('click', () => selectMaterialHead(head));
    });

    statsCells.forEach((cell) => {
      const head = materialHeads.find((option) => option.dataset.materialHead === cell.dataset.materialHead);
      if (!head) return;
      cell.addEventListener('click', () => selectMaterialHead(head));
      cell.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectMaterialHead(head);
      });
    });

    closeMaterialButton?.addEventListener('click', () => {
      materialDetails.hidden = true;
      materialHeads.forEach((head) => {
        head.classList.remove('is-selected');
        head.setAttribute('aria-pressed', 'false');
      });
      statsCells.forEach((cell) => cell.classList.remove('is-selected'));
    });
  }


  window.lucide?.createIcons();
})();
