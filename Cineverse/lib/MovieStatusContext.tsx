import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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
interface MovieStatusMap {
  [movieId: string]: MovieStatus;
}
interface MovieMap {
  [movieId: string]: Movie;
}
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}
export interface Review {
  id?: number;
  movie_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at?: string;
}

interface MovieStatusContextType {
  loading: boolean;
  movieStatus: MovieStatusMap;
  allMovies: Movie[];
  session: Session | null;
  profile: Profile | null;
  signOut: () => void;
  updateAvatar: (imageUri: string) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<boolean>;
  toggleLikeMovie: (movie: Movie) => void;
  toggleDislikeMovie: (movie: Movie) => void;
  toggleSaveMovie: (movie: Movie) => void;
  addReview: (movie: Movie, rating: number, comment: string) => Promise<void>;
  deleteReview: (movieId: number) => Promise<void>;
  getMyReview: (movieId: string) => Promise<Review | null>;
}

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [movieStatus, setMovieStatus] = useState<MovieStatusMap>({});
  const [allMovies, setAllMovies] = useState<MovieMap>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          loadUserData(session);
        } else {
          setMovieStatus({});
          setAllMovies({});
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (session: Session) => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData as Profile);

      const { data: statusData, error: statusError } = await supabase
        .from('movie_status')
        .select('*, movies(*)')
        .eq('user_id', session.user.id);
      
      if (statusError) throw statusError;

      if (statusData) {
        const newStatusMap: MovieStatusMap = {};
        const newMoviesMap: MovieMap = {};
        for (const row of statusData) {
          if (row.movies) {
            // @ts-ignore
            newMoviesMap[row.movie_id] = {
              id: row.movies.id.toString(),
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

  const updateUsername = async (newUsername: string): Promise<boolean> => {
    if (!session) return false;
    if (newUsername.length < 3) {
      Alert.alert('Erro', 'O nome de usuário deve ter pelo menos 3 caracteres.');
      return false;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', session.user.id);

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Nome indisponível', `O usuário "${newUsername}" já está sendo usado.`);
          return false;
        }
        throw error;
      }
      setProfile((prev) => prev ? { ...prev, username: newUsername } : null);
      Alert.alert('Sucesso', 'Nome de usuário atualizado!');
      return true;
    } catch (e: any) {
      console.error('Erro ao atualizar username:', e);
      Alert.alert('Erro', 'Não foi possível atualizar o nome de usuário.');
      return false;
    }
  };

  const updateAvatar = async (imageUri: string) => {
    if (!session || !profile) {
      Alert.alert('Erro', 'Você precisa estar logado para mudar o avatar.');
      return;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `avatar.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!data || !data.publicUrl) throw new Error('Erro na URL pública.');

      const publicUrlWithCacheBust = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrlWithCacheBust,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrlWithCacheBust });
      Alert.alert('Sucesso!', 'Foto de perfil atualizada.');
    } catch (e: any) {
      console.error('Erro ao atualizar avatar:', e.message);
      Alert.alert('Erro no Upload', e.message);
    }
  };

  const addMovieToSupabase = async (movie: Movie) => {
    const movieId = parseInt(movie.id, 10);
    if (isNaN(movieId)) return;
    await supabase.from('movies').upsert({
      id: movieId,
      title: movie.titulo,
      overview: movie.descricao,
      poster_url: movie.posterUrl,
    });
  };

  const saveStatusToSupabase = async (userId: string, movieId: string, newStatus: MovieStatus) => {
    const numericMovieId = parseInt(movieId, 10);
    await supabase.from('movie_status').upsert({
      user_id: userId,
      movie_id: numericMovieId,
      liked: newStatus.liked,
      disliked: newStatus.disliked,
      saved: newStatus.saved,
    });
  };

  const addReview = async (movie: Movie, rating: number, comment: string) => {
    if (!session) return;
    try {
      await addMovieToSupabase(movie);
      const numericMovieId = parseInt(movie.id, 10);
      const { error } = await supabase.from('reviews').upsert({
        user_id: session.user.id,
        movie_id: numericMovieId,
        rating: rating,
        comment: comment,
      }, { onConflict: 'user_id, movie_id' });

      if (error) throw error;
      Alert.alert('Sucesso!', 'Sua avaliação foi salva.');
    } catch (e: any) {
      console.error('Erro ao salvar review:', e);
      Alert.alert('Erro', 'Não foi possível salvar sua avaliação.');
    }
  };

  const deleteReview = async (movieId: number) => {
    if (!session) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('user_id', session.user.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      Alert.alert('Sucesso', 'Review apagado.');
    } catch (e: any) {
      console.error('Erro ao apagar review:', e);
      Alert.alert('Erro', 'Não foi possível apagar o review.');
    }
  };

  const getMyReview = async (movieId: string): Promise<Review | null> => {
    if (!session) return null;
    try {
      const numericMovieId = parseInt(movieId, 10);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('movie_id', numericMovieId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar review:', error);
      }
      return data as Review;
    } catch (e) {
      return null;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
  };

  const handleToggle = async (movie: Movie, updateFn: (status: MovieStatus) => MovieStatus) => {
    if (!session) return;
    await addMovieToSupabase(movie);
    const currentStatus = movieStatus[movie.id] || { liked: false, disliked: false, saved: false };
    const newStatus = updateFn(currentStatus);
    const newStatusMap = { ...movieStatus, [movie.id]: newStatus };
    setMovieStatus(newStatusMap);
    if (!allMovies[movie.id]) {
      setAllMovies({ ...allMovies, [movie.id]: movie });
    }
    await saveStatusToSupabase(session.user.id, movie.id, newStatus);
  };
  const toggleLikeMovie = (movie: Movie) => { handleToggle(movie, (status) => ({ ...status, liked: !status.liked, disliked: false })); };
  const toggleDislikeMovie = (movie: Movie) => { handleToggle(movie, (status) => ({ ...status, liked: false, disliked: !status.disliked })); };
  const toggleSaveMovie = (movie: Movie) => { handleToggle(movie, (status) => ({ ...status, saved: !status.saved })); };

  const value = {
    loading,
    session,
    profile,
    signOut,
    updateAvatar,
    updateUsername,
    addReview,
    deleteReview,
    getMyReview,
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