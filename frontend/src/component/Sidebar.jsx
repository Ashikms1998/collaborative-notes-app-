import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

export const SIDEBAR_VIEWS = {
  MY_NOTES: "my_notes",
  NOTIFICATIONS: "notifications",
  PROFILE: "profile",
};


export function Sidebar({notificationCount,activeView,onItemClick}) {
  const navigate = useNavigate();

  const [loggedInUsername, setLoggedInUsername] = useState("Profile");
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setLoggedInUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_URL}/auth/logout`)
      .then((res) => {
        if (res.data.status) {
          localStorage.removeItem("username");
          localStorage.removeItem("userId");
          setLoggedInUsername("Profile");
          navigate("/login");
        } else {
          console.log("Logout failed:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error during logout:", err);
      });
  };

  return (
    <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray">
          <span className="font-serif text-3xl">The NoteBook</span>
        </Typography>
      </div>
      <List>
        <ListItem
         selected={activeView === SIDEBAR_VIEWS.PROFILE}
          onClick={() => onItemClick(SIDEBAR_VIEWS.PROFILE)}
        >
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          {loggedInUsername}
        </ListItem>
        <ListItem  selected={activeView === SIDEBAR_VIEWS.MY_NOTES}
          onClick={() => onItemClick(SIDEBAR_VIEWS.MY_NOTES)}>
          <ListItemPrefix>
            <DocumentTextIcon className="h-5 w-5" />
          </ListItemPrefix>
          Notes
        </ListItem>

        <ListItem selected={activeView === SIDEBAR_VIEWS.NOTIFICATIONS}
          onClick={() => onItemClick(SIDEBAR_VIEWS.NOTIFICATIONS)}>
          <ListItemPrefix>
            <BellIcon className="h-5 w-5" />
          </ListItemPrefix>
          Notifications
          <ListItemSuffix>
             {notificationCount > 0 && (
            <Chip
              value={notificationCount}
              size="sm"
              variant="ghost"
              color="blue-gray"
              className="rounded-full"
            />
             )}
          </ListItemSuffix>
        </ListItem>
        <ListItem onClick={handleLogout}>
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          Log Out
        </ListItem>
      </List>
    </Card>
  );
}
