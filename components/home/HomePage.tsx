"use client";

import { FallingObject } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import PixelApple from "@/assets/icons/pixel-apple.png";
import PixelBomb from "@/assets/icons/pixel-bomb.png";
import PixelSnowflake from "@/assets/icons/pixel-snowflake.png";

const HomePage = () => {
  const [objects, setObjects] = useState<Array<FallingObject>>([]);
  const [falling, setFalling] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30); // Timer set to 30 seconds
  const [marks, setMarks] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Generate a new object with random properties
  const generateObject = useCallback(
    ({
      isBomb,
      isSnow,
    }: {
      isBomb: boolean;
      isSnow: boolean;
    }): FallingObject => {
      const randomFromOneToThree = Math.floor(Math.random() * 3) + 1;
      return {
        id: Date.now(), // Unique id based on time
        position: 0, // Starting at the top
        left: Math.random() * 90, // Random horizontal position (0-90% of the screen)
        velocity: Math.random() * 7 + 3, // Random velocity from 3 to 7 for variation
        display: true,
        sizeAndMark: randomFromOneToThree,
        isBomb: isBomb,
        isSnow: isSnow,
      };
    },
    []
  );

  // Timer for 30 seconds and stopping the object generation after time ends
  useEffect(() => {
    if (falling && timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setFalling(false); // Stop falling when time ends
      setObjects([]); // No objects when stop
    }
  }, [falling, timeLeft, isPaused]);

  // const animationInterval = useRef<ReturnType<typeof requestAnimationFrame>>(0);

  // const moveObjects = useCallback(() => {
  //   setObjects((prevObjects) =>
  //     prevObjects
  //       .map((obj) =>
  //         obj.position < window.innerHeight - 100
  //           ? {
  //               ...obj,
  //               position: obj.position + obj.velocity,
  //             }
  //           : { ...obj, display: false }
  //       )
  //       ?.filter((obj) => obj.display)
  //   );

  //   animationInterval.current = requestAnimationFrame(moveObjects);
  // }, []);

  // Handle the falling animation for each object and generate new objects over time
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let objectGenerationInterval: ReturnType<typeof setInterval>;

    if (falling && timeLeft > 0 && !isPaused) {
      // Create a new object every half second
      objectGenerationInterval = setInterval(() => {
        setObjects((prevObjects) => [
          ...prevObjects,
          generateObject({
            isBomb: timeLeft < 30 && timeLeft % 6 === 0,
            isSnow: timeLeft < 30 && timeLeft % 10 === 0,
          }),
        ]);
      }, 500);

      // Update the position of each object
      intervalId = setInterval(() => {
        setObjects((prevObjects) =>
          prevObjects
            .map((obj) =>
              obj.position < window.innerHeight - 100
                ? { ...obj, position: obj.position + obj.velocity }
                : { ...obj, display: false }
            )
            ?.filter((obj) => obj.display)
        );
      }, 100);
      // animationInterval.current = requestAnimationFrame(moveObjects);
    }

    return () => {
      clearInterval(intervalId);
      clearInterval(objectGenerationInterval);
      // cancelAnimationFrame(animationInterval.current);
    };
  }, [falling, timeLeft, generateObject, isPaused]);

  const startFalling = () => {
    setFalling(true);
    setTimeLeft(30); // Reset timer to 30 seconds on start
    setObjects([]); // Reset the object array
    setMarks(0); // Reset marks
  };

  const handleClickObject = (id: number) => {
    setObjects((prevObjects) => prevObjects.filter((obj) => obj.id !== id));
  };

  return (
    <div className="w-full h-[100vh] overflow-hidden bg-blue-200">
      <h1>Time Left: {timeLeft}s</h1>
      <h1>Marks: {marks}</h1>
      {objects.map((obj) => (
        <div
          key={obj.id}
          className={`absolute transition-all duration-100 ease-linear cursor-pointer ${
            (obj.isBomb || obj.isSnow) && "animate-slow-spin"
          }`}
          style={{
            top: `${obj.position}px`,
            left: `${obj.left}vw`,
          }}
          onClick={() => {
            handleClickObject(obj.id);
            if (!obj.isSnow) {
              setMarks(
                (prevMark) => prevMark + (obj.isBomb ? -10 : obj.sizeAndMark)
              );
            }

            if (obj.isSnow) {
              setIsPaused(true);
              if (!isPaused) {
                setTimeout(() => {
                  setIsPaused(false);
                }, 3000);
              }
            }
          }}
        >
          <Image
            src={
              obj.isBomb ? PixelBomb : obj.isSnow ? PixelSnowflake : PixelApple
            }
            width={obj.sizeAndMark * 30}
            height={obj.sizeAndMark * 30}
            alt="Pixel"
          />
        </div>
      ))}
      {!falling && <button onClick={startFalling}>Start Falling</button>}
    </div>
  );
};

export default HomePage;
