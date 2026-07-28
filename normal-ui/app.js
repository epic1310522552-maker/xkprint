/* ============================================
   XKPrint — Mobile 3D Printer Control UI
   Script: navigation, theme, Three.js scene
   ============================================ */

(function () {
  'use strict';

  /* ----- Navigation ----- */
  function initNavigation() {
    var navButtons = document.querySelectorAll('[data-nav]');
    var pages = document.querySelectorAll('[data-page]');
    var bottomNavButtons = document.querySelectorAll('.bottom-nav [data-nav]');

    function showPage(target) {
      var page = document.querySelector('[data-page="' + target + '"]');
      if (!page) return;

      pages.forEach(function (item) { item.classList.remove('active'); });
      bottomNavButtons.forEach(function (button) {
        button.classList.toggle('active', button.getAttribute('data-nav') === target);
      });
      page.classList.add('active');
      window.scrollTo(0, 0);
    }

    navButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        showPage(button.getAttribute('data-nav'));
      });
    });
  }

  /* ----- Notifications ----- */
  function initNotifications() {
    var page = document.querySelector('[data-page="notifications"]');
    var readAllButton = document.querySelector('[data-notification-read-all]');
    var trigger = document.querySelector('.notification-trigger');
    if (!page || !readAllButton) return;

    readAllButton.addEventListener('click', function () {
      page.querySelectorAll('.notification-item--unread').forEach(function (item) {
        item.classList.remove('notification-item--unread');
      });
      page.querySelectorAll('[data-unread-count]').forEach(function (count) {
        count.textContent = '0';
      });
      var sectionCount = page.querySelector('[data-unread-label]');
      if (sectionCount) sectionCount.textContent = '暂无未读';
      readAllButton.textContent = '已全部阅读';
      readAllButton.disabled = true;
      if (trigger) {
        trigger.classList.remove('notification-trigger--unread');
        trigger.setAttribute('aria-label', '通知，无未读消息');
      }
    });
  }

  /* ----- Local print files ----- */
  function initFileBrowser() {
    var openButton = document.querySelector('[data-float-file]');
    var backButton = document.querySelector('[data-files-back]');
    var sourceButtons = document.querySelectorAll('.file-source-option');
    var pages = document.querySelectorAll('[data-page]');
    var bottomNavButtons = document.querySelectorAll('.bottom-nav [data-nav]');

    function showPage(target) {
      pages.forEach(function (page) { page.classList.remove('active'); });
      bottomNavButtons.forEach(function (button) { button.classList.remove('active'); });
      var page = document.querySelector('[data-page="' + target + '"]');
      var navButton = document.querySelector('.bottom-nav [data-nav="' + target + '"]');
      if (page) page.classList.add('active');
      if (navButton) navButton.classList.add('active');
      window.scrollTo(0, 0);
    }

    if (openButton) openButton.addEventListener('click', function () { showPage('files'); });
    if (backButton) backButton.addEventListener('click', function () { showPage('device'); });

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (option) {
          option.classList.toggle('active', option === button);
          option.setAttribute('aria-pressed', option === button ? 'true' : 'false');
        });
      });
    });
  }

  /* ----- Demo device pairing ----- */
  function initDevicePairing() {
    var devicePage = document.querySelector('[data-page="device"]');
    var scanButton = document.querySelector('[data-scan-device]');
    if (!devicePage || !scanButton) return;

    scanButton.addEventListener('click', function () {
      devicePage.classList.remove('no-device');
      scanButton.blur();
    });
  }

  /* ----- Theme ----- */

  function initTheme() {
    var doc = document.documentElement;
    var metaTheme = document.getElementById('theme-color');
    var saved = localStorage.getItem('xkprint-theme');

    if (saved === 'dark' || saved === 'light') {
      doc.setAttribute('data-theme', saved);
    }
    updateTheme(doc.getAttribute('data-theme') || 'light');


    document.querySelectorAll('[data-theme-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        var theme = button.getAttribute('data-theme-option');
        doc.setAttribute('data-theme', theme);
        localStorage.setItem('xkprint-theme', theme);
        updateTheme(theme);
      });
    });

    function updateTheme(theme) {
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#1A1A1E' : '#F5F0EB');
      }
      document.querySelectorAll('[data-theme-option]').forEach(function (option) {
        var selected = option.getAttribute('data-theme-option') === theme;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    }
  }

  /* ----- Account Security ----- */
  function initAccountSecurity() {
    var agreement = document.querySelector('[data-delete-agreement]');
    var submitButton = document.querySelector('[data-delete-submit]');
    if (!agreement || !submitButton) return;

    agreement.addEventListener('change', function () {
      submitButton.disabled = !agreement.checked;
    });
  }

  /* ----- Device Preview Floating Actions ----- */
  function initDeviceFloatActions() {
    var heroCard = document.querySelector('.hero-card');
    if (!heroCard) return;

    var camButton = heroCard.querySelector('[data-float-cam]');
    var fileButton = heroCard.querySelector('[data-float-file]');
    var screenshotButton = heroCard.querySelector('[data-float-screenshot]');
    var lightButton = heroCard.querySelector('[data-float-light]');
    var fullscreenButton = heroCard.querySelector('[data-float-fullscreen]');
    var exitButton = heroCard.querySelector('[data-float-exit]');
    var camPlaceholder = heroCard.querySelector('.cam-placeholder');

    if (!camButton || !fileButton || !screenshotButton || !lightButton || !fullscreenButton || !exitButton || !camPlaceholder) return;

    function setCameraMode(active) {
      heroCard.classList.toggle('cam-active', active);
      camPlaceholder.hidden = !active;
      camButton.hidden = active;
      fileButton.hidden = active;
      screenshotButton.hidden = !active;
      fullscreenButton.hidden = !active;
      lightButton.hidden = !active;
      exitButton.hidden = !active;
    }

    camButton.addEventListener('click', function () {
      setCameraMode(true);
    });

    exitButton.addEventListener('click', function () {
      setCameraMode(false);
    });

    screenshotButton.addEventListener('click', function () {
      window.alert('截图将保存至手机相册');
    });

    lightButton.addEventListener('click', function () {
      var active = lightButton.classList.toggle('is-active');
      lightButton.setAttribute('aria-pressed', String(active));
    });
  }
 

  /* ----- Three.js Model Scene ----- */
  function initModelScene() {
    var container = document.getElementById('model-canvas');
    if (!container) return;

    // dynamic import with CDN-failure fallback
    import('three')
      .then(function (three) {
        var scene = new three.Scene();
        scene.background = null; // transparent

        var camera = new three.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(5, 4, 8);
        camera.lookAt(0, 1.5, 0);

        var renderer = new three.WebGLRenderer({
          alpha: true,
          antialias: true,
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = three.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // lights
        var ambientLight = new three.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        var dirLight = new three.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);
        var backLight = new three.DirectionalLight(0x4488ff, 0.4);
        backLight.position.set(-3, 2, -5);
        scene.add(backLight);

        // ribbed vase / lathe geometry
        var points = [];
        var segments = 32;
        var height = 3.2;
        for (var i = 0; i <= segments; i++) {
          var t = i / segments;
          var y = t * height;
          // vase profile: narrow base, widen, slight neck, flared lip
          var r = 0.4 + Math.sin(t * Math.PI) * 0.8 + (t > 0.85 ? (t - 0.85) * 2.5 : 0);
          // wobble for organic feel
          r += Math.sin(t * Math.PI * 3) * 0.04;
          points.push(new three.Vector2(r, y));
        }
        var latheGeo = new three.LatheGeometry(points, 32);

        // blue accent material
        var mat = new three.MeshStandardMaterial({
          color: 0x2B78E4,
          roughness: 0.45,
          metalness: 0.1,
          flatShading: false,
          side: three.DoubleSide,
          envMapIntensity: 0.6,
        });

        var vase = new three.Mesh(latheGeo, mat);
        vase.position.y = -0.2;
        scene.add(vase);

        // print bed (grid-like)
        var bedGeo = new three.CircleGeometry(2.8, 32);
        var bedMat = new three.MeshStandardMaterial({
          color: themeIsDark() ? 0x3A3A3E : 0xE0DDD8,
          roughness: 0.8,
          metalness: 0.0,
          transparent: true,
          opacity: 0.5,
          side: three.DoubleSide,
        });
        var bed = new three.Mesh(bedGeo, bedMat);
        bed.rotation.x = -Math.PI / 2;
        bed.position.y = -0.3;
        scene.add(bed);

        // grid helper lines
        var gridHelper = new three.GridHelper(5.6, 14, 0x888888, 0x666666);
        gridHelper.position.y = -0.25;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        scene.add(gridHelper);

        // subtle rim light glow ring
        var ringGeo = new three.RingGeometry(1.6, 2.0, 48);
        var ringMat = new three.MeshBasicMaterial({
          color: 0x2B78E4,
          transparent: true,
          opacity: 0.08,
          side: three.DoubleSide,
        });
        var ring = new three.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.28;
        scene.add(ring);

        // auto-rotation animation
        var clock = new three.Clock();

        function animate() {
          requestAnimationFrame(animate);
          var delta = clock.getDelta();
          vase.rotation.y += delta * 0.3;
          renderer.render(scene, camera);
        }
        animate();

        // ResizeObserver for responsive rendering
        var resizeObserver = new ResizeObserver(function () {
          var w = container.clientWidth;
          var h = container.clientHeight;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        });
        resizeObserver.observe(container);

        // stop animation on reduced motion
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReduced.matches) {
          vase.rotation.y = 0.5; // static angled view
        }
        prefersReduced.addEventListener('change', function (e) {
          if (e.matches) {
            vase.rotation.y = 0.5;
          }
        });

        function themeIsDark() {
          return document.documentElement.getAttribute('data-theme') === 'dark';
        }
      })
      .catch(function () {
        // CDN unavailable — CSS silhouette fallback is already in place
        console.info('Three.js not loaded — using CSS fallback.');
      });
  }

  /* ----- Inline Device Controls ----- */
  function initDeviceControlTabs() {
    var panel = document.querySelector('.device-control-panel');
    if (!panel || panel.dataset.tabsInitialized) return;
    panel.dataset.tabsInitialized = 'true';

    var tabs = panel.querySelectorAll('[role="tab"][data-tab]');
    var panels = panel.querySelectorAll('[role="tabpanel"][data-tab-panel]');

    function selectTab(target) {
      tabs.forEach(function (tab) {
        var selected = tab.getAttribute('data-tab') === target;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
      panels.forEach(function (tabPanel) {
        var selected = tabPanel.getAttribute('data-tab-panel') === target;
        tabPanel.classList.toggle('active', selected);
        tabPanel.hidden = !selected;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        selectTab(tab.getAttribute('data-tab'));
      });
    });
  }

  function initToolheadSelector() {
    var selector = document.querySelector('[data-toolhead-selector]');
    var detail = document.querySelector('[data-toolhead-detail]');
    if (!selector || !detail || selector.dataset.toolheadInitialized) return;
    selector.dataset.toolheadInitialized = 'true';

    var toolheads = [
      { id: 1, label: '执行头 1', material: 'PLA Matte · 星空蓝', materialColor: '#2B78E4', loaded: true, currentTemperature: '218°C', targetTemperature: 220, suggestedTemperature: 220, status: '已加载' },
      { id: 2, label: '执行头 2', material: 'PLA Basic · 雾灰', materialColor: '#8A8E94', loaded: true, currentTemperature: '205°C', targetTemperature: 210, suggestedTemperature: 210, status: '已加载' },
      { id: 3, label: '执行头 3', material: 'PETG · 琥珀橙', materialColor: '#D97732', loaded: true, currentTemperature: '238°C', targetTemperature: 240, suggestedTemperature: 240, status: '已加载' },
      { id: 4, label: '执行头 4', material: 'ABS · 石墨黑', materialColor: '#36383D', loaded: true, currentTemperature: '245°C', targetTemperature: 250, suggestedTemperature: 250, status: '已加载' },
      { id: 5, label: '执行头 5', material: 'TPU 95A · 赤红', materialColor: '#C94040', loaded: false, currentTemperature: '室温', targetTemperature: null, suggestedTemperature: 230, status: '空闲' },
      { id: 6, label: '执行头 6', material: 'PLA Silk · 樱粉', materialColor: '#E88BA5', loaded: true, currentTemperature: '212°C', targetTemperature: 215, suggestedTemperature: 215, status: '已加载' },
      { id: 7, label: '执行头 7', material: 'ASA · 雪白', materialColor: '#F2F0EA', loaded: false, currentTemperature: '室温', targetTemperature: null, suggestedTemperature: 250, status: '空闲' },
      { id: 8, label: '执行头 8', material: 'PA-CF · 碳纤黑', materialColor: '#1E2024', loaded: true, currentTemperature: '260°C', targetTemperature: 265, suggestedTemperature: 265, status: '已加载' },
    ];
    var selectedId = 1;
    var cards = selector.querySelectorAll('[data-toolhead-card]');
    var title = detail.querySelector('[data-toolhead-title]');
    var status = detail.querySelector('[data-toolhead-status]');
    var material = detail.querySelector('[data-toolhead-material]');
    var materialStatus = detail.querySelector('[data-toolhead-material-status]');
    var swatch = detail.querySelector('[data-toolhead-swatch]');
    var detailIcon = detail.querySelector('[data-toolhead-detail-icon]');
    var currentTemperature = detail.querySelector('[data-toolhead-current-temperature]');
    var targetTemperature = detail.querySelector('[data-toolhead-target-temperature]');
    var unload = detail.querySelector('[data-toolhead-unload]');
    var feedback = detail.querySelector('[data-toolhead-feedback]');
    var home = detail.querySelector('[data-toolhead-action="home"]');
    var temperatureDialog = document.querySelector('[data-toolhead-temperature-dialog]');
    var temperatureNumber = temperatureDialog && temperatureDialog.querySelector('[data-toolhead-temperature-input="number"]');
    var temperatureRange = temperatureDialog && temperatureDialog.querySelector('[data-toolhead-temperature-input="range"]');
    var temperatureOutput = temperatureDialog && temperatureDialog.querySelector('[data-toolhead-temperature-output]');
    var invokingTemperatureButton = null;
    var editingToolheadId = null;

    function getToolhead(id) {
      return toolheads.find(function (toolhead) { return toolhead.id === id; });
    }

    function renderToolhead(id) {
      var toolhead = getToolhead(id);
      if (!toolhead) return;
      selectedId = id;
      cards.forEach(function (card) {
        var selected = Number(card.getAttribute('data-toolhead')) === id;
        card.classList.toggle('toolhead-card--selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });
      title.textContent = toolhead.label;
      status.textContent = toolhead.status;
      material.textContent = toolhead.material;
      materialStatus.textContent = toolhead.loaded ? '已加载' : '未加载';
      swatch.style.background = toolhead.materialColor;
      detailIcon.style.setProperty('--toolhead-color', toolhead.materialColor);
      currentTemperature.textContent = toolhead.currentTemperature;
      targetTemperature.textContent = toolhead.targetTemperature === null ? '室温' : toolhead.targetTemperature + '°C';
      unload.textContent = toolhead.loaded ? '放回执行头' : '取消执行头';
      home.setAttribute('aria-label', toolhead.label + '归零');
      feedback.textContent = '';
    }

    function stageTemperature(value) {
      temperatureNumber.value = value;
      temperatureRange.value = value;
      temperatureOutput.value = value + '°C';
      temperatureNumber.removeAttribute('aria-invalid');
    }

    function updateKeyboardOffset() {
      var viewport = window.visualViewport;
      if (!viewport || !temperatureDialog.open || document.activeElement !== temperatureNumber) {
        temperatureDialog.style.removeProperty('--keyboard-offset');
        temperatureDialog.style.removeProperty('--visible-viewport-height');
        return;
      }
      var visibleBottom = viewport.offsetTop + viewport.height;
      var keyboardOffset = Math.max(0, window.innerHeight - visibleBottom);
      temperatureDialog.style.setProperty('--keyboard-offset', keyboardOffset + 'px');
      temperatureDialog.style.setProperty('--visible-viewport-height', viewport.height + 'px');
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        renderToolhead(Number(card.getAttribute('data-toolhead')));
      });
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          renderToolhead(Number(card.getAttribute('data-toolhead')));
        }
      });
    });

    detail.querySelectorAll('[data-toolhead-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var toolhead = getToolhead(selectedId);
        var action = button.getAttribute('data-toolhead-action');
        if (!toolhead) return;
        if (action === 'temperature') {
          if (!temperatureDialog || !temperatureNumber || !temperatureRange || !temperatureOutput) return;
          editingToolheadId = selectedId;
          invokingTemperatureButton = button;
          stageTemperature(toolhead.targetTemperature === null ? toolhead.suggestedTemperature : toolhead.targetTemperature);
          temperatureDialog.showModal();
        } else if (action === 'unload') {
          feedback.textContent = '已模拟：' + toolhead.label + (toolhead.loaded ? '已放回' : '已取消');
        } else if (action === 'home') {
          feedback.textContent = '已模拟：' + toolhead.label + '已归零';
        }
      });
    });

    if (temperatureDialog && temperatureNumber && temperatureRange && temperatureOutput) {
      temperatureNumber.addEventListener('input', function () {
        if (temperatureNumber.value !== '' && temperatureNumber.validity.valid) {
          temperatureRange.value = temperatureNumber.value;
          temperatureOutput.value = temperatureNumber.value + '°C';
          temperatureNumber.removeAttribute('aria-invalid');
        } else {
          temperatureNumber.setAttribute('aria-invalid', 'true');
        }
      });
      temperatureRange.addEventListener('input', function () {
        stageTemperature(temperatureRange.value);
      });
      temperatureNumber.addEventListener('focus', updateKeyboardOffset);
      temperatureNumber.addEventListener('blur', updateKeyboardOffset);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateKeyboardOffset);
        window.visualViewport.addEventListener('scroll', updateKeyboardOffset);
      }
      temperatureDialog.querySelectorAll('[data-toolhead-temperature-close], [data-toolhead-temperature-cancel]').forEach(function (button) {
        button.addEventListener('click', function () { temperatureDialog.close(); });
      });
      temperatureDialog.querySelector('[data-toolhead-temperature-apply]').addEventListener('click', function () {
        if (temperatureNumber.value === '' || !temperatureNumber.validity.valid) {
          temperatureNumber.setAttribute('aria-invalid', 'true');
          temperatureNumber.reportValidity();
          return;
        }
        var toolhead = getToolhead(editingToolheadId);
        if (!toolhead) return;
        toolhead.targetTemperature = Number(temperatureNumber.value);
        if (selectedId === editingToolheadId) renderToolhead(editingToolheadId);
        feedback.textContent = '已模拟：' + toolhead.label + ' 温度已设置为 ' + toolhead.targetTemperature + '°C';
        temperatureDialog.close();
      });
      temperatureDialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        temperatureDialog.close();
      });
      temperatureDialog.addEventListener('click', function (event) {
        if (event.target === temperatureDialog) temperatureDialog.close();
      });
      temperatureDialog.addEventListener('close', function () {
        temperatureDialog.style.removeProperty('--keyboard-offset');
        temperatureDialog.style.removeProperty('--visible-viewport-height');
        if (invokingTemperatureButton && invokingTemperatureButton.isConnected) invokingTemperatureButton.focus();
        invokingTemperatureButton = null;
        editingToolheadId = null;
      });
    }

    renderToolhead(selectedId);
  }

  function initDeviceControlDialogs() {
    var controlPanel = document.querySelector('.device-control-panel');
    if (!controlPanel || controlPanel.dataset.dialogsInitialized) return;
    controlPanel.dataset.dialogsInitialized = 'true';

    var state = {
      bed: 60,
      speed: 100,
      fanPartEnabled: true,
      fanPart: 80,
      fanAuxiliaryEnabled: false,
      fanAuxiliary: 0,
      fanChamberEnabled: false,
      fanChamber: 0,
      lightEnabled: false,
      rgbEnabled: false,
    };
    var invokingCard = null;

    function dialogFor(name) {
      return document.querySelector('[data-control-dialog-panel="' + name + '"]');
    }

    function inputFor(dialog, name) {
      return dialog.querySelector('[data-control-input="' + name + '"]');
    }

    function updateBedControls(dialog, value) {
      var range = inputFor(dialog, 'bed');
      var number = inputFor(dialog, 'bed-number');
      var output = dialog.querySelector('[data-control-output="bed"]');
      range.value = value;
      number.value = value;
      number.removeAttribute('aria-invalid');
      output.value = value + '°C';
    }

    function updateKeyboardOffset(dialog) {
      var viewport = window.visualViewport;
      var number = inputFor(dialog, 'bed-number');
      if (!viewport || !dialog.open || document.activeElement !== number) {
        dialog.style.removeProperty('--keyboard-offset');
        dialog.style.removeProperty('--visible-viewport-height');
        return;
      }

      var visibleBottom = viewport.offsetTop + viewport.height;
      var keyboardOffset = Math.max(0, window.innerHeight - visibleBottom);
      dialog.style.setProperty('--keyboard-offset', keyboardOffset + 'px');
      dialog.style.setProperty('--visible-viewport-height', viewport.height + 'px');
    }

    function updateOutput(dialog, name, suffix) {
      var output = dialog.querySelector('[data-control-output="' + name + '"]');
      var input = inputFor(dialog, name);
      if (output && input) output.value = input.value + suffix;
    }

    function updateFanControl(dialog, type, enabled, value) {
      var checkbox = inputFor(dialog, 'fan-' + type + '-enabled');
      var range = inputFor(dialog, 'fan-' + type);
      checkbox.checked = enabled;
      range.value = value;
      range.disabled = !enabled;
      updateOutput(dialog, 'fan-' + type, '%');
    }


    function updateSummary(name) {
      var summary = controlPanel.querySelector('[data-control-summary="' + name + '"]');
      if (!summary) return;
      if (name === 'bed') summary.querySelector('.metric-display__secondary').textContent = state.bed + '°C';
      if (name === 'speed') summary.querySelector('.metric-display__primary').textContent = state.speed + '%';
      if (name === 'fan') {
        var fanLevels = ['Part', 'Auxiliary', 'Chamber'];
        var fanLabels = ['部件风扇', '辅助风扇', '机箱风扇'];
        fanLevels.forEach(function (type, index) {
          var enabled = state['fan' + type + 'Enabled'];
          var value = enabled ? state['fan' + type] : 0;
          var item = summary.querySelector('[data-fan-state="' + type.toLowerCase() + '"]');
          item.classList.toggle('is-on', enabled);
          item.classList.toggle('is-off', !enabled);
          item.querySelector('.fan-levels__value').textContent = enabled ? value + '%' : '关';
        });
        summary.setAttribute('aria-label', fanLevels.map(function (type, index) {
          return fanLabels[index] + (state['fan' + type + 'Enabled'] ? ' ' + state['fan' + type] + '%' : '已关闭');
        }).join('，'));
      }
      if (name === 'lighting') {
        summary.querySelector('[data-light-state="main"]').classList.toggle('is-on', state.lightEnabled);
        summary.querySelector('[data-light-state="rgb"]').classList.toggle('is-on', state.rgbEnabled);
        summary.setAttribute('aria-label', '照明灯' + (state.lightEnabled ? '已开启' : '已关闭') + '，RGB 灯' + (state.rgbEnabled ? '已开启' : '已关闭'));
      }
    }

    function stageState(dialog, name) {
      if (name === 'bed') updateBedControls(dialog, state.bed);
      if (name === 'speed') {
        inputFor(dialog, 'speed').value = state.speed;
        updateOutput(dialog, 'speed', '%');
      }
      if (name === 'fan') {
        updateFanControl(dialog, 'part', state.fanPartEnabled, state.fanPart);
        updateFanControl(dialog, 'auxiliary', state.fanAuxiliaryEnabled, state.fanAuxiliary);
        updateFanControl(dialog, 'chamber', state.fanChamberEnabled, state.fanChamber);
      }
      if (name === 'lighting') {
        inputFor(dialog, 'light-enabled').checked = state.lightEnabled;
        inputFor(dialog, 'rgb-enabled').checked = state.rgbEnabled;
      }
    }

    function commitDialog(dialog, name) {
      if (name === 'bed') {
        var bed = inputFor(dialog, 'bed-number');
        if (!bed.validity.valid) {
          bed.setAttribute('aria-invalid', 'true');
          bed.reportValidity();
          return false;
        }
        state.bed = Number(bed.value);
      }
      if (name === 'speed') {
        var speed = inputFor(dialog, 'speed');
        if (!speed.validity.valid) return false;
        state.speed = Number(speed.value);
      }
      if (name === 'fan') {
        var fanTypes = ['part', 'auxiliary', 'chamber'];
        if (fanTypes.some(function (type) { return !inputFor(dialog, 'fan-' + type).validity.valid; })) return false;
        fanTypes.forEach(function (type) {
          var stateName = type.charAt(0).toUpperCase() + type.slice(1);
          state['fan' + stateName + 'Enabled'] = inputFor(dialog, 'fan-' + type + '-enabled').checked;
          state['fan' + stateName] = Number(inputFor(dialog, 'fan-' + type).value);
        });
      }
      if (name === 'lighting') {
        state.lightEnabled = inputFor(dialog, 'light-enabled').checked;
        state.rgbEnabled = inputFor(dialog, 'rgb-enabled').checked;
      }
      updateSummary(name);
      return true;
    }

    controlPanel.querySelectorAll('[data-control-dialog]').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.getAttribute('data-control-dialog');
        var dialog = dialogFor(name);
        if (!dialog) return;
        stageState(dialog, name);
        invokingCard = card;
        dialog.showModal();
      });
    });

    document.querySelectorAll('[data-control-dialog-panel]').forEach(function (dialog) {
      var name = dialog.getAttribute('data-control-dialog-panel');
      dialog.querySelectorAll('[data-control-close], [data-control-cancel]').forEach(function (button) {
        button.addEventListener('click', function () { dialog.close(); });
      });
      dialog.querySelector('[data-control-apply]').addEventListener('click', function () {
        if (commitDialog(dialog, name)) dialog.close();
      });
      dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        dialog.close();
      });
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', function () {
        dialog.style.removeProperty('--keyboard-offset');
        dialog.style.removeProperty('--visible-viewport-height');
        if (invokingCard && invokingCard.isConnected) invokingCard.focus();
        invokingCard = null;
      });

      if (name === 'bed' || name === 'speed') {
        var range = inputFor(dialog, name);
        range.addEventListener('input', function () {
          if (name === 'bed') updateBedControls(dialog, range.value);
          else updateOutput(dialog, name, '%');
        });
      }
      if (name === 'bed') {
        var bedNumber = inputFor(dialog, 'bed-number');
        bedNumber.addEventListener('input', function () {
          if (bedNumber.validity.valid && bedNumber.value !== '') {
            updateBedControls(dialog, bedNumber.value);
          } else {
            bedNumber.setAttribute('aria-invalid', 'true');
          }
        });
        dialog.querySelectorAll('[data-bed-preset]').forEach(function (button) {
          button.addEventListener('click', function () {
            updateBedControls(dialog, button.getAttribute('data-bed-preset'));
          });
        });
        bedNumber.addEventListener('focus', function () { updateKeyboardOffset(dialog); });
        bedNumber.addEventListener('blur', function () { updateKeyboardOffset(dialog); });
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', function () { updateKeyboardOffset(dialog); });
          window.visualViewport.addEventListener('scroll', function () { updateKeyboardOffset(dialog); });
        }
      }
      if (name === 'speed') {
        dialog.querySelectorAll('[data-speed-preset]').forEach(function (button) {
          button.addEventListener('click', function () {
            inputFor(dialog, 'speed').value = button.getAttribute('data-speed-preset');
            updateOutput(dialog, 'speed', '%');
          });
        });
      }
      if (name === 'fan') {
        ['part', 'auxiliary', 'chamber'].forEach(function (type) {
          var fanRange = inputFor(dialog, 'fan-' + type);
          var fanEnabled = inputFor(dialog, 'fan-' + type + '-enabled');
          fanRange.addEventListener('input', function () { updateOutput(dialog, 'fan-' + type, '%'); });
          fanEnabled.addEventListener('change', function () { fanRange.disabled = !fanEnabled.checked; });
        });
      }
    });
  }

  /* ----- Material Detail Drawer ----- */
  function initMaterialDrawer() {
    var triggers = document.querySelectorAll('[data-material-trigger]');
    var dialog = document.querySelector('[data-material-drawer]');
    if (!triggers.length || !dialog || dialog.dataset.materialInitialized) return;
    dialog.dataset.materialInitialized = 'true';

    var materialTypes = ['PLA Matte', 'PLA Basic', 'PETG', 'ABS', 'TPU 95A', 'PLA Silk', 'ASA', 'PA-CF'];
    var colors = [
      { name: '星空蓝', value: '#2B78E4' }, { name: '月岩灰', value: '#757B84' },
      { name: '透明琥珀', value: '#D8892B' }, { name: '工业黑', value: '#303236' },
      { name: '熔岩红', value: '#D74C46' }, { name: '玫瑰金', value: '#C98291' },
      { name: '高光白', value: '#D9D6CF' }, { name: '碳黑', value: '#25282B' }
    ];
    var materials = [
      { id: 1, type: 'PLA Matte', colorName: '星空蓝', color: '#2B78E4', remaining: 42, status: '当前打印 · 耗材充足', active: true },
      { id: 2, type: 'PLA Basic', colorName: '月岩灰', color: '#757B84', remaining: 76, status: '待用', active: false },
      { id: 3, type: 'PETG', colorName: '透明琥珀', color: '#D8892B', remaining: 64, status: '待用', active: false },
      { id: 4, type: 'ABS', colorName: '工业黑', color: '#303236', remaining: 31, status: '待用', active: false },
      { id: 5, type: 'TPU 95A', colorName: '熔岩红', color: '#D74C46', remaining: 58, status: '待用', active: false },
      { id: 6, type: 'PLA Silk', colorName: '玫瑰金', color: '#C98291', remaining: 88, status: '待用', active: false },
      { id: 7, type: 'ASA', colorName: '高光白', color: '#D9D6CF', remaining: 47, status: '待用', active: false },
      { id: 8, type: 'PA-CF', colorName: '碳黑', color: '#25282B', remaining: 19, status: '库存偏低', active: false }
    ];
    var picker = document.querySelector('[data-material-picker]');
    var pickerViews = picker.querySelectorAll('[data-material-picker-view]');
    var pickerTitle = picker.querySelector('#material-picker-title');
    var typeOptions = picker.querySelector('[data-material-type-options]');
    var colorOptions = picker.querySelector('[data-material-color-options]');
    var editingMaterialId = null;
    var pendingType = null;
    var pendingColorName = null;
    var pendingColor = null;
    var invokingTrigger = null;

    function getMaterial(id) { return materials.find(function (material) { return material.id === id; }); }
    function createOption(className, label, value, pressed) {
      var button = document.createElement('button');
      button.className = className;
      button.type = 'button';
      button.dataset.materialOption = value;
      button.setAttribute('aria-pressed', String(pressed));
      button.textContent = label;
      return button;
    }
    function renderOptions() {
      typeOptions.replaceChildren();
      materialTypes.forEach(function (type) {
        var button = createOption('material-type-option', type, type, pendingType === type);
        button.addEventListener('click', function () { pendingType = type; renderOptions(); renderMaterialDetail(); picker.close(); });
        typeOptions.appendChild(button);
      });
      colorOptions.replaceChildren();
      colors.forEach(function (color) {
        var button = createOption('material-color-option', color.name, color.name, pendingColorName === color.name);
        var swatch = document.createElement('span');
        swatch.className = 'material-color-option__swatch';
        swatch.style.background = color.value;
        button.prepend(swatch);
        button.addEventListener('click', function () { pendingColorName = color.name; pendingColor = color.value; renderOptions(); renderMaterialDetail(); picker.close(); });
        colorOptions.appendChild(button);
      });
    }
    function renderMaterialDetail() {
      var material = getMaterial(editingMaterialId);
      if (!material) return;
      dialog.querySelector('[data-material-type]').textContent = pendingType;
      dialog.querySelector('[data-material-swatch]').style.background = pendingColor;
      dialog.querySelector('[data-material-color-name]').textContent = pendingColorName;
    }
    function openMaterialPicker(name) {
      pickerViews.forEach(function (view) { view.hidden = view.getAttribute('data-material-picker-view') !== name; });
      pickerTitle.textContent = name === 'type' ? '选择耗材种类' : '选择颜色';
      picker.showModal();
    }
    function renderMaterialTrigger(material) {
      var trigger = document.querySelector('[data-material-trigger][data-material-id="' + material.id + '"]');
      if (!trigger) return;
      trigger.style.setProperty('--material-color', material.color);
      trigger.querySelector('.material-thumbnail-name').textContent = material.type;
      trigger.setAttribute('aria-label', '槽位 ' + material.id + '：' + material.type + '，' + material.colorName + '，' + material.remaining + '%，' + material.status);
      if (material.active) document.querySelector('[data-active-material-color-name]').textContent = material.colorName;
    }
    function openMaterialDrawer(id, trigger) {
      var material = getMaterial(id);
      if (!material) return;
      editingMaterialId = id;
      pendingType = material.type;
      pendingColorName = material.colorName;
      pendingColor = material.color;
      invokingTrigger = trigger;
      renderOptions();
      renderMaterialDetail();
      dialog.showModal();
    }
    function commitMaterialSelection() {
      var material = getMaterial(editingMaterialId);
      if (!material || !pendingType || !pendingColorName || !pendingColor) return;
      material.type = pendingType;
      material.colorName = pendingColorName;
      material.color = pendingColor;
      renderMaterialTrigger(material);
      dialog.close();
    }

    triggers.forEach(function (trigger) { trigger.addEventListener('click', function () { openMaterialDrawer(Number(trigger.dataset.materialId), trigger); }); });
    dialog.querySelectorAll('[data-material-edit]').forEach(function (button) { button.addEventListener('click', function () { openMaterialPicker(button.dataset.materialEdit); }); });
    picker.querySelector('[data-material-picker-close]').addEventListener('click', function () { picker.close(); });
    picker.addEventListener('cancel', function (event) { event.preventDefault(); picker.close(); });
    picker.addEventListener('click', function (event) { if (event.target === picker) picker.close(); });
    dialog.querySelectorAll('[data-material-close], [data-material-cancel]').forEach(function (button) { button.addEventListener('click', function () { dialog.close(); }); });
    dialog.querySelector('[data-material-apply]').addEventListener('click', commitMaterialSelection);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () {
      if (invokingTrigger && invokingTrigger.isConnected) invokingTrigger.focus();
      editingMaterialId = null;
      pendingType = null;
      pendingColorName = null;
      pendingColor = null;
      invokingTrigger = null;
    });
  }

  /* ----- Settings previews ----- */
  function initSettingsPreviews() {
    var clearButton = document.querySelector('[data-clear-cache]');
    var toast = document.querySelector('[data-cache-toast]');
    var toastTimer;

    if (!clearButton || !toast) return;

    clearButton.addEventListener('click', function () {
      window.clearTimeout(toastTimer);
      toast.classList.add('is-visible');
      toast.setAttribute('aria-hidden', 'false');
      toastTimer = window.setTimeout(function () {
        toast.classList.remove('is-visible');
        toast.setAttribute('aria-hidden', 'true');
      }, 1800);
    });
  }

  /* ----- Device settings ----- */
  function initDeviceSettings() {
    var nameInput = document.querySelector('[data-device-name-input]');
    var editButton = document.querySelector('[data-device-name-edit]');
    var nameDisplay = document.querySelector('[data-device-name-display]');
    var editLabel = editButton && editButton.querySelector('span');
    var editIcon = editButton && editButton.querySelector('svg');
    var previousName = '';

    if (!nameInput || !editButton || !nameDisplay) return;

    function setEditing(editing) {
      nameInput.readOnly = !editing;
      editButton.setAttribute('aria-label', editing ? '保存设备名称' : '编辑设备名称');
      if (editLabel) editLabel.textContent = editing ? '保存' : '编辑';
      if (editIcon) editIcon.style.display = editing ? 'none' : '';
      if (editing) {
        previousName = nameInput.value;
        nameInput.focus();
        nameInput.select();
      }
    }

    function saveName() {
      var name = nameInput.value.trim();
      if (!name) {
        nameInput.value = previousName;
        name = previousName;
      }
      nameDisplay.textContent = name;
      setEditing(false);
    }

    editButton.addEventListener('click', function () {
      if (nameInput.readOnly) setEditing(true);
      else saveName();
    });
    nameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveName();
      }
      if (event.key === 'Escape') {
        nameInput.value = previousName;
        setEditing(false);
      }
    });
    nameInput.addEventListener('blur', function (event) {
      if (!nameInput.readOnly && event.relatedTarget !== editButton) saveName();
    });
  }

  /* ----- Software update demo ----- */
  function initSoftwareUpdate() {
    var checkButton = document.querySelector('[data-check-update]');
    var dialog = document.querySelector('[data-update-dialog]');
    var confirmDialog = document.querySelector('[data-update-confirm]');
    if (!checkButton || !dialog || !confirmDialog || dialog.dataset.initialized) return;
    dialog.dataset.initialized = 'true';

    var views = dialog.querySelectorAll('[data-update-view]');
    var progress = dialog.querySelector('[data-update-progress]');
    var progressFill = dialog.querySelector('[data-update-progress-fill]');
    var percent = dialog.querySelector('[data-update-percent]');
    var stage = dialog.querySelector('[data-update-stage]');
    var currentVersion = document.querySelector('[data-current-software-version]');
    var versionStatus = document.querySelector('[data-software-version-status]');
    var checkTimer;
    var upgradeTimer;
    var upgradeStartedAt = 0;
    var elapsedBeforePause = 0;
    var activeView = 'checking';

    var closeAfterCancel = false;

    function showView(name) {
      activeView = name;
      views.forEach(function (view) { view.hidden = view.dataset.updateView !== name; });
    }

    function stopUpgradeTimer() {
      window.clearInterval(upgradeTimer);
      upgradeTimer = null;
      if (upgradeStartedAt) elapsedBeforePause += Date.now() - upgradeStartedAt;
      upgradeStartedAt = 0;
    }

    function renderProgress(value) {
      var rounded = Math.min(100, Math.round(value));
      progressFill.style.width = rounded + '%';
      percent.textContent = rounded + '%';
      progress.setAttribute('aria-valuenow', String(rounded));
      stage.textContent = rounded < 72 ? '正在下载更新包，请保持设备在线' : '正在安装更新，请勿关闭设备';
    }

    function runUpgrade() {
      upgradeStartedAt = Date.now();
      upgradeTimer = window.setInterval(function () {
        var value = ((elapsedBeforePause + Date.now() - upgradeStartedAt) / 5000) * 100;
        renderProgress(value);
        if (value >= 100) {
          stopUpgradeTimer();
          showView('complete');
        }
      }, 80);
    }

    function requestCancelUpgrade(shouldClose) {
      if (confirmDialog.open) return;
      closeAfterCancel = shouldClose;
      stopUpgradeTimer();
      confirmDialog.showModal();
    }

    function closeUpdateDialog() {
      window.clearTimeout(checkTimer);
      if (activeView === 'upgrading') stopUpgradeTimer();
      if (dialog.open) dialog.close();
    }

    checkButton.addEventListener('click', function () {
      window.clearTimeout(checkTimer);
      showView('checking');
      dialog.showModal();
      checkTimer = window.setTimeout(function () { showView('available'); }, 1500);
    });
    dialog.querySelector('[data-update-start]').addEventListener('click', function () {
      elapsedBeforePause = 0;
      renderProgress(0);
      showView('upgrading');
      runUpgrade();
    });
    dialog.querySelector('[data-update-cancel]').addEventListener('click', function () {
      requestCancelUpgrade(false);
    });
    confirmDialog.querySelector('[data-update-continue]').addEventListener('click', function () {
      confirmDialog.close();
      closeAfterCancel = false;
      runUpgrade();
    });
    confirmDialog.querySelector('[data-update-confirm-cancel]').addEventListener('click', function () {
      confirmDialog.close();
      elapsedBeforePause = 0;
      renderProgress(0);
      showView('available');
      if (closeAfterCancel && dialog.open) dialog.close();
      closeAfterCancel = false;
    });
    dialog.querySelector('[data-update-done]').addEventListener('click', function () {
      currentVersion.textContent = 'v1.5.0';
      versionStatus.textContent = '当前已是最新版本';
      checkButton.textContent = '再次检查';
      dialog.close();
    });
    dialog.querySelector('[data-update-close]').addEventListener('click', function () {
      if (activeView === 'upgrading') requestCancelUpgrade(true);
      else closeUpdateDialog();
    });
    dialog.querySelector('[data-update-later]').addEventListener('click', closeUpdateDialog);
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      if (activeView === 'upgrading') requestCancelUpgrade(true);
      else closeUpdateDialog();
    });
    confirmDialog.addEventListener('cancel', function (event) { event.preventDefault(); confirmDialog.close(); closeAfterCancel = false; runUpgrade(); });
  }

  /* ----- Logout confirmation demo ----- */
  function initLogoutConfirmation() {
    var trigger = document.querySelector('[data-settings-logout]');
    var dialog = document.querySelector('[data-logout-confirm]');
    if (!trigger || !dialog || dialog.dataset.initialized) return;
    dialog.dataset.initialized = 'true';

    function closeDialog() {
      dialog.close();
      trigger.focus();
    }

    trigger.addEventListener('click', function () { dialog.showModal(); });
    dialog.querySelector('[data-logout-cancel]').addEventListener('click', closeDialog);
    dialog.querySelector('[data-logout-submit]').addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeDialog(); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) closeDialog(); });
  }

  
  /* ----- Init ----- */
  document.addEventListener('DOMContentLoaded', function () {
    runInit();
  });
  // Also run immediately in case DOMContentLoaded already fired
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInit();
  }

  function runInit() {
    // Lucide first
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    initNavigation();
    initNotifications();
    initFileBrowser();
    initDevicePairing();
    initDeviceControlTabs();
    initDeviceControlDialogs();
    initToolheadSelector();
    initMaterialDrawer();
    initTheme();
    initAccountSecurity();
    initSettingsPreviews();
    initDeviceSettings();
    initSoftwareUpdate();
    initLogoutConfirmation();
    initModelScene();
    initDeviceFloatActions();
  }
})();
