/* The phone-width frame every screen sits in: back button + title, segmented
   progress, scrolling body, and the big footer button. */
import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppState';
import { cx } from './ui';

const BACK_LTR = 'M19 12H5M12 19l-7-7 7-7';
const BACK_RTL = 'M5 12h14M12 5l7 7-7 7';

export function Chrome({
  scrollKey, title, sub, counter, segments, onBack, ctaLabel, ctaDisabled, onCta,
  watermark, children,
}) {
  const { rtl } = useApp();
  const scroll = useRef(null);

  /* every new screen starts at the top */
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = 0; }, [scrollKey]);

  const backPath = rtl ? BACK_RTL : BACK_LTR;
  const ctaPath = rtl ? BACK_LTR : BACK_RTL;

  return (
    <>
      <div className="ob-header">
        <button type="button" className="ob-back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={backPath} />
          </svg>
        </button>
        <div className="ob-titles">
          <div className="ob-milestone">{title}</div>
          {sub ? <div className="ob-sub">{sub}</div> : null}
        </div>
        {counter ? <div className="ob-count" dir="ltr">{counter}</div> : null}
      </div>

      {segments ? (
        <div className="ob-segments">
          {segments.map((f, i) => (
            <div className="ob-track" key={i}>
              <div className="ob-fill" style={{ width: Math.round(f * 100) + '%' }} />
            </div>
          ))}
        </div>
      ) : null}

      <div className={cx('ob-scroll', watermark && 'has-mark')} ref={scroll}>{children}</div>

      <div className="ob-footer">
        <button type="button" className="ob-cta" onClick={onCta} disabled={ctaDisabled}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={ctaPath} />
          </svg>
          <span>{ctaLabel}</span>
        </button>
      </div>
    </>
  );
}
