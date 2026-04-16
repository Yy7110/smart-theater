"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeartCursor() {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isOverImage, setIsOverImage] = useState(false);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isOverImage) return;
      const id = Date.now();
      setHearts((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 1000);
    },
    [isOverImage]
  );

  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isImg =
        target.tagName === "IMG" ||
        target.closest("[data-heart-cursor]") !== null;
      setIsOverImage(isImg);
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  useEffect(() => {
    if (isOverImage) {
      document.body.classList.add("cursor-heart");
    } else {
      document.body.classList.remove("cursor-heart");
    }
    return () => document.body.classList.remove("cursor-heart");
  }, [isOverImage]);

  return (
    <AnimatePresence>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ opacity: 1, scale: 0, x: heart.x - 12, y: heart.y - 12 }}
          animate={{ opacity: 0, scale: 1.5, y: heart.y - 60 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed pointer-events-none z-[90]"
          style={{ left: 0, top: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#F43F5E">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
