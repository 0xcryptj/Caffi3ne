"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence, type Transition } from "motion/react";

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  rotationInterval?: number;
  staggerDuration?: number;
  loop?: boolean;
  mainClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      rotationInterval = 2500,
      staggerDuration = 0.03,
      loop = true,
      mainClassName = "",
      elementLevelClassName = "",
    },
    ref
  ) => {
    const [index, setIndex] = useState(0);

    const splitIntoChars = (text: string) => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(seg.segment(text), (s) => s.segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      const words = texts[index].split(" ");
      return words.map((word, i) => ({
        chars: splitIntoChars(word),
        needsSpace: i !== words.length - 1,
      }));
    }, [texts, index]);

    const totalChars = elements.reduce((s, w) => s + w.chars.length, 0);

    const next = useCallback(() => {
      setIndex((i) => (i === texts.length - 1 ? (loop ? 0 : i) : i + 1));
    }, [texts.length, loop]);

    const previous = useCallback(() => {
      setIndex((i) => (i === 0 ? (loop ? texts.length - 1 : i) : i - 1));
    }, [texts.length, loop]);

    const jumpTo = useCallback(
      (i: number) => setIndex(Math.max(0, Math.min(i, texts.length - 1))),
      [texts.length]
    );

    const reset = useCallback(() => setIndex(0), []);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }));

    useEffect(() => {
      const id = setInterval(next, rotationInterval);
      return () => clearInterval(id);
    }, [next, rotationInterval]);

    let charsSeen = 0;

    return (
      <motion.span
        layout
        transition={transition}
        className={`relative inline-flex flex-wrap whitespace-pre-wrap ${mainClassName}`}
      >
        <span className="sr-only">{texts[index]}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="inline-flex flex-wrap whitespace-pre-wrap"
            aria-hidden
          >
            {elements.map((wordObj, wi) => {
              const wordStart = charsSeen;
              charsSeen += wordObj.chars.length;
              return (
                <span key={wi} className="inline-flex">
                  {wordObj.chars.map((char, ci) => (
                    <motion.span
                      key={ci}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-120%", opacity: 0 }}
                      transition={{
                        ...transition,
                        delay: (wordStart + ci) * staggerDuration,
                      }}
                      className={`inline-block ${elementLevelClassName}`}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordObj.needsSpace && <span>{"\u00A0"}</span>}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  }
);

RotatingText.displayName = "RotatingText";
export { RotatingText };
