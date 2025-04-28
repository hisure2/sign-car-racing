import { Coins } from "lucide-react"

interface CoinProps {
  lane: number
  y: number
  laneWidth: number
  size: number
}

export function Coin({ lane, y, laneWidth, size }: CoinProps) {
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
      <div className="w-full h-full flex items-center justify-center bg-yellow-400 rounded-full animate-pulse">
        <Coins className="text-yellow-800" size={30} />
      </div>
    </div>
  )
}
