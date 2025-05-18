import React from 'react'
import { FilePlus, Mic, FileText, Edit2 } from 'lucide-react'

const HomeScreen = ({ selectedFile, handleFileChange, uploadAndGenerate, generated }) => (
  <div className="space-y-4">
    <h1 className="exam-greeting text-end sm:text-xl px-6">Welcome, Nikka!</h1>
    <section>
      <h2 className="exam-subheading sm:text-sm ">Create</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
        {[
          { icon: <FilePlus size={20} />, title: 'Upload a PDF, PPT, Video, or Audio', desc: 'Get flashcards, summaries & quiz questions instantly.' },
          { icon: <Mic size={20} />, title: 'Create from live recording', desc: 'Start a live lecture recording now.' },
          { icon: <FileText size={20} />, title: 'Create flashcards manually', desc: 'Create flashcards without AI for free.' },
          { icon: <Edit2 size={20} />, title: 'Create notes manually', desc: 'Create notes without AI for free.' }
        ].map((card, i) => (
          <div key={i} className="exam-card p-2 sm:p-4 text-xs sm:text-sm flex items-start">
            <div className="mr-2">{card.icon}</div>
            <div>
              <h3>{card.title}</h3>
              <p >{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <br />
    <section>
      <h2 className="exam-subheading mb-2 text-xs sm:text-sm">Upload & Generate</h2>
      <input type="file" onChange={handleFileChange} className="mb-2 text-xs sm:text-sm" />
      <div className="flex flex-wrap gap-2 mb-2">
        {['flashcards','summary','quiz'].map(type => (
          <button key={type} onClick={() => uploadAndGenerate(type)} className="exam-button-mini py-1 px-2 text-xs sm:text-sm" data-hover={`Generate ${type}`}>Generate {type}</button>
        ))}
      </div>
      {generated.summary && <div className="exam-card p-2 mb-2 text-xs sm:text-sm"><h3 className="font-semibold">Summary</h3><p className="mt-1">{generated.summary}</p></div>}
      {generated.flashcards.length > 0 && <div className="exam-card p-2 mb-2 text-xs sm:text-sm"><h3 className="font-semibold">Flashcards</h3><ul className="list-disc list-inside mt-1">{generated.flashcards.map((f,i)=><li key={i}>{f}</li>)}</ul></div>}
      {generated.quiz.length > 0 && <div className="exam-card p-2 text-xs sm:text-sm"><h3 className="font-semibold">Quiz Questions</h3><ol className="list-decimal list-inside mt-1">{generated.quiz.map((q,i)=><li key={i}>{q}</li>)}</ol></div>}
    </section>
  </div>
)

export default HomeScreen
