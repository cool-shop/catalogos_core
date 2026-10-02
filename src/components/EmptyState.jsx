import { APP_CONFIG } from '../../../config';

const EmptyState = () => {
    return (
        <div className="text-center py-32 bg-cat-darkest/50 rounded-[3rem] border-1 border-cat-light/50 w-full">
            <img src={APP_CONFIG.LOGO_ROTO} className="mx-auto mb-6" alt="Logo Roto" width={192} height={192} />
            <h3 className="text-xl font-bold text-cat-contrast">Sin productos disponibles</h3>
            <p className="text-cat-contrast/80 font-medium">Intenta con otra categoría o término.</p>
        </div>
    );
};

export default EmptyState;
