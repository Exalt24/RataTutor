'use client';

import React, { useState } from 'react';
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
  return (
    <div className="w-fit mx-auto gap-2 flex pb-20 pt-10">
      {items.map((item, i) => (
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`rounded-2xl relative overflow-hidden ${index === i ? 'w-[400px]' : 'w-[60px]'} h-[420px] flex-shrink-0 transition-[width] duration-700 ease-in-out`}
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
                className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-[#B8EECF]/60 via-[#D6F5E3]/30 to-transparent text-black dark:text-white rounded-2xl"
              >
                <motion.h1 variants={article} className="text-2xl font-bold">
                  {item.title}
                </motion.h1>
                <motion.p variants={article} className="text-sm">
                  {item.description}
                </motion.p>
              </motion.article>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default function DevelopersSlide() {
  const [index, setIndex] = useState(0);
  return (
    <div className="relative">
      <h3 className="text-3xl font-bold text-center text-gray-800 exam-heading pt-6 pb-4">
        Meet the Developers
      </h3>
      <DeveloperGallery items={developers} index={index} setIndex={setIndex} />
    </div>
  );
}
