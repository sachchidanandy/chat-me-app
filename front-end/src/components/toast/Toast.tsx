import { useEffect } from "react";

import Svg from "../Svg";
import toastStyle from './toast.module.css';

export enum eToastType {
  success = 'success',
  error = 'error',
  info = 'info',
  warning = 'warning',
}

interface iToastProps {
  type: eToastType;
  message: string | null;
  show: boolean;
  setShowToast: (status: boolean) => void;
}

const getAlertClass = (type: eToastType) => {
  switch (type) {
    case eToastType.success:
      return `alert alert-success max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition} z-50`;
    case eToastType.error:
      return `alert alert-error max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition} z-50`;
    case eToastType.info:
      return `alert alert-info max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition} z-50`;
    case eToastType.warning:
      return `alert alert-warning max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition} z-50`;
    default:
      return `alert alert-success max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition} z-50`;
  }
}
const Toast = (props: iToastProps) => {
  const { show, message, type, setShowToast } = props;

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }, [show]);

  return show ? (
    <div role="alert" className={getAlertClass(type)}>
      <Svg svgName={type as string} />
      <span>{message}</span>
    </div>
  ) : null;
};

export default Toast;
