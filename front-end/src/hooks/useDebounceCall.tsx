import { useEffect, useState } from "react";

const useDebounceCall = (callback: () => void, delay: number = 300): [boolean, (trigger: boolean) => void] => {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (trigger) {
      const intervalId = setTimeout(() => {
        callback();
        setTrigger(false);
      }, delay);

      return () => clearTimeout(intervalId);
    }
  }, [callback, delay]);

  return [trigger, setTrigger];
};

export default useDebounceCall;
