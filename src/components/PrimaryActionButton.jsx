export default function PrimaryActionButton({
  onClick,
  className = "",
  label = "🚨 Acionar"
}) {
  const classes = ["requestButton", className].filter(Boolean).join(" ")

  return (
    <button type="button" className={classes} onClick={onClick}>
      {label}
    </button>
  )
}
