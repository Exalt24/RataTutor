// src/components/Hero.jsx
import React, { useEffect, useState } from "react";
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
  const [imgIndex, setImgIndex] = useState(0);
  const [deg, setDeg] = useState(0);
  const [fade, setFade] = useState(false);

  const handleImageClick = () => {
    setDeg((d) => d + 90);
    setImgIndex((i) => (i + 1) % images.length);
    setFade(true);
    setTimeout(() => setFade(false), 300);
  };

  useEffect(() => {
    let last = 0;
    const cooldown = 1000;
    const onWheel = (e) => {
      const now = Date.now();
      if (now - last < cooldown) return;
      const radios = Array.from(
        document.querySelectorAll('input[name="slide"]')
      );
      let idx = radios.findIndex((r) => r.checked);
      idx =
        e.deltaY > 0
          ? (idx + 1) % radios.length
          : (idx - 1 + radios.length) % radios.length;
      radios[idx].checked = true;
      last = now;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
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
                {s.id === 1 ? (
                  <>
                    {/* LEFT IMAGE */}
                    <div className="flex justify-start">
                      <img
                        src={images[imgIndex]}
                        alt=""
                        className="w-20 h-20 rounded-full mb-2 object-cover opacity-40 cursor-pointer"
                        onClick={handleImageClick}
                        style={{
                          transform: `rotate(${deg}deg)`,
                          transition: "transform 0.5s ease",
                        }}
                      />
                    </div>

                    {/* TITLE */}
                    <h2
                      className={
                        "exam-heading transition-opacity duration-300 " +
                        (fade ? "opacity-50" : "opacity-100")
                      }
                    >
                      RataTutor
                    </h2>

                    {/* DESCRIPTION */}
                    <p
                      className={
                        "text-justify transition-opacity duration-300 " +
                        (fade ? "opacity-50" : "opacity-100")
                      }
                    >
                      RataTutor is an AI-powered platform that connects you with
                      experienced tutors for personalized, on-demand learning.
                    </p>

                    {/* ← BRINGING BACK THE BUTTONS */}
                    <div className="hero-actions">
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
                    <div className="flex justify-end">
                      <img
                        src={images[(imgIndex + 1) % images.length]}
                        alt=""
                        className="w-20 h-20 rounded-full mb-2 object-cover cursor-pointer"
                        onClick={handleImageClick}
                        style={{
                          transform: `rotate(${deg}deg)`,
                          transition: "transform 0.5s ease",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  s.centerContent
                )}
              </div>

              <div className="row flex items-center space-x-3">
                <div className="icon">
                  <img
                    src={s.icon || logotemp}
                    alt={`${s.heading} icon`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="description label-text">
                  <h4 className="pt-2 m-0">{s.heading}</h4>
                </div>
              </div>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
