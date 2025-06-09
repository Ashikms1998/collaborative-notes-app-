import mongoose from "mongoose";
import Note from "../models/notes.model.js";
import User from "../models/user.model.js";

export const addNote = async (req, res) => {
  const { title, content, noteType, isEditable, sharedWith } = req.body;
  const createdBy = req.user?.id;
  try {
    if (!title || !content || !createdBy) {
      return res
        .status(400)
        .json({ message: "Title, content, and creator are required." });
    }
    let collaboratorsForDb = [];
    if (noteType === "shared" && sharedWith && sharedWith.length > 0) {
      for (const email of sharedWith) {
        const collaboratorUser = await User.findOne({ email });
        if (collaboratorUser) {
          collaboratorsForDb.push({
            userId: collaboratorUser._id,
            permission: isEditable ? "write" : "read",
          });
        } else {
          console.warn(
            `Collaborator email "${email}" not found in User database. Skipping.`
          );
        }
      }
      const newNote = new Note({
        title,
        content,
        noteType,
        createdBy: createdBy,
        collaborators: collaboratorsForDb,
      });
      await newNote.save();
      await newNote.populate("createdBy", "fullName");
      return res.status(201).json({
        status: true,
        message: "Note created successfully",
        note: newNote,
      });
    } else if (noteType === "personal") {
      const newNote = new Note({
        title,
        content,
        noteType,
        createdBy: createdBy,
        collaborators: collaboratorsForDb,
      });
      await newNote.save();
      await newNote.populate("createdBy", "fullName");
      return res.status(201).json({
        status: true,
        message: "Note created successfully",
        note: newNote,
      });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({
      message: "Failed to create note. An unexpected error occurred.",
    });
  }
};

export const getNotes = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  try {
    const notes = await Note.find({
  $or: [
    { createdBy: userId },
    { 'collaborators.userId': userId }
  ]
})
.populate('createdBy', 'fullName')
.populate('collaborators.userId', 'fullName')
.sort({ updatedAt: -1 });
    return res.status(200).json({
      status: true,
      message: "Notes fetched successfully.",
      notes: notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch notes. An unexpected error occurred.",
    });
  }
};

export const updateNote = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, content, noteType, isEditable, sharedWith } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Note ID format." });
    }
    const existingNote = await Note.findOne({ _id: id });
    if (!existingNote) {
      return res.status(404).json({
        status: false,
        message: "Note not found or you do not have permission to edit it.",
      });
    }

const isOwner = existingNote.createdBy.toString() === userId;
    const isWriteCollaborator = existingNote.collaborators?.some(
      (collab) =>
        collab.userId.toString() === userId && collab.permission === "write"
    );

    if (!isOwner && !isWriteCollaborator) {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to edit this note.",
      });
    }



    existingNote.title = title;
    existingNote.content = content;
    existingNote.noteType = noteType;

    let collaboratorsForDb = [];
    if (noteType === "shared" && sharedWith && sharedWith.length > 0) {
      for (const email of sharedWith) {
        const collaboratorUser = await User.findOne({ email });
        if (collaboratorUser) {
          collaboratorsForDb.push({
            userId: collaboratorUser._id,
            permission: isEditable ? "write" : "read",
          });
        } else {
          console.warn(
            `Collaborator email "${email}" not found in User database. Skipping.`
          );
        }
      }
      existingNote.collaborators = collaboratorsForDb;
      await existingNote.save();

      const updatedNoteWithPopulatedCreator = await Note.findById(
        existingNote._id
      ).populate("createdBy", "fullName");

      return res.status(200).json({
        status: true,
        message: "Note updated successfully",
        note: updatedNoteWithPopulatedCreator,
      });
    } else if (noteType === "personal") {
      existingNote.collaborators = collaboratorsForDb;
      await existingNote.save();
      const updatedNoteWithPopulatedCreator = await Note.findById(
        existingNote._id
      ).populate("createdBy", "fullName");

      return res.status(200).json({
        status: true,
        message: "Note updated successfully",
        note: updatedNoteWithPopulatedCreator,
      });
    }
  } catch (error) {
    console.error("Error updating note:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update note. An unexpected error occurred.",
    });
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;
  const UserId = req.user.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Note ID format." });
    }
    const deletedNote = await Note.findOneAndDelete({
      _id: id,
      createdBy: UserId,
    });
    if (!deletedNote) {
      return res
        .status(404)
        .json({
          status: false,
          message: "Note not found or you do not have permission to delete it.",
        });
    }
    return res
      .status(200)
      .json({ status: true, message: "Note deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({
        status: false,
        message: "Failed to delete note. An unexpected error occurred.",
      });
  }
};


export const checkNotification = async(req,res)=>{
   const authenticatedUserId = req.user.id;

   try {
        const userIdObjectId = new mongoose.Types.ObjectId(authenticatedUserId);

        const currentUser = await User.findById(userIdObjectId);

        if (!currentUser) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        const lastChecked = currentUser.lastCheckedNotificationsAt;

        const newNotifications = await Note.find({
            'collaborators.userId': userIdObjectId,
            createdBy: { $ne: userIdObjectId },
            updatedAt: { $gt: lastChecked }
        })
        .populate('createdBy', 'fullName')
        .sort({ updatedAt: -1 });

         currentUser.lastCheckedNotificationsAt = new Date();

        await currentUser.save();

        return res.status(200).json({
            status: true,
            message: "Notifications checked successfully.",
            notifications: newNotifications,
            count: newNotifications.length,
        });

    } catch (error) {
        console.error("Error checking notifications:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to check notifications. An unexpected error occurred.",
        });
    }
};



export const getAllNotifications = async (req, res) => {
    const authenticatedUserId = req.user.id;
    try {
        const userIdObjectId = new mongoose.Types.ObjectId(authenticatedUserId);

        const notifications = await Note.find({
            'collaborators.userId': userIdObjectId,
            createdBy: { $ne: userIdObjectId }
        })
        .populate('createdBy', 'fullName')
        .sort({ updatedAt: -1 });

        return res.status(200).json({
            status: true,
            message: "All notifications fetched successfully.",
            notifications: notifications,
            count: notifications.length,
        });

    } catch (error) {
        console.error("Error getting all notifications:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to get all notifications. An unexpected error occurred.",
        });
    }
};