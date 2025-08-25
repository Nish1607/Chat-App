// components/Layout.jsx
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ users, setUsers, selectedId, onSelect, avatarBust }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar
            users={users}
            setUsers={setUsers}
            selectedId={selectedId}
            onSelect={onSelect}
            avatarBust={avatarBust}
          />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
