import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import r1 from '../assets/r1.png'
import r2 from '../assets/r2.png'
import r3 from '../assets/r3.png'
import r4 from '../assets/r4.png'
import '../styles/home.css'

const dishesData = [
  {
    id: 1,
    name: "Ratatouille",
    description: "A classic French Provençal dish of stewed vegetables",
    image: r1,
    bgColor: "bg-color-1"
  },
  {
    id: 2,
    name: "Cheese Soufflé",
    description: "Light and airy French cheese soufflé",
    image: r2,
    bgColor: "bg-color-2"
  },
  {
    id: 3,
    name: "French Bread",
    description: "Freshly baked artisanal French bread",
    image: r3,
    bgColor: "bg-color-3"
  },
  {
    id: 4,
    name: "Beef Bourguignon",
    description: "Traditional French beef stew with red wine",
    image: r4,
    bgColor: "bg-color-4"
  }
]

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0)
  const [currentDish, setCurrentDish] = useState(0)
  const containerRef = useRef(null)

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY
    const newSection = delta > 0 
      ? Math.min(currentSection + 1, 3)
      : Math.max(currentSection - 1, 0)
    setCurrentSection(newSection)
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [currentSection])

  const handleDishChange = (index) => {
    if (index === currentDish) return;
    
    setCurrentDish(index);
    const content = document.querySelector('.hero-content');
    content.classList.add('fade-in');
    
    setTimeout(() => {
      content.classList.remove('fade-in');
    }, 500);
  }

  const getImagePosition = (index) => {
    const positions = ['position-1', 'position-2', 'position-3', 'position-4']
    const offset = (index - currentDish + 4) % 4
    return positions[offset]
  }

  return (
    <div className="exam-container" ref={containerRef}>
      <div 
        className="horizontal-scroll"
        style={{ transform: `translateX(-${currentSection * 100}vw)` }}
      >
        {/* Hero Section */}
        <section className={`section hero-section ${dishesData[currentDish].bgColor}`}>
          <div className="wheel-container">
            <div className="image-wheel">
              {dishesData.map((dish, index) => (
                <img
                  key={dish.id}
                  src={dish.image}
                  alt={dish.name}
                  className={`wheel-image ${getImagePosition(index)} ${currentDish === index ? 'active' : ''}`}
                  onClick={() => handleDishChange(index)}
                />
              ))}
            </div>
          </div>
          <div className="hero-content">
            <h1 className="exam-heading">{dishesData[currentDish].name}</h1>
            <p className="exam-subheading">{dishesData[currentDish].description}</p>
            <Link to="/login" className="exam-button" data-hover="Login Now!">
              Start Cooking
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-color-2">
          <div className="exam-card text-center">
            <h2 className="exam-heading">Master French Cuisine</h2>
            <div className="flex gap-4 justify-center">
              <div className="exam-card">
                <h3>Cooking Techniques</h3>
                <p>Learn from the best</p>
              </div>
              <div className="exam-card">
                <h3>Recipe Collection</h3>
                <p>Authentic French recipes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="section bg-color-3">
          <div className="exam-card">
            <h2 className="exam-heading">Your Culinary Journey</h2>
            <div className="flex gap-4">
              <div className="exam-card">
                <h3>50+</h3>
                <p>French Recipes</p>
              </div>
              <div className="exam-card">
                <h3>1000+</h3>
                <p>Happy Cooks</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="section bg-color-4">
          <div className="hero-content">
            <h2 className="exam-heading">Ready to Cook?</h2>
            <p className="exam-subheading">Join our culinary community</p>
            <Link to="/register" className="exam-button" data-hover="Register Now!">
              Get Started
            </Link>
          </div>
        </section>
      </div>

      {/* Navigation Dots */}
      <div className="nav-dots">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`nav-dot ${currentSection === index ? 'active' : ''}`}
            onClick={() => setCurrentSection(index)}
          />
        ))}
      </div>
    </div>
  )
}
