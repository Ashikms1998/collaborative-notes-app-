import React from "react";
import { MdClose } from "react-icons/md";

const ViewNoteModal = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {note.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <MdClose className="w-7 h-7" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {" "}
            {/* whitespace-pre-wrap to preserve formatting */}
            {note.content}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
            <span>By: {note.createdBy?.fullName || "Unknown User"}</span>
            <span>
              Last Updated:{" "}
              {new Date(note.updatedAt || note.createdAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
          {note.noteType === "shared" && note.sharedBy && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Shared by: {note.sharedBy}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
