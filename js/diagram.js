/* =========================================================
   diagram.js — Render SVG FSM diagram, highlight active state
   FSM Login System Demo
   ========================================================= */

(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const R = 42; // radius state node
  const VIEW_W = 800;
  const VIEW_H = 480;

  // ---- Posisi setiap state node ----
  const NODE_POS = {
    S0: { x: 90,  y: 240 },
    S1: { x: 260, y: 240 },
    S2: { x: 260, y: 90  },
    S3: { x: 440, y: 240 },
    S4: { x: 640, y: 130 },
    S5: { x: 440, y: 380 },
    S6: { x: 640, y: 380 }
  };

  // ---- Definisi transisi (path + label) ----
  // Tiap entry: id, from, to, label, d (path data), labelPos {x,y}
  const TRANSITIONS = [
    { id: 't01', from: 'S0', to: 'S1', label: 'submit',
      d: 'M 130 240 L 220 240', labelPos: { x: 175, y: 232 } },

    { id: 't12', from: 'S1', to: 'S2', label: 'email\nnot found',
      d: 'M 260 200 L 260 130', labelPos: { x: 268, y: 168 } },

    { id: 't20', from: 'S2', to: 'S0', label: 'edit input',
      d: 'M 222 70 C 160 30 90 100 90 200', labelPos: { x: 110, y: 35 } },

    { id: 't13', from: 'S1', to: 'S3', label: 'wrong_pw',
      d: 'M 300 240 L 400 240', labelPos: { x: 350, y: 232 } },

    { id: 't31', from: 'S3', to: 'S1', label: 'submit',
      d: 'M 400 268 C 380 310 320 310 300 268', labelPos: { x: 350, y: 320 } },

    { id: 't14', from: 'S1', to: 'S4', label: 'success',
      d: 'M 286 206 C 290 110 600 100 600 132', labelPos: { x: 460, y: 100 } },

    { id: 't15', from: 'S1', to: 'S5', label: '3x fail',
      d: 'M 290 274 C 290 360 400 360 400 340', labelPos: { x: 295, y: 335 } },

    { id: 't56', from: 'S5', to: 'S6', label: 'auto',
      d: 'M 482 380 L 600 380', labelPos: { x: 540, y: 372 } },

    { id: 't60', from: 'S6', to: 'S0', label: '30s',
      d: 'M 614 410 C 360 460 100 460 112 280', labelPos: { x: 350, y: 458 } },

    { id: 't40', from: 'S4', to: 'S0', label: 'logout',
      d: 'M 600 122 C 480 50 200 50 122 200', labelPos: { x: 340, y: 35 } }
  ];

  // ---- Class Diagram ----
  class Diagram {
    constructor(svgElement, fsm) {
      if (!svgElement) throw new Error('[Diagram] svgElement required');
      if (!fsm) throw new Error('[Diagram] fsm instance required');
      this.svg = svgElement;
      this.fsm = fsm;
      this.stateNodes = {};  // stateId -> { circle, text, group }
      this.transPaths = {};  // transitionId -> { path, label }

      this._init();
      this.fsm.subscribe((next, prev, evt) => this._onStateChange(next, prev, evt));
    }

    // ---------- Init SVG structure ----------
    _init() {
      // Clear
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      this.svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
      this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      this._buildDefs();
      this._buildTransitions();
      this._buildNodes();
      this._buildStateBadge();
      this._highlightState(this.fsm.getStateId(), null);
    }

    // ---------- Arrow markers (1 per state color) ----------
    _buildDefs() {
      const defs = document.createElementNS(SVG_NS, 'defs');
      const allStates = FSM.getAllStates();
      allStates.forEach(s => {
        const marker = document.createElementNS(SVG_NS, 'marker');
        marker.setAttribute('id', `arrow-${s.id}`);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '8');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('orient', 'auto-start-reverse');

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        path.setAttribute('fill', s.color);
        marker.appendChild(path);
        defs.appendChild(marker);
      });
      this.svg.appendChild(defs);
    }

    // ---------- Transition paths + labels ----------
    _buildTransitions() {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'transitions');

      TRANSITIONS.forEach(t => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', `transition t-${t.id}`);
        path.setAttribute('d', t.d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--color-border-strong)');
        path.setAttribute('stroke-width', '1.8');
        path.setAttribute('marker-end', 'url(#arrow-default)');
        path.setAttribute('data-from', t.from);
        path.setAttribute('data-to', t.to);

        // Gunakan marker dengan warna tujuan
        path.setAttribute('marker-end', `url(#arrow-${t.to})`);

        g.appendChild(path);

        // Label multi-line
        const lines = t.label.split('\n');
        const labelGroup = document.createElementNS(SVG_NS, 'g');
        labelGroup.setAttribute('class', `transition-label t-label-${t.id}`);
        labelGroup.setAttribute('transform', `translate(${t.labelPos.x}, ${t.labelPos.y})`);

        // Background rect untuk readability (optional, semi-transparent)
        lines.forEach((line, idx) => {
          const text = document.createElementNS(SVG_NS, 'text');
          text.setAttribute('class', 'transition-label-text');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('x', 0);
          text.setAttribute('y', idx * 12);
          text.setAttribute('dy', '0.35em');
          text.textContent = line;
          labelGroup.appendChild(text);
        });
        g.appendChild(labelGroup);

        this.transPaths[t.id] = { path, label: labelGroup, meta: t };
      });

      this.svg.appendChild(g);
    }

    // ---------- State nodes ----------
    _buildNodes() {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'nodes');

      const allStates = FSM.getAllStates();
      allStates.forEach(s => {
        const pos = NODE_POS[s.id];
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', `state-node state-${s.id}`);
        group.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
        group.setAttribute('data-state', s.id);

        // Outer glow (hidden by default)
        const glow = document.createElementNS(SVG_NS, 'circle');
        glow.setAttribute('class', 'state-glow');
        glow.setAttribute('r', R + 8);
        glow.setAttribute('fill', s.color);
        glow.setAttribute('opacity', '0');
        group.appendChild(glow);

        // Main circle
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('class', 'state-circle');
        circle.setAttribute('r', R);
        circle.setAttribute('fill', 'var(--color-surface)');
        circle.setAttribute('stroke', s.color);
        circle.setAttribute('stroke-width', '2.5');
        group.appendChild(circle);

        // State ID text (large)
        const idText = document.createElementNS(SVG_NS, 'text');
        idText.setAttribute('class', 'state-id');
        idText.setAttribute('text-anchor', 'middle');
        idText.setAttribute('y', '-4');
        idText.textContent = s.id;
        group.appendChild(idText);

        // State name text (small)
        const nameText = document.createElementNS(SVG_NS, 'text');
        nameText.setAttribute('class', 'state-name');
        nameText.setAttribute('text-anchor', 'middle');
        nameText.setAttribute('y', '14');
        nameText.textContent = s.name;
        group.appendChild(nameText);

        g.appendChild(group);
        this.stateNodes[s.id] = { group, circle, glow, idText, nameText, state: s };
      });

      this.svg.appendChild(g);
    }

    // ---------- Active state badge (top-left of SVG) ----------
    _buildStateBadge() {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'state-badge');
      g.setAttribute('transform', 'translate(12, 18)');

      // Pill background
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', 'state-badge-bg');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', '158');
      rect.setAttribute('height', '26');
      rect.setAttribute('rx', '13');
      rect.setAttribute('ry', '13');
      g.appendChild(rect);

      // Pulse dot
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'state-badge-dot');
      dot.setAttribute('cx', '14');
      dot.setAttribute('cy', '13');
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', 'currentColor');
      g.appendChild(dot);

      // Label text
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'state-badge-text');
      text.setAttribute('x', '26');
      text.setAttribute('y', '13');
      text.setAttribute('dy', '0.35em');
      text.textContent = 'Current: S0 — IDLE';
      g.appendChild(text);

      this.svg.appendChild(g);
      this._stateBadge = { group: g, dot, text };
    }

    // ---------- Update highlight on state change ----------
    _onStateChange(newStateId, prevStateId, event) {
      this._highlightState(newStateId, prevStateId);
    }

    _highlightState(stateId, prevStateId) {
      const state = FSM.getStateById(stateId);
      if (!state) return;

      // Reset all nodes
      Object.values(this.stateNodes).forEach(n => {
        n.group.classList.remove('active');
        n.glow.setAttribute('opacity', '0');
      });

      // Reset all transitions
      Object.values(this.transPaths).forEach(t => {
        t.path.classList.remove('active');
        t.path.setAttribute('stroke-width', '1.8');
        t.label.classList.remove('active');
      });

      // Activate current state
      const node = this.stateNodes[stateId];
      if (node) {
        node.group.classList.add('active');
        node.glow.setAttribute('opacity', '0.3');
      }

      // Activate transition from prev to current (if any)
      if (prevStateId) {
        const trans = TRANSITIONS.find(t => t.from === prevStateId && t.to === stateId);
        if (trans) {
          const tp = this.transPaths[trans.id];
          if (tp) {
            tp.path.classList.add('active');
            tp.path.setAttribute('stroke-width', '3');
            tp.label.classList.add('active');
          }
        }
      }

      // Update badge
      if (this._stateBadge) {
        this._stateBadge.group.style.color = state.color;
        this._stateBadge.text.textContent = `Current: ${state.id} — ${state.name}`;
      }
    }
  }

  global.Diagram = Diagram;

})(window);
