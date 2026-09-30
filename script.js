
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
/* reveal + counters */
const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in');
    e.target.querySelectorAll('[data-n]').forEach(c => {
        const t = +c.dataset.n, s = performance.now();
        (function f(n) { const p = Math.min(1, (n - s) / 1600); c.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f) })(s)
    });
    io.unobserve(e.target)
}), { threshold: .2 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el) });
/* card tilt */
document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch' || reduce) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`
    });
    c.addEventListener('pointerleave', () => c.style.transform = '')
});
/* 3D scene */
if (window.THREE) {
    const cv = document.getElementById('bg'), R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    const S = new THREE.Scene(), C = new THREE.PerspectiveCamera(50, 1, .1, 100); C.position.z = 7;
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, .45, 220, 32), new THREE.MeshStandardMaterial({ color: 0x5b3df5, metalness: .7, roughness: .22, emissive: 0x1a0f66 }));
    const wire = new THREE.Mesh(new THREE.TorusKnotGeometry(1.52, .47, 90, 14), new THREE.MeshBasicMaterial({ color: 0xff5d8f, wireframe: true, transparent: true, opacity: .22 }));
    const g = new THREE.Group(); g.add(knot, wire); S.add(g);
    S.add(new THREE.AmbientLight(0xffffff, .55));
    const l1 = new THREE.PointLight(0xff5d8f, 2.2, 30); l1.position.set(-5, 3, 5); const l2 = new THREE.PointLight(0x5b9bff, 2, 30); l2.position.set(5, -3, 4); S.add(l1, l2);
    const N = 700, pos = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++)pos[i] = (Math.random() - .5) * 26;
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .04, color: 0x9a8cff, transparent: true, opacity: .7 })); S.add(pts);
    let mx = 0, my = 0, sc = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 }, { passive: true });
    function size() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix() }
    addEventListener('resize', size); size();
    const t0 = performance.now();
    (function loop() {
        const t = (performance.now() - t0) / 1000, max = document.documentElement.scrollHeight - innerHeight || 1;
        sc = scrollY / max; tx += (mx - tx) * .06; ty += (my - ty) * .06;
        const wide = innerWidth > 760;
        g.position.x += ((wide ? -2.4 : 0) + (sc * (wide ? 3.6 : 0)) - g.position.x) * .05;
        g.position.y += ((wide ? 0 : 1.6) - sc * 1.5 - g.position.y) * .05;
        g.scale.setScalar(1 + sc * .5);
        if (!reduce) { g.rotation.y = t * .25 + tx * 1.6 + sc * 6; g.rotation.x = t * .12 + ty * 1.2; pts.rotation.y = t * .02 + sc * .8 }
        R.render(S, C); requestAnimationFrame(loop)
    })();
}
/* progress bar */
addEventListener('scroll', () => { document.getElementById('bar').style.width = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100 + '%' }, { passive: true });
