import React, { useEffect, useState } from "react";
import { MdClose, MdPersonRemove } from "react-icons/md";

const AddNoteModal = ({ isOpen, onClose, onSave, initialNote }) => {

  const getInitialPersonnelEmails = (note) => {
return note?.collaborators?.map(collab => collab.userId?.email).filter(Boolean) || [];
  };
  // State for form fields
  const [noteTitle, setNoteTitle] = useState(initialNote?.title || "");
  const [noteContent, setNoteContent] = useState(initialNote?.content || "");
  const [noteType, setNoteType] = useState(initialNote?.noteType || "personal"); // 'personal', 'shared'
  const [isEditable, setIsEditable] = useState(
    initialNote?.isEditable !== undefined ? initialNote.isEditable : true
  ); // Default to editable
  const [newPersonnelEmail, setNewPersonnelEmail] = useState("");
  const [addedPersonnel, setAddedPersonnel] = useState(
    getInitialPersonnelEmails(initialNote)
  );
  const [inputError, setInputError] = useState("");
  const [personnelEmailError, setPersonnelEmailError] = useState("");

  // Reset state when modal opens/closes or initialNote changes
  useEffect(() => {
    if (isOpen) {
      setNoteTitle(initialNote?.title || "");
      setNoteContent(initialNote?.content || "");
      setNoteType(initialNote?.noteType || "personal");
      setIsEditable(
        initialNote?.isEditable !== undefined ? initialNote.isEditable : true
      );
      // setAddedPersonnel(initialNote.sharedWith || []);
            setAddedPersonnel(getInitialPersonnelEmails(initialNote));

      setNewPersonnelEmail("");
      setInputError("");
      setPersonnelEmailError("");
    }
  }, [isOpen,initialNote]);

  // Handle personnel email input change
  const handlePersonnelEmailChange = (e) => {
    setNewPersonnelEmail(e.target.value);
    setPersonnelEmailError(""); // Clear error on change
  };

  // Add personnel to the list
  const handleAddPersonnel = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex

    if (!newPersonnelEmail.trim()) {
      setPersonnelEmailError("Email cannot be empty.");
      return;
    }
    if (!emailRegex.test(newPersonnelEmail)) {
      setPersonnelEmailError("Please enter a valid email address.");
      return;
    }
    if (addedPersonnel.includes(newPersonnelEmail)) {
      setPersonnelEmailError("This email is already added.");
      return;
    }

    setAddedPersonnel([...addedPersonnel, newPersonnelEmail]);
    setNewPersonnelEmail("");
    setPersonnelEmailError("");
  };

  // Remove personnel from the list
  const handleRemovePersonnel = (emailToRemove) => {
    setAddedPersonnel(
      addedPersonnel.filter((email) => email !== emailToRemove)
    );
  };

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();
    setInputError(""); // Clear previous errors

    if (!noteTitle.trim()) {
      setInputError("Note title cannot be empty.");
      return;
    }
    if (!noteContent.trim()) {
      setInputError("Note content cannot be empty.");
      return;
    }
    if (noteType === "shared" && addedPersonnel.length === 0) {
      setInputError("Please add at least one personnel for shared notes.");
      return;
    }

    onSave({
      title: noteTitle,
      content: noteContent,
      noteType: noteType,
      isEditable: noteType === "shared" ? isEditable : undefined, // Only send if shared
      sharedWith: noteType === "shared" ? addedPersonnel : undefined, // Only send if shared
    });
    // onClose(); // Close modal after saving
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {initialNote?.id ? "Edit Note" : "Create New Note"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <MdClose className="w-7 h-7" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {inputError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
              role="alert"
            >
              {inputError}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label
              htmlFor="noteTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="noteTitle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Enter note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label
              htmlFor="noteContent"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Content
            </label>
            <textarea
              id="noteContent"
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Note Type Selector */}
          <div>
            <label
              htmlFor="noteType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Note Type
            </label>
            <select
              id="noteType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
            >
              <option value="personal">Personal</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          {/* Shared Note Options (Conditional) */}
          {noteType === "shared" && (
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                Sharing Options
              </h4>

              {/* Read-only/Editable Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEditable"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                  checked={isEditable}
                  onChange={(e) => setIsEditable(e.target.checked)}
                />
                <label
                  htmlFor="isEditable"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                >
                  Enable editing for shared collaborators.
                </label>
              </div>

              {/* Add Personnel by Email */}
              <div>
                <label
                  htmlFor="personnelEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Add Personnel (Email)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    id="personnelEmail"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                    placeholder="person@example.com"
                    value={newPersonnelEmail}
                    onChange={handlePersonnelEmailChange}
                  />
                  <button
                    type="button"
                    onClick={handleAddPersonnel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                  >
                    Add
                  </button>
                </div>
                {personnelEmailError && (
                  <p className="text-red-500 text-xs mt-1">
                    {personnelEmailError}
                  </p>
                )}
              </div>

              {/* Added Personnel List */}
              {addedPersonnel.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shared With:
                  </p>
                  <ul className="space-y-1">
                    {addedPersonnel.map((email, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 p-2 rounded-md text-sm text-gray-800 dark:text-gray-200"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemovePersonnel(email)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Remove personnel"
                        >
                          <MdPersonRemove className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
