import { useEffect } from "react";

import Svg from "../Svg";
import toastStyle from './toast.module.css';

export enum toastType {
  success = 'success',
  error = 'error',
  info = 'info',
  warning = 'warning',
}

interface iToastProps {
  type: toastType;
  message: string | null;
  show: boolean;
  setShowToast: (status: boolean) => void;
}

const getAlertClass = (type: toastType) => {
  switch (type) {
    case toastType.success:
      return `alert alert-success max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition}`;
    case toastType.error:
      return `alert alert-error max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition}`;
    case toastType.info:
      return `alert alert-info max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition}`;
    case toastType.warning:
      return `alert alert-warning max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition}`;
    default:
      return `alert alert-success max-w-sm p-2 transition-all transition-discrete ${toastStyle.toastPosition}`;
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
