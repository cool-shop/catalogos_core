import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = React.forwardRef(({ searchTerm, setSearchTerm, activeCategory }, ref) => {
    return (
        <div className="px-6 sm:px-12 ">
            <div className="relative ">
                <Search className="text-cat-contrast/50 absolute left-5 top-1/2 -translate-y-1/2" size={20} />
                <input
                    ref={ref}
                    type="text"
                    placeholder={`Buscar en categoría: ${activeCategory.name}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-cat-darkest/50 rounded-[2rem] py-5 pl-14 pr-6 text-cat-contrast placeholder:text-cat-contrast/60 main-text shadow-sm focus:outline-none focus:ring-4 focus:ring-cat-dark/50 focus:border-cat-contrast/50 transition-all font-medium text-lg border border-cat-light/50"
                />
            </div>
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
