

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 overflow-auto shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] ${className}`}
      {...props}
    />
  )
}
export function CardHeader({ className = "", ...props }) {
  return <div className={`px-4 py-4 ${className}`} {...props} />
}
export function CardContent({ className = "", ...props }) {
  return <div className={`px-4 py-4 ${className}`} {...props} />
}
export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-lg font-semibold tracking-tight ${className}`} {...props} />
}