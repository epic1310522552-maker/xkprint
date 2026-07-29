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
  const materialDetails = document.querySelector('.material-details');
  const selectedHeadLabel = document.querySelector('[data-selected-head]');
  const closeMaterialButton = document.querySelector('[data-close-material]');

  if (materialHeads.length && materialDetails && selectedHeadLabel) {
    materialHeads.forEach((head) => {
      head.addEventListener('click', () => {
        materialHeads.forEach((option) => {
          const isSelected = option === head;
          option.classList.toggle('is-selected', isSelected);
          option.setAttribute('aria-pressed', String(isSelected));
        });
        selectedHeadLabel.textContent = head.dataset.materialHead;
        materialDetails.hidden = false;
      });
    });

    closeMaterialButton?.addEventListener('click', () => {
      materialDetails.hidden = true;
      materialHeads.forEach((head) => {
        head.classList.remove('is-selected');
        head.setAttribute('aria-pressed', 'false');
      });
    });
  }


  window.lucide?.createIcons();
})();
