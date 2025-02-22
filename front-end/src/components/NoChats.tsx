const NoChats = ({ message }: { message: string }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-cover bg-blend-overlay bg-no-repeat bg-neutral-900 bg-[url(/images/background-image.png)]">
      <div className="text-3xl font-bold relative flex justify-center">
        <img src="/images/no-chats-preview.png" className="max-h-screen" />
        <p className="absolute text-white  capitalize bottom-24">{message}</p>
      </div>
    </div>
  )
};

export default NoChats;
