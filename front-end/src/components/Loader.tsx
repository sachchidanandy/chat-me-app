export enum eLoaderTypes {
  RING = 'loading-ring',
  BALL = 'loading-ball',
  BARS = 'loading-bars',
  INFINITY = 'loading-infinity',
  DOTS = 'loading-dots',
  SPINNER = 'loading-spinner'
}
type LoaderPropsType = {
  size?: string,
  type?: eLoaderTypes,
  color?: string,
  clsName?: string
  message?: string
}
const Loader = (props: LoaderPropsType) => {
  const { size = 'w-44', type = eLoaderTypes.RING, color = '', clsName = '', message = '' } = props;
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <span className={`loading ${type} ${size} ${color} ${clsName}`} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
};

export default Loader;
