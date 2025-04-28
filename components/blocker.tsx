import { X } from "lucide-react"

interface BlockerProps {
  lane: number
  y: number
  laneWidth: number
  size: number
}

export function Blocker({ lane, y, laneWidth, size }: BlockerProps) {
  return (
    <div
      className="absolute"
      style={{
        left: lane * laneWidth + (laneWidth - size) / 2,
        top: y,
        width: size,
        height: size,
      }}
    >
      <div className="w-full h-full flex items-center justify-center bg-gray-900 border-2 border-red-500 rounded-md">
        <X className="text-red-500" size={30} />
      </div>
    </div>
  )
}
