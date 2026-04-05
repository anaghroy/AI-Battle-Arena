import React, { useState, useEffect } from 'react';
import { Search, Code, Image as ImageIcon, Video, Archive, Swords, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { battleService } from '../services/battle.service';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await battleService.searchChats(query, category);
                setResults(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query, category]);

    const categories = [
        { id: 'battles', label: 'Battles', icon: <Swords size={16} /> },
        { id: 'search', label: 'Search', icon: <Search size={16} /> },
        { id: 'code', label: 'Code', icon: <Code size={16} /> },
        { id: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
        { id: 'video', label: 'Video', icon: <Video size={16} /> },
        { id: 'archived', label: 'Archived', icon: <Archive size={16} /> },
    ];

    const groupChatsByDate = (chats) => {
        const groups = { Today: [], Yesterday: [], 'Previous 7 Days': [], Older: [] };
        if (!chats) return groups;
        
        const now = new Date();
        const todayStr = now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        chats.forEach(chat => {
            const chatDate = new Date(chat.updatedAt);
            if (chatDate.toDateString() === todayStr) {
                groups.Today.push(chat);
            } else if (chatDate.toDateString() === yesterdayStr) {
                groups.Yesterday.push(chat);
            } else if (chatDate > sevenDaysAgo) {
                groups['Previous 7 Days'].push(chat);
            } else {
                groups.Older.push(chat);
            }
        });
        return groups;
    };

    const groupedResults = groupChatsByDate(results);

    return (
        <div style={{ padding: '40px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                <input 
                    type="text" 
                    placeholder="Search your chats..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-inter-regular)',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: category === cat.id ? 'var(--bg-secondary)' : 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: category === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-inter-regular)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {Object.entries(groupedResults).map(([groupName, chats]) => {
                    if (chats.length === 0) return null;
                    return (
                        <div key={groupName}>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', fontFamily: 'var(--font-inter-regular)', fontWeight: 'normal' }}>
                                {groupName}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {chats.map(chat => (
                                    <div 
                                        key={chat._id}
                                        onClick={() => {
                                            // Depending on how you manage active chat vs page routes
                                            navigate(`/c/${chat._id}`);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            <MessageSquare size={16} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-inter-bold)', fontSize: '0.95rem' }}>
                                                {chat.title}
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-inter-regular)' }}>
                                                Last message {groupName}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {!loading && results.length === 0 && (
                     <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px', fontFamily: 'var(--font-inter-regular)' }}>
                         No chats found.
                     </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
