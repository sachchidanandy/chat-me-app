import { Link } from "react-router";

import { iSearchUser } from "../../types/common";
import animationStyle from '../../utils/animation.module.css';

interface iUsersCardProps {
  user: iSearchUser,
}
const UsersCardProps = ({ user }: iUsersCardProps) => {
  const { id, profilePicUrl, fullName, username } = user;

  return (
    <Link to={`/${id}`} className={animationStyle.fadeIn}>
      <div className="card card-side h-16 px-1 max-w-sm hover:cursor-pointer text-base-content btn-ghost">
        <figure>
          <img
            src={profilePicUrl}
            alt={`${username}-pic`}
            className="size-14 rounded-full"
          />
        </figure>
        <div className="card-body p-2 gap-1 max-w-[calc(100%-4rem)]">
          <span className="font-bold text-base">
            {fullName}
          </span>
          <p className="font-light text-sm truncate">{username}</p>
        </div>
      </div>
    </Link>
  );
}

export default UsersCardProps;
