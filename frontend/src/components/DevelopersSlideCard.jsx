'use client';

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import r1 from '../assets/frog.png';
import r2 from '../assets/chick.png';
import r3 from '../assets/dog.png';
import r4 from '../assets/cat.png';
import r5 from '../assets/penguin.png';

const developers = [
  { title: 'Daniel Alexis Cruz', description: 'Full Stack Developer', url: r1 },
  { title: 'Nikka Joie Mendoza', description: 'Frontend Developer', url: r2 },
  { title: 'Mc Clareenz Zerrudo', description: 'Backend Developer', url: r3 },
  { title: 'Shaira Joy Macale', description: 'UI/UX Designer', url: r4 },
  { title: 'Vince Quinanola', description: 'Frontend Developer', url: r5 },
];

const article = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

function DeveloperGallery({ items, setIndex, index }) {
  const containerRef = useRef();

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -50 && index < items.length - 1) {
      setIndex(index + 1);
    } else if (info.offset.x > 50 && index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full flex gap-2 px-4 sm:px-0 pb-20 pt-10 justify-center overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      {items.map((item, i) => (
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`
            rounded-2xl relative overflow-hidden 
            ${index === i 
              ? 'w-[65vw] sm:w-[400px]' 
              : 'w-[12vw] sm:w-[60px]'}
            h-[300px] sm:h-[420px]
            flex-shrink-0 transition-[width] duration-700 ease-in-out`}
          key={i}
          onClick={() => setIndex(i)}
          onMouseEnter={() => setIndex(i)}
        >
          <motion.img
            src={item.url}
            alt={item.title}
            className={`w-full h-full object-cover rounded-2xl ${index === i ? 'cursor-default' : 'cursor-pointer'}`}
          />
          <AnimatePresence mode="wait">
            {index === i && (
              <motion.article
                variants={article}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end bg-gradient-to-t from-[#B8EECF]/60 via-[#D6F5E3]/30 to-transparent text-black rounded-2xl"
              >
                <motion.h1 variants={article} className="text-[14px] sm:text-[18px] md:text-[20px] font-bold">
                  {item.title}
                </motion.h1>
                <motion.p variants={article} className="text-[14px] sm:text-[18px] md:text-[20px]">
                  {item.description}
                </motion.p>
              </motion.article>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function DevelopersSlide() {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <h4 className="text-[12px] sm:text-[14px] md:text-[16px] font-bold text-center text-gray-800 exam-heading pt-6 pb-4 px-4">
        Meet the Developers
      </h4>
      <DeveloperGallery items={developers} index={index} setIndex={setIndex} />
    </div>
  );
}
