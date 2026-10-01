import { motion } from 'framer-motion';
import { APP_CONFIG } from '../config';

const CategoryHeader = ({ user, onBrandClick }) => {
    return (
        <div className="px-6 pt-12 pb-6 mb-6 flex justify-between items-center sm:px-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <img src={APP_CONFIG.LOGO_NOMBRE} alt={APP_CONFIG.NAME} className="w-64 h-16 sm:w-64 sm:h-16 object-contain" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 group cursor-pointer"
            >
                <div
                    onClick={onBrandClick}
                    className="">
                    <img src={APP_CONFIG.LOGO_SM} alt={APP_CONFIG.NAME} className="w-16 h-16 sm:w-24 sm:h-24 rounded-full shadow-xl shadow-black/30 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 object-cover" />
                </div>
            </motion.div>
        </div>
    );
};

export default CategoryHeader;
