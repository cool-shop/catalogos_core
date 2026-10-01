import { motion, AnimatePresence } from 'framer-motion';

const HighResLightbox = ({ setIsZoomed, product }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 sm:p-12 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="max-max-w-full max-h-full relative"
            >
                <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="max-h-[85vh] w-auto shadow-2xl rounded-2xl"
                />
                <p className="text-center text-white/40 mt-6 text-sm font-bold uppercase tracking-widest cursor-default">
                    {product.name} • Toca para cerrar
                </p>
            </motion.div>
        </motion.div>
    );
};

export default HighResLightbox;
