function Spinner({container, text}) {
  return (
    <div className={container ? 'text-center grid place-items-center' : ''} style={container ? { height: 400 } : {}}>
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
      </div>
      {text &&
        <h2>{text}...</h2>
      }
    </div>
  )
}

export default Spinner