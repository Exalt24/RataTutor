import { ArrowLeft, FileText, Search } from 'lucide-react';
import React, { useState } from 'react';

const ViewNotes = ({ material, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  // Sample notes data - replace with actual data from material prop
  const notes = [
    {
      id: 1,
      title: "Introduction to Physics",
      content: `Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force.

Key Concepts:
1. Newton's Laws of Motion
   - First Law: An object at rest stays at rest unless acted upon by an external force
   - Second Law: Force equals mass times acceleration (F = ma)
   - Third Law: For every action, there is an equal and opposite reaction

2. Thermodynamics
   - First Law: Energy cannot be created or destroyed
   - Second Law: Entropy of an isolated system always increases
   - Third Law: As temperature approaches absolute zero, entropy approaches a minimum value

3. Electromagnetism
   - Electric fields and magnetic fields are related
   - Maxwell's equations describe the behavior of electromagnetic fields
   - Light is an electromagnetic wave`,
      updated: "2 days ago",
      tags: ["physics", "basics", "science"]
    },
    {
      id: 2,
      title: "Quantum Mechanics Basics",
      content: `Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.

Key Principles:
1. Wave-Particle Duality
   - Particles can exhibit both wave-like and particle-like properties
   - The double-slit experiment demonstrates this behavior

2. Uncertainty Principle
   - It is impossible to know both position and momentum with perfect precision
   - The more precisely one property is measured, the less precisely the other can be known

3. Quantum Superposition
   - Particles can exist in multiple states simultaneously
   - Only when measured does the system collapse to a single state`,
      updated: "1 day ago",
      tags: ["physics", "quantum", "advanced"]
    }
  ];

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-[90rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{material?.title || 'Notes'}</h1>
                <p className="text-sm text-gray-500">Study and review your notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[90rem] mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Notes List */}
            <div className="w-80 flex-shrink-0">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedNote?.id === note.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{note.updated}</span>
                      <span>•</span>
                      <span>{note.tags.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1">
              {selectedNote ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">{selectedNote.title}</h2>
                    <span className="text-sm text-gray-500">{selectedNote.updated}</span>
                  </div>
                  <div className="flex gap-2 mb-6">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="prose max-w-none">
                    {selectedNote.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700">
                        {highlightText(paragraph, searchQuery)}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a note to view</h3>
                  <p className="text-gray-600">Choose a note from the list to start reading</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNotes; 