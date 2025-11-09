import { motion } from "framer-motion";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  animate = false, // opsional
}) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  const appliedVariant = variants[variant] || variants.primary;

  const classes = `${baseStyle} ${appliedVariant} ${className}`;

  if (animate) {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        className={classes}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
