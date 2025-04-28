"use client"

interface GameOverProps {
  score: number
  onRestart: () => void
}

export function GameOver({ score, onRestart }: GameOverProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
      <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
      <p className="text-xl text-white mb-6">Your score: {score}</p>
      <button
        onClick={onRestart}
        className="px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
