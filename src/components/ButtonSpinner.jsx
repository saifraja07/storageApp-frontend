import { LoaderCircle } from "lucide-react";

export default function ButtonSpinner({ size = 14 }) {
  return (
    <LoaderCircle
      size={size}
      aria-hidden="true"
      className="animate-spin"
      style={{ flex: `0 0 ${size}px` }}
    />
  );
}
