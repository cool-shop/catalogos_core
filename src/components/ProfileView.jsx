import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, ShieldAlert, LogOut, ChevronLeft, Plus } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { GOOGLE_DRIVE_CONFIG } from '../config';

const ProfileView = ({ user, setUser, isAdmin, onLogout, onClose, onAdminClick }) => {

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userData = { ...res.data, access_token: tokenResponse.access_token };
                setUser(userData);
                localStorage.setItem('google_user', JSON.stringify(userData));
            } catch (err) {
                console.error('Error fetching user info:', err);
            }
        },
        scope: 'https://www.googleapis.com/auth/drive',
    });

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
                        className="w-10 h-10 bg-cat-light text-cat-contrast rounded-full flex items-center justify-center hover:bg-cat-contrast hover:text-cat-light active:scale-95 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-black text-cat-contrast uppercase tracking-tight">Mi Perfil</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-12">
                <div className="max-w-2xl mx-auto space-y-8">

                    {!user ? (
                        <div className="bg-cat-darkest/50 rounded-[2.5rem] p-10 border border-cat-light/10 flex flex-col items-center text-center shadow-xl">
                            <div className="w-24 h-24 bg-cat-teal-light/10 rounded-full flex items-center justify-center text-cat-teal-light mb-6">
                                <User size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-cat-contrast mb-2 uppercase tracking-tight">Bienvenido</h3>
                            <p className="text-cat-light/70 mb-8 max-w-sm">
                                Inicia sesión con tu cuenta de Google para acceder a funciones personalizadas.
                            </p>
                            <button
                                onClick={() => login()}
                                className="flex items-center gap-3 bg-cat-light border border-cat-light/10 px-8 py-4 rounded-[2rem] hover:bg-cat-contrast hover:text-cat-light hover:border-cat-contrast transition-all active:scale-95 text-cat-dark font-black uppercase tracking-widest text-xs"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                                Entrar con Google
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* User Card */}
                            <div className="bg-cat-darkest/50 rounded-[3rem] p-8 border border-cat-light/10 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cat-contrast/10 rounded-bl-[5rem] -mr-8 -mt-8" />
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-400 shadow-inner mb-6 relative">
                                    <img src={user?.picture} alt={user?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <h3 className="text-2xl font-black text-cat-light mb-1 uppercase">{user?.name}</h3>
                                <div className="flex items-center gap-2 text-cat-light/70 font-medium text-sm">
                                    <Mail size={14} className="opacity-50" />
                                    <span>{user?.email}</span>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-6 mb-2">Configuración y Gestión</p>

                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            onAdminClick();
                                            onClose();
                                        }}
                                        className="w-full bg-cat-contrast/10 p-6 rounded-[2rem] shadow-sm border border-cat-contrast flex items-center justify-between group hover:border-cat-contrast transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4 text-cat-contrast">
                                            <div className="w-12 h-12 bg-cat-contrast/10 rounded-2xl flex items-center justify-center font-bold">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-cat-light text-sm uppercase tracking-tight">Panel Administrador</p>
                                                <p className="text-xs opacity-60">Gestionar productos y catálogo</p>
                                            </div>
                                        </div>
                                    </button>
                                )}

                                <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${isAdmin ? 'bg-green-950/20 border-green-500/30' : 'bg-cat-darkest/50 border-cat-light/10'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-cat-teal-light/10 text-cat-teal-light'}`}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-black text-sm uppercase tracking-tight ${isAdmin ? 'text-green-400' : 'text-cat-contrast'}`}>
                                            {isAdmin ? 'Administrador' : 'Cliente'}
                                        </p>
                                        <p className="text-xs text-cat-light/70">
                                            {isAdmin
                                                ? 'Acceso total para editar y subir productos.'
                                                : 'Acceso al catálogo.'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onLogout();
                                        onClose();
                                    }}
                                    className="w-full bg-cat-darkest/50 p-6 rounded-[2rem] border border-cat-light/10 flex items-center justify-between group hover:bg-red-950/20 hover:border-red-500/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4 text-red-500">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center font-bold">
                                            <LogOut size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm uppercase tracking-tight text-cat-light">Cerrar Sesión</p>
                                            <p className="text-xs text-cat-light/60">Finalizar sesión actual</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 opacity-70">
                                <div className="bg-cat-darkest/50 border border-cat-light/10 rounded-[2rem] p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 mb-1">Sesión activa</p>
                                    <p className="text-xs font-bold text-cat-light">Google Authenticated</p>
                                </div>
                                <div className="bg-cat-darkest/50 border border-cat-light/10 rounded-[2rem] p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 mb-1">App v1.2</p>
                                    <p className="text-xs font-bold text-cat-light uppercase">Pre-release</p>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </motion.div>
    );
};

export default ProfileView;

