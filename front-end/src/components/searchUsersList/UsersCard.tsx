import { Link } from "react-router";
import { iSearchUser } from "../../types/common";
import animationStyle from '../../utils/animation.module.css';
import useFetch from "../../hooks/useFetch";
import Loader, { eLoaderTypes } from "../Loader";
import useAuth from "../../hooks/useAuth";
import { eToastType } from "../toast/Toast";

interface iUsersCardProps {
  user: iSearchUser;
  handleSendFriendRequest: (userId: string) => void;
}
const UsersCardProps = ({ user, handleSendFriendRequest }: iUsersCardProps) => {
  const { id, profilePicUrl, fullName, username, isFriend, isRequestSent } = user;
  const { handleToastToogle } = useAuth();

  const { loading, request: sendFriendRequest } = useFetch('/friend/request');

  const handleRequest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log(" =======  HERE =======", id);
    const { error, data } = await sendFriendRequest({
      method: 'POST',
      data: {
        recieversId: id
      }
    });
    if (!error) {
      handleToastToogle((data?.message || 'Request send') as string);
      handleSendFriendRequest(id);
    } else {
      if (error?.includes('already send request')) {
        handleSendFriendRequest(id);
      }
      handleToastToogle(error, eToastType.error);
    }
  };

  const getActionButtons = (): JSX.Element => {
    if (isRequestSent) {
      return (
        <span
          className="absolute top-4 right-2 w-28 text-gray-300 text-center"
        >
          Requested
        </span>
      );
    }
    if (isFriend) {
      return (
        <Link to={`/${id}`}
          className="btn btn-primary absolute right-2 w-28"
        >
          Start Chat
        </Link>
      );
    }

    return (
      <button
        className="btn btn-primary absolute right-2 w-28"
        onClick={handleRequest}
        disabled={loading}
      >
        {loading ? <Loader size="w-8" color="text-primary" type={eLoaderTypes.SPINNER} /> : 'Add Friend'}
      </button>
    );
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
        {getActionButtons()}
      </div>
    </div >
  );
}

export default UsersCardProps;
