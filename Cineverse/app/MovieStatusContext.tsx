import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Tipos ---
interface Movie {
  id: string;
  titulo: string;
  descricao: string;
  posterUrl: string;
}

interface MovieStatus {
  liked: boolean;
  disliked: boolean;
  saved: boolean;
}

// Mapa de status, onde a chave é o ID do filme
interface MovieStatusMap {
  [movieId: string]: MovieStatus;
}

// Mapa de filmes, onde a chave é o ID do filme
interface MovieMap {
  [movieId: string]: Movie;
}

interface MovieStatusContextType {
  loading: boolean;
  movieStatus: MovieStatusMap; // Status de todos os filmes (like, dislike, save)
  allMovies: Movie[]; // Uma lista de todos os filmes que já vimos
  toggleLikeMovie: (movie: Movie) => void;
  toggleDislikeMovie: (movie: Movie) => void;
  toggleSaveMovie: (movie: Movie) => void;
}

// --- Chaves do AsyncStorage ---
const STATUS_KEY = '@Cineverse:movieStatus';
const MOVIES_KEY = '@Cineverse:allMovies';

// --- Contexto ---
const MovieStatusContext = createContext<MovieStatusContextType | undefined>(
  undefined
);

// --- Hook Customizado ---
export const useMovieStatus = () => {
  const context = useContext(MovieStatusContext);
  if (!context) {
    throw new Error(
      'useMovieStatus deve ser usado dentro de um MovieStatusProvider'
    );
  }
  return context;
};

// --- Provider ---
export const MovieStatusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [movieStatus, setMovieStatus] = useState<MovieStatusMap>({});
  const [allMovies, setAllMovies] = useState<MovieMap>({}); // Usamos mapa para evitar duplicatas

  // Efeito para carregar dados do AsyncStorage na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusData, moviesData] = await Promise.all([
          AsyncStorage.getItem(STATUS_KEY),
          AsyncStorage.getItem(MOVIES_KEY),
        ]);

        if (statusData) setMovieStatus(JSON.parse(statusData));
        if (moviesData) setAllMovies(JSON.parse(moviesData));
      } catch (e) {
        console.error('Falha ao carregar dados do AsyncStorage', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Função genérica para salvar no AsyncStorage
  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Falha ao salvar dados no AsyncStorage', e);
    }
  };

  // Função para adicionar ou atualizar um filme na nossa lista total
  const addMovieToMap = (movie: Movie) => {
    if (allMovies[movie.id]) return; // Não faz nada se já existe

    const newMoviesMap = { ...allMovies, [movie.id]: movie };
    setAllMovies(newMoviesMap);
    saveData(MOVIES_KEY, newMoviesMap);
  };

  // --- Funções de Toggle ---

  const toggleLikeMovie = (movie: Movie) => {
    addMovieToMap(movie); // Garante que o filme está na lista
    const currentStatus = movieStatus[movie.id] || {
      liked: false,
      disliked: false,
      saved: false,
    };
    const newStatusMap = {
      ...movieStatus,
      [movie.id]: {
        ...currentStatus,
        liked: !currentStatus.liked, // Inverte o like
        disliked: false, // Desliga o dislike se ligar o like
      },
    };
    setMovieStatus(newStatusMap);
    saveData(STATUS_KEY, newStatusMap);
  };

  const toggleDislikeMovie = (movie: Movie) => {
    addMovieToMap(movie);
    const currentStatus = movieStatus[movie.id] || {
      liked: false,
      disliked: false,
      saved: false,
    };
    const newStatusMap = {
      ...movieStatus,
      [movie.id]: {
        ...currentStatus,
        liked: false, // Desliga o like se ligar o dislike
        disliked: !currentStatus.disliked, // Inverte o dislike
      },
    };
    setMovieStatus(newStatusMap);
    saveData(STATUS_KEY, newStatusMap);
  };

  const toggleSaveMovie = (movie: Movie) => {
    addMovieToMap(movie);
    const currentStatus = movieStatus[movie.id] || {
      liked: false,
      disliked: false,
      saved: false,
    };
    const newStatusMap = {
      ...movieStatus,
      [movie.id]: {
        ...currentStatus,
        saved: !currentStatus.saved, // Inverte o save
      },
    };
    setMovieStatus(newStatusMap);
    saveData(STATUS_KEY, newStatusMap);
  };

  const value = {
    loading,
    movieStatus,
    allMovies: Object.values(allMovies), // Transforma o mapa em array para as telas
    toggleLikeMovie,
    toggleDislikeMovie,
    toggleSaveMovie,
  };

  return (
    <MovieStatusContext.Provider value={value}>
      {children}
    </MovieStatusContext.Provider>
  );
};