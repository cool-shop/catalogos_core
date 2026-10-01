import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';

const RecentlyViewed = ({ items, onClose, onProductSelect }) => {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[150] bg-cat-dark overflow-y-auto flex flex-col"
        >
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center justify-between sm:px-12 bg-cat-darkest/30 backdrop-blur-xl sticky top-0 z-10 border-b border-cat-light/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-cat-light rounded-full flex items-center justify-center text-cat-contrast hover:bg-cat-contrast hover:text-cat-light active:scale-95 transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-black text-cat-contrast uppercase tracking-tight">Vistos recientemente</h2>
                </div>
                {/* <div className="bg-cat-contrast/10 p-2 rounded-xl text-cat-contrast">
                    <Clock size={20} />
                </div> */}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-70 py-20">
                        <div className="w-24 h-24 bg-cat-darkest/50 border border-cat-light/10 rounded-full flex items-center justify-center mb-6 text-cat-contrast">
                            <Clock size={48} />
                        </div>
                        <h3 className="text-xl font-black text-cat-contrast uppercase mb-2">Sin actividad reciente</h3>
                        <p className="text-sm font-medium max-w-[200px] text-cat-light/70">Los productos que visites aparecerán aquí para que no los pierdas de vista.</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-10">
                            <AnimatePresence mode="popLayout">
                                {items.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        setSelectedProduct={onProductSelect}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Hint for the user */}
            {items.length > 0 && (
                <div className="p-6 bg-cat-dark border-t border-cat-light/10 sticky bottom-0">
                    <div className="max-w-2xl mx-auto flex items-center gap-4 bg-cat-darkest/70 border border-cat-teal-light/20 p-4 rounded-3xl">
                        <div className="w-10 h-10 bg-cat-teal-light rounded-2xl flex items-center justify-center text-cat-darkest shrink-0">
                            <ShoppingBag size={18} />
                        </div>
                        <p className="text-xs font-bold text-cat-teal-light leading-tight">
                            ¿Encontraste algo que te gusta? <br />
                            <span className="text-cat-light/60 font-medium">Pulsa el producto para ver detalles y consultar por WhatsApp.</span>
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default RecentlyViewed;
