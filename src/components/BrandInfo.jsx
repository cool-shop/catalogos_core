import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Target, Star } from 'lucide-react';
import { SiFacebook, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import { APP_CONFIG, BRAND_TEXTS } from '../config';

const BrandInfo = ({ onClose }) => {
    const about = BRAND_TEXTS.ABOUT;
    const icons = [Heart, Target, Star];
    const iconColors = ['text-[#FF0000]', 'text-blue-500', 'text-yellow-500'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-cat-dark overflow-y-auto"
        >
            {/* Elegant Header */}
            <div className="sticky top-0 z-20 bg-cat-darkest/30 backdrop-blur-xl px-6 py-6 sm:px-12 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-12 h-12 bg-cat-light text-cat-contrast rounded-full flex items-center justify-center hover:bg-cat-contrast hover:text-cat-light active:scale-95 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <img src={APP_CONFIG.LOGO_NOMBRE} alt={APP_CONFIG.NAME} className="w-60 h-auto flex items-center justify-center mx-auto transform" />
                <div className="w-12" /> {/* Spacer for centering */}
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 sm:px-12">

                {/* Hero Section */}
                <div className="relative rounded-[3rem] overflow-hidden bg-cat-darkest/85 p-12 mb-16 text-center">
                    <div className="relative z-10">
                        <div className="">
                            <img src={APP_CONFIG.LOGO} alt={APP_CONFIG.NAME} className="sm:w-48 sm:h-48 w-48 h-48 rounded-[8rem] flex items-center justify-center text-white shadow-2xl shadow-cat-dark/50 mx-auto mb-8 transform" />
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black text-cat-contrast mb-6 uppercase leading-tight">{about.title}</h1>
                        <p className="text-lg text-cat-light max-w-2xl mx-auto leading-relaxed font-medium">
                            {about.subtitle}
                        </p>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -top-10 -right-10 w-60 h-60 bg-cat-dark rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cat-contrast/50 rounded-full blur-3xl" />
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {about.cards.map((card, idx) => {
                        const IconComponent = icons[idx % icons.length];
                        const iconColor = iconColors[idx % iconColors.length];
                        return (
                            <div key={idx} className="bg-cat-darkest/50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className={`w-16 h-16 bg-cat-light mx-auto ${iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <IconComponent size={32} />
                                </div>
                                <h3 className="text-xl font-black text-cat-contrast mb-3 uppercase text-center">{card.title}</h3>
                                <p className="text-cat-light/80 text-sm leading-relaxed text-justify">{card.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Content Section */}
                <div className="space-y-16">
                    <section>
                        <h2 className="text-3xl font-black text-cat-contrast mb-8 uppercase flex items-center gap-4">
                            <span className="w-12 h-1 bg-cat-contrast rounded-full" /> {about.passionTitle}
                        </h2>
                        <div className="prose prose-lg text-cat-light/70 font-medium leading-relaxed max-w-none">
                            {about.passionParagraphs.map((pText, i) => (
                                <p key={i} className={i > 0 ? "mt-4" : ""}>{pText}</p>
                            ))}
                        </div>
                    </section>

                    {/* Social links / Contact */}
                    <section className="bg-cat-contrast/80 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-black text-center uppercase tracking-tighter mb-2">{BRAND_TEXTS.HERO.title}</h2>
                            <p className="text-white/60 font-medium text-center">{BRAND_TEXTS.HERO.subtitle}</p>
                        </div>
                        <div className="flex gap-4">
                            {import.meta.env.VITE_WHATSAPP_NUMBER && <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-darkest/10 hover:bg-cat-darkest/20 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                                <SiWhatsapp size={32} />
                            </a>}
                            {import.meta.env.VITE_INSTAGRAM_PAGE && <a href={`https://instagram.com/${import.meta.env.VITE_INSTAGRAM_PAGE}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-darkest/10 hover:bg-cat-darkest/20 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                                <SiInstagram size={32} />
                            </a>}
                            {import.meta.env.VITE_FACEBOOK_PAGE && <a href={`https://facebook.com/${import.meta.env.VITE_FACEBOOK_PAGE}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-darkest/10 hover:bg-cat-darkest/20 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                                <SiFacebook size={32} />
                            </a>}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-24 text-center pb-12">
                    <p className="text-slate-400 text-xs text-center font-black uppercase tracking-[0.5em] mb-4">{about.footerSlogan}</p>
                    <p className="text-cat-dark text-sm text-center font-bold">{about.copyright}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default BrandInfo;
