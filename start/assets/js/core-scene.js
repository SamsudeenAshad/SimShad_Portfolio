/* A dependency-free sculpture with native WebGL and a software-rendered fallback. */
(function () {
    'use strict';

    var container = document.querySelector('.core-scene');
    if (!container) return;
    var canvas = container.querySelector('.core-canvas');
    if (!canvas) return;
    var ctx, gl;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (_) { /* Use canvas below. */ }
    if (!gl) {
        try { ctx = canvas.getContext('2d', { alpha: true }); } catch (_) { return; }
        if (!ctx) return;
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var segments = coarse ? 150 : 208;
    var sides = gl ? (coarse ? 40 : 64) : (coarse ? 24 : 36);
    var vertices = [];
    var faces = [];
    var projected = [];
    var ordered = [];
    var width = 0;
    var height = 0;
    var visible = true;
    var contextLost = false;
    var manuallyPaused = false;
    var frame = 0;
    var lastTime = 0;
    var elapsed = 0;
    var pointer = { x: 0, y: 0 };
    var eased = { x: 0, y: 0 };
    var scroll = 0;
    var TAU = Math.PI * 2;

    function center(t) {
        var radius = 1.05 + 0.42 * Math.cos(3 * t);
        return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), 0.55 * Math.sin(3 * t)];
    }

    function normalize(v) {
        var length = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    function cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // The torus knot is a single closed surface. Frenet frames keep the tube round.
    for (var i = 0; i < segments; i++) {
        var t = TAU * i / segments;
        var c = center(t);
        var before = center(t - 0.001);
        var after = center(t + 0.001);
        var tangent = normalize([after[0] - before[0], after[1] - before[1], after[2] - before[2]]);
        var normal = normalize(cross(tangent, [0, 0, 1]));
        var binormal = normalize(cross(tangent, normal));
        for (var j = 0; j < sides; j++) {
            var a = TAU * j / sides;
            var ca = Math.cos(a);
            var sa = Math.sin(a);
            var nx = normal[0] * ca + binormal[0] * sa;
            var ny = normal[1] * ca + binormal[1] * sa;
            var nz = normal[2] * ca + binormal[2] * sa;
            vertices.push([c[0] + nx * 0.265, c[1] + ny * 0.265, c[2] + nz * 0.265, nx, ny, nz]);
            projected.push({ x: 0, y: 0, z: 0, nx: 0, ny: 0, nz: 0 });
            faces.push([
                i * sides + j,
                ((i + 1) % segments) * sides + j,
                ((i + 1) % segments) * sides + (j + 1) % sides,
                i * sides + (j + 1) % sides
            ]);
        }
    }

    var gpu;
    function createGPU() {
        var vertexSource = [
            'attribute vec3 aPosition;',
            'attribute vec3 aNormal;',
            'uniform mat3 uRotation;',
            'uniform vec2 uSize;',
            'uniform float uScale;',
            'uniform float uBob;',
            'varying vec3 vNormal;',
            'void main(){',
            ' vec3 p=uRotation*aPosition;',
            ' float w=7.5-p.z;',
            ' gl_Position=vec4(p.x*uScale*15.0/uSize.x,p.y*uScale*15.0/uSize.y+(0.06-uBob*2.0/uSize.y)*w,-p.z*0.1*w,w);',
            ' vNormal=uRotation*aNormal;',
            '}'
        ].join('\n');
        var fragmentSource = [
            'precision mediump float;',
            'varying vec3 vNormal;',
            'float box(float value,float center,float width){float d=(value-center)/width;return exp(-d*d);}',
            'void main(){',
            ' vec3 n=normalize(vNormal);',
            ' vec3 r=2.0*n.z*n-vec3(0.0,0.0,1.0);',
            ' float top=box(r.y,0.5,0.33)*(0.55+0.45*max(0.0,r.z));',
            ' float strip=box(r.x,-0.53,0.105)*max(0.15,r.y+0.8);',
            ' float right=box(r.x,0.68,0.24)*max(0.2,r.z+0.55);',
            ' float rim=pow(1.0-max(0.0,n.z),3.0);',
            ' float base=38.0+135.0*top+150.0*strip+64.0*right+60.0*rim;',
            ' float copper=right*12.0+rim*6.0;',
            ' vec3 color=vec3(base*1.23+copper,base*0.82+copper*0.45,base*0.47+copper*0.2)/255.0;',
            ' gl_FragColor=vec4(min(color,vec3(1.0,0.94,0.82)),1.0);',
            '}'
        ].join('\n');
        function shader(type, source) {
            var result = gl.createShader(type);
            gl.shaderSource(result, source);
            gl.compileShader(result);
            if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Shader unavailable');
            return result;
        }
        var program = gl.createProgram();
        gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Renderer unavailable');
        gl.useProgram(program);
        var mesh = new Float32Array(vertices.length * 6);
        for (var m = 0; m < vertices.length; m++) mesh.set(vertices[m], m * 6);
        var indices = new Uint16Array(faces.length * 6);
        for (var f = 0; f < faces.length; f++) {
            var face = faces[f];
            indices.set([face[0], face[1], face[2], face[0], face[2], face[3]], f * 6);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
        var position = gl.getAttribLocation(program, 'aPosition');
        var normal = gl.getAttribLocation(program, 'aNormal');
        gl.enableVertexAttribArray(position);
        gl.enableVertexAttribArray(normal);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 0);
        return {
            count: indices.length,
            rotation: gl.getUniformLocation(program, 'uRotation'),
            size: gl.getUniformLocation(program, 'uSize'),
            scale: gl.getUniformLocation(program, 'uScale'),
            bob: gl.getUniformLocation(program, 'uBob')
        };
    }

    if (gl) {
        try { gpu = createGPU(); }
        catch (_) {
            // A browser can expose a WebGL context while refusing shader compilation.
            var replacement = canvas.cloneNode(false);
            canvas.parentNode.replaceChild(replacement, canvas);
            canvas = replacement;
            gl = null;
            ctx = canvas.getContext('2d', { alpha: true });
            if (!ctx) return;
        }
    }

    function rotation(x, y, z) {
        var cx = Math.cos(x), sx = Math.sin(x);
        var cy = Math.cos(y), sy = Math.sin(y);
        var cz = Math.cos(z), sz = Math.sin(z);
        return [cy * cz, sx * sy * cz - cx * sz, cx * sy * cz + sx * sz,
            cy * sz, sx * sy * sz + cx * cz, cx * sy * sz - sx * cz,
            -sy, sx * cy, cx * cy];
    }

    function shade(nx, ny, nz) {
        var len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        // Reflect a studio of softboxes in the surface, rather than emitting a glow.
        var rx = 2 * nx * nz;
        var ry = 2 * ny * nz;
        var rz = 2 * nz * nz - 1;
        var topBox = Math.exp(-Math.pow((ry - 0.5) / 0.33, 2)) * (0.55 + 0.45 * Math.max(0, rz));
        var strip = Math.exp(-Math.pow((rx + 0.53) / 0.105, 2)) * Math.max(0.15, ry + 0.8);
        var rightBox = Math.exp(-Math.pow((rx - 0.68) / 0.24, 2)) * Math.max(0.2, rz + 0.55);
        var rim = Math.pow(1 - Math.max(0, nz), 3);
        var base = 30 + 120 * topBox + 135 * strip + 64 * rightBox + 60 * rim;
        var copper = rightBox * 15 + rim * 7;
        var r = Math.min(245, base * 1.23 + copper);
        var g = Math.min(249, base * 0.82 + copper * 0.45);
        var b = Math.min(247, base * 0.47 + copper * 0.2);
        return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
    }

    function render() {
        if (!width || !height || contextLost) return;
        var motion = reduced.matches ? 0 : elapsed;
        var matrix = rotation(0.58 + Math.sin(motion * 0.18) * 0.08 + eased.y * 0.09,
            -0.29 + Math.sin(motion * 0.13) * 0.13 + eased.x * 0.13 + scroll * 0.07,
            -0.29 + Math.sin(motion * 0.1) * 0.035);
        var scale = Math.min(width, height) * 0.262;
        var originX = width * 0.5;
        var originY = height * 0.47 + Math.sin(motion * 0.4) * 3;

        if (gl) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniformMatrix3fv(gpu.rotation, false, [matrix[0], matrix[3], matrix[6], matrix[1], matrix[4], matrix[7], matrix[2], matrix[5], matrix[8]]);
            gl.uniform2f(gpu.size, width, height);
            gl.uniform1f(gpu.scale, scale);
            gl.uniform1f(gpu.bob, Math.sin(motion * 0.4) * 3);
            gl.drawElements(gl.TRIANGLES, gpu.count, gl.UNSIGNED_SHORT, 0);
            container.classList.add('is-rendered');
            return;
        }
        ctx.clearRect(0, 0, width, height);

        var shadow = ctx.createRadialGradient(originX, height * 0.87, 0, originX, height * 0.87, width * 0.29);
        shadow.addColorStop(0, 'rgba(0,0,0,0.48)');
        shadow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(0, height * 0.87);
        ctx.scale(1, 0.17);
        ctx.translate(0, -height * 0.87);
        ctx.fillStyle = shadow;
        ctx.fillRect(0, 0, width, height * 2);
        ctx.restore();

        for (var k = 0; k < vertices.length; k++) {
            var v = vertices[k];
            var p = projected[k];
            var x = matrix[0] * v[0] + matrix[1] * v[1] + matrix[2] * v[2];
            var y = matrix[3] * v[0] + matrix[4] * v[1] + matrix[5] * v[2];
            p.z = matrix[6] * v[0] + matrix[7] * v[1] + matrix[8] * v[2];
            var perspective = 7.5 / (7.5 - p.z);
            p.x = originX + x * scale * perspective;
            p.y = originY - y * scale * perspective;
            p.nx = matrix[0] * v[3] + matrix[1] * v[4] + matrix[2] * v[5];
            p.ny = matrix[3] * v[3] + matrix[4] * v[4] + matrix[5] * v[5];
            p.nz = matrix[6] * v[3] + matrix[7] * v[4] + matrix[8] * v[5];
        }

        ordered.length = 0;
        for (var f = 0; f < faces.length; f++) {
            var face = faces[f];
            var p0 = projected[face[0]], p1 = projected[face[1]], p2 = projected[face[2]], p3 = projected[face[3]];
            if (p0.nz + p1.nz + p2.nz + p3.nz < -0.65) continue;
            ordered.push({ face: face, depth: p0.z + p1.z + p2.z + p3.z });
        }
        ordered.sort(function (a, b) { return a.depth - b.depth; });

        ctx.lineWidth = 0.6;
        ctx.lineJoin = 'round';
        for (var q = 0; q < ordered.length; q++) {
            var quad = ordered[q].face;
            var a0 = projected[quad[0]], a1 = projected[quad[1]], a2 = projected[quad[2]], a3 = projected[quad[3]];
            var color = shade(a0.nx + a1.nx + a2.nx + a3.nx,
                a0.ny + a1.ny + a2.ny + a3.ny, a0.nz + a1.nz + a2.nz + a3.nz);
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(a1.x, a1.y);
            ctx.lineTo(a2.x, a2.y);
            ctx.lineTo(a3.x, a3.y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.fill();
            ctx.stroke();
        }
        container.classList.add('is-rendered');
    }

    function tick(time) {
        frame = 0;
        if (!gl || !visible || document.hidden || reduced.matches || manuallyPaused || contextLost) return;
        if (time - lastTime > (coarse ? 66 : 42)) {
            elapsed += Math.min((time - lastTime) / 1000, 0.08);
            lastTime = time;
            eased.x += (pointer.x - eased.x) * 0.07;
            eased.y += (pointer.y - eased.y) * 0.07;
            render();
        }
        frame = window.requestAnimationFrame(tick);
    }

    function schedule() {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        if (gl && visible && !document.hidden && !reduced.matches && !manuallyPaused && !contextLost) {
            lastTime = performance.now();
            frame = window.requestAnimationFrame(tick);
        }
    }

    function resize() {
        var bounds = container.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        var dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
        else ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        render();
    }

    if (!coarse) {
        window.addEventListener('pointermove', function (event) {
            if (!visible || reduced.matches) return;
            pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
            pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
    }
    window.addEventListener('scroll', function () {
        if (visible && !reduced.matches) scroll = Math.min(window.scrollY / window.innerHeight, 1.5);
    }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('portfolio:motionchange', function (event) {
        manuallyPaused = !!event.detail.paused;
        schedule();
    });
    canvas.addEventListener('webglcontextlost', function (event) {
        event.preventDefault();
        contextLost = true;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        container.classList.remove('is-rendered');
    });
    canvas.addEventListener('webglcontextrestored', function () {
        try {
            gpu = createGPU();
            contextLost = false;
            resize();
            schedule();
        } catch (_) { container.classList.remove('is-rendered'); }
    });
    var onMotionChange = function () { render(); schedule(); };
    if (reduced.addEventListener) reduced.addEventListener('change', onMotionChange);
    else if (reduced.addListener) reduced.addListener(onMotionChange);

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container);
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            schedule();
        }, { rootMargin: '80px' }).observe(container);
    }
    resize();
    schedule();
}());
