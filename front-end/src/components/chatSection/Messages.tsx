import { Fragment } from "react";

const Messages = () => {
  return (
    <div className="w-full overflow-scroll mx-auto h-[80%] flex justify-center">
      <div className="max-w-5xl w-full">
        {
          new Array(20).fill(0).map((_, index) => (
            <Fragment key={index}>
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-primary">What kind of nonsense is this</div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-secondary">Calm down, Anakin.</div>
              </div>
            </Fragment>
          ))
        }
      </div>
    </div>
  )
}

export default Messages;