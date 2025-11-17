import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
// --- ESTA É A CORREÇÃO ---
import AsyncStorage from '@react-native-async-storage/async-storage';
// --- FIM DA CORREÇÃO ---

// --- Tipos ---
interface Movie {
  id: string; // O ID do TMDB é uma string no nosso app
  titulo: string;
  descricao: string;
  posterUrl: string;
}
interface MovieStatus {
  liked: boolean;
  disliked: boolean;
  saved: boolean;
}
interface MovieStatusMap {
  [movieId: string]: MovieStatus;
}
interface MovieMap {
  [movieId: string]: Movie;
}
interface MovieStatusContextType {
  loading: boolean;
  movieStatus: MovieStatusMap;
  allMovies: Movie[];
  session: Session | null;
  signOut: () => void;
  toggleLikeMovie: (movie: Movie) => void;
  toggleDislikeMovie: (movie: Movie) => void;
  toggleSaveMovie: (movie: Movie) => void;
}

// --- FIM DOS TIPOS ---

const MovieStatusContext = createContext<MovieStatusContextType | undefined>(
  undefined
);

export const useMovieStatus = () => {
  const context = useContext(MovieStatusContext);
  if (!context) {
    throw new Error(
      'useMovieStatus deve ser usado dentro de um MovieStatusProvider'
    );
  }
  return context;
};

export const MovieStatusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [movieStatus, setMovieStatus] = useState<MovieStatusMap>({});
  const [allMovies, setAllMovies] = useState<MovieMap>({});

  // --- EFEITO PRINCIPAL (Ouve o Login/Logout) ---
  useEffect(() => {
    // 1. Pega a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Se JÁ ESTÁ logado, carrega os dados
        loadDataFromSupabase(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Ouve mudanças (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          // Acabou de logar, carrega os dados
          loadDataFromSupabase(session.user.id);
        } else {
          // Acabou de deslogar, limpa os dados
          setMovieStatus({});
          setAllMovies({});
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- FUNÇÃO 1: CARREGAR DADOS DO SUPABASE ---
  const loadDataFromSupabase = async (userId: string) => {
    setLoading(true);
    try {
      // Pega todos os status E os detalhes dos filmes associados
      const { data, error } = await supabase
        .from('movie_status')
        .select('*, movies(*)') // Isso é um JOIN!
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const newStatusMap: MovieStatusMap = {};
        const newMoviesMap: MovieMap = {};

        // Processa os dados que vieram do banco
        for (const row of data) {
          if (row.movies) { // O Supabase nos dá o objeto 'movies'
            // @ts-ignore
            newMoviesMap[row.movie_id] = {
              id: row.movies.id.toString(), // O ID do banco é BIGINT, convertemos
              titulo: row.movies.title,
              descricao: row.movies.overview,
              posterUrl: row.movies.poster_url,
            };
          }
          newStatusMap[row.movie_id] = {
            liked: row.liked || false,
            disliked: row.disliked || false,
            saved: row.saved || false,
          };
        }
        
        setMovieStatus(newStatusMap);
        setAllMovies(newMoviesMap);
      }
    } catch (e) {
      console.error('Falha ao carregar dados do Supabase', e);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO 2: SALVAR O FILME NA TABELA 'movies' ---
  // (Usa 'upsert' para não salvar filmes duplicados)
  const addMovieToSupabase = async (movie: Movie) => {
    // A tabela 'movies' espera um 'id' (BIGINT)
    const movieId = parseInt(movie.id, 10);
    if (isNaN(movieId)) return; // Não salva se o ID for inválido
    
    // 'upsert' = (UPDATE or INSERT)
    await supabase.from('movies').upsert({
      id: movieId,
      title: movie.titulo,
      overview: movie.descricao,
      poster_url: movie.posterUrl,
    });
  };

  // --- FUNÇÃO 3: SALVAR O STATUS NA TABELA 'movie_status' ---
  const saveStatusToSupabase = async (
    userId: string,
    movieId: string,
    newStatus: MovieStatus
  ) => {
    const numericMovieId = parseInt(movieId, 10);
    
    await supabase.from('movie_status').upsert({
      user_id: userId,
      movie_id: numericMovieId,
      liked: newStatus.liked,
      disliked: newStatus.disliked,
      saved: newStatus.saved,
    });
  };

  // --- FUNÇÃO DE LOGOUT ---
  const signOut = async () => {
    await supabase.auth.signOut();
    // Limpar o AsyncStorage é uma boa prática
    await AsyncStorage.clear();
  };

  // --- FUNÇÕES DE TOGGLE (ATUALIZADAS) ---
  
  // Função genérica para lidar com o clique
  const handleToggle = async (
    movie: Movie,
    updateFn: (status: MovieStatus) => MovieStatus
  ) => {
    if (!session) return; // Não faz nada se está deslogado
    
    // 1. Salva o filme na tabela 'movies' (ignora se já existe)
    await addMovieToSupabase(movie);

    // 2. Atualiza o estado local IMEDIATAMENTE (UI rápida)
    const currentStatus = movieStatus[movie.id] || { liked: false, disliked: false, saved: false };
    const newStatus = updateFn(currentStatus);
    
    const newStatusMap = {
      ...movieStatus,
      [movie.id]: newStatus,
    };
    
    // Atualiza o estado local (filmes e status)
    setMovieStatus(newStatusMap);
    if (!allMovies[movie.id]) {
      setAllMovies({ ...allMovies, [movie.id]: movie });
    }

    // 3. Salva o novo status no Supabase (em segundo plano)
    await saveStatusToSupabase(session.user.id, movie.id, newStatus);
  };

  // As 3 funções de toggle agora usam o 'handleToggle'
  const toggleLikeMovie = (movie: Movie) => {
    handleToggle(movie, (status) => ({
      ...status,
      liked: !status.liked,
      disliked: false, // Regra de negócio: Like desliga o Dislike
    }));
  };

  const toggleDislikeMovie = (movie: Movie) => {
    handleToggle(movie, (status) => ({
      ...status,
      liked: false, // Regra de negócio: Dislike desliga o Like
      disliked: !status.disliked,
    }));
  };

  const toggleSaveMovie = (movie: Movie) => {
    handleToggle(movie, (status) => ({
      ...status,
      saved: !status.saved,
    }));
  };

  // --- Valor do Contexto ---
  const value = {
    loading,
    session,
    signOut,
    movieStatus,
    allMovies: Object.values(allMovies),
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