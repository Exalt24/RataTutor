// src/components/Hero.jsx
'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useScroll } from 'framer-motion';
import r2 from "../assets/book2.png";
import r3 from "../assets/eraser.png";
import r4 from "../assets/laptop.png";
import logotemp from "../assets/logotemp.png";
import r6 from "../assets/pen.png";
import r1 from "../assets/phone.png";
import r5 from "../assets/tablet.png";
import "../styles/components/hero.css";
import DevelopersSlideCard from "./DevelopersSlideCard";
import FeaturesSlideCard from "./FeaturesSlideCard";
import { isLoggedIn } from "../services/authService";

const developers = [
  { name: "Daniel Alexis Cruz", img: r1 },
  { name: "Nikka Joie Mendoza", img: r2 },
  { name: "Mc Clareenz Zerrudo", img: r3 },
  { name: "Shaira Joy Macale", img: r4 },
  { name: "Vince Quinanola", img: r5 },
];

const slides = [
  { id: 1, cardClass: "card--1", heading: "Home" },
  { id: 2, cardClass: "card--2", icon: r2, heading: "About" },
  { id: 3, cardClass: "card--3", icon: r3, heading: "Features" },
  { id: 4, cardClass: "card--4", icon: r4, heading: "Developers" },
];

export default function Hero() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const topImages = [r1, r2, r3, r4, r5, r6];
  const bottomImages = [r1, r2, r3, r4, r5, r6];
  const bgColor = [
    "linear-gradient(90deg, #6FA9FF 0%, #EBF3FF 100%)",
    "linear-gradient(90deg, #FF90A8 0%, #FFF0F3 100%)",
    "linear-gradient(90deg, #C39AEA 0%, #F5EEFF 100%)",
    "linear-gradient(90deg, #FFC97B 0%, #FFF4E0 100%)",
    "linear-gradient(90deg, #90C9FF 0%, #F0F8FF 100%)",
    "linear-gradient(90deg, #A2E4C3 0%, #E8FFF5 100%)"
  ];
  const [imgIndex, setImgIndex] = useState(0);
  const [deg, setDeg] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fade, setFade] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(null);
  const [activeCard, setActiveCard] = useState(1);
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Track login status

  // Check login status on component mount and whenever localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      setUserLoggedIn(isLoggedIn());
    };
    
    checkLoginStatus();
    
    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleCardClick = (cardId) => {
    setActiveCard(cardId);
    setFade(false);
    setTimeout(() => setFade(true), 50);
  };

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
    setTimeout(() => { setIsAnimating(false); setPrevImageIndex(null); }, 1500);
  }, [currentImageIndex, isAnimating, bottomImages.length]);

  useEffect(() => {
    let last = 0;
    const onWheel = (e) => {
      const now = Date.now();
      if (now - last < 1000) return;
      last = now;
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
              onChange={() => handleCardClick(s.id)}
            />
            <label
              htmlFor={`c${s.id}`}
              className={`card ${s.cardClass} ${s.id === 1 ? "" : "relative z-10"}`}
              style={s.id === 1 ? { background: bgColor[bgIndex] } : {}}
            >

              {/* LEFT IMAGE */}
              {s.id === 1 && activeCard === 1 && topImages.map((img, index) => {
                const visible = currentImageIndex === index || prevImageIndex === index;
                return (
                  <div
                    key={index}
                    className={`
                      fixed z-0 transition-all duration-300
                      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
                      top-[-20px] left-[-20px] sm:top-[10px] sm:left-[10px]
                      md:top-[5px] md:left-[5px]
                    `}
                  >
                    <img
                      src={img}
                      alt=""
                      className={`
                        opacity-25
                        backface-hidden
                        w-[150px] h-[150px]
                        sm:w-[200px] sm:h-[200px]
                        md:w-[250px] md:h-[250px]
                        lg:w-[400px] lg:h-[400px]
                        ${currentImageIndex === index && isAnimating ? 'swipe-in-top' : ''}
                        ${prevImageIndex === index && isAnimating ? 'swipe-out-top' : ''}
                      `}
                    />
                  </div>
                );
              })}

              <div className="hero-center">
                {(s.id === 1 || s.id === 2 || s.id === 3 || s.id === 4) ? (
                  <div className="flex items-center justify-start min-h-screen relative">
                    <div className="hero-content max-w-xl" style={{ position: "relative" }}>
                      {s.id === 1 && (
                        <>
                          <h2 className="exam-heading text-left text-2xl sm:text-xl md:text-4xl mb-2 sm:mb-4">RataTutor</h2>
                          <p className="text-left text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
                            RataTutor is an AI-powered platform that connects you
                            with experienced tutors for personalized, on-demand
                            learning.
                          </p>
                          <div className="hero-actions flex justify-start gap-4">
                            <Link to="/login" data-hover="Login" className="exam-button-mini">Login</Link>
                            <Link to="/register" data-hover="Signup" className="exam-button-mini">Sign up</Link>
                          </div>

                          {bottomImages.map((img, index) => {
                            const isVisible = currentImageIndex === index || prevImageIndex === index;
                            const isActive = currentImageIndex === index;
                            const isExiting = prevImageIndex === index;

                            return (
                              <div
                                key={index}
                                className={`
                                  absolute z-[1] transition-opacity duration-300
                                  ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
                                  bottom-[-4] right-2 sm:bottom-[-6] sm:right-1 md:bottom-[-5] md:right-2
                                `}
                              >
                                <img
                                  src={img}
                                  alt="flipped image"
                                  className={`
                                    transform -scale-x-100 opacity-25
                                    w-[70px] h-[70px]
                                    sm:w-[100px] sm:h-[100px]
                                    md:w-[120px] md:h-[120px]
                                    lg:w-[150px] lg:h-[150px]
                                    ${isActive ? "swipe-in" : ""}
                                    ${isExiting ? "swipe-out" : ""}
                                  `}
                                />
                              </div>
                            );
                          })}

                        </>
                      )}

                      {s.id === 2 && (
                        <div className="w-full px-4 sm:px-6 md:px-10">
                          <h2 className="exam-heading text-left mb-4 text-xl sm:text-2xl md:text-3xl">
                            About RataTutor
                          </h2>
                          <p className="text-left text-gray-700 mb-6 text-base sm:text-lg leading-relaxed">
                            RataTutor is your AI-powered study companion, designed to streamline the way you learn. Below are the key tools and features that make studying more effective and personalized.
                          </p>
                        </div>
                      )}

                      {s.id === 3 && (
                        <div className="relative w-full h-full px-4 sm:px-6 md:px-10 overflow-hidden flex flex-col">
                          <h2 className="exam-heading text-left text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 shrink-0">
                            Features Galore
                          </h2>
                          <div className="flex-1 overflow-y-auto pr-1 relative z-0">
                            <FeaturesSlideCard />
                          </div>
                        </div>
                      )}

                      {s.id === 4 && (
                        <div className="w-full">
                          <DevelopersSlideCard />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (s.centerContent)}
              </div>

              <div
                className={`row flex items-center space-x-3 mt-6 sm:mt-8 ${
                  s.id === 1 ? "sm:relative sm:bottom-0 sm:left-0 sm:translate-x-0" : ""
                }`}
                style={{ zIndex: 20 }}
              >
                <div className={`icon ${s.id === 1 && fade ? "image-clicked" : ""} w-8 h-8 sm:w-12 sm:h-12`}>
                  <img
                    src={s.icon || logotemp}
                    alt={`${s.heading} icon`}
                    className={`w-full h-full object-cover inline-block rounded-full ${
                      s.id === 1 && fade ? "image-clicked" : ""
                    }`}
                  />
                </div>

                <div
                  className="description label-text mb-2 object-cover opacity-40 cursor-pointer text-xs sm:text-sm"
                  onClick={handleImageClick}
                >
                  <h4
                    className={`pt-2 m-0 text-glow ${
                      s.id === 1 && fade ? "image-clicked" : ""
                    } ${s.id === 1 ? "flex items-center" : ""}`}
                  >
                    {s.heading}
                    {s.id === 1 && (
                      <div className="click-me-arrow px-2 sm:px-4">
                        <div className="arrow"></div>
                        <span className="arrow-text">Click me!</span>
                      </div>
                    )}
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