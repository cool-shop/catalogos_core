const LoadingSpinner = ({ fullPage = false, message = "Cargando..." }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullPage ? 'py-32' : 'py-10'}`}>
            <div className="w-14 h-14 border-4 border-cat-teal-light/10 border-t-cat-teal-dark rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-bold animate-pulse">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
