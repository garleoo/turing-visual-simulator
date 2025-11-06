class TuringMachine {
    constructor() {
        this.transitions = {
            'q0': {
                'X': ['q0', 'X', 'R'],
                'Y': ['q0', 'Y', 'R'],
                'a': ['q1', 'X', 'R'],
                'b': ['q2', 'Y', 'R'],
                '|': ['q7', '|', 'R']
            },
            'q1': {
                'a': ['q1', 'a', 'R'],
                'b': ['q1', 'b', 'R'],
                '|': ['q3', '|', 'R']
            },
            'q2': {
                'a': ['q2', 'a', 'R'],
                'b': ['q2', 'b', 'R'],
                '|': ['q4', '|', 'R']
            },
            'q3': {
                'X': ['q3', 'X', 'R'],
                'Y': ['q3', 'Y', 'R'],
                'b': ['q3', 'b', 'R'],
                '_': ['q5', 'X', 'L'],
                'a': ['q5', 'X', 'L']
            },
            'q4': {
                'X': ['q4', 'X', 'R'],
                'Y': ['q4', 'Y', 'R'],
                'a': ['q4', 'a', 'R'],
                'b': ['q5', 'Y', 'L'],
                '_': ['q5', 'Y', 'L']
            },
            'q5': {
                'X': ['q5', 'X', 'L'],
                'Y': ['q5', 'Y', 'L'],
                'a': ['q5', 'a', 'L'],
                'b': ['q5', 'b', 'L'],
                '_': ['q0', '_', 'R'],
                '|': ['q5', '|', 'L']
            },
            'q6': {
                'X': ['q6', 'a', 'L'],
                'Y': ['q6', 'b', 'L'],
                '|': ['q6', '|', 'L'],
                '_': ['q8', '_', 'S']
            },
            'q7': {
                'a': ['q9', 'X', 'L'],
                'b': ['q10', 'Y', 'L'],
                'X': ['q7', 'X', 'R'],
                'Y': ['q7', 'Y', 'R'],
                '_': ['q6', '_', 'L']
            },
            'q9': {
                'X': ['q9', 'X', 'L'],
                'Y': ['q9', 'Y', 'L'],
                '|': ['q9', '|', 'L'],
                '_': ['q0', 'X', 'R']
            },
            'q10': {
                'X': ['q10', 'X', 'L'],
                'Y': ['q10', 'Y', 'L'],
                '|': ['q10', '|', 'L'],
                '_': ['q0', 'Y', 'R']
            }
        };
    }

    processInput(input) {
        // Cinta representada como array de símbolos. Usamos '_' como blanco.
        let tape = input.split('');
        let currentState = 'q0';
        let head = 0;

        const stepsArr = [];

        const maxSteps = 20000; // tope para evitar bucles infinitos
        let steps = 0;

        // Asegura que la cabeza apunte a una celda existente; extiende la cinta a la izquierda o derecha con '_'.
        const ensureHeadInBounds = () => {
            if (head < 0) {
                // añadimos un blanco al inicio y colocamos la cabeza en la nueva celda 0
                tape.unshift('_');
                head = 0;
            }
            while (head >= tape.length) {
                tape.push('_');
            }
        };

        // push inicial
        ensureHeadInBounds();
        stepsArr.push({ tape: tape.slice(), head: head, state: currentState });

        while (currentState !== 'q8' && steps < maxSteps) {
            steps++;
            ensureHeadInBounds();

            let currentSymbol = tape[head] || '_';

            // permitir transición por símbolo exacto o por símbolo blanco '_'
            let trans = (this.transitions[currentState] && (this.transitions[currentState][currentSymbol] || this.transitions[currentState]['_']));
            if (!trans) {
                // no hay transición; detenemos la simulación
                break;
            }

            let [nextState, writeSymbol, direction] = trans;

            // escribir símbolo
            tape[head] = writeSymbol;

            // mover cabeza
            if (direction === 'R') {
                head++;
            } else if (direction === 'L') {
                head--;
            } else if (direction === 'S') {
                // stay / halta; terminamos
                currentState = nextState;
                ensureHeadInBounds();
                stepsArr.push({ tape: tape.slice(), head: Math.max(0, Math.min(head, tape.length-1)), state: currentState });
                break;
            }

            currentState = nextState;

            // asegurar nuevamente para construir la representación
            ensureHeadInBounds();
            stepsArr.push({ tape: tape.slice(), head: Math.max(0, Math.min(head, tape.length-1)), state: currentState });
        }

        if (steps >= maxSteps) {
            // indicamos que se detuvo por tope
            stepsArr.push({ info: '...detenido por tope de pasos (posible bucle)' });
        }

        return stepsArr;
    }
}

function processInput() {
    const inputElement = document.getElementById('input-string');
    const outputElement = document.getElementById('turing-id');
    const input = inputElement.value.trim();

    if (!input || !input.includes('|')) {
        alert('Por favor ingrese dos cadenas separadas por |');
        return;
    }

    const turingMachine = new TuringMachine();
    const steps = turingMachine.processInput(input);

    // Mostrar texto con ID tradicional (concat de configuraciones) para compatibilidad
    const pretty = steps.filter(s=>!s.info).map(s=>{
        // construir representación similar a before: insertar estado en la posición head
        const tapeStr = s.tape.join('');
        const pos = Math.max(0, Math.min(s.head, s.tape.length));
        return tapeStr.substring(0,pos) + s.state + tapeStr.substring(pos);
    }).join(' <- ');

    outputElement.textContent = pretty || (steps[steps.length-1] && steps[steps.length-1].info) || '';

    // Visualización: render paso a paso
    window.turingSteps = steps; // exponer globalmente para controles
    window.currentStepIndex = 0;
    renderStep(0);
    setupControls();
}

function renderStep(idx) {
    const container = document.getElementById('tape-container');
    const info = document.getElementById('step-info');
    container.innerHTML = '';
    const steps = window.turingSteps || [];
    if (!steps || steps.length===0) return;

    const step = steps[idx] || steps[steps.length-1];
    if (step.info) {
        info.textContent = step.info;
        return;
    }

    // opcional: mostrar padding de 3 blancos alrededor para ver cambios al inicio/final
    const pad = 3;
    const tape = step.tape.slice();
    for (let i=0;i<pad;i++) tape.unshift('_');
    for (let i=0;i<pad;i++) tape.push('_');

    const adjHead = step.head + pad;

    tape.forEach((sym, i) => {
        const cell = document.createElement('div');
        cell.className = 'cell' + (i===adjHead? ' head':'');
        cell.textContent = sym;
        if (i===adjHead) {
            const badge = document.createElement('div');
            badge.className = 'state-badge';
            badge.textContent = step.state;
            cell.appendChild(badge);
        }
        container.appendChild(cell);
    });

    info.textContent = `Paso ${idx+1} / ${window.turingSteps.length}`;

    // resaltar diagrama: prev state -> current state
    const prevState = (steps[idx-1] && steps[idx-1].state) || null;
    const currState = (step && step.state) || null;
    if (currState) highlightDiagram(prevState, currState);
}

function setupControls() {
    const prev = document.getElementById('prev-step');
    const next = document.getElementById('next-step');
    const play = document.getElementById('play-pause');
    const reset = document.getElementById('reset');
    clearInterval(window._turingTimer);
    window._isPlaying = false;
    play.textContent = '▶ Play';

    prev.onclick = () => {
        if (!window.turingSteps) return;
        window.currentStepIndex = Math.max(0, window.currentStepIndex - 1);
        renderStep(window.currentStepIndex);
    };
    next.onclick = () => {
        if (!window.turingSteps) return;
        window.currentStepIndex = Math.min(window.turingSteps.length-1, window.currentStepIndex + 1);
        renderStep(window.currentStepIndex);
    };
    play.onclick = () => {
        if (!window.turingSteps) return;
        if (window._isPlaying) {
            clearInterval(window._turingTimer);
            window._isPlaying = false;
            play.textContent = '▶ Play';
        } else {
            window._isPlaying = true;
            play.textContent = '⏸ Pause';
            window._turingTimer = setInterval(()=>{
                if (window.currentStepIndex < window.turingSteps.length-1) {
                    window.currentStepIndex++;
                    renderStep(window.currentStepIndex);
                } else {
                    clearInterval(window._turingTimer);
                    window._isPlaying = false;
                    play.textContent = '▶ Play';
                }
            }, 350);
        }
    };
    reset.onclick = () => {
        if (!window.turingSteps) return;
        clearInterval(window._turingTimer);
        window._isPlaying = false;
        play.textContent = '▶ Play';
        window.currentStepIndex = 0;
        renderStep(0);
    };
}

/* ------------------- Diagrama: construcción y resaltado ------------------- */
function initDiagram() {
    const container = document.getElementById('diagram-container');
    container.innerHTML = '';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1000 360');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // definimos posiciones aproximadas para cada estado
    const positions = {
        'q0': [80, 180],
        'q1': [220, 80],
        'q3': [420, 60],
        'q5': [620, 80],
        'q4': [820, 120],
        'q2': [520, 180],
        'q7': [360, 260],
        'q9': [520, 260],
        'q6': [680, 260],
        'q10': [260, 260],
        'q8': [920, 220]
    };

    // crear flecha marker
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const markerPath = document.createElementNS(svgNS, 'path');
    markerPath.setAttribute('d', 'M0,0 L6,3 L0,6 z');
    markerPath.setAttribute('fill', '#bdbdbd');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // extraer transiciones del objeto (para dibujar aristas) y recolectar etiquetas
    const tm = new TuringMachine();
    const edges = new Map();
    Object.keys(tm.transitions).forEach(s => {
        const trans = tm.transitions[s];
        Object.keys(trans).forEach(sym => {
            const t = trans[sym];
            if (!t) return;
            const next = t[0];
            const write = t[1];
            const dir = t[2];
            const key = `${s}->${next}`;
            const label = `${sym}:${write},${dir}`;
            if (!edges.has(key)) edges.set(key, {from: s, to: next, labels: [label]});
            else edges.get(key).labels.push(label);
        });
    });

    // dibujar aristas (líneas curvas simples)
    const edgeGroup = document.createElementNS(svgNS, 'g');
    edgeGroup.setAttribute('class', 'diagram-edges');
    edges.forEach(e => {
        const from = positions[e.from] || [100,100];
        const to = positions[e.to] || [300,100];
        const path = document.createElementNS(svgNS, 'path');
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const mx = from[0] + dx * 0.5;
        const my = from[1] + dy * 0.5 - 30; // curve upwards a bit
        const d = `M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'diagram-edge');
        path.setAttribute('data-from', e.from);
        path.setAttribute('data-to', e.to);
        const key = `${e.from}->${e.to}`;
        path.setAttribute('data-key', key);
        path.setAttribute('marker-end', 'url(#arrow)');
        edgeGroup.appendChild(path);

        // etiqueta para la arista
        const labelText = (e.labels || []).join(' | ');
        if (labelText) {
            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', mx);
            text.setAttribute('y', my - 8);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'edge-label');
            text.setAttribute('data-key', key);
            text.textContent = labelText;
            edgeGroup.appendChild(text);
        }
    });
    svg.appendChild(edgeGroup);

    // dibujar nodos
    const nodeGroup = document.createElementNS(svgNS, 'g');
    nodeGroup.setAttribute('class', 'diagram-nodes');
    Object.keys(positions).forEach(k => {
        const pos = positions[k];
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('class', 'diagram-node');
        g.setAttribute('data-state', k);
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pos[0]);
        circle.setAttribute('cy', pos[1]);
        circle.setAttribute('r', 26);
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', pos[0]);
        text.setAttribute('y', pos[1] + 5);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = k;
        g.appendChild(circle);
        g.appendChild(text);
        nodeGroup.appendChild(g);
    });
    svg.appendChild(nodeGroup);

    container.appendChild(svg);

    // guardar referencias globales para actualizar resaltados
    window._diagram = { svg, nodeGroup, edgeGroup };
}

function highlightDiagram(prevState, currState) {
    if (!window._diagram) return;
    const { nodeGroup, edgeGroup } = window._diagram;
    // limpiar clases
    nodeGroup.querySelectorAll('.diagram-node').forEach(n => n.classList.remove('active'));
    edgeGroup.querySelectorAll('.diagram-edge').forEach(e => e.classList.remove('active'));

    // resaltar nodo actual
    const node = nodeGroup.querySelector(`[data-state="${currState}"]`);
    if (node) node.classList.add('active');

    // resaltar arista desde prev->curr si existe
    if (prevState) {
        const key = `${prevState}->${currState}`;
        const edge = edgeGroup.querySelector(`.diagram-edge[data-key="${key}"]`);
        const label = edgeGroup.querySelector(`.edge-label[data-key="${key}"]`);
        if (edge) {
            edge.classList.add('active');
            if (label) label.classList.add('active');
            // animación breve: quitar tras 400ms
            setTimeout(()=> { edge.classList.remove('active'); if (label) label.classList.remove('active'); }, 400);
        }
    }
}

// inicializamos diagrama al cargar la página
window.addEventListener('load', ()=>{
    try { 
        initDiagram(); 
        renderTransitionsTable();
    } catch(e){ console.error(e); }
});

function renderTransitionsTable() {
    const tableDiv = document.getElementById('transitions-table');
    if (!tableDiv) return;
    const tm = new TuringMachine();
    const rows = [];
    Object.entries(tm.transitions).forEach(([state, trans]) => {
        Object.entries(trans).forEach(([read, [next, write, dir]]) => {
            rows.push({
                state,
                read,
                write,
                next,
                dir
            });
        });
    });
    let html = '<table><thead><tr><th>Estado</th><th>Lee</th><th>Escribe</th><th>Siguiente</th><th>Acción</th></tr></thead><tbody>';
    for (const r of rows) {
        html += `<tr><td>${r.state}</td><td>${r.read}</td><td>${r.write}</td><td>${r.next}</td><td>${r.dir}</td></tr>`;
    }
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}