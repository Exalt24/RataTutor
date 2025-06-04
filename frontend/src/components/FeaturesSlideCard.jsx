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
    <AccordionContainer className="grid-cols-1 md:grid-cols-2">
      <AccordionWrapper>
        <Accordion defaultValue={'item-1'}>
          <AccordionItem value="item-1">
            <AccordionHeader>Auto Note Conversion</AccordionHeader>
            <AccordionPanel>
              Upload your study materials (PDF, DOCX, PPTX, TXT) and instantly get AI-curated flashcards, summaries, and quiz questions.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionHeader>Smart Focus Mode</AccordionHeader>
            <AccordionPanel>
              Zero in on weak areas using adaptive review sessions tailored to your quiz performance.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionHeader>Multi-Format Uploads</AccordionHeader>
            <AccordionPanel>
              Seamlessly drop in class notes, slides, or readings—RataTutor handles all the formats with ease.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionHeader>Memory Boost Quizzes</AccordionHeader>
            <AccordionPanel>
              Challenge yourself with smartly spaced repetition quizzes to improve long-term retention.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </AccordionWrapper>

      <AccordionWrapper>
        <Accordion defaultValue={'item-5'}>
          <AccordionItem value="item-5">
            <AccordionHeader>Progress Dashboard</AccordionHeader>
            <AccordionPanel>
              Visualize your mastery over subjects with dynamic progress tracking and topic breakdowns.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionHeader>Cross-Device Sync</AccordionHeader>
            <AccordionPanel>
              Pick up right where you left off—your study data is synced across all your devices.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionHeader>Custom Themes</AccordionHeader>
            <AccordionPanel>
              Switch between light, dark, or focus themes to create your perfect study vibe.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionHeader>Modular Learning Blocks</AccordionHeader>
            <AccordionPanel>
              Build your own learning paths by bookmarking AI-generated materials into custom collections.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </AccordionWrapper>
    </AccordionContainer>
  );
}
