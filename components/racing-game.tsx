"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { Car } from "./car"
import { Coin } from "./coin"
import { Blocker } from "./blocker"
import { GameOver } from "./game-over"
import { useKeyPress } from "@/hooks/use-key-press"

// Game constants
const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const LANE_COUNT = 3
const LANE_WIDTH = GAME_WIDTH / LANE_COUNT
const GAME_SPEED_INITIAL = 5
const GAME_SPEED_INCREMENT = 0.0005
const COIN_SPAWN_RATE = 0.02
const BLOCKER_SPAWN_RATE = 0.015
const OBJECT_SIZE = 50

type GameObject = {
  id: number
  lane: number
  y: number
  type: "coin" | "blocker"
}

export default function RacingGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [carLane, setCarLane] = useState(1)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const gameSpeedRef = useRef(GAME_SPEED_INITIAL)
  const animationFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const objectIdCounterRef = useRef(0)

  // Handle key presses for car movement
  const leftPressed = useKeyPress("ArrowLeft")
  const rightPressed = useKeyPress("ArrowRight")

  const moveCarLeft = useCallback(() => {
    if (carLane > 0) {
      setCarLane((lane) => lane - 1)
    }
  }, [carLane])

  const moveCarRight = useCallback(() => {
    if (carLane < LANE_COUNT - 1) {
      setCarLane((lane) => lane + 1)
    }
  }, [carLane])

  // Handle touch controls for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touchX = e.touches[0].clientX
      const gameRect = e.currentTarget.getBoundingClientRect()
      const touchXRelative = touchX - gameRect.left

      if (touchXRelative < GAME_WIDTH / 2) {
        moveCarLeft()
      } else {
        moveCarRight()
      }
    },
    [moveCarLeft, moveCarRight],
  )

  // Start the game
  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setCarLane(1)
    setGameObjects([])
    gameSpeedRef.current = GAME_SPEED_INITIAL
    lastTimeRef.current = performance.now()
    objectIdCounterRef.current = 0
  }, [])

  // Game loop
  const gameLoop = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time
      }

      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      // Increase game speed over time
      gameSpeedRef.current += GAME_SPEED_INCREMENT * deltaTime

      // Move existing objects down
      setGameObjects((prevObjects) => {
        const newObjects = prevObjects
          .map((obj) => ({
            ...obj,
            y: obj.y + (gameSpeedRef.current * deltaTime) / 16,
          }))
          .filter((obj) => obj.y < GAME_HEIGHT)

        // Check for collisions with car
        const carY = GAME_HEIGHT - 100
        const carHitbox = {
          left: carLane * LANE_WIDTH + 10,
          right: (carLane + 1) * LANE_WIDTH - 10,
          top: carY,
          bottom: carY + OBJECT_SIZE,
        }

        let shouldEndGame = false
        let pointsToAdd = 0

        const objectsAfterCollision = newObjects.filter((obj) => {
          const objHitbox = {
            left: obj.lane * LANE_WIDTH + 10,
            right: (obj.lane + 1) * LANE_WIDTH - 10,
            top: obj.y,
            bottom: obj.y + OBJECT_SIZE,
          }

          const collision = !(
            carHitbox.right < objHitbox.left ||
            carHitbox.left > objHitbox.right ||
            carHitbox.bottom < objHitbox.top ||
            carHitbox.top > objHitbox.bottom
          )

          if (collision) {
            if (obj.type === "blocker") {
              shouldEndGame = true
              return true // Keep the blocker to show collision
            } else if (obj.type === "coin") {
              pointsToAdd += 10
              return false // Remove collected coin
            }
          }

          return true
        })

        if (shouldEndGame) {
          setGameOver(true)
          return objectsAfterCollision
        }

        if (pointsToAdd > 0) {
          setScore((s) => s + pointsToAdd)
        }

        // Randomly spawn new objects
        if (Math.random() < (COIN_SPAWN_RATE * deltaTime) / 16) {
          const lane = Math.floor(Math.random() * LANE_COUNT)
          objectsAfterCollision.push({
            id: objectIdCounterRef.current++,
            lane,
            y: -OBJECT_SIZE,
            type: "coin",
          })
        }

        if (Math.random() < (BLOCKER_SPAWN_RATE * deltaTime) / 16) {
          const lane = Math.floor(Math.random() * LANE_COUNT)
          objectsAfterCollision.push({
            id: objectIdCounterRef.current++,
            lane,
            y: -OBJECT_SIZE,
            type: "blocker",
          })
        }

        return objectsAfterCollision
      })

      if (!gameOver) {
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      }
    },
    [carLane, gameOver],
  )

  // Handle key presses
  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (leftPressed) moveCarLeft()
      if (rightPressed) moveCarRight()
    }
  }, [leftPressed, rightPressed, moveCarLeft, moveCarRight, gameStarted, gameOver])

  // Start and stop game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, gameLoop])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-white text-xl font-bold">Score: {score}</div>

      <div
        className="relative overflow-hidden bg-gray-800 rounded-lg shadow-lg"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onTouchStart={handleTouchStart}
      >
        {/* Road and lane markings */}
        <div className="absolute inset-0 bg-gray-700">
          {Array.from({ length: LANE_COUNT - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-2 bg-yellow-400"
              style={{
                left: (i + 1) * LANE_WIDTH - 1,
                backgroundImage: "linear-gradient(0deg, yellow 50%, transparent 50%)",
                backgroundSize: "20px 40px",
                backgroundRepeat: "repeat-y",
                animation: "moveRoad 0.5s linear infinite",
              }}
            />
          ))}
        </div>

        {/* Game objects */}
        {gameObjects.map((obj) =>
          obj.type === "coin" ? (
            <Coin key={obj.id} lane={obj.lane} y={obj.y} laneWidth={LANE_WIDTH} size={OBJECT_SIZE} />
          ) : (
            <Blocker key={obj.id} lane={obj.lane} y={obj.y} laneWidth={LANE_WIDTH} size={OBJECT_SIZE} />
          ),
        )}

        {/* Player car */}
        <Car lane={carLane} laneWidth={LANE_WIDTH} size={OBJECT_SIZE} />

        {/* Game over overlay */}
        {gameOver && <GameOver score={score} onRestart={startGame} />}

        {/* Start game overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <button
              onClick={startGame}
              className="px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        <p>Use left and right arrow keys to move</p>
        <p>Or tap left/right side of the screen on mobile</p>
      </div>

      <style jsx global>{`
        @keyframes moveRoad {
          from { background-position-y: 0; }
          to { background-position-y: 40px; }
        }
      `}</style>
    </div>
  )
}
