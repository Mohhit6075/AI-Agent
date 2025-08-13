import React from "react"

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none  disabled:opacity-60 disabled:pointer-events-none"
  const variants = {
    default:
      "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-white/10",
    secondary:
      "bg-white/5 text-neutral-100 hover:bg-white/10 border border-white/10",
    ghost: "bg-transparent text-neutral-200 hover:bg-white/10",
  }
  const sizes = {
    default: "h-10 rounded-lg px-4 text-sm",
    sm: "h-8 rounded-md px-3 text-sm",
    icon: "h-10 w-10 rounded-full p-0",
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}