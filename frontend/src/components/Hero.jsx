import React, { useEffect } from 'react';
import '../styles/components/hero.css';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    cardClass: 'card--1',
    centerContent: (
      <>
        <h2 className="exam-heading">Landing Page Design</h2>
        <div className="hero-actions">
          <Link to="/login" data-hover="Login" className="exam-button">Login</Link>
          <Link to="/register" data-hover="Signup" className="exam-button">Sign up</Link>
        </div>
      </>
    ),
    icon: '1',
    heading: 'Home',
  },
  {
    id: 2,
    cardClass: 'card--2',
    centerContent: (
      <>
        <h2 className="exam-heading">About RataTutor</h2>
        <p className="about-text">
          RataTutor is an AI-powered platform that connects you with experienced tutors for personalized, on-demand learning.
        </p>
      </>
    ),
    icon: '2',
    heading: 'About',
  },
  {
    id: 3,
    cardClass: 'card--3',
    centerContent: (
      <>
        <h2 className="exam-heading">Features Galore</h2>
        <div className="exam-card-container">
          <div className="exam-card flex">
            <div>📈</div>
            <p>Personalized learning paths</p>
          </div>
          <div className="exam-card flex">
            <div>📝</div>
            <p>Interactive quizzes & exercises</p>
          </div>
          <div className="exam-card flex">
            <div>⏱️</div>
            <p>Real-time progress tracking</p>
          </div>
          <div className="exam-card flex">
            <div>💬</div>
            <p>24/7 tutor support</p>
          </div>
        </div>
      </>
    ),
    icon: '3',
    heading: 'Features',
  },
  {
    id: 4,
    cardClass: 'card--4',
    centerContent: (
      <>
        <h2 className="exam-heading">Get in Touch</h2>
        <form className="contact-form">
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Message
            <textarea name="message" rows="4" placeholder="How can we help?" />
          </label>
          <button type="submit" className="exam-button">
            Send Message
          </button>
        </form>
      </>
    ),
    icon: '4',
    heading: 'Contact',
  }
];

const Hero = () => {
  useEffect(() => {
    let last = 0;
    const cooldown = 1000;
    const onWheel = e => {
      const now = Date.now();
      if (now - last < cooldown) return;
      const radios = Array.from(document.querySelectorAll('input[name="slide"]'));
      let idx = radios.findIndex(r => r.checked);
      idx = e.deltaY > 0
        ? (idx + 1) % radios.length
        : (idx - 1 + radios.length) % radios.length;
      radios[idx].checked = true;
      last = now;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="wrapper">
      <div className="container">
        {slides.map((s, i) => (
          <React.Fragment key={s.id}>
            <input
              type="radio"
              name="slide"
              id={`c${s.id}`}
              defaultChecked={i === 0}
            />
            <label htmlFor={`c${s.id}`} className={`card ${s.cardClass}`}>
              <div className="hero-center">
                {s.centerContent}
              </div>
              <div className="row">
                <div className="icon">{s.icon}</div>
                <div className="description">
                  <h4>{s.heading}</h4>
                </div>
              </div>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Hero;
