// src/App.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import App from './App';

const mock = new MockAdapter(axios);

describe('App', () => {
  let consoleErrorSpy;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    mock.reset();
  });

  it('deve renderizar o título da Pokédex', () => {
    render(<App />);
    expect(screen.getByText('Pokédex Gui')).toBeInTheDocument();
  });

  it('deve exibir a mensagem inicial de "Digite o nome..."', () => {
    render(<App />);
    expect(screen.getByText('Digite o nome de um Pokémon para começar!')).toBeInTheDocument();
  });

  it('deve buscar e exibir dados de Pokémon quando um nome válido é digitado e o botão é clicado', async () => {
    const mockPokemonData = {
      id: 25,
      name: 'pikachu',
      sprites: { front_default: 'pikachu.png' },
      types: [{ type: { name: 'electric' } }],
      weight: 60, // 6.0 kg na lógica de exibição, mas 6 no output HTML real
      height: 4,  // 0.4 m
      abilities: [{ ability: { name: 'static' }, is_hidden: false }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 35 },
        { stat: { name: 'attack' }, base_stat: 55 },
      ],
    };

    mock.onGet('https://pokeapi.co/api/v2/pokemon/pikachu/').reply(200, mockPokemonData);

    render(<App />);

    const pokemonInput = screen.getByPlaceholderText('Digite o nome do Pokémon...');
    fireEvent.change(pokemonInput, { target: { value: 'pikachu' } });

    const searchButton = screen.getByRole('button', { name: /buscar pokémon/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument();
      expect(screen.getByText('#025')).toBeInTheDocument();
      expect(screen.getByAltText('pikachu')).toHaveAttribute('src', 'pikachu.png');
      expect(screen.getByText('electric')).toBeInTheDocument();

      // Corrigido para Altura e Peso usando uma função de matcher mais robusta
      // que verifica o textContent completo do elemento.
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' &&
               element.textContent.includes('Altura:') &&
               element.textContent.includes('0.4 m');
      })).toBeInTheDocument();

      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' &&
               element.textContent.includes('Peso:') &&
               element.textContent.includes('6 kg');
      })).toBeInTheDocument();

      expect(screen.getByText('static')).toBeInTheDocument();
      expect(screen.getByText('hp:')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('attack:')).toBeInTheDocument();
      expect(screen.getByText('55')).toBeInTheDocument();
    });

    expect(screen.queryByText('Digite o nome de um Pokémon para começar!')).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de Pokémon não encontrado para um nome inválido', async () => {
    mock.onGet('https://pokeapi.co/api/v2/pokemon/nomeinvalido/').reply(404);

    render(<App />);

    const pokemonInput = screen.getByPlaceholderText('Digite o nome do Pokémon...');
    fireEvent.change(pokemonInput, { target: { value: 'nomeinvalido' } });

    const searchButton = screen.getByRole('button', { name: /buscar pokémon/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Pokémon não encontrado. Verifique o nome e tente novamente.')).toBeInTheDocument();
    });

    expect(screen.queryByText('Altura:')).not.toBeInTheDocument();
  });

  it('deve desabilitar o botão de busca quando o input estiver vazio', () => {
    render(<App />);
    const pokemonInput = screen.getByPlaceholderText('Digite o nome do Pokémon...');
    const searchButton = screen.getByRole('button', { name: /buscar pokémon/i });

    fireEvent.change(pokemonInput, { target: { value: '' } });
    expect(searchButton).toBeDisabled();

    fireEvent.change(pokemonInput, { target: { value: 'mew' } });
    expect(searchButton).not.toBeDisabled();
  });

  it('deve exibir "Buscando..." no botão e desabilitá-lo enquanto carrega', async () => {
    const mockPokemonData = {
      id: 1,
      name: 'charmander',
      sprites: { front_default: 'charmander.png' },
      types: [], abilities: [], stats: [],
      weight: 1, height: 1,
    };
    mock.onGet('https://pokeapi.co/api/v2/pokemon/charmander/').replyOnce(200, mockPokemonData);


    render(<App />);

    const pokemonInput = screen.getByPlaceholderText('Digite o nome do Pokémon...');
    fireEvent.change(pokemonInput, { target: { value: 'charmander' } });

    const searchButton = screen.getByRole('button', { name: /buscar pokémon/i });
    fireEvent.click(searchButton);

    expect(screen.getByText('Buscando...')).toBeInTheDocument();
    expect(searchButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Buscando...')).not.toBeInTheDocument();
      expect(searchButton).not.toBeDisabled();
    }, { timeout: 4000 });

    expect(screen.getByText('charmander')).toBeInTheDocument();
  });
});