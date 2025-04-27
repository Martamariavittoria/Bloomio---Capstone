import React, { useEffect, useState, useRef } from 'react';
import ColorThief from 'colorthief';

function ColorPalette({ imageUrl }) {
  const [palette, setPalette] = useState([]);
  const imgRef = useRef();

  useEffect(() => {
    if (!imageUrl) return;

    const img = imgRef.current;
    const colorThief = new ColorThief();

    const handleLoad = () => {
      try {
        const colors = colorThief.getPalette(img, 5); // 5 colori
        setPalette(colors);
      } catch (err) {
        console.error('Errore color-thief:', err);
      }
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, [imageUrl]);

  return (
    <div style={{ marginTop: '10px' }}>
      <img
        src={imageUrl}
        ref={imgRef}
        crossOrigin="anonymous"
        style={{ display: 'none' }}
        alt="source"
      />
      <div style={{ display: 'flex', gap: '6px' }}>
        {palette.map((rgb, index) => {
          const color = `rgb(${rgb.join(',')})`;
          return (
            <div
              key={index}
              style={{
                backgroundColor: color,
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid #ccc',
              }}
              title={color}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ColorPalette;
