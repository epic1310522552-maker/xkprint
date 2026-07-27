/* ============================================
   XKPrint Glass — Mobile 3D Printer Control UI
   Script: navigation, Three.js scene
   ============================================ */

(function () {
  'use strict';

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
        var panel = document.querySelector('.tab-panel[data-tab-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ----- Material Card Selection ----- */
  function initMaterialCards() {
    var cards = document.querySelectorAll('[data-material-card]');

    function selectCard(card) {
      cards.forEach(function (item) {
        var selected = item === card;
        item.classList.toggle('material-card--selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        selectCard(card);
      });
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectCard(card);
        }
      });
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
