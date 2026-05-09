import { createContext, useContext, useEffect, useRef } from "react"
import gsap from "gsap"

const PageTransitionContext = createContext(null)

const blockCount = 10

const getBlocks = () => Array.from({ length: blockCount })

const animateBlocks = (blocks, scaleY, duration = 0.9) => {
  return new Promise((resolve) => {
    gsap.to(blocks, {
      scaleY,
      duration,
      ease: "power4.inOut",
      stagger: {
        each: 0.08,
        from: "start",
        grid: [2, 5],
        axis: "x",
      },
      onComplete: resolve,
    })
  })
}

export const PageTransitionProvider = ({ children }) => {
  const overlayRef = useRef(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    const blocks = overlayRef.current?.querySelectorAll(".page-transition-block")

    if (!blocks?.length) {
      return
    }

    gsap.set(blocks, { scaleY: 1, visibility: "visible" })

    animateBlocks(blocks, 0, 1).then(() => {
      gsap.set(blocks, { visibility: "hidden" })
    })
  }, [])

  const transitionTo = async (navigateCallback) => {
    if (isAnimatingRef.current) {
      return
    }

    const blocks = overlayRef.current?.querySelectorAll(".page-transition-block")

    if (!blocks?.length) {
      navigateCallback()
      return
    }

    isAnimatingRef.current = true

    gsap.set(blocks, { scaleY: 0, visibility: "visible" })
    await animateBlocks(blocks, 1)
    navigateCallback()
    await animateBlocks(blocks, 0)
    gsap.set(blocks, { visibility: "hidden" })

    isAnimatingRef.current = false
  }

  return (
    <PageTransitionContext.Provider value={{ transitionTo }}>
      {children}

      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-999 grid grid-cols-5 grid-rows-2 overflow-hidden"
        aria-hidden="true"
      >
        {getBlocks().map((_, index) => (
          <div
            key={index}
            className="page-transition-block origin-top scale-y-0 bg-black"
          />
        ))}
      </div>
    </PageTransitionContext.Provider>
  )
}

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext)

  if (!context) {
    throw new Error("usePageTransition must be used within PageTransitionProvider")
  }

  return context
}