import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { LilyMark } from "./Icon";
import { browseUrl } from "../lib/browse";
export function Layout({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash !== "#collection")
      window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header shell">
        <Link to="/" className="brand" aria-label="Étude home">
          <LilyMark />
          <span>
            étude<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link
            to={browseUrl("gallery", search)}
            className={pathname !== "/about" ? "active" : ""}
          >
            The collection
          </Link>
          <NavLink to="/about">Our perspective</NavLink>
        </nav>
        <span className="header-note">ART, AT YOUR OWN PACE.</span>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer shell">
        <div>
          <Link className="footer-brand" to="/">
            étude.
          </Link>
          <p>A little space for a closer look.</p>
        </div>
        <p>
          Collection data courtesy of the
          <br />
          <a href="https://www.artic.edu/" target="_blank" rel="noreferrer">
            Art Institute of Chicago ↗
          </a>
        </p>
        <span className="footer-note">
          AN INDEPENDENT EXPLORATION
          <br />
          OF LIGHT, COLOR & EVERYDAY LIFE
        </span>
      </footer>
    </>
  );
}
