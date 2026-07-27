/* ============================================
   XKPrint Glass — Mobile 3D Printer Control UI
   Script: navigation, Three.js scene, AMS wheel
   ============================================ */

(function () {
  'use strict';

  /* ----- AMS Material data (8 slots) ----- */
  var AMS_MATERIALS = [
    { name: 'PLA Matte',  pct: 42,  color: '#2B78E4' },
    { name: 'PLA Basic',  pct: 76,  color: '#757B84' },
    { name: 'PETG',       pct: 64,  color: '#D8892B' },
    { name: 'ABS',        pct: 31,  color: '#303236' },
    { name: 'TPU 95A',    pct: 58,  color: '#D74C46' },
    { name: 'PLA Silk',   pct: 88,  color: '#C98291' },
    { name: 'ASA',        pct: 47,  color: '#D9D6CF' },
    { name: 'PA-CF',      pct: 19,  color: '#25282B' },
  ];

  /* ----- Shared material card selector ----- */
  function selectMaterialCard(index, shouldScroll) {
    if (index == null || index < 0 || index >= AMS_MATERIALS.length) return;
    var cards = document.querySelectorAll('[data-material-card]');
    if (!cards.length) return;

    cards.forEach(function (item, i) {
      var selected = i === index;
      item.classList.toggle('material-card--selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    if (shouldScroll && cards[index]) {
      var reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      requestAnimationFrame(function () {
        cards[index].scrollIntoView({
          block: 'center',
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      });
    }
  }

  /* ----- Navigation ----- */
  function initNavigation() {
    var navButtons = document.querySelectorAll('[data-nav]');
    var pages = document.querySelectorAll('[data-page]');
    // bottom-navigation items (the four top-level tabs)
    var bottomNavItems = document.querySelectorAll('.bottom-nav [data-nav]');
    var bottomTargets = ['device', 'models', 'market', 'profile'];

    function activateBottom(target) {
      bottomNavItems.forEach(function (b) {
        var match = b.getAttribute('data-nav') === target;
        b.classList.toggle('active', match);
        if (match) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
      });
    }

    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-nav');

        // deactivate all pages, activate target
        pages.forEach(function (p) { p.classList.remove('active'); });
        var page = document.querySelector('[data-page="' + target + '"]');
        if (page) page.classList.add('active');

        // determine bottom-nav activation
        if (bottomTargets.indexOf(target) !== -1) {
          activateBottom(target);
        } else {
          // materials / control keep device highlighted
          activateBottom('device');
        }

        window.scrollTo(0, 0);
      });
    });
  }

  /* ----- Control Panel Tabs ----- */
  function initControlTabs() {
    var tabs = document.querySelectorAll('[data-tab]');
    var panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = document.querySelector(
          '.tab-panel[data-tab-panel="' + target + '"]'
        );
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ----- Material Card Selection (in-page) ----- */
  function initMaterialCards() {
    var cards = document.querySelectorAll('[data-material-card]');

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var idx = parseInt(card.getAttribute('data-material-index'), 10);
        selectMaterialCard(idx, false);
      });
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          var idx = parseInt(card.getAttribute('data-material-index'), 10);
          selectMaterialCard(idx, false);
        }
      });
    });
  }

  /* ----- AMS Wheel ----- */
  function initAmsWheel() {
    var stage = document.querySelector('[data-ams-stage]');
    var wheel = document.querySelector('[data-ams-wheel]');
    var slots = document.querySelectorAll('[data-ams-slot]');
    var prevBtn = document.querySelector('[data-ams-prev]');
    var nextBtn = document.querySelector('[data-ams-next]');
    var currentEl = stage ? stage.querySelector('.ams-current') : null;
    var positionEl = stage ? stage.querySelector('.ams-position') : null;

    // Guard: missing DOM or wrong slot count
    if (!stage || !wheel || slots.length !== 8) return;

    // Prevent double init
    if (stage.getAttribute('data-ams-initialized') === 'true') return;
    stage.setAttribute('data-ams-initialized', 'true');

    var reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // --- State ---
    var state = {
      currentIndex: 0,
      rotation: 0,
      animating: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      suppressClickUntil: 0,
    };

    // --- Helpers ---
    function normalizeMaterialIndex(index) {
      return ((index % 8) + 8) % 8;
    }

    // shortest delta from `from` to `to`, result in [-4, 4]
    function shortestMaterialDelta(from, to) {
      var raw = to - from;
      if (raw > 4) return raw - 8;
      if (raw < -4) return raw + 8;
      return raw;
    }

    function updateAmsPresentation(index) {
      var mat = AMS_MATERIALS[index];

      // Update center ring
      var circumference = 2 * Math.PI * 44; // ~276.46
      var offset = circumference * (1 - mat.pct / 100);
      if (currentEl) {
        currentEl.style.setProperty('--active-material-color', mat.color);
        currentEl.setAttribute(
          'aria-label',
          '查看 ' + mat.name + ' 耗材详情'
        );
        var nameEl = currentEl.querySelector('.ams-current-name');
        var pctEl = currentEl.querySelector('.ams-current-pct');
        var ring = currentEl.querySelector('.ams-current-ring circle');
        if (nameEl) nameEl.textContent = mat.name;
        if (pctEl) pctEl.textContent = mat.pct + '%';
        if (ring) {
          ring.setAttribute('stroke-dasharray', String(circumference));
          ring.setAttribute('stroke-dashoffset', String(offset));
        }
      }

      // Update position text
      if (positionEl) positionEl.textContent = (index + 1) + ' / 8';

      // Update aria-live status
      var liveEl = stage.querySelector('.ams-live-status');
      if (liveEl) {
        liveEl.textContent =
          '当前耗材：' + mat.name + '，剩余 ' + mat.pct + '%';
      }

      // Update slot visibility, tabindex, aria-hidden
      var visibleOffsets = [-2, -1, 1, 2]; // relative to current
      slots.forEach(function (slot, i) {
        var rel = shortestMaterialDelta(index, i);
        var visible;
        if (rel === 0) {
          visible = 'hidden'; // current is shown in center
        } else if (visibleOffsets.indexOf(rel) !== -1) {
          visible = Math.abs(rel) === 2 ? 'far' : 'near';
        } else {
          visible = 'hidden';
        }
        slot.setAttribute('data-ams-visible', visible);
        if (visible === 'hidden') {
          slot.setAttribute('tabindex', '-1');
          slot.setAttribute('aria-hidden', 'true');
        } else {
          slot.setAttribute('tabindex', '0');
          slot.setAttribute('aria-hidden', 'false');
        }
      });
    }

    function rotateAmsTo(index) {
      if (state.animating) return;
      var target = normalizeMaterialIndex(index);
      if (target === state.currentIndex) return;
      state.animating = true;

      var delta = shortestMaterialDelta(state.currentIndex, target);
      state.currentIndex = target;
      state.rotation -= delta * 45;
      wheel.style.setProperty('--wheel-rotation', state.rotation + 'deg');

      // Update slot counter-rotation for upright text
      slots.forEach(function (slot, i) {
        var inner = slot.querySelector('.ams-slot-inner');
        if (inner) {
          var counter = -(i * 45 + state.rotation);
          inner.style.setProperty('--slot-counter-rotation', counter + 'deg');
        }
      });

      function onComplete() {
        state.animating = false;
        updateAmsPresentation(state.currentIndex);
      }

      if (reducedMotion) {
        // Skip animation wait in reduced motion
        onComplete();
      } else {
        var settled = false;
        function finishOnce() {
          if (settled) return;
          settled = true;
          wheel.removeEventListener('transitionend', onTransitionEnd);
          clearTimeout(fallbackTimer);
          onComplete();
        }
        function onTransitionEnd() {
          finishOnce();
        }
        wheel.addEventListener('transitionend', onTransitionEnd);
        var fallbackTimer = setTimeout(finishOnce, 500);
      }
    }

    function rotateAmsBy(delta) {
      rotateAmsTo(state.currentIndex + delta);
    }

    // --- Initial presentation ---
    updateAmsPresentation(0);

    // Set initial slot inner counter-rotations
    slots.forEach(function (slot, i) {
      var inner = slot.querySelector('.ams-slot-inner');
      if (inner) {
        inner.style.setProperty(
          '--slot-counter-rotation',
          -i * 45 + 'deg'
        );
      }
    });

    // --- Arrow buttons ---
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        rotateAmsBy(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        rotateAmsBy(1);
      });
    }

    // --- Outer slot click (rotate to center, no page nav) ---
    slots.forEach(function (slot) {
      slot.addEventListener('click', function (e) {
        if (performance.now() < state.suppressClickUntil) {
          e.preventDefault();
          return;
        }
        var idx = parseInt(slot.getAttribute('data-material-index'), 10);
        if (!isNaN(idx) && idx !== state.currentIndex) {
          rotateAmsTo(idx);
        }
      });
    });

    // --- Center click: navigate + select card ---
    if (currentEl) {
      currentEl.addEventListener('click', function () {
        // The data-nav="materials" listener in initNavigation handles page switch
        // We hook onto the transition via a microtask
        var idx = state.currentIndex;
        selectMaterialCard(idx, true);
      });
    }

    // --- Keyboard: ArrowLeft / ArrowRight on stage ---
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rotateAmsBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rotateAmsBy(1);
      }
    });
    stage.setAttribute('tabindex', '0');

    // --- Pointer swipe ---
    stage.addEventListener('pointerdown', function (e) {
      state.pointerId = e.pointerId;
      state.startX = e.clientX;
      state.startY = e.clientY;
    });

    stage.addEventListener('pointermove', function (e) {
      // no-op during drag tracking; we only care about up/cancel
    });

    function handlePointerEnd(e) {
      if (e.pointerId !== state.pointerId) return;
      state.pointerId = null;

      var dx = e.clientX - state.startX;
      var dy = e.clientY - state.startY;
      var absDx = Math.abs(dx);
      var absDy = Math.abs(dy);

      // Only horizontal swipes of >= 40px and more horizontal than vertical
      if (absDx >= 40 && absDx > absDy) {
        e.preventDefault();
        if (dx < 0) {
          rotateAmsBy(1); // left swipe = next
        } else {
          rotateAmsBy(-1); // right swipe = prev
        }
        // Suppress any click from the same gesture
        state.suppressClickUntil = performance.now() + 500;
      }
    }

    stage.addEventListener('pointerup', handlePointerEnd);
    stage.addEventListener('pointercancel', function (e) {
      if (e.pointerId === state.pointerId) {
        state.pointerId = null;
      }
    });
  }

  /* ----- Three.js Model Scene ----- */
  function initModelScene() {
    var container = document.getElementById('model-canvas');
    if (!container) return;

    import('three')
      .then(function (three) {
        var scene = new three.Scene();
        scene.background = null;

        var camera = new three.PerspectiveCamera(
          35,
          container.clientWidth / container.clientHeight,
          0.1,
          100
        );
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

        // Hide CSS fallback when Three.js loads successfully
        var fallback = container.querySelector('.css-fallback-vase');
        if (fallback) fallback.style.display = 'none';

        // Lights
        var ambientLight = new three.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        var dirLight = new three.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        var backLight = new three.DirectionalLight(0x6666ff, 0.4);
        backLight.position.set(-3, 2, -5);
        scene.add(backLight);

        // Glass-style vase with physical material
        var points = [];
        var segments = 32;
        var height = 3.2;

        for (var i = 0; i <= segments; i++) {
          var t = i / segments;
          var y = t * height;
          var r =
            0.4 +
            Math.sin(t * Math.PI) * 0.8 +
            (t > 0.85 ? (t - 0.85) * 2.5 : 0);
          r += Math.sin(t * Math.PI * 3) * 0.04;
          points.push(new three.Vector2(r, y));
        }

        var latheGeo = new three.LatheGeometry(points, 32);

        var mat = new three.MeshPhysicalMaterial({
          color: 0x7c6cf0,
          roughness: 0.15,
          metalness: 0.0,
          transparent: true,
          opacity: 0.85,
          clearcoat: 0.3,
          clearcoatRoughness: 0.2,
          side: three.DoubleSide,
        });

        var vase = new three.Mesh(latheGeo, mat);
        vase.position.y = -0.2;
        scene.add(vase);

        // Print bed
        var bedGeo = new three.CircleGeometry(2.8, 32);
        var bedMat = new three.MeshStandardMaterial({
          color: 0xe0e8f0,
          roughness: 0.8,
          metalness: 0.0,
          transparent: true,
          opacity: 0.4,
          side: three.DoubleSide,
        });
        var bed = new three.Mesh(bedGeo, bedMat);
        bed.rotation.x = -Math.PI / 2;
        bed.position.y = -0.3;
        scene.add(bed);

        // Grid
        var gridHelper = new three.GridHelper(5.6, 14, 0x888888, 0x666666);
        gridHelper.position.y = -0.25;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        scene.add(gridHelper);

        // Glow ring
        var ringGeo = new three.RingGeometry(1.6, 2.0, 48);
        var ringMat = new three.MeshBasicMaterial({
          color: 0x6c63ff,
          transparent: true,
          opacity: 0.1,
          side: three.DoubleSide,
        });
        var ring = new three.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.28;
        scene.add(ring);

        // Animation
        var clock = new three.Clock();

        function animate() {
          requestAnimationFrame(animate);
          var delta = clock.getDelta();
          vase.rotation.y += delta * 0.3;
          renderer.render(scene, camera);
        }
        animate();

        // ResizeObserver
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

        // Reduced motion
        var prefersReduced = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        );
        if (prefersReduced.matches) {
          vase.rotation.y = 0.5;
        }
        prefersReduced.addEventListener('change', function (e) {
          if (e.matches) {
            vase.rotation.y = 0.5;
          }
        });
      })
      .catch(function () {
        // CDN unavailable — CSS fallback already in place via styles
        console.info('Three.js not loaded — CSS fallback active.');
      });
  }

  /* ----- Init ----- */
  function runInit() {
    // Lucide first
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    initNavigation();
    initControlTabs();
    initMaterialCards();
    initAmsWheel();
    initModelScene();
  }

  document.addEventListener('DOMContentLoaded', function () {
    runInit();
  });

  // Also run immediately if DOMContentLoaded already fired
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    runInit();
  }
})();
