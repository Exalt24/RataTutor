// src/components/Hero.jsx
import React, { useEffect, useState, useCallback } from "react";
import "../styles/components/hero.css";
import { Link } from "react-router-dom";
import logotemp from "../assets/logotemp.png";
import r1 from "../assets/phone.png";
import r2 from "../assets/book2.png";
import r3 from "../assets/eraser.png";
import r4 from "../assets/laptop.png";
import r5 from "../assets/tablet.png";
import r6 from "../assets/pen.png";
import AboutSlideCard from "./AboutSlideCard";
import FeaturesSlideCard from "./FeaturesSlideCard";
import DevelopersSlideCard from "./DevelopersSlideCard";

const developers = [
  { name: "Daniel Alexis Cruz", img: r1 },
  { name: "Nikka Joie Mendoza", img: r2 },
  { name: "Mc Clareenz Zerrudo", img: r3 },
  { name: "Shaira Joy Macale", img: r4 },
  { name: "Vince Quinanola", img: r5 },
];

const slides = [
  { id: 1, cardClass: "card--1", heading: "Home" },
  {
    id: 2,
    cardClass: "card--2",
    icon: r2,
    heading: "About",
  },
  {
    id: 3,
    cardClass: "card--3",
    icon: r3,
    heading: "Features",
  },
  {
    id: 4,
    cardClass: "card--4",
    icon: r4,
    heading: "Developers",
  },
];

export default function Hero() {
  const topImages = [r1, r2, r3, r4, r5, r6];
  const bottomImages = [r1, r2, r3, r4, r5, r6];
  const bgColor = [
    "linear-gradient(90deg, #6FA9FF 0%, #EBF3FF 100%)",  // blue
    "linear-gradient(90deg, #FF90A8 0%, #FFF0F3 100%)",  // pink
    "linear-gradient(90deg, #C39AEA 0%, #F5EEFF 100%)",  // violet
    "linear-gradient(90deg, #FFC97B 0%, #FFF4E0 100%)",  // peach
    "linear-gradient(90deg, #90C9FF 0%, #F0F8FF 100%)",  // sky blue
    "linear-gradient(90deg, #A2E4C3 0%, #E8FFF5 100%)"   // mint green
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
            <input type="radio" name="slide" id={`c${s.id}`} defaultChecked={i === 0} />
            <label
              htmlFor={`c${s.id}`}
              className={`card ${s.cardClass}`}
              style={s.id === 1 ? { background: bgColor[bgIndex], transition: "background 0.5s ease" } : {}}
            >
              {/* LEFT IMAGE */}
              {s.id === 1 && topImages.map((img, index) => (
                <div key={index} className="fixed top-[-100px] left-[-20px] z-0"
                  style={{
                    opacity: currentImageIndex === index || prevImageIndex === index ? 1 : 0,
                    pointerEvents: currentImageIndex === index ? 'auto' : 'none'
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    className={`w-[550px] h-[550px]
                      ${currentImageIndex === index && isAnimating ? 'swipe-in-top' : ''}
                      ${prevImageIndex === index && isAnimating ? 'swipe-out-top' : ''}`}
                    style={{ backfaceVisibility: 'hidden', opacity: 0.25, }}
                  />
                </div>
              ))}

              <div className="hero-center" style={{ background: "none" }}>
                {(s.id === 1 || s.id === 2 || s.id === 3 || s.id === 4) ? (
                  <div className="flex items-center justify-start min-h-screen relative">
                    <div className="hero-content max-w-xl" style={{ position: "relative", zIndex: 20 }}>
                      {s.id === 1 && (
                        <>
                          <h2 className="exam-heading text-left">RataTutor</h2>
                          <p className="text-left mb-6 text-gray-700">
                            RataTutor is an AI-powered platform that connects you
                            with experienced tutors for personalized, on-demand
                            learning.
                          </p>
                          <div className="hero-actions flex justify-start gap-4">
                            <Link to="/login" data-hover="Login" className="exam-button-mini">Login</Link>
                            <Link to="/register" data-hover="Signup" className="exam-button-mini">Sign up</Link>
                          </div>

                          {bottomImages.map((img, index) => (
                            <div key={index} className="absolute"
                              style={{
                                right: '-250px', bottom: '-100px', zIndex: 1,
                                opacity: currentImageIndex === index || prevImageIndex === index ? 1 : 0,
                                pointerEvents: currentImageIndex === index ? 'auto' : 'none'
                              }}
                            >
                              <img
                                src={img}
                                alt="flipped image"
                                className={`w-[200px] h-[200px] transform -scale-x-100
                                  ${currentImageIndex === index && isAnimating ? 'swipe-in' : ''}
                                  ${prevImageIndex === index && isAnimating ? 'swipe-out' : ''}`}
                                style={{ backfaceVisibility: 'hidden' }}
                              />
                            </div>
                          ))}
                        </>
                      )}

                      {s.id === 2 && (
                        <div className="w-full">
                          <h2 className="exam-heading text-left mb-6">About RataTutor</h2>
                          <p className="text-left text-gray-700 mb-6">
                          RataTutor is your AI-powered study companion, designed to streamline the way you learn. Below are the key tools and features that make studying more effective and personalized.
                          </p>
                          <AboutSlideCard />
                        </div>
                      )}

                      {s.id === 3 && (
                        <div className="w-full">
                          <h2 className="exam-heading text-left mb-6">Features Galore</h2>
                          <FeaturesSlideCard />
                        </div>
                      )}

                      {s.id === 4 && (
                        <div className="w-full">
                          <h2 className="exam-heading text-left mb-6">Developers</h2>
                          <DevelopersSlideCard />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (s.centerContent)}
              </div>

              <div className="row flex items-center space-x-3" style={{ position: "relative", zIndex: 20 }}>
                <div className={`icon ${s.id === 1 && fade ? "image-clicked" : ""}`}>
                  <img
                    src={s.icon || logotemp}
                    alt={`${s.heading} icon`}
                    className={`w-full h-full object-cover inline-block rounded-full ${s.id === 1 && fade ? "image-clicked" : ""}`}
                  />
                </div>
                <div className="description label-text mb-2 object-cover opacity-40 cursor-pointer" onClick={handleImageClick}>
                  <h4 className={`pt-2 m-0 text-glow ${s.id === 1 && fade ? "image-clicked" : ""}`}>
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
