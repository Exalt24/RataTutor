import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logotemp.png';
import bookImg from '../assets/book2.png';
import quizGif from '../assets/screenshots/quiz.gif';
import '../styles/pages/Home.css';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'creators', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NEW: Resize Handler to close menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      // 768px is the standard Tailwind 'md' breakpoint
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  const navButtonClasses = (section) => {
    const base =
      'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative';
    const active =
      activeSection === section ? 'bg-orange-200 text-orange-600' : '';
    const hover =
      hoveredSection === section && activeSection !== section
        ? 'bg-indigo-100 -translate-y-0.5'
        : '';
    const color = activeSection === section ? '' : 'text-indigo-900';
    return `${base} ${active} ${hover} ${color}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 relative overflow-x-hidden">

      {/* Logo */}
      <div className="fixed top-4 md:top-7 left-4 md:left-9 z-50">
        <img
          src={logo}
          alt="RataTutor logo"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-indigo-100 shadow-md"
        />
      </div>

      {/* --- START MOBILE NAV (SIDEBAR VERSION) --- */}

      {/* Mobile Menu Toggle Button (Fixed Z-Index higher than sidebar) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-5 right-5 z-[60] md:hidden p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-indigo-900 border border-indigo-100 hover:bg-indigo-50 transition-all"
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          // Close Icon (X)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger Icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Backdrop Overlay (Click to close, lets you see content behind) */}
      <div 
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Sidebar Container */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 z-50 bg-indigo-900 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 gap-6 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Navigation Links */}
        {['home', 'features', 'creators', 'contact'].map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className={`text-xl font-bold text-left transition-all duration-300 ${
              activeSection === section 
                ? 'text-orange-300 translate-x-2' 
                : 'text-white hover:text-indigo-200'
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
        
        {/* Divider */}
        <div className="h-px bg-indigo-700 w-full my-2"></div>

        {/* Mobile Auth Buttons */}
        <div className="flex flex-col gap-4 w-full">
             <Link
                to="/login"
                className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold text-center hover:bg-indigo-50 transition shadow-sm"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-orange-400 text-white px-6 py-2.5 rounded-full font-bold text-center hover:bg-orange-500 transition shadow-sm"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
        </div>
      </div>

      {/* --- END MOBILE NAV --- */}

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-8 right-10 z-50 bg-white/90 backdrop-blur-lg rounded-full shadow-lg px-6 py-2 gap-6 items-center font-semibold">
        {['home', 'features', 'creators', 'contact'].map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            onMouseEnter={() => setHoveredSection(section)}
            onMouseLeave={() => setHoveredSection(null)}
            className={navButtonClasses(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      {/* HERO SECTION */}
      <section
        id="home"
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 bg-[radial-gradient(circle_at_60%_40%,_#f3e8ff_0%,_#e0e7ff_60%,_#f8fafc_100%)]"
      >
        <img
          src={bookImg}
          alt="Book"
          className="w-[240px] h-[180px] md:w-[280px] md:h-[210px] mb-6 object-contain animate-[floaty_3s_ease-in-out_infinite]"
        />
        <h1 className="text-4xl md:text-6xl font-extrabold text-purple-800 drop-shadow-lg mb-3">
          Welcome to <span className="text-indigo-500">RataTutor</span> ✨
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-indigo-500 font-cursive mb-4">
          The cutest way to study with friends
        </h2>
        <p className="text-purple-700 max-w-xl font-pixel mb-8">
          AI-powered notes, flashcards, and quizzes — cozy, playful, and powerful 🐹
        </p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-orange-400 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="min-h-screen flex items-center justify-center py-20 px-6 bg-slate-50"
      >
        <div className="flex flex-wrap justify-center items-center gap-12 max-w-6xl w-full">
          <div className="flex-1 min-w-[300px]">
            <img
              src={quizGif}
              alt="Quiz"
              className="w-full max-h-[600px] rounded-2xl border-8 border-white shadow-lg bg-purple-100"
            />
          </div>

          <div className="flex-1 min-w-[300px] flex flex-col gap-6">
            <h2 className="text-3xl font-extrabold text-indigo-600">
              Powerful Features
            </h2>

            {[
              {
                title: '🎯 Smart Quizzes',
                desc: 'AI-generated quizzes that adapt to your learning style and help you master any subject.',
              },
              {
                title: '📚 Interactive Flashcards',
                desc: 'Create and share flashcards with friends. Study together, learn faster.',
              },
              {
                title: '✨ AI-Powered Notes',
                desc: 'Transform your notes into organized study materials with the power of AI.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-purple-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-purple-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATORS */}
      <section
        id="creators"
        className="min-h-screen flex flex-col justify-center items-center py-20 px-6 bg-gradient-to-br from-slate-50 to-indigo-100 text-center"
      >
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-3">
          Meet the Creators
        </h2>
        <p className="text-purple-700 mb-10 max-w-xl">
          The passionate team behind RataTutor
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {[
            {
              name: 'John Smith',
              role: 'Lead Developer',
              emoji: '👨‍💻',
              desc: 'Building the future of learning through code and innovation.',
            },
            {
              name: 'Sarah Johnson',
              role: 'UI/UX Designer',
              emoji: '👩‍🎨',
              desc: 'Designing delightful experiences that make studying fun.',
            },
            {
              name: 'Alex Chen',
              role: 'AI Engineer',
              emoji: '🤖',
              desc: 'Making smart tools that help every student learn better.',
            },
          ].map((person, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-3xl mb-4">
                {person.emoji}
              </div>
              <h3 className="text-xl font-bold text-purple-800">{person.name}</h3>
              <p className="text-indigo-500 font-semibold">{person.role}</p>
              <p className="text-purple-700 text-sm mt-1">{person.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="min-h-screen flex flex-col justify-center items-center bg-indigo-100 text-center py-20 px-6"
      >
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-4">
          Get in Touch
        </h2>
        <p className="text-purple-700 mb-12 max-w-xl">
          We'd love to hear from you! Reach out for questions, feedback, or just to say hi 🐹
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full mb-12">
          {[
            {
              icon: '📧',
              label: 'Email',
              value: 'hello@ratatutor.com',
              link: 'mailto:hello@ratatutor.com',
            },
            {
              icon: '💬',
              label: 'Support',
              value: 'support@ratatutor.com',
              link: 'mailto:support@ratatutor.com',
            },
            { icon: '🌐', label: 'Social', social: true },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="text-lg font-bold text-purple-800 mb-1">
                {item.label}
              </h3>

              {item.social ? (
                <div className="flex gap-4 text-indigo-500 text-xl mt-2">
                  <a href="#" aria-label="Facebook">
                    📘
                  </a>
                  <a href="#" aria-label="Twitter">
                    🐦
                  </a>
                  <a href="#" aria-label="Instagram">
                    📷
                  </a>
                </div>
              ) : (
                <a
                  href={item.link}
                  className="text-indigo-500 font-semibold"
                >
                  {item.value}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-indigo-200 pt-6 w-full max-w-5xl">
          <div className="text-lg font-bold text-indigo-900 mb-2">
            RataTutor — Study Prep Buddy
          </div>
          <div className="text-sm opacity-80">
            © {new Date().getFullYear()} RataTutor. All rights reserved.
          </div>

          <div className="mt-4">
            <a href="/privacy" className="underline mr-4 text-indigo-800">
              Privacy Policy
            </a>
            <a href="/terms" className="underline text-indigo-800">
              Terms of Service
            </a>
          </div>
        </div>
      </section>

      {/* Floating Animation */}
      <style>
        {`
          @keyframes floaty {
            0% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Home;