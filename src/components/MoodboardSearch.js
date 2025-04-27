import React, { useState } from 'react';
import './MoodboardSearch.css';

const API_KEY = '49878136-6cd38103c6418066eca0a715e';

function MoodboardSearch({ onSaveComplete }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    try {
      const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=12`);
      const data = await res.json();
      setResults(data.hits);
    } catch (error) {
      console.error('❌ Errore ricerca Pixabay:', error);
    }
  };

  const handleSave = async (image) => {
    try {
      const res = await fetch('http://localhost:3317/moodboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          imageUrl: image.webformatURL,
          tags: image.tags
        })
      });
      const data = await res.json();
      console.log('✅ Immagine salvata:', data);

      if (onSaveComplete) onSaveComplete(); // 💥 chiamata di aggiornamento
    } catch (error) {
      console.error('❌ Errore salvataggio immagine:', error);
    }
  };

  return (
    <div className="moodboard-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Cerca immagini (es. oceano)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">🔍 Cerca</button>
      </form>

      <div className="results-grid">
        {results.map((img) => (
          <div key={img.id} className="result-card">
            <img src={img.webformatURL} alt={img.tags} />
            <button onClick={() => handleSave(img)}>💾 Salva</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoodboardSearch;
