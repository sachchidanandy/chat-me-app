const SkeletonFriendListLoader = () => {
  return (
    <div className="flex flex-col w-full overflow-hidden gap-2 px-3">
      {
        Array.from({ length: 10 }).map((_, index) => (
          <div className="flex items-center gap-4" key={index}>
            <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div className="flex flex-col gap-4">
              <div className="skeleton h-4 w-36"></div>
              <div className="skeleton h-4 w-40"></div>
            </div>
          </div>
        ))
      }
    </div>
  )
};

export default SkeletonFriendListLoader;
