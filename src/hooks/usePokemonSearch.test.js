// src/hooks/usePokemonSearch.test.js
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import usePokemonSearch from './usePokemonSearch';

const mock = new MockAdapter(axios);

describe('usePokemonSearch', () => {
  // Mock console.error para evitar que a saída de erro polua o terminal
  // durante os testes de erro esperados (ex: 404).
  let consoleErrorSpy;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore(); // Restaura o console.error original
  });

  afterEach(() => {
    mock.reset(); // Reseta os mocks do axios após cada teste para garantir isolamento
  });

  it('deve retornar null e loading como true inicialmente', () => {
    const { result } = renderHook(() => usePokemonSearch('pikachu'));
    expect(result.current.pokemon).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('deve buscar e retornar dados de Pokémon com sucesso', async () => {
    const mockPokemonData = {
      id: 25,
      name: 'pikachu',
      sprites: { front_default: 'pikachu.png' },
      types: [{ type: { name: 'electric' } }],
      weight: 60,
      height: 4,
      abilities: [{ ability: { name: 'static' }, is_hidden: false }],
      stats: [{ stat: { name: 'hp' }, base_stat: 35 }],
    };

    mock.onGet('https://pokeapi.co/api/v2/pokemon/pikachu/').reply(200, mockPokemonData);

    const { result } = renderHook(() => usePokemonSearch('pikachu'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pokemon).toEqual(mockPokemonData);
    });
  });

  it('deve retornar erro quando a busca falha (ex: Pokémon não encontrado)', async () => {
    mock.onGet('https://pokeapi.co/api/v2/pokemon/naoexiste/').reply(404);

    const { result } = renderHook(() => usePokemonSearch('naoexiste'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.pokemon).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toContain('Pokémon não encontrado'); // Verifica a mensagem de erro específica
    });
  });

  it('não deve buscar se o nome do Pokémon for vazio', async () => {
    // Garante que nenhuma requisição seria feita
    mock.onGet(/.*/).networkErrorOnce(); // Qualquer requisição GET falharia se fosse feita

    const { result } = renderHook(() => usePokemonSearch(''));

    // Espera um curto período para garantir que nenhuma busca foi acionada
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(result.current.loading).toBe(false);
    expect(result.current.pokemon).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mock.history.get.length).toBe(0); // Garante que nenhuma requisição GET foi feita
  });
});