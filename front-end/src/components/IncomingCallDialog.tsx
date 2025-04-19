import { CallerDetails } from "../contextProvider/AudioCallProvider";
import { getNamesInitials } from "../utils/helpers";
import Svg from "./Svg";

interface iIcomingCallDialogProps {
  callerDetails: CallerDetails;
  handleAcceptCall: () => void;
  handleRejectCall: () => void;
}
const IncomingCallDialog = ({ callerDetails, handleAcceptCall, handleRejectCall }: iIcomingCallDialogProps) => {
  return (
    <dialog id="incoming-call-modal" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box capitalize max-w-sm w-full mx-auto">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleRejectCall}>✕</button>
        </form>
        {callerDetails && (
          <div>
            <div className="flex items-center gap-2 flex-col justify-center">
              {callerDetails.profilePicUrl ? <figure>
                <img
                  src={callerDetails.profilePicUrl}
                  alt={`${callerDetails.username}-pic`}
                  className="size-14 rounded-full"
                />
              </figure> : <div
                className="size-14 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-2xl self-center">
                {getNamesInitials(callerDetails.fullName) || ''}
              </div>}
              <div>
                <p className=" font-bold text-center">{callerDetails.fullName} Calling...</p>
                <p className="font-light text-center">{callerDetails.username}</p>
              </div>
            </div>
            <div className="flex justify-center gap-32 mt-4">
              <button className="btn btn-circle btn-ghost border-white bg-green-700" onClick={handleAcceptCall}>
                <Svg
                  className="fill-none stroke-current text-white h-8 w-8"
                  viewBox="0 0 24 24"
                  svgName="normalCall" />
              </button>
              <button className="btn btn-circle btn-ghost border-white bg-red-800" onClick={handleRejectCall}>
                <Svg
                  className="fill-none stroke-current text-white h-8 w-8"
                  viewBox="0 0 24 24"
                  svgName="endNormalCall" />
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default IncomingCallDialog;
