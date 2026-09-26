import React from 'react';

export const PaginationControls = ({ query }) => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-obsidian">
        <span className="text-xs font-mono text-sandstone">
            Page {query.page + 1}
        </span>
        <div className="flex gap-2">
            <button 
                onClick={query.prevPage} 
                disabled={query.page === 0}
                className="px-3 py-1 text-xs font-mono font-bold text-sandstone hover:text-cyan disabled:opacity-50 disabled:hover:text-sandstone transition-colors border border-border hover:border-cyan cursor-pointer"
            >
                {'<'} PREV
            </button>
            <button 
                onClick={query.nextPage} 
                disabled={!query.hasMore}
                className="px-3 py-1 text-xs font-mono font-bold text-sandstone hover:text-cyan disabled:opacity-50 disabled:hover:text-sandstone transition-colors border border-border hover:border-cyan cursor-pointer"
            >
                NEXT {'>'}
            </button>
        </div>
    </div>
);
