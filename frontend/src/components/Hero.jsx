// src/components/Hero.jsx
import React, { useEffect, useState, useCallback } from "react";
import "../styles/components/hero.css";
import { Link } from "react-router-dom";
import logotemp from "../assets/logotemp.png";
import r1 from "../assets/r1.png";
import r2 from "../assets/r2.png";
import r3 from "../assets/r3.png";
import r4 from "../assets/r4.png";

const developers = [
  { name: "Daniel Alexis Cruz", img: r1 },
  { name: "Nikka Joie Mendoza", img: r2 },
  { name: "Mc Clareenz Zerrudo", img: r3 },
  { name: "Shaira Joy Macale", img: r4 },
  { name: "Vince Quinanola", img: r4 },
];

const slides = [
  {
    id: 1,
    cardClass: "card--1",
    heading: "Home",
    // slide 1 content is rendered inline below
  },
  {
    id: 2,
    cardClass: "card--2",
    icon: r2,
    heading: "About",
    centerContent: (
      <>
        <h2 className="exam-heading">About RataTutor</h2>
        <p className="about-text text-justify">
          RataTutor is an AI-powered platform that connects you with experienced
          tutors for personalized, on-demand learning...
        </p>
      </>
    ),
  },
  {
    id: 3,
    cardClass: "card--3",
    icon: r3,
    heading: "Features",
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
  },
  {
    id: 4,
    cardClass: "card--4",
    icon: r4,
    heading: "Developers",
    centerContent: (
      <>
        <h2 className="exam-heading">Developers</h2>
        <div className="developer-card-container grid grid-cols-2 sm:grid-cols-4 gap-4">
          {developers.map((dev) => (
            <div
              key={dev.name}
              className="developer-card flex flex-col items-center"
            >
              <img
                src={dev.img}
                alt={dev.name}
                className="w-20 h-20 rounded-full mb-2 object-cover"
              />
              <p className="font-semibold text-center">{dev.name}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

export default function Hero() {
  // images to cycle through
  const images = [r1, r2, r3, r4, logotemp];
  const topImages = [r1, r2, r3, r4, logotemp];
  const bottomImages = [r1, r2, r3, r4, logotemp];
  const bgColor = [
    "linear-gradient(90deg, #B5CCFF 0%, #EBF3FF 100%)",
    "linear-gradient(90deg, #FFD1DB 0%, #FFF0F3 100%)",
    "linear-gradient(90deg, #E6D6FA 0%, #F5EEFF 100%)",
    "linear-gradient(90deg, #FFE4B8 0%, #FFF4E0 100%)",
    "linear-gradient(90deg, #C1DDFF 0%, #F0F8FF 100%)"
  ];

  const [imgIndex, setImgIndex] = useState(0);
  const [deg, setDeg] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fade, setFade] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(null);

  const handleImageClick = useCallback(() => {
    if (isAnimating) return;
    
    const nextIndex = (currentImageIndex + 1) % bottomImages.length;
    setPrevImageIndex(currentImageIndex);
    setCurrentImageIndex(nextIndex);
    setImgIndex(nextIndex);
    setBgIndex(nextIndex);
    setDeg((d) => d + 90);
    setFade(true);
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
      setPrevImageIndex(null);
    }, 1500);
  }, [currentImageIndex, isAnimating, bottomImages.length]);
  
  
  useEffect(() => {
    let last = 0;
    const cooldown = 1000;

    const onWheel = (e) => {
      const now = Date.now();
      if (now - last < cooldown) return;
      last = now;

      // Just trigger the same rotation animation as clicking
      handleImageClick();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [handleImageClick]);

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
            <label
              htmlFor={`c${s.id}`}
              className={`card ${s.cardClass}`}
              style={
                s.id === 1
                  ? {
                      background: bgColor[bgIndex],
                      transition: "background 0.5s ease",
                    }
                  : {}
              }
            >
              {/* LEFT IMAGE  */}
              {s.id === 1 && topImages.map((img, index) => (
                <div
                  key={index}
                  className="fixed top-[-100px] left-[-20px] z-0"
                  style={{
                    opacity: currentImageIndex === index || prevImageIndex === index ? 1 : 0,
                    pointerEvents: currentImageIndex === index ? 'auto' : 'none'
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    className={`
                      w-[550px] h-[550px] rounded-full object-cover opacity-20
                      ${currentImageIndex === index && isAnimating ? 'swipe-in-top' : ''}
                      ${prevImageIndex === index && isAnimating ? 'swipe-out-top' : ''}
                    `}
                    style={{
                      backfaceVisibility: 'hidden',
                      opacity: 0.2
                    }}
                  />
                </div>
              ))}

              <div className="hero-center" style={{ background: "none" }}>
                {s.id === 1 ? (
                  <div className="flex items-center justify-start min-h-screen relative">
                    <div
                      style={{ position: "relative", zIndex: 20 }}
                      className="hero-content max-w-xl"
                    >
                      {/* TITLE */}
                      <h2 className="exam-heading text-left">RataTutor</h2>
                      {/* DESCRIPTION */}
                      <p className="text-left mb-6">
                        RataTutor is an AI-powered platform that connects you
                        with experienced tutors for personalized, on-demand
                        learning.
                      </p>
                      {/* BUTTONS */}
                      <div className="hero-actions flex justify-start gap-4">
                        <Link
                          to="/login"
                          data-hover="Login"
                          className="exam-button-mini"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          data-hover="Signup"
                          className="exam-button-mini"
                        >
                          Sign up
                        </Link>
                      </div>

                      {/* RIGHT IMAGE */}
                      {bottomImages.map((img, index) => (
                        <div
                          key={index}
                          className="absolute"
                          style={{
                            right: '-250px',
                            bottom: '-100px',
                            zIndex: 1,
                            opacity: currentImageIndex === index || prevImageIndex === index ? 1 : 0,
                            pointerEvents: currentImageIndex === index ? 'auto' : 'none'
                          }}
                        >
                          <img
                            src={img}
                            alt=""
                            className={`
                              w-[100px] h-[100px] rounded-full object-cover
                              ${currentImageIndex === index && isAnimating ? 'swipe-in' : ''}
                              ${prevImageIndex === index && isAnimating ? 'swipe-out' : ''}
                            `}
                            style={{
                              backfaceVisibility: 'hidden'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  s.centerContent
                )}
              </div>

              <div
                className="row flex items-center space-x-3"
                style={{ position: "relative", zIndex: 20 }}
              >
                <div className={`icon ${s.id === 1 && fade ? "image-clicked" : ""}`}>
                  <img
                    src={s.icon || logotemp}
                    alt={`${s.heading} icon`}
                    className={`w-full h-full object-cover inline-block rounded-full ${
                      s.id === 1 && fade ? "image-clicked" : ""
                    }`}
                  />
                </div>
                <div
                  className="description label-text mb-2 object-cover opacity-40 cursor-pointer"
                  onClick={handleImageClick}
                >
                  <h4
                    className={`pt-2 m-0 text-glow ${
                      s.id === 1 && fade ? "image-clicked" : ""
                    }`}
                  >
                    {s.heading}
                  </h4>
                </div>
              </div>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
