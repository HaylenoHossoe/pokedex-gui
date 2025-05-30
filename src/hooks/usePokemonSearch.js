// src/hooks/usePokemonSearch.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const usePokemonSearch = (pokemonName) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false); // Começa como false, pois não há busca inicial
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só faz a busca se pokemonName não estiver vazio
    if (!pokemonName) {
      setPokemon(null); // Limpa o Pokémon se a busca estiver vazia
      setError(null);
      setLoading(false);
      return;
    }

    const fetchPokemon = async () => {
      setLoading(true);
      setError(null);
      try {
        // A API aceita o nome em minúsculas
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}/`);
        setPokemon(response.data);
      } catch (err) {
        console.error("Erro ao buscar Pokémon:", err);
        // Verifica se é um erro 404 (Not Found)
        if (err.response && err.response.status === 404) {
          setError("Pokémon não encontrado. Verifique o nome e tente novamente.");
        } else {
          setError("Não foi possível carregar o Pokémon. Tente novamente mais tarde.");
        }
        setPokemon(null); // Limpa o Pokémon em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonName]); // O efeito é executado sempre que pokemonName mudar

  return { pokemon, loading, error };
};

export default usePokemonSearch;