import React, { useRef, useEffect } from "react";

export function EmiDonut({ principal, interest, principalPercentage }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const total = principal + interest;
    if (!total) return;

    const cx = 75;
    const cy = 75;
    const rO = 72;
    const rI = 50;

    // Principal percentage representation
    const pr = (principal / total) * 2 * Math.PI;
    const start = -Math.PI / 2;

    ctx.clearRect(0, 0, 150, 150);

    // Principal segment (Cyan)
    ctx.beginPath();
    ctx.arc(cx, cy, rO, start, start + pr);
    ctx.arc(cx, cy, rI, start + pr, start, true);
    ctx.closePath();
    ctx.fillStyle = "#22D3EE";
    ctx.fill();

    // Interest segment (Gold)
    ctx.beginPath();
    ctx.arc(cx, cy, rO, start + pr, start + 2 * Math.PI);
    ctx.arc(cx, cy, rI, start + 2 * Math.PI, start + pr, true);
    ctx.closePath();
    ctx.fillStyle = "#D4AF37";
    ctx.fill();
  }, [principal, interest]);

  return (
    <div className="emi-donut-wrap">
      <canvas ref={canvasRef} width="150" height="150"></canvas>
      <div className="emi-donut-center">
        <span className="edc-v">{principalPercentage}%</span>
        <span className="edc-l">Principal</span>
      </div>
    </div>
  );
}

export default EmiDonut;
