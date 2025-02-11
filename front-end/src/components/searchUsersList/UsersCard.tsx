import { iSearchUser } from "../../types/common";
import animationStyle from '../../utils/animation.module.css';

interface iUsersCardProps {
  user: iSearchUser,
}
const UsersCardProps = ({ user }: iUsersCardProps) => {
  const { id, profilePicUrl, fullName, username } = user;
  const isRequestSent = true;

  const handleFriedsRequest = () => {
    console.log(" ======= ", id);
  }

  return (
    <div className={`${animationStyle.fadeIn} card card-side h-16 px-1 max-w-sm text-base-content btn-ghost`}>
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
        <button
          className="btn btn-primary absolute right-2 w-28"
          style={isRequestSent ? { color: '#d1d5db' } : {}}
          onClick={handleFriedsRequest}
          disabled={isRequestSent}
        >
          {isRequestSent ? 'Requested' : 'Add Friend'}
        </button>
      </div>
    </div >
  );
}

export default UsersCardProps;
