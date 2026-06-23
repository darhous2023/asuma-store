const MedusaCTA = () => {
  return (
    <p className="font-sans text-xs" style={{ color: "var(--ivory-muted, #7A6A5A)" }}>
      designed by{" "}
      <a
        href="mailto:ahmeddarhous@gmail.com"
        className="transition-colors duration-200 hover:opacity-100"
        style={{ color: "var(--gold-dark, #8B7040)" }}
      >
        Ahmed Darhous
      </a>{" "}
      © {new Date().getFullYear()}
    </p>
  )
}

export default MedusaCTA
