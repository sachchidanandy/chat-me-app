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
}
const Loader = (props: LoaderPropsType) => {
  const { size = 'w-44', type = eLoaderTypes.RING, color = '' } = props;
  return (
    <div className="w-full h-full flex justify-center items-center">
      <span className={`loading ${type} ${size} ${color}`} />
    </div>
  )
};

export default Loader;