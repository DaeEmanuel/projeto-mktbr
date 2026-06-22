export function QRCodeGenerator({ value, size = 84 }: { value: string; size?: number }) {
  const safeValue = value || "https://mktbr.site";
  const cells = 17;
  const cellSize = size / cells;
  const seed = Array.from(safeValue).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  function isDark(row: number, col: number) {
    const finder =
      (row < 5 && col < 5) ||
      (row < 5 && col > cells - 6) ||
      (row > cells - 6 && col < 5);

    if (finder) {
      const localRow = row < 5 ? row : row - (cells - 5);
      const localCol = col < 5 ? col : col - (cells - 5);
      return localRow === 0 || localRow === 4 || localCol === 0 || localCol === 4 || (localRow === 2 && localCol === 2);
    }

    return (row * 7 + col * 11 + seed) % 5 < 2;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR Code">
      <rect width={size} height={size} rx="8" fill="white" />
      {Array.from({ length: cells }).map((_, row) =>
        Array.from({ length: cells }).map((__, col) =>
          isDark(row, col) ? (
            <rect
              key={`${row}-${col}`}
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize * 0.92}
              height={cellSize * 0.92}
              rx="1"
              fill="#061421"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}