import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContainer,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./LinearDialog";
import { motion } from "framer-motion";
import bookImg from '../assets/book.png';
import gearImg from '../assets/gear.png';

const aboutItems = [
    {
      id: 1,
      title: 'Study Tools',
      image: bookImg,
      theme: {
        gradient: 'from-blue-100 via-blue-200 to-cyan-100 hover:from-blue-200 hover:via-blue-300 hover:to-cyan-200',
        background: 'bg-blue-100 hover:bg-blue-200',
        card: 'bg-blue-200 hover:bg-blue-300',
        text: 'text-blue-900'
      },
      description: [
        'Drop your study materials',
        'Generate AI-powered flashcards',
        'Create concise summaries',
        'AI-generated quiz questions',
      ],
    },
    {
      id: 2,
      title: 'Platform Features',
      image: gearImg,
      theme: {
        gradient: 'from-indigo-100 via-blue-100 to-sky-100 hover:from-indigo-200 hover:via-blue-200 hover:to-sky-200',
        background: 'bg-indigo-100 hover:bg-indigo-200',
        card: 'bg-indigo-200 hover:bg-indigo-300',
        text: 'text-indigo-900'
      },
      description: [
        'Organize study materials',
        'Track learning progress',
        'Responsive design',
        'Download for offline access',
      ],
    },
  ];  

export default function AboutSlideCard() {
  return (
    <div className="flex gap-15 flex-wrap">
      {aboutItems.map((item) => (
        <Dialog
          key={item.id}
          transition={{ type: 'spring', bounce: 0.05, duration: 0.5 }}
        >
          <DialogTrigger
            className={`flex w-40 h-35 flex-col overflow-hidden border 
              rounded-2xl shadow-xl transition-all duration-300 
              bg-gradient-to-br ${item.theme.gradient}
              dark:bg-gray-800 dark:hover:bg-gray-700`}
          >
            <div className="h-20 flex items-center justify-center mt-3">
              <img
                src={item.image}
                alt={item.title}
                className="h-12 w-12 object-contain"
              />
            </div>
            <div className="flex justify-center items-center p-3">
              <h3 className={`text-lg font-semibold ${item.theme.text}`}>
                {item.title}
              </h3>
            </div>
          </DialogTrigger>

          <DialogContainer className="pt-20">
            <DialogContent
              layout
              transition={{ type: 'spring', bounce: 0.05, duration: 0.5 }}
              style={{ borderRadius: '24px' }}
              className={`relative flex mx-auto flex-col overflow-y-auto border w-[80%] lg:w-[900px] 
                ${item.theme.background} dark:bg-black dark:hover:bg-gray-950`}
            >
              <DialogClose />
              <DialogTitle className={`text-4xl mb-6 flex items-center gap-4 ${item.theme.text}`}>
                <img
                  src={item.image}
                  alt={`${item.title} icon`}
                  className="h-10 w-10 object-contain"
                />
                {item.title}
              </DialogTitle>

              <DialogDescription
                disableLayoutAnimation
                variants={{
                  initial: { opacity: 0, scale: 0.8, y: -40 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.8, y: -50 },
                }}
              >
                <motion.div
                  layout
                  className="grid gap-4 w-full grid-cols-2 md:grid-cols-4"
                >
                  {item.description.map((desc, i) => (
                    <div
                      key={i}
                      className={`slide-card p-4 min-h-[80px] rounded-md shadow-sm text-sm text-center flex items-center justify-center
                        ${item.theme.card} text-gray-800`}
                    >
                      {desc}
                    </div>
                  ))}
                </motion.div>
              </DialogDescription>
            </DialogContent>
          </DialogContainer>
        </Dialog>
      ))}
    </div>
  );
}
