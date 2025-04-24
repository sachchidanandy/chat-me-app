import { NavLink } from "react-router";
import { useAuth } from "../contextProvider/AuthProvider";
import Svg from "./Svg";
import { useFriends } from "../contextProvider/FriendsProvider";
import { getNamesInitials } from "../utils/helpers";

import AnimationStyle from "../utils/animation.module.css";

// create a navigation bar
const Navbar = () => {
  const { user, logout, showNavBar } = useAuth();
  const { friendRequests } = useFriends();
  const { userId, profilePicUrl } = user || {};
  const pendingRequests = friendRequests?.pendingRequests;

  return userId && showNavBar ? (
    <nav className={`navbar bg-primary text-primary-content ${showNavBar ? AnimationStyle.fadeIn : AnimationStyle.fadeOut}`}>
      <div className="flex-1">
        <NavLink className="btn btn-ghost text-xl" to="/">Chit Chat</NavLink>
      </div>
      <div className="flex-none gap-6">
        <div tabIndex={0} role="button" className="indicator" onClick={() => (document.getElementById('friend-request-modal') as HTMLDialogElement | null)?.showModal()}>
          <span className="indicator-item badge badge-secondary">{pendingRequests?.length || 0}</span>
          <Svg svgName="notification" className="fill-none stroke-current pt-1" />
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={1} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 text-center content-center">
              {
                profilePicUrl ? <img alt="profile-pic" src={profilePicUrl} /> : <span className="text-2xl font-bold">{getNamesInitials(user?.fullName) || ''}</span>
              }
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
