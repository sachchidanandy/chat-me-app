const NoChats = ({ message }: { message: string }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-cover bg-blend-overlay bg-no-repeat bg-neutral-900 bg-[url(/images/background-image.png)]">
      <div className="text-3xl font-bold flex justify-center flex-col items-center">
        <img src="/images/no-chats-preview.png" className="max-h-screen" />
        <p className="text-white text-center capitalize bottom-24 relative text-2xl">{message}</p>
      </div>
    </div>
  )
};

export default NoChats;
