import React, { useState } from "react";
import { MdAdd, MdCreate, MdDelete } from "react-icons/md";
import AddNoteModal from "./AddNoteModal";
const Notecard = ({
  title,
  content,
  createdBy,
  lastUpdated,
  onEdit,
  onDelete,
  onCardClick
}) => {

  return (
    <>
      <div className="border w-80 rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out" onClick={onCardClick} >
        <div className="flex-col items-center justify-between">
          <div>
            <h6 className="text-sm font-medium">{title}</h6>
            <span className="text-xs text-gray-600">{lastUpdated}</span>
          </div>
          <p className="text-xs text-gray-600-600 mt-2">
            {content?.slice(0, 60)}...
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs mt-3 text-gray-600 font-light">
              by {createdBy}
            </span>
            <div className="flex items-end gap-2">
              {onEdit && (<MdCreate
                className="icon-btn hover:text-green-600"
                onClick={onEdit}
              />)}
              {onDelete &&(<MdDelete
                className="icon-btn hover:text-red-500"
                onClick={onDelete}
              />)}
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default Notecard;
