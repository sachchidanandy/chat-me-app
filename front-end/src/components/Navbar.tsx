

import { NavLink } from "react-router";
import useAuth from "../hooks/useAuth"
import Svg from "./Svg";

// create a navigation bar
const Navbar = () => {
  const { user, logout } = useAuth();
  const { userId, profilePicUrl } = user || {};

  return userId ? (
    <nav className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <NavLink className="btn btn-ghost text-xl" to="/">daisyUI</NavLink>
      </div>
      <div className="flex-none gap-2">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" onClick={() => (document.getElementById('friend-request-modal') as HTMLDialogElement | null)?.showModal()}>
          <Svg svgName="notification" />
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={1} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="profile-pic"
                src={profilePicUrl} />
            </div>
          </div>
          <ul
            tabIndex={1}
            className="menu menu-sm dropdown-content bg-primary text-primary-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <NavLink className="justify-between" to="/profile">
                Profile
                <span className="badge">New</span>
              </NavLink>
            </li>
            <li><NavLink to="setting">Settings</NavLink></li>
            <li><a onClick={logout}>Logout</a></li>
          </ul>
        </div>
      </div>
    </nav>
  ) : null;
};

export default Navbar;
