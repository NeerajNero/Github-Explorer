'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

// Repository type
type Repository = {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
};

// Fetch function for repos
const fetchRepos = async (username: string): Promise<Repository[]> => {
  const { data } = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
  return data;
};

// Simulated mutation function for favorites
const addFavoriteRepo = async (repo: Repository): Promise<Repository> => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Shorter delay
  console.log(`Faking API call to add ${repo.name} to favorites!`);
  return repo;
};

export default function Home() {
  const [username, setUsername] = useState<string>('tanstack');
  const [favorites, setFavorites] = useState<Repository[]>([]);

  const { data, error, isLoading, isFetching } = useQuery<Repository[]>({
    queryKey: ['githubRepos', username],
    queryFn: () => fetchRepos(username),
    enabled: !!username,
  });

  const mutation = useMutation({
    mutationFn: addFavoriteRepo,
    onSuccess: (savedRepo) => {
      // Add to favorites only if it's not already there
      if (!favorites.find(fav => fav.id === savedRepo.id)) {
        setFavorites((prevFavorites) => [...prevFavorites, savedRepo]);
      }
    },
  });

  return (
    <main className="bg-gray-900 text-white min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">GitHub Explorer</h1>
          <p className="text-gray-400 mb-6">Enter a GitHub username to see their latest repositories.</p>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., facebook"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          <div className="mt-6">
            {isFetching && !isLoading && <p className="text-sm text-gray-500">Looking for repositories...</p>}
            {isLoading && <p className="text-center text-gray-400 mt-8">Loading data...</p>}
            {error && <p className="text-center text-red-400 mt-8">An error occurred: {error.message}</p>}

            <ul className="space-y-4 mt-4">
              {data?.map((repo) => (
                <li key={repo.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 transition hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-400 hover:underline">
                        {repo.name}
                      </a>
                      <p className="text-sm text-gray-400">⭐ {repo.stargazers_count.toLocaleString()}</p>
                      <p className="mt-2 text-gray-300">{repo.description ?? 'No description'}</p>
                    </div>
                    <button
                      onClick={() => mutation.mutate(repo)}
                      disabled={mutation.isPending}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {mutation.isPending ? 'Adding...' : 'Favorite'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Favorites Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-800/50 p-6 rounded-lg h-fit sticky top-8">
          <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-4">Favorites</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400">Your favorite repos will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {favorites.map((fav) => (
                <li key={fav.id} className="bg-gray-700 p-2 rounded-md text-sm truncate">
                  <a href={fav.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{fav.name}</a>
                </li>
              ))}
            </ul>
          )}
        </aside>

      </div>
    </main>
  );
}