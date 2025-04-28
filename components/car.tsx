import { CarFront } from "lucide-react"

interface CarProps {
  lane: number
  laneWidth: number
  size: number
}

export function Car({ lane, laneWidth, size }: CarProps) {
  return (
    <div
      className="absolute transition-all duration-150 ease-in-out"
      style={{
        left: lane * laneWidth + (laneWidth - size) / 2,
        bottom: 50,
        width: size,
        height: size,
      }}
    >
      <div className="w-full h-full flex items-center justify-center bg-pink-500 rounded-md shadow-lg"
>
        <CarFront className="text-white" size={30} />
      </div>
    </div>
  )
}
