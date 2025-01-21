

import { NavLink } from "react-router";
import useAuth from "../hooks/useAuth"

// create a navigation bar
const Navbar = () => {
  const { user } = useAuth();
  return user ? (
    <nav className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <NavLink className="btn btn-ghost text-xl" to="/">daisyUI</NavLink>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-primary text-primary-content rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <NavLink className="justify-between" to="/profile">
                Profile
                <span className="badge">New</span>
              </NavLink>
            </li>
            <li><NavLink to="setting">Settings</NavLink></li>
            <li><a>Logout</a></li>
          </ul>
        </div>
      </div>
    </nav>
  ) : (
    <nav className="navbar bg-primary text-primary-content">
      <div className="navbar-start">
        <NavLink className="btn btn-ghost text-xl" to="/login">daisyUI</NavLink>
      </div>
    </nav>
  )
};

export default Navbar;
