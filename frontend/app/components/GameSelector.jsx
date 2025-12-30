'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function GameSelector({ onGameSelect }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            const data = await api.getAllGames();
            setGames(data.games);
        } catch (error) {
            console.error('Failed to load games:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading games...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game, index) => (
                <div
                    key={game.id}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500"
                    onClick={() => onGameSelect(game)}
                >
                    <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl mr-4">
                            {index + 1}
                        </div>
                        <h3 className="text-xl font-bold">{game.name}</h3>
                    </div>
                    <p className="text-gray-600">{game.description}</p>
                    <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Play Game
                    </button>
                </div>
            ))}
        </div>
    );
}
