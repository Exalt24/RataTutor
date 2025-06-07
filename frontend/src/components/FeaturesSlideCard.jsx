import React from 'react';
import {
  Accordion,
  AccordionContainer,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionWrapper,
} from './Accordion';

export default function FeaturesSlideCard() {
  return (
    <div className="max-h-[80vh] scrollbar-hide px-2 sm:px-4">
      <AccordionContainer className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 w-full">
        <AccordionWrapper className="text-xs sm:text-sm">
          <Accordion defaultValue={'item-1'}>
            <AccordionItem value="item-1">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Auto Note Conversion
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Upload your study materials (PDF, DOCX, PPTX, TXT) and instantly get AI-curated flashcards, summaries, and quiz questions.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Smart Focus Mode
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Zero in on weak areas using adaptive review sessions tailored to your quiz performance.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Multi-Format Uploads
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Seamlessly drop in class notes, slides, or readings—RataTutor handles all the formats with ease.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Memory Boost Quizzes
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Challenge yourself with smartly spaced repetition quizzes to improve long-term retention.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </AccordionWrapper>
  
        <AccordionWrapper className="text-xs sm:text-sm">
          <Accordion defaultValue={'item-5'}>
            <AccordionItem value="item-5">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Progress Dashboard
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Visualize your mastery over subjects with dynamic progress tracking and topic breakdowns.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Cross-Device Sync
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Pick up right where you left off—your study data is synced across all your devices.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Custom Themes
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Switch between light, dark, or focus themes to create your perfect study vibe.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionHeader className="text-sm sm:text-base font-semibold">
                Modular Learning Blocks
              </AccordionHeader>
              <AccordionPanel className="text-[12px] sm:text-sm leading-snug">
                Build your own learning paths by bookmarking AI-generated materials into custom collections.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </AccordionWrapper>
      </AccordionContainer>
    </div>
  );  
}
