import PaperDrift from './PaperDrift'
import { Arrow, BrandMark, Check } from './Icons'
import { useCursorGlow, useTilt } from './motion'
import './App.css'

const NAV_LINKS = ['Platform', 'Verification', 'Industries', 'Pricing']

const POINTS = [
  'Applicants finish in one mobile sitting, from a single link',
  'Identity, income and bank data verified before it reaches your desk',
  'Fewer follow-ups, faster approvals, less abandoned pipeline',
]

// Sample application in the product visual (illustrative, not real data)
const STEPS = [
  { label: 'Link opened on mobile', meta: '0:00', done: true },
  { label: 'Identity verified', meta: '2:41', done: true },
  { label: 'Bank connected securely', meta: '4:18', done: true },
  { label: 'Income confirmed', meta: '6:12', done: true },
]

export default function App() {
  const tiltRef = useTilt<HTMLDivElement>()
  useCursorGlow()

  return (
    <div className="page">
      <div className="cursor-glow" aria-hidden="true" />

      {/* ---------- Nav ---------- */}
      <header className="nav">
        <div className="container nav__in">
          <a className="brand" href="#" aria-label="Carousel home">
            <span className="brand__mark"><BrandMark /></span>
            Carousel
          </a>
          <nav className="nav__links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a href="#" key={link}>{link}</a>
            ))}
          </nav>
          <a className="btn btn--primary" href="#book">Book a demo</a>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <main className="hero">
        <div className="container hero__grid">
          {/* Left: message */}
          <div>
            <span className="eyebrow reveal d1">For lending &amp; leasing credit teams</span>

            <h1 className="reveal d1">
              Decision-ready borrower files, in <em>minutes</em>.
            </h1>

            <p className="hero__sub reveal d2">
              Carousel runs intake and verification so your credit desk gets a
              complete, decision-ready file the same day — not 24 to 72 hours later.
            </p>

            <div className="hero__cta reveal d3">
              <a className="btn btn--primary btn--lg btn--shine" href="#book">
                Book a demo <Arrow />
              </a>
              <a className="btn btn--ghost btn--lg" href="#how">See how it works</a>
            </div>

            <ul className="points reveal d4">
              {POINTS.map((point) => (
                <li key={point}>
                  <span className="tick"><Check /></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: plausible product visual */}
          <div className="visual reveal d3" aria-hidden="true" ref={tiltRef}>
            <div className="card">
              <div className="card__head">
                <div className="card__who">
                  <span className="avatar">JD</span>
                  <div>
                    <b>Jordan Delisle</b>
                    <span>Application #CR-4821</span>
                  </div>
                </div>
                <span className="badge"><Check size={12} /> Verified</span>
              </div>

              <ul className="steps">
                {STEPS.map((step) => (
                  <li className="step" key={step.label}>
                    <span className={step.done ? 'dot' : 'dot dot--pending'}>
                      {step.done && <Check size={12} />}
                    </span>
                    {step.label}
                    <span className="meta">{step.meta}</span>
                  </li>
                ))}
              </ul>

              <div className="timer">
                <b>6:12</b>
                <span>time to decision-ready</span>
              </div>
              <p className="compare">
                Legacy verification: <s>24–72 hours</s>
              </p>
            </div>
          </div>
        </div>
      </main>

      <PaperDrift />
    </div>
  )
}
