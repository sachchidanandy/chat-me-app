import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch"
import Loader, { eLoaderTypes } from "./Loader";
import { useAuth } from "../contextProvider/AuthProvider";
import { iPendingRequestType } from "../contextProvider/FriendsProvider";
import { useFriends } from "../contextProvider/FriendsProvider";

interface iPendingRequestState extends iPendingRequestType {
  responseStatus: string;
}
type friendRequestResponse = {
  pendingRequests: iPendingRequestState[],
  message: string,
};

const FriendRequestModal = () => {
  const { handleToastToogle } = useAuth();
  const { friendRequests, friendRequestLoading } = useFriends();
  const { loading: actionLoading, request } = useFetch('/friend/request');
  const [friendRequest, setFriendRequest] = useState<friendRequestResponse>();

  useEffect(() => {
    if (friendRequests?.pendingRequests) {
      const formateRequestData = friendRequests?.pendingRequests.map((req: iPendingRequestType) => ({
        ...req,
        sentAt: new Date(req.sentAt || '').toDateString().slice(4),
        responseStatus: ''
      }));
      setFriendRequest({ message: friendRequests?.message, pendingRequests: formateRequestData });
    }
  }, [friendRequests]);

  const handleRequest = (requestId: string, accepted = false) => (
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const { data, error } = await request({
        method: 'PATCH',
        data: {
          requestId,
          accepted
        }
      });

      if (!error && friendRequest) {
        handleToastToogle(data?.message as string);
        const newPendingRequests = friendRequest?.pendingRequests.map(
          (req) => (req.requestId === requestId ? {
            ...req,
            responseStatus: accepted ? 'Accepted' : 'Rejected'
          } : { ...req })
        );
        setFriendRequest({ message: friendRequest?.message, pendingRequests: newPendingRequests });
      }
    }
  );

  const requestCard = (req: iPendingRequestState) => {
    const { requestId, senderName, senderProfilePic, senderUsername, responseStatus } = req;

    return (
      <div key={requestId} className="h-auto w-full flex gap-x-2 items-center justify-between flex-wrap">
        <div className="flex gap-1 items-center">
          <img className="img rounded-full size-16" src={senderProfilePic} alt={`${senderUsername}-profile-pic`} />
          <div className="flex flex-col">
            <span>{senderName}'s request</span>
            <span>{senderUsername}</span>
          </div>
        </div>
        {
          responseStatus ? (<span className="px-6 py-1 bg-gray-700 text-gray-200 rounded-xl">{responseStatus}</span>) : (
            <div className="flex gap-3 justify-center">
              <button className="btn btn-primary" disabled={actionLoading} onClick={handleRequest(requestId, true)}>
                Accept
              </button>
              <button className="btn btn-secondary" disabled={actionLoading} onClick={handleRequest(requestId, false)}>
                Reject
              </button>
            </div>
          )
        }
      </div>
    )
  };

  const { pendingRequests, message } = friendRequest || {};

  return (
    <dialog id="friend-request-modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box capitalize w-full max-w-5xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        {friendRequestLoading || actionLoading ? <Loader type={eLoaderTypes.SPINNER} size="w-20" /> : (
          <div className="flex flex-col gap-y-2 pt-1">
            {pendingRequests?.length === 0 && message ? <p className="text-center">{message}</p> : null}
            {
              pendingRequests?.map(requestCard)
            }
          </div>
        )}
      </div>
    </dialog>
  )
};

export default FriendRequestModal;
