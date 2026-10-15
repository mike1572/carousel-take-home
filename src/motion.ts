import { useEffect, useRef } from 'react'

/** The viewer's motion capabilities, read once from the environment. */
export function motionPrefs() {
  return {
    hoverFine: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

/** True when it's appropriate to run pointer-driven motion effects. */
export function canAnimatePointer() {
  const { hoverFine, reduceMotion } = motionPrefs()
  return hoverFine && !reduceMotion
}

/** Wrap a handler so it runs at most once per animation frame. */
export function rafThrottle<Args extends unknown[]>(fn: (...args: Args) => void) {
  let frame = 0
  const run = (...args: Args) => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => fn(...args))
  }
  run.cancel = () => cancelAnimationFrame(frame)
  return run
}

/** Subtle cursor-parallax tilt on an element. No-op on touch / reduced-motion. */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !canAnimatePointer()) return

    const onMove = rafThrottle((e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5 // -0.5 .. 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-2px)`
    })
    const reset = () => {
      onMove.cancel()
      el.style.transform = ''
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      onMove.cancel()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [])
  return ref
}

/** Soft radial spotlight that follows the pointer (drawn via CSS vars on :root). */
export function useCursorGlow() {
  useEffect(() => {
    if (!canAnimatePointer()) return

    const root = document.documentElement
    const onMove = rafThrottle((e: PointerEvent) => {
      root.style.setProperty('--cx', `${e.clientX}px`)
      root.style.setProperty('--cy', `${e.clientY}px`)
      root.classList.add('glow-on')
    })
    const onLeave = () => root.classList.remove('glow-on')

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      onMove.cancel()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])
}
