/* The two "roller" controls. On device they are ScrollViews; here they take
   the same gestures: drag / flick the wheels vertically, drag the rulers
   horizontally, or use the mouse wheel and the arrow keys. Clock wheels wrap
   forever, bounded values stop at an end. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from './ui';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ROW = 44; // wheel row height, px

/** A vertical wheel. `values` are the numbers on it; `value` is the selected one. */
export function Wheel({ values, value, onChange, format, loop }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const suppressUntil = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const looped = !!loop && values.length > 1;
  let idx = values.indexOf(value);
  if (idx < 0) idx = 0;
  const rows = looped ? [0, 1, 2, 3, 4].flatMap(() => values) : values;
  const selectedIndex = looped ? values.length * 2 + idx : idx;
  const baseY = ROW - selectedIndex * ROW;

  const step = (amount) => {
    if (!values.length || !amount) return;
    let next = idx + amount;
    next = looped ? ((next % values.length) + values.length) % values.length : clamp(next, 0, values.length - 1);
    onChange(values[next]);
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  /* React registers wheel listeners as passive, so page-scroll is stopped here */
  useEffect(() => {
    const el = ref.current;
    const onWheel = (e) => {
      e.preventDefault();
      stepRef.current(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e) => {
    const btn = e.target.closest('button[data-v]');
    drag.current = {
      pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
      tapValue: btn ? Number(btn.getAttribute('data-v')) : null,
    };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    setDragY(e.clientY - d.startY);
  };
  const finish = (e, cancelled) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;
    setDragging(false);
    setDragY(0);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    if (cancelled) return;
    if (moved) suppressUntil.current = Date.now() + 350;
    if (!moved && d.tapValue !== null) {
      suppressUntil.current = Date.now() + 100;
      onChange(d.tapValue);
      return;
    }
    const steps = Math.round(-dy / ROW);
    if (steps) step(steps);
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      step(e.key === 'ArrowDown' ? 1 : -1);
    }
  };

  return (
    <div
      ref={ref}
      className={cx('wheel', dragging && 'dragging')}
      tabIndex={0}
      role="listbox"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
      onKeyDown={onKeyDown}
    >
      <div className="wheel-list" style={{ transform: `translateY(${baseY + dragY}px)` }}>
        {rows.map((n, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            role="option"
            aria-selected={i === selectedIndex}
            className={i === selectedIndex ? 'sel' : ''}
            data-v={n}
            onClick={() => { if (Date.now() >= suppressUntil.current) onChange(n); }}
          >
            {format ? format(n) : n}
          </button>
        ))}
      </div>
    </div>
  );
}

const TICK = 12; // px per whole value

/** A horizontal ruler: a 12px tick per whole value, every 10th long and
 *  labelled, every 5th medium. The strip slides under a fixed centre pointer. */
export function Ruler({ min, max, value, onChange }) {
  const boxRef = useRef(null);
  const drag = useRef(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const ticks = useMemo(() => {
    const out = [];
    for (let v = min; v <= max; v++) {
      const isLong = v % 10 === 0;
      const isMed = !isLong && v % 5 === 0;
      out.push(
        <div className="tick-slot" key={v}>
          <div
            className="tick"
            style={{ height: isLong ? 28 : isMed ? 20 : 12, background: isLong ? 'var(--primary)' : 'var(--border)' }}
          />
          {isLong ? <div className="tick-label">{v}</div> : null}
        </div>
      );
    }
    return out;
  }, [min, max]);

  const shown = dragging ? clamp(Math.round(value - dx / TICK), min, max) : value;
  const offset = (value - min) * TICK + TICK / 2;

  const nudge = (delta) => onChange(clamp(value + delta, min, max));
  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;

  useEffect(() => {
    const el = boxRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      nudgeRef.current(delta > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e) => {
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY };
    setDragging(true);
    setDx(0);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    setDx(e.clientX - d.startX);
  };
  const finish = (e, cancelled) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    const ddx = e.clientX - d.startX;
    const ddy = e.clientY - d.startY;
    const moved = Math.abs(ddx) > 4 || Math.abs(ddy) > 4;
    setDragging(false);
    setDx(0);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    if (cancelled) return;
    let delta;
    if (moved) {
      delta = Math.round(-ddx / TICK);
    } else {
      /* a tap: jump towards the tapped tick */
      const rect = e.currentTarget.getBoundingClientRect();
      delta = Math.round((e.clientX - rect.left - rect.width / 2) / TICK);
    }
    onChange(clamp(value + delta, min, max));
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      nudge(e.key === 'ArrowRight' ? 1 : -1);
    }
  };

  return (
    <div className="ruler-wrap">
      <div className="ruler-value-row"><div className="ruler-value">{shown}</div></div>
      <div
        ref={boxRef}
        className={cx('ruler-box', dragging && 'dragging')}
        tabIndex={0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={shown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finish(e, false)}
        onPointerCancel={(e) => finish(e, true)}
        onKeyDown={onKeyDown}
      >
        <div className="ruler-strip" style={{ transform: `translateX(calc(50% - ${offset}px + ${dragging ? dx : 0}px))` }}>
          {ticks}
        </div>
        <div className="ruler-pointer"><i /></div>
      </div>
    </div>
  );
}
