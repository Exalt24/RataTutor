import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  MessageCircle,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";

import logo from "../assets/logotemp.png";
import bookImg from "../assets/note1.png";
import quizGif from "../assets/screenshots/quiz.gif";
import homeBg from "../assets/hero_bg.png";
import bg from "../assets/creator_bg.png";
import catImg from "../assets/cat.png";
import dogImg from "../assets/dog.png";
import frogImg from "../assets/frog.png";
import chickImg from "../assets/chick.png";
import penguinImg from "../assets/penguin.png";
import danielReal from "../assets/daniel.jpg";
import nikkaReal from "../assets/nikka.jpg";
import mcReal from "../assets/mc.png";
import shairaReal from "../assets/shaira.jpg";
import vinceReal from "../assets/vince.jpg";
import "../styles/pages/home.css";

const Home = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [hoveredSection, setHoveredSection] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const gifContainerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = ["home", "features", "creators", "contact"];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lazy load/unload GIF to save memory (87MB file!)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowGif(true);
          } else {
            setShowGif(false); // Unload when off-screen
          }
        });
      },
      { rootMargin: "200px" } // Load slightly before it comes into view
    );

    if (gifContainerRef.current) {
      observer.observe(gifContainerRef.current);
    }

    return () => {
      if (gifContainerRef.current) {
        observer.unobserve(gifContainerRef.current);
      }
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  const navButtonClasses = (section) => {
    const base =
      "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative";
    const active =
      activeSection === section
        ? "bg-[var(--pastel-green)] text-white"
        : "text-[var(--text-dark)]";
    const hover =
      hoveredSection === section && activeSection !== section
        ? "bg-[var(--pastel-green)]/50 -translate-y-0.5"
        : "";
    const color = activeSection === section ? "" : "text-[var(--text-dark)]";
    return `${base} ${active} ${hover} ${color}`;
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-[family-name:var(--font-pixel)] text-[var(--text-dark)]"
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Logo */}
      <div className="fixed top-4 md:top-7 left-4 md:left-9 z-50">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={logo}
            alt="RataTutor logo"
            className="w-16 h-16 md:w-14 md:h-14 rounded-full bg-white/50 border-2 border-[var(--pastel-blue)] shadow-md p-2"
          />
        </Link>
      </div>

      {/* --- START MOBILE NAV (SIDEBAR VERSION) --- */}

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-5 right-5 z-[60] md:hidden p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-[var(--text-dark)] border border-[var(--pastel-blue)] hover:bg-[var(--pastel-cream)] transition-all"
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Backdrop Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-50 bg-color-2 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-6 px-6 gap-6 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Logo Section matching Dashboard */}
        <div className="w-full">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img
              src={logo}
              alt="Logo"
              className="block mx-auto w-20 border-b border-gray-200 pb-1 mb-3"
            />
          </Link>
          <hr className="border-t border-gray-400 mb-4" />
        </div>

        {/* Navigation Links */}
        {["home", "features", "creators", "contact"].map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className={`text-xl font-bold text-left transition-all duration-300 font-[family-name:var(--font-pixel)] ${
              activeSection === section
                ? "text-[var(--pastel-green)] translate-x-2"
                : "text-[var(--text-dark)] hover:text-white"
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}

        {/* Divider */}
        <div className="h-px bg-[var(--pastel-blue)] w-full my-2"></div>

        {/* Mobile Auth Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
            className="exam-button-secondary w-full"
          >
            Login
          </button>
          <button
            onClick={() => {
              navigate("/register");
              setMenuOpen(false);
            }}
            className="exam-button w-full"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* --- END MOBILE NAV --- */}

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-8 right-10 z-50 bg-white/90 backdrop-blur-lg rounded-full shadow-lg px-4 py-2 gap-6 items-center font-semibold border border-[var(--pastel-blue)]">
        {["home", "features", "creators", "contact"].map((section) => (
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
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20"
      >
        <img
          src={bookImg}
          alt="Book"
          className="w-[240px] h-[180px] md:w-[280px] md:h-[210px] mb-6 object-contain animate-[floaty_3s_ease-in-out_infinite]"
        />
        <h1 className="home-heading text-[var(--text-dark)]">
          Welcome to{" "}
          <span className="text-[var(--button-primary)]">RataTutor</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold home-sub mb-4 text-[var(--pastel-purple)]">
          The most engaging way to study with friends
        </h2>
        <div className="text-[var(--text-dark)] max-w-xl mb-10 description leading-relaxed opacity-80">
          AI-powered notes, flashcards, and quizzes — cozy, playful, and
          powerful 🐹
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            data-hover="Login"
            className="exam-button-secondary"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            data-hover="Sign Up"
            className="exam-button"
          >
            Sign Up
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-color-3"
      >
        <h2 className="section-title text-center mb-3">Features</h2>
        <div className="text-[var(--text-dark)] mb-12 max-w-4xl text-center description opacity-80">
          Unlock your full potential with tools designed to make every study
          session efficient across all your devices.
        </div>
        <div className="flex flex-col justify-center items-center gap-12 max-w-6xl w-full">
          <div
            className="w-full max-w-3xl mx-auto rounded-2xl border-8 border-white shadow-lg bg-[var(--pastel-purple)] overflow-hidden"
            ref={gifContainerRef}
            style={{ transform: "translateZ(0)" }}
          >
            {showGif ? (
              <img
                src={quizGif}
                alt="Quiz"
                decoding="async"
                className="w-full h-auto block gpu-accelerated"
              />
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-pixel)] text-lg animate-pulse">
                  Loading visual...
                </span>
              </div>
            )}
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Smart Quizzes",
                desc: "AI-generated quizzes that adapt to your learning style and help you master any subject.",
              },
              {
                title: "Interactive Flashcards",
                desc: "Create and share flashcards with friends. Study together, learn faster.",
              },
              {
                title: "AI-Powered Notes",
                desc: "Transform your notes into organized study materials with the power of AI.",
              },
              {
                title: "AI-Tutor",
                desc: "Let AI tutor you with personalized study plans.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition border border-[var(--pastel-purple)]"
              >
                <h3 className="text-2xl font-bold text-[var(--text-dark)] mb-2 font-[family-name:var(--font-pixel)]">
                  {item.title}
                </h3>
                <p className="text-[var(--text-dark)] leading-relaxed text-base opacity-80">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATORS */}
      <section
        id="creators"
        className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.65)), url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <h2 className="section-title mb-3">Meet the Creators</h2>
        <div className="text-[var(--text-dark)] mb-12 max-w-2xl description opacity-80">
          The passionate team behind RataTutor
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {[
            {
              name: "Daniel Alexis Cruz",
              role: "Lead Developer, Full Stack Developer",
              image: penguinImg,
              realImage: danielReal,
              desc: "Architecting the full-stack ecosystem and engineering the core features that drive the platform.",
            },
            {
              name: "Nikka Joie Mendoza",
              role: "UI/UX Designer, Design Developer",
              image: catImg,
              realImage: nikkaReal,
              desc: "Crafting the visual identity and translating designs into pixel-perfect, responsive components.",
            },
            {
              name: "MC Clareenz Zerrudo",
              role: "Backend Developer",
              image: frogImg,
              realImage: mcReal,
              desc: "Powering the backend with robust APIs and secure database management.",
            },
            {
              name: "Shaira Macale",
              role: "Frontend Developer",
              image: chickImg,
              realImage: shairaReal,
              desc: "Developing robust client-side logic and ensuring seamless integration with backend services.",
            },
            {
              name: "Vince Quinanola",
              role: "Frontend Developer",
              image: dogImg,
              realImage: vinceReal,
              desc: "Engineering efficient state management and logic to handle complex application interactions.",
            },
          ].map((person, i) => (
            <div
              key={i}
              className="bg-white/90 p-8 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center border border-[var(--pastel-purple)]"
            >
              <div className="w-24 h-24 mb-4 flip-card cursor-pointer">
                <div className="flip-card-inner">
                  {/* Front Side (Animal) */}
                  <div className="flip-card-front rounded-full bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--pastel-purple)] flex items-center justify-center p-2 shadow-inner">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  </div>
                  {/* Back Side (Real Photo) */}
                  <div className="flip-card-back rounded-full overflow-hidden border-2 border-[var(--pastel-purple)] bg-white">
                    <img
                      src={person.realImage}
                      alt={`${person.name} real`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-dark)] font-[family-name:var(--font-pixel)]">
                {person.name}
              </h3>
              <p className="text-[var(--pastel-blue-active)] font-semibold font-[family-name:var(--font-pixel)] text-lg">
                {person.role}
              </p>
              <p className="text-[var(--text-dark)] mt-2 text-sm opacity-80 leading-relaxed">
                {person.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="min-h-screen flex flex-col justify-center items-center bg-color-4 text-center py-20 px-6"
      >
        <h2 className="section-title mb-3">Get in Touch</h2>
        <div className="text-[var(--text-dark)] mb-12 max-w-2xl description opacity-80">
          We'd love to hear from you! Reach out for questions, feedback, or just
          to say hi 🐹
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-12">
          {/* Main Block - Email (Tall on Desktop) */}
          <div className="md:row-span-2 bg-white/60 backdrop-blur-sm p-10 rounded-3xl border border-[var(--pastel-yellow)] shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center text-center gap-6 group">
            <div className="w-24 h-24 bg-[var(--pastel-green)]/20 rounded-full flex items-center justify-center text-[var(--text-dark)] group-hover:scale-110 transition-transform duration-300">
              <Mail size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-dark)] font-[family-name:var(--font-pixel)] mb-2">
                Say Hello
              </h3>
              <p className="text-[var(--text-dark)]/70 mb-4 font-['Poppins']">
                Have a question or just want to chat? We'd love to hear from
                you!
              </p>
              <a
                href="mailto:asterius069@gmail.com"
                className="exam-button inline-block text-lg"
                data-hover="Submit"
              >
                dcruz@up.edu.ph
              </a>
            </div>
          </div>

          {/* Top Right - Support */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-[var(--pastel-pink)] shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3 group">
            <div className="text-[var(--text-dark)] mb-1 group-hover:-translate-y-1 transition-transform">
              <MessageCircle size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-dark)] font-[family-name:var(--font-pixel)]">
              Need Help?
            </h3>
            <a
              href="mailto:support@ratatutor.com"
              className="text-[var(--pastel-blue-active)] font-semibold hover:underline font-['Poppins']"
            >
              dcruz@up.edu.ph
            </a>
          </div>

          {/* Bottom Right - Socials */}
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-[var(--pastel-purple)] shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3 group">
            <div className="text-[var(--text-dark)] mb-1 group-hover:rotate-12 transition-transform">
              <Globe size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-dark)] font-[family-name:var(--font-pixel)]">
              Lets Connect
            </h3>
            <div className="flex gap-6 text-[var(--pastel-blue-active)] mt-1">
              <a
                href="https://www.linkedin.com/in/dacruz24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:scale-125 transition-transform hover:text-[var(--pastel-purple)]"
              >
                <Linkedin size={28} />
              </a>
              <a
                href="https://www.facebook.com/theonewhogaveuponhumanity"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:scale-125 transition-transform hover:text-[var(--pastel-purple)]"
              >
                <Facebook size={28} />
              </a>
              <a
                href="https://www.instagram.com/dankiel_cruz/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:scale-125 transition-transform hover:text-[var(--pastel-purple)]"
              >
                <Instagram size={28} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--text-dark)]/20 pt-6 w-full max-w-5xl">
          <div className="text-lg font-bold text-[var(--text-dark)] mb-2 font-[family-name:var(--font-pixel)]">
            RataTutor — Study Prep Buddy
          </div>
          <div className="text-sm text-[var(--text-dark)] opacity-80 font-[family-name:var(--font-pixel)]">
            © {new Date().getFullYear()} RataTutor. All rights reserved.
          </div>

          <div className="mt-4 font-[family-name:var(--font-pixel)]">
            <a
              href="/privacy"
              className="underline mr-4 text-[var(--text-dark)] hover:text-[var(--pastel-blue-active)]"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="underline text-[var(--text-dark)] hover:text-[var(--pastel-blue-active)]"
            >
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
