"use client";

import { useEffect, useRef, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  el: HTMLDivElement;
}

export function AnimatedCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const posRef   = useRef({ x: -100, y: -100 });
  const ringPos  = useRef({ x: -100, y: -100 });
  const rafRef   = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const counterRef = useRef(0);

  const animate = useCallback(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Dot follows instantly
    dot.style.transform  = `translate(${posRef.current.x - 4}px, ${posRef.current.y - 4}px)`;

    // Ring lags behind with lerp
    ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
    ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
    ring.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY);
    };

    const onEnterLink = () => {
      if (ringRef.current) ringRef.current.style.transform += " scale(1.6)";
      if (ringRef.current) ringRef.current.style.borderColor = "#FF5A5F";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click",     onClick);

    rafRef.current = requestAnimationFrame(animate);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click",     onClick);
      cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = "";
    };
  }, [animate]);

  function createRipple(x: number, y: number) {
    const container = document.getElementById("cursor-ripples");
    if (!container) return;

    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      border: 1.5px solid #FF5A5F;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9998;
      opacity: 0.7;
      transition: none;
    `;
    container.appendChild(el);

    const id = ++counterRef.current;
    ripplesRef.current.push({ id, x, y, el });

    // Animate outward
    let size = 0;
    let opacity = 0.7;
    const step = () => {
      size += 4;
      opacity -= 0.025;
      el.style.width   = `${size}px`;
      el.style.height  = `${size}px`;
      el.style.opacity = String(Math.max(0, opacity));
      if (opacity > 0) {
        requestAnimationFrame(step);
      } else {
        el.remove();
        ripplesRef.current = ripplesRef.current.filter((r) => r.id !== id);
      }
    };
    requestAnimationFrame(step);

    // Second wave — slightly delayed
    setTimeout(() => {
      const el2 = document.createElement("div");
      el2.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 1px solid rgba(255, 90, 95, 0.4);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9997;
        opacity: 0.4;
      `;
      container.appendChild(el2);
      let s2 = 0, o2 = 0.4;
      const step2 = () => {
        s2 += 3;
        o2 -= 0.015;
        el2.style.width   = `${s2}px`;
        el2.style.height  = `${s2}px`;
        el2.style.opacity = String(Math.max(0, o2));
        if (o2 > 0) requestAnimationFrame(step2);
        else el2.remove();
      };
      requestAnimationFrame(step2);
    }, 80);
  }

  return (
    <>
      {/* Ripple container */}
      <div id="cursor-ripples" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9997 }} />

      {/* Outer lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: "50%",
          border: "1.5px solid rgba(255, 90, 95, 0.5)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "border-color 0.2s",
          willChange: "transform",
        }}
      />

      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: "50%",
          backgroundColor: "#FF5A5F",
          pointerEvents: "none",
          zIndex: 10000,
          willChange: "transform",
        }}
      />
    </>
  );
}