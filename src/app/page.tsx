export default function HomePage() {
  return (
    <main className="home-page">
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Northstar home">
          <span className="brand-mark">N</span>
          <span>Northstar</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-cta" href="#contact">
          Get started
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">
          <span /> Built for better ideas
        </div>
        <h1>
          Turn your next big idea into a <em>real impact.</em>
        </h1>
        <p className="hero-copy">
          A focused workspace that brings your projects, people, and progress
          together—so you can move from inspiration to launch with confidence.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#contact">
            Start creating <span>→</span>
          </a>
          <a className="text-link" href="#features">
            Explore features <span>↘</span>
          </a>
        </div>
        <div className="trust-row">
          <div className="avatars" aria-hidden="true">
            <span>AM</span>
            <span>JL</span>
            <span>SK</span>
          </div>
          <p>
            <strong>4.9/5</strong> from 2,000+ creative teams
          </p>
        </div>

        <div className="artwork" aria-label="Product dashboard preview">
          <div className="window-bar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>northstar.app/workspace</span>
            <div className="window-user">JD</div>
          </div>
          <div className="dashboard">
            <aside className="sidebar">
              <div className="mini-brand">N</div>
              <div className="side-icon active">◇</div>
              <div className="side-icon">⌁</div>
              <div className="side-icon">◫</div>
              <div className="side-icon">◎</div>
            </aside>
            <div className="dashboard-main">
              <div className="dashboard-heading">
                <div>
                  <small>Good morning, Jamie</small>
                  <h3>Project overview</h3>
                </div>
                <button>+ New project</button>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Active projects</span>
                  <strong>24</strong>
                  <small>+12% this month</small>
                </div>
                <div className="metric-card">
                  <span>Tasks completed</span>
                  <strong>186</strong>
                  <small>+18% this week</small>
                </div>
                <div className="metric-card">
                  <span>Team velocity</span>
                  <strong>92%</strong>
                  <small>On target</small>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <span>Weekly progress</span>
                    <strong>+28.4%</strong>
                  </div>
                  <small>Last 7 days</small>
                </div>
                <div className="chart-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logo-strip" aria-label="Trusted companies">
        <p>Trusted by teams at</p>
        <div>
          <span>◈</span> VERTEX
        </div>
        <div>
          <span>✦</span> LUMA
        </div>
        <div>
          <span>◉</span> KINETIC
        </div>
        <div>
          <span>●</span> MONO
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <div className="eyebrow">
            <span /> Everything in one place
          </div>
          <h2>
            Less busywork.
            <br />
            <em>More meaningful work.</em>
          </h2>
        </div>
        <div className="feature-grid">
          <article>
            <div className="feature-icon">✦</div>
            <h3>Clear by design</h3>
            <p>Bring the right information into view, without the noise.</p>
          </article>
          <article>
            <div className="feature-icon">⌁</div>
            <h3>Built to move</h3>
            <p>
              Turn plans into progress quickly with simple, powerful workflows.
            </p>
          </article>
          <article>
            <div className="feature-icon">◌</div>
            <h3>Made together</h3>
            <p>
              Give every teammate the context they need to do their best work.
            </p>
          </article>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-copy">
          <div className="eyebrow">
            <span /> The Northstar way
          </div>
          <h2>
            Work feels better when it <em>flows.</em>
          </h2>
          <p>
            Northstar helps ambitious teams turn ideas into outcomes. Keep your
            vision clear, your team connected, and your momentum moving.
          </p>
          <a href="#contact">
            Discover our story <span>→</span>
          </a>
        </div>
        <div className="quote-card">
          <span className="quote-mark">“</span>
          <blockquote>
            Northstar gave us the clarity we were missing. We ship faster, with
            a team that feels more connected than ever.
          </blockquote>
          <div className="quote-author">
            <span>MR</span>
            <div>
              <strong>Maya Rodriguez</strong>
              <small>Co-founder, Luma</small>
            </div>
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="eyebrow light">
          <span /> Your next chapter starts here
        </div>
        <h2>
          Ready to make work
          <br />
          feel <em>remarkable?</em>
        </h2>
        <a href="mailto:hello@northstar.example">
          Start your journey <span>→</span>
        </a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">N</span>
          <span>Northstar</span>
        </a>
        <p>© 2026 Northstar. Make progress matter.</p>
        <div>
          <a href="#top">Privacy</a>
          <a href="#top">Terms</a>
          <a href="#top">LinkedIn</a>
        </div>
      </footer>
    </main>
  );
}
