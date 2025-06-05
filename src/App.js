// src/App.js
import React, { useState } from 'react';
import usePokemonSearch from './hooks/usePokemonSearch';
import './App.css';

function App() {
  const [inputPokemonName, setInputPokemonName] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(''); // Estado para "disparar" a busca

  // Usa o hook com o nome do Pokémon a ser buscado
  const { pokemon, loading, error } = usePokemonSearch(searchTrigger);

  // Função para lidar com a mudança no campo de input
  const handleInputChange = (event) => {
    setInputPokemonName(event.target.value);
  };

  // Função para lidar com o clique no botão de buscar
  const handleSearchClick = () => {
    setSearchTrigger(inputPokemonName); // Atualiza o gatilho de busca
  };

  // Função para formatar o ID
  const formatPokemonId = (id) => {
    if (!id) return '';
    return String(id).padStart(3, '0');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        {/* Nova imagem do logo */}
        <img
          src="/International_Pokémon_logo.svg.png" // Caminho absoluto para a pasta public
          alt="Pokémon Logo"
          className="pokemon-logo" // Classe para estilização
        />
        <h1>Pokédex Gui</h1>
      </header>

      <main className="pokemon-search-card">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Digite o nome do Pokémon..."
            value={inputPokemonName}
            onChange={handleInputChange}
            className="pokemon-input"
            onKeyPress={(e) => { // Permite buscar ao pressionar Enter
                if (e.key === 'Enter') {
                    handleSearchClick();
                }
            }}
          />
          <button onClick={handleSearchClick} disabled={loading || !inputPokemonName} className="search-button">
            {loading ? 'Buscando...' : 'Buscar Pokémon'}
          </button>
        </div>

        {loading && <p className="status-message">Buscando Pokémon...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && pokemon && (
          <div className="pokemon-display">
            <img
              src={pokemon.sprites.front_default}
//              src={pokemon.sprites.other['official-artwork'].front_default}
              alt={pokemon.name}
              className="pokemon-sprite"
            />
            <h2>{pokemon.name}</h2>
            <p className="pokemon-id">#{formatPokemonId(pokemon.id)}</p>

            {/* NOVOS DADOS - ALTURA E PESO */}
            <div className="pokemon-details-grid">
                <p>
                    <strong>Altura:</strong> {pokemon.height / 10} m
                </p>
                <p>
                    <strong>Peso:</strong> {pokemon.weight / 10} kg
                </p>
            </div>

            <div className="pokemon-types">
              {pokemon.types.map(typeInfo => (
                <span key={typeInfo.type.name} className={`type-badge type-${typeInfo.type.name}`}>
                  {typeInfo.type.name}
                </span>
              ))}
            </div>

            {/* NOVOS DADOS - HABILIDADES */}
            <div className="pokemon-abilities">
                <h3>Habilidades:</h3>
                <ul>
                    {pokemon.abilities.map(abilityInfo => (
                        <li key={abilityInfo.ability.name}>
                            {abilityInfo.ability.name.replace('-', ' ')}
                            {abilityInfo.is_hidden && " (oculta)"}
                        </li>
                    ))}
                </ul>
            </div>

            {/* NOVOS DADOS - ESTATÍSTICAS BASE COM BARRAS */}
            <div className="pokemon-stats">
                <h3>Estatísticas Base:</h3>
                {pokemon.stats.map(statInfo => (
                    <div key={statInfo.stat.name} className="stat-item">
                        <span className="stat-name">{statInfo.stat.name.replace('-', ' ')}:</span>
                        <span className="stat-value">{statInfo.base_stat}</span>
                        <div className="stat-bar-container">
                            <div className="stat-bar-fill" style={{ width: `${(statInfo.base_stat / 255) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {!loading && !error && !pokemon && searchTrigger && (
            <p className="status-message">Nenhum Pokémon encontrado. Digite um nome válido e clique em buscar.</p>
        )}
        {!loading && !error && !pokemon && !searchTrigger && (
            <p className="status-message">Digite o nome de um Pokémon para começar!</p>
        )}
      </main>

      <footer className="app-footer">
        <p>Dados fornecidos pela PokeAPI</p>
        <p>Crédito da marca: Por Nintendo - Transferido de en.wikipedia</p>
            {/* International_Pokémon_logo.svg.png: Por Nintendo - Transferido de en.wikipedia para a wiki Commons. Based on DVD boxart., Domínio público, https://commons.wikimedia.org/w/index.php?curid=16063375 */}
      </footer>
    </div>
  );
}

export default App;