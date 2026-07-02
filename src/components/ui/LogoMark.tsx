/** Logo GoJob — G-loupe néon violet→cyan, fond transparent (pas de tuile). */
export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="./logo-mark.png"
      height={size}
      alt="GoJob"
      className={className}
      style={{
        height: size,
        width: 'auto',
        display: 'block',
        filter: 'drop-shadow(0 0 10px rgba(123,60,255,0.35))',
      }}
    />
  )
}
