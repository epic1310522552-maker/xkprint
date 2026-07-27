/* ============================================
   XKPrint — Mobile 3D Printer Control UI
   Script: navigation, theme, Three.js scene
   ============================================ */

(function () {
  'use strict';

  /* ----- Navigation ----- */
  function initNavigation() {
    const navButtons = document.querySelectorAll('[data-nav]');
    const pages = document.querySelectorAll('[data-page]');

    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-nav');

        // deactivate all
        navButtons.forEach(function (b) { b.classList.remove('active'); });
        pages.forEach(function (p) { p.classList.remove('active'); });

        // activate target
        btn.classList.add('active');
        var page = document.querySelector('[data-page="' + target + '"]');
        if (page) page.classList.add('active');
      });
    });
  }

  /* ----- Theme ----- */
  function initTheme() {
    var doc = document.documentElement;
    var metaTheme = document.getElementById('theme-color');

    // restore saved preference
    var saved = localStorage.getItem('xkprint-theme');
    if (saved === 'dark' || saved === 'light') {
      doc.setAttribute('data-theme', saved);
    }
    updateThemeMeta(doc.getAttribute('data-theme') || 'light');

    // bind every toggle
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = doc.getAttribute('data-theme') || 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        doc.setAttribute('data-theme', next);
        localStorage.setItem('xkprint-theme', next);
        updateThemeMeta(next);
        // re-render Lucide icons after icon swap
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      });
    });

    function updateThemeMeta(theme) {
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#1A1A1E' : '#F5F0EB');
      }
      // toggle sun/moon icons
      document.querySelectorAll('[data-theme-toggle]').forEach(function (tog) {
        var sun = tog.querySelector('[data-lucide="sun"]');
        var moon = tog.querySelector('[data-lucide="moon"]');
        if (sun && moon) {
          if (theme === 'dark') {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
          } else {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
          }
        }
      });
    }
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

  /* ----- Init ----- */
  document.addEventListener('DOMContentLoaded', function () {
    // Lucide first
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }

    initNavigation();
    initControlTabs();
    initTheme();
    initModelScene();
  });
});
