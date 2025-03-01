const onlyTime = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};
const withDateTime = {
  ...onlyTime,
  month: "short",
  day: "numeric",
};

export const getRedableTimeStamp = (chatTime: string) => {
  const timeStamp = new Date(chatTime);
  return timeStamp.toLocaleDateString() === new Date().toLocaleDateString() ? timeStamp.toLocaleString('en-US', onlyTime as Intl.DateTimeFormatOptions) : timeStamp.toLocaleString('en-US', withDateTime as Intl.DateTimeFormatOptions);
};
