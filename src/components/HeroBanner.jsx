import { SiFacebook, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';
import { BANNER_CONFIG, BRAND_TEXTS } from '../config';

const HeroBanner = ({ onActionClick }) => {
    return (
        <div className="px-6 mb-8 sm:px-12">
            <div className="bg-cat-contrast/30 rounded-[2.5rem] p-8 flex items-center relative overflow-hidden h-80 sm:h-64 shadow-lg shadow-black/30">
                <div className="z-10 w-2/3 md:w-3/5">
                    <div className="py-5">
                        <h3 className="text-cat-light text-xl font-black mb-0 leading-tight sm:text-4xl text-center">
                            {BRAND_TEXTS.HERO.title}
                        </h3>
                        <p className="text-white/60 font-medium text-center">{BRAND_TEXTS.HERO.subtitle}</p>
                    </div>
                    <div className="flex gap-4 mx-auto justify-evenly">
                        {import.meta.env.VITE_WHATSAPP_NUMBER && <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-contrast/70 hover:bg-cat-contrast rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                            <SiWhatsapp size={32} />
                        </a>}
                        {import.meta.env.VITE_INSTAGRAM_PAGE && <a href={`https://instagram.com/${import.meta.env.VITE_INSTAGRAM_PAGE}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-contrast/70 hover:bg-cat-contrast rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                            <SiInstagram size={32} />
                        </a>}
                        {import.meta.env.VITE_FACEBOOK_PAGE && <a href={`https://facebook.com/${import.meta.env.VITE_FACEBOOK_PAGE}`} target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-cat-contrast/70 hover:bg-cat-contrast rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                            <SiFacebook size={32} />
                        </a>}
                    </div>
                </div>


                <img
                    src={BANNER_CONFIG.HERO_IMAGE}
                    className="absolute -right-4 w-60 h-60 object-contain rotate-12 sm:w-80 sm:h-80 sm:right-10"
                    alt="Hero product"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>
    );
};

export default HeroBanner;
