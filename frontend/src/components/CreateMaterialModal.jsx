import { X } from 'lucide-react'
import React, { useState } from 'react'

const CreateMaterialModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      updated: 'Just now',
      tag: 'Note'
    })
    setTitle('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold label-text">Create New Material</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                placeholder="Enter material title"
                required
              />
            </div>

            <div>
              <label className="label-text block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm label-text bg-white focus:bg-white focus:ring-2 focus:ring-[#7BA7CC]/30 focus:border-[#1b81d4] transition-colors outline-none"
                placeholder="Enter material description"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="label-text px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="exam-button-mini"
              data-hover="Create"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMaterialModal 