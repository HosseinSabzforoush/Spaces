import { useState } from 'react';
import { motion } from 'motion/react';

const colors = [
  { id: 'blue', hex: '#2563eb' },
  { id: 'purple', hex: '#9333ea' },
  { id: 'orange', hex: '#f97316' },
  { id: 'pink', hex: '#db2777' },
  { id: 'teal', hex: '#0d9488' },
];

export default function AccentColorPicker() {
  const [selected, setSelected] = useState('blue');

  return (
    <div className="flex flex-col gap-3">
      <span className="text-text-muted text-xs">Accent Color</span>

      <div
        className="flex gap-5 *:cursor-pointer"
        role="radiogroup">
        {colors.map((color) => (
          <label
            key={color.id}
            className="relative cursor-pointer">
            <input
              type="radio"
              name="accent-color"
              value={color.id}
              checked={selected === color.id}
              onChange={() => setSelected(color.id)}
              className="sr-only"
            />

            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="h-7 w-7 rounded-full"
              style={{ backgroundColor: color.hex }}>
              {selected === color.id && (
                <motion.span
                  layoutId="active-ring"
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 0 2px #1e1e1e, 0 0 0 4px ${color.hex}`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.div>
          </label>
        ))}
      </div>
    </div>
  );
}
