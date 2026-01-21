import { useEffect, useRef } from 'react'

export const useVantaEffect = () => {
    const vantaRef = useRef<HTMLDivElement>(null)
    const vantaEffect = useRef<any>(null)

    useEffect(() => {
        if (!vantaEffect.current && vantaRef.current) {
            // Dynamically import Vanta and p5.js (TRUNK uses p5, not Three.js)
            Promise.all([
                import('vanta/dist/vanta.trunk.min'),
                import('p5')
            ]).then(([VANTA, p5Module]) => {
                vantaEffect.current = (VANTA as any).default({
                    el: vantaRef.current,
                    p5: p5Module.default,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: 0x4338ca,        // Indigo-700 for trunks
                    backgroundColor: 0x312e81,  // Indigo-900 - balanced darkness
                    spacing: 5.00,
                    chaos: 3.00
                })
            })
        }

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy()
                vantaEffect.current = null
            }
        }
    }, [])

    return vantaRef
}
