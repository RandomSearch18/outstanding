const Button = ({
  text,
  action,
}: {
  text: string
  action?: (event: MouseEvent) => void
}) => {
  return (
    <button type="button" onClick={action}>
      {text}
    </button>
  )
}

export default Button