import { ChevronRight } from 'lucide-react';
import { GOOGLE_DRIVE_CONFIG } from '../config';

const CategoryGrid = ({ activeCategory, setActiveCategory }) => {
    return (
        <div className="px-6 mb-12 sm:px-12">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-cat-light text-xl sm:text-3xl tracking-tight">Categorías</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {GOOGLE_DRIVE_CONFIG.FOLDERS.map((folder) => {
                    const isActive = activeCategory.id === folder.id && activeCategory.name === folder.name;
                    return (
                        <button
                            key={`${folder.id}-${folder.name}`}
                            onClick={() => setActiveCategory(folder)}
                            className={`relative aspect-[3/3] w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-md ${isActive ? 'ring-4 ring-cat-contrast ring-offset-4 ring-offset-cat-dark scale-95 shadow-xl opacity-100' : 'opacity-80 grayscale-[20%] hover:opacity-100 hover:grayscale-0'
                                }`}
                        >
                            <img
                                src={folder.image}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={folder.name}
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-cat-dark/80 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
                                <span className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                                    {folder.name}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryGrid;
