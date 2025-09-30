import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logotemp.png';
import bookImg from '../assets/book2.png';
import quizGif from '../assets/screenshots/quiz.gif';
import GiftIcon from '../components/GiftIcon';
import '../styles/pages/home.css';

const Home = () => {
  const scrollRef = useRef(null);
  // Section refs for navigation
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Track active section
  const [activeIdx, setActiveIdx] = React.useState(0);

  // Scroll to section by index
  const scrollToSection = (idx) => {
    const el = scrollRef.current;
    const section = sectionRefs[idx].current;
    if (el && section) {
      el.scrollTo({ left: section.offsetLeft, behavior: 'smooth' });
      setActiveIdx(idx);
    }
  };

  // Listen for scroll to update active section
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      let found = 0;
      sectionRefs.forEach((ref, idx) => {
        const section = ref.current;
        if (section && scrollLeft >= section.offsetLeft - 10) {
          found = idx;
        }
      });
      setActiveIdx(found);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={scrollRef} className="home-wrapper" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', minHeight: '100vh', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
      {/* Logo top left */}
      <div style={{ position: 'fixed', top: 28, left: 36, zIndex: 12 }}>
        <img src={logo} alt="RataTutor logo" style={{ width: 48, height: 48, borderRadius: '50%', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', background: '#fff', border: '2px solid #e0e7ff' }} />
      </div>
      {/* Navigation menu */}
      <nav style={{ position: 'fixed', top: 32, right: 40, zIndex: 10, background: 'rgba(255,255,255,0.85)', borderRadius: 9999, boxShadow: '0 2px 12px rgba(99,102,241,0.07)', padding: '0.5rem 1.25rem', display: 'flex', gap: '1.2rem', alignItems: 'center', fontWeight: 600 }}>
        <button onClick={() => scrollToSection(0)} style={{ background: 'none', border: 'none', color: activeIdx === 0 ? '#f59e42' : '#a21caf', cursor: 'pointer', fontSize: '1rem', fontWeight: activeIdx === 0 ? 800 : 600, textDecoration: activeIdx === 0 ? 'underline' : 'none', transition: 'color 0.2s' }}>Home</button>
        <button onClick={() => scrollToSection(1)} style={{ background: 'none', border: 'none', color: activeIdx === 1 ? '#f59e42' : '#6366f1', cursor: 'pointer', fontSize: '1rem', fontWeight: activeIdx === 1 ? 800 : 600, textDecoration: activeIdx === 1 ? 'underline' : 'none', transition: 'color 0.2s' }}>Features</button>
        <button onClick={() => scrollToSection(3)} style={{ background: 'none', border: 'none', color: activeIdx === 3 ? '#f59e42' : '#3730a3', cursor: 'pointer', fontSize: '1rem', fontWeight: activeIdx === 3 ? 800 : 600, textDecoration: activeIdx === 3 ? 'underline' : 'none', transition: 'color 0.2s' }}>Join</button>
  <button onClick={() => scrollToSection(4)} style={{ background: 'none', border: 'none', color: activeIdx === 4 ? '#f59e42' : '#3730a3', cursor: 'pointer', fontSize: '1rem', fontWeight: activeIdx === 4 ? 800 : 600, textDecoration: activeIdx === 4 ? 'underline' : 'none', transition: 'color 0.2s' }}>Contact</button>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'row', width: '500vw', height: '100vh', scrollSnapType: 'x mandatory' }}>
        {/* Hero Section */}
  <section ref={sectionRefs[0]} style={{
          minWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          scrollSnapAlign: 'start',
          padding: '3rem 1rem 2rem',
          background: 'radial-gradient(circle at 60% 40%, #f3e8ff 0%, #e0e7ff 60%, #f8fafc 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img src={bookImg} alt="Book" style={{ width: 220, height: 170, marginBottom: 24, animation: 'floaty 2.5s ease-in-out infinite', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, textAlign: 'center', marginBottom: 10, color: '#a21caf', letterSpacing: '1.5px', textShadow: '0 2px 12px #e0e7ff' }}>
            Welcome to <span style={{ color: '#6366f1', fontFamily: 'cursive', fontWeight: 700 }}>RataTutor</span>! <span role="img" aria-label="sparkles">✨</span>
          </h1>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 500, textAlign: 'center', marginBottom: 18, color: '#6366f1', fontFamily: 'cursive' }}>
            The cutest way to study with friends
          </h2>
          <p style={{ fontSize: '1.08rem', color: '#6d28d9', marginBottom: 28, textAlign: 'center', maxWidth: 480, fontFamily: 'var(--font-pixel)' }}>
            AI-powered notes, flashcards, and quizzes. Cozy, playful, and powerful. <span role="img" aria-label="hamster">🐹</span>
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: 32 }}>
            <Link to="/login" className="exam-button" style={{ fontSize: '1.1rem', padding: '0.85rem 2.2rem', borderRadius: 9999, background: '#a21caf', color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}>Login</Link>
            <Link to="/register" className="exam-button" style={{ fontSize: '1.1rem', padding: '0.85rem 2.2rem', borderRadius: 9999, background: '#fff', color: '#a21caf', fontWeight: 700, border: '2px solid #a21caf' }}>Sign Up</Link>
          </div>
          <style>{`
            @keyframes floaty {
              0% { transform: translateY(0); }
              50% { transform: translateY(-18px); }
              100% { transform: translateY(0); }
            }
          `}</style>
        </section>
        {/* Features Grid */}
    <section ref={sectionRefs[1]} style={{ minWidth: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start', padding: '2rem 1rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <img src={quizGif} alt="Quiz" style={{ width: '100%', maxWidth: 600, height: 'auto', maxHeight: 600, borderRadius: '32px', boxShadow: '0 8px 32px rgba(99,102,241,0.12)', border: '8px solid #fff', background: '#f3e8ff', objectFit: 'contain' }} />
      </div>
    </section>
        {/* Final CTA bar */}
  <section ref={sectionRefs[3]} style={{ minWidth: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', scrollSnapAlign: 'start', textAlign: 'center', padding: '3rem 1rem 2rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#3730a3', marginBottom: 18 }}>Ready to join the study server?</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: 10 }}>
            <Link to="/register" className="exam-button" style={{ fontSize: '1.1rem', padding: '0.85rem 2.2rem', borderRadius: 9999, background: '#6366f1', color: '#fff', fontWeight: 700 }}>Sign Up</Link>
            <Link to="/login" className="exam-button" style={{ fontSize: '1.1rem', padding: '0.85rem 2.2rem', borderRadius: 9999, background: '#fff', color: '#6366f1', fontWeight: 700, border: '2px solid #6366f1' }}>Login</Link>
          </div>
        </section>
        {/* Footer Section as last slide */}
  <section ref={sectionRefs[4]} style={{ minWidth: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', scrollSnapAlign: 'start', background: '#e0e7ff', textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3730a3', marginBottom: 12 }}>RataTutor — Study Prep Buddy</div>
          <div style={{ fontSize: '.98rem', opacity: .85 }}>© {new Date().getFullYear()} RataTutor</div>
          <div style={{ marginTop: 16 }}>
            <a href="mailto:hello@ratatutor.com" style={{ color: '#3730a3', textDecoration: 'underline', fontSize: '1rem' }}>Contact</a> | <a href="/privacy" style={{ color: '#3730a3', textDecoration: 'underline', fontSize: '1rem' }}>Privacy</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home
