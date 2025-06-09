import Notecard from "../component/Notecard";
import { useState } from "react";
import AddNoteModal from "../component/AddNoteModal";
import { MdAdd } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCallback } from "react";
import ViewNoteModal from "../component/ViewNoteModal";
import NotificationItem from "../component/NotificationItem";
import { Sidebar, SIDEBAR_VIEWS } from "../component/Sidebar";
import { useRef } from "react";



const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [sharedWithMeNotes, setSharedWithMeNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [activeView, setActiveView] = useState(SIDEBAR_VIEWS.MY_NOTES);
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();
const userId = localStorage.getItem("userId");
  const fetchNotes = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User not logged in. Cannot fetch notes.");
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/notes/get-notes`,
        { withCredentials: true }
      );
      if (response.data.status) {
        const fetchedNotes = response.data.notes || [];
        console.log("Fetched notes", fetchedNotes);
        console.log("User ID", userId);

        fetchedNotes.forEach((note) => {
          console.log("Note:", note.title);
          console.log("Note Type:", note.noteType);
          console.log("Created By:", note.createdBy?._id);
          console.log(
            "Collaborators:",
            note.collaborators?.map((c) => c.userId?._id)
          );
        });
        const createdByUser = fetchedNotes.filter(
          (note) => note.createdBy?._id.toString() === userId
        );

        const sharedWithUser = fetchedNotes.filter(
          (note) =>
            note.collaborators?.some(
              (collab) => collab.userId?._id?.toString() === userId
            ) && note.createdBy?._id?.toString() !== userId
        );

        const sortNotes = (notesArray) => {
          return notesArray.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
        };
        setMyNotes(sortNotes(createdByUser));
        setSharedWithMeNotes(sortNotes(sharedWithUser));
      }
    } catch (error) {
      console.error(
        "Error fetching notes:",
        error.response?.data?.message || error.message
      );
    }
  }, [navigate]);

const fetchAllNotifications = useCallback(async () => {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
console.log("User ID in fetchAllNotifications:", userId);
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/notes/all-notifications`,
            { withCredentials: true }
        );
        if (response.data.status) {
            setNotifications(response.data.notifications || []);
        }
    } catch (error) {
        console.error(
            "Error fetching all notifications:",
            error.response?.data?.message || error.message
        );
        setNotifications([]);
    }
  }, [])


const fetchNotificationCount = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setNotificationCount(0);
        return;
      }
console.log("User ID in fetchNotificationCount:", userId);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/notes/check-notification`,
        { withCredentials: true }
      );

      if (response.data.status) {
        setNotificationCount(response.data.count);
        if (response.data.count > 0 && activeView === SIDEBAR_VIEWS.NOTIFICATIONS) {
            fetchAllNotifications();
        }
      }
    } catch (error) {
      console.error(
        "Error fetching notification count:",
        error.response?.data?.message || error.message
      );
      setNotificationCount(0);
    }
  }, [activeView, fetchAllNotifications]);



   useEffect(() => {
    fetchNotes();

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(fetchNotificationCount, 5000);

    fetchNotificationCount();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotes, fetchNotificationCount]);

  const handleAddClick = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingNote(null);
    setIsModalOpen(false);
  };

  const handleEditNote = (noteData) => {
    setEditingNote(noteData);
    setIsModalOpen(true);
  };

  const handleDelete = async (noteId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/notes/delete-note/${noteId}`,
        { withCredentials: true }
      );
      fetchNotes();
      // setNotes(prevNotes =>prevNotes.filter(note => note._id !== noteId))
    } catch (error) {
      console.error(
        "Error deleting note:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleSaveNote = async (noteData) => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      console.error(
        "No user ID found for creating/editing note. Please ensure the user is logged in."
      );
      return;
    }
    try {
      let response;
      // let savedNote;
      if (editingNote) {
        response = await axios.put(
          `${import.meta.env.VITE_SERVER_URL}/notes/update-note/${
            editingNote._id
          }`,
          { ...noteData, createdBy: currentUserId },
          { withCredentials: true }
        );
        //   savedNote = response.data.note
        //   console.log(savedNote)
        //   setNotes((prevNotes) => {
        //   const updatedNotes = prevNotes.map((note) =>
        //     note._id === editingNote._id
        //       ? { ...note, ...savedNote }
        //       : note
        //   )
        //   return updatedNotes.sort((a, b) => {
        //     const dateA = new Date(a.updatedAt || a.createdAt);
        //     const dateB = new Date(b.updatedAt || b.createdAt);
        //     return dateB.getTime() - dateA.getTime();
        //   });
        // })
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/notes/add-note`,
          { ...noteData },
          { withCredentials: true }
        );
      }
      // savedNote = response.data.note;
      // setNotes((prevNotes) => {
      //         const newNotes = [savedNote, ...prevNotes];
      //         return newNotes.sort((a, b) => {
      //           const dateA = new Date(a.updatedAt || a.createdAt);
      //           const dateB = new Date(b.updatedAt || b.createdAt);
      //           return dateB.getTime() - dateA.getTime();
      //         });
      //         });
      //     }

      if (response.data.status) {
        fetchNotes();
        handleCloseModal();
      }
    } catch (error) {
      console.error(
        "Error while saving note",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleViewNoteClick = (noteData) => {
    setViewingNote(noteData);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewingNote(null);
    setIsViewModalOpen(false);
  };

  const handleSidebarItemClick = (view) => {
    setActiveView(view);
    if (view === SIDEBAR_VIEWS.NOTIFICATIONS) {
        fetchAllNotifications();
        setNotificationCount(0);
    } else {
        fetchNotes();
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 gap-4">
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
          <Sidebar
notificationCount={notificationCount}
            activeView={activeView}
            onItemClick={handleSidebarItemClick}
          />
        </div>
        <div className=" container mx-auto">
           {activeView === SIDEBAR_VIEWS.MY_NOTES && (
            <>
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            My Notes
          </h1>
          {!myNotes.length && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No personal notes yet. Click the '+' button to create one!
            </p>
          )}
          <div className=" grid grid-cols-3 gap-4 mt-8">
            {myNotes.map((note) =>(
                <Notecard
                  key={note._id}
                  title={note.title}
                  content={note.content}
                  createdBy={note.createdBy?.fullName || "Unknown User"}
                  lastUpdated={new Date(
                    note.updatedAt || note.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  onEdit={() => handleEditNote(note)}
                  onDelete={() => handleDelete(note._id)}
                  onCardClick={() => handleViewNoteClick(note)}
                />
              ))}

          </div>

          <h1 className="text-3xl font-bold mt-12 mb-6 text-gray-800 dark:text-gray-100">
            Shared with Me
          </h1>

          {!sharedWithMeNotes.length && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No notes have been shared with you yet.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mt-8">
            {sharedWithMeNotes.map((note) => (
              <Notecard
                key={note._id}
                title={note.title}
                content={note.content}
                createdBy={note.createdBy?.fullName || "Unknown User"}
                lastUpdated={new Date(
                  note.updatedAt || note.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                onEdit={
                  note.collaborators?.some(
                    (collab) =>
                      collab.userId?._id?.toString() === userId &&
                      collab.permission === "write"
                  )
                    ? () => handleEditNote(note)
                    : undefined
                }
                onDelete={
                  note.createdBy?._id?.toString() === userId
                    ? () => handleDelete(note._id)
                    : undefined
                }
                onCardClick={() => handleViewNoteClick(note)}
                sharedBy={note.createdBy?.fullName || "A User"}
              />
                ))}
              </div>
            </>
          )}

{activeView === SIDEBAR_VIEWS.NOTIFICATIONS && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                Notifications
              </h1>
              {!notifications.length && (
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You have no new notifications.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    user={notification.createdBy?.fullName || "A User"}
                    timestamp={new Date(
                      notification.updatedAt || notification.createdAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: '2-digit', minute: '2-digit'
                    })}
                  />
                ))}
              </div>
            </>
          )}
          {activeView === SIDEBAR_VIEWS.MY_NOTES && (
          <button
            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-700 hover:bg-blue-800 absolute right-10 bottom-10"
            onClick={handleAddClick}
          >
            <MdAdd className="text-[32px] text-white" />
          </button>
          )}
        </div>
      </div>
      <AddNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />

      <ViewNoteModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        note={viewingNote}
      />
    </>
  );
};

export default Dashboard;
