export default function WhatsAppButton({ href, className = "", label = "💬 WhatsApp" }) {
  const classes = ["btnWhatsClean", className].filter(Boolean).join(" ")

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {label}
    </a>
  )
}
