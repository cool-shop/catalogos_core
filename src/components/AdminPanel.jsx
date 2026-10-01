import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Upload,
    Edit,
    Plus,
    Trash2,
    Save,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { GOOGLE_DRIVE_CONFIG } from '../config';
import { fetchFolderFiles, uploadFileToDrive, updateFileMetadata, deleteFileFromDrive } from '../services/googleDrive';
import { parseDescription } from '../utils/helpers';

const AdminPanel = ({ user, onClose, initialProductToEdit }) => {
    const [mode, setMode] = useState('list'); // 'list' or 'upload' or 'edit'
    const [selectedFolder, setSelectedFolder] = useState(GOOGLE_DRIVE_CONFIG.FOLDERS.find(f => !['all', 'latest'].includes(f.id)));
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    // Form states
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        variants: [{ name: '', price: '' }],
        file: null,
        categoryId: '',
        fileUrl: ''
    });

    const folders = GOOGLE_DRIVE_CONFIG.FOLDERS.filter(f => !['all', 'latest'].includes(f.id));

    useEffect(() => {
        if (mode === 'list' && selectedFolder) {
            loadFolderProducts();
        }
    }, [mode, selectedFolder]);

    const loadFolderProducts = async () => {
        setLoading(true);
        try {
            const result = await fetchFolderFiles(selectedFolder.id, null, 100);
            setProducts(result.files);
        } catch (err) {
            console.error(err);
            showMsg('error', 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleAddVariant = () => {
        setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '' }] });
    };

    const handleRemoveVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const buildFullDescription = () => {
        const { title = '', description = '', variants = [], fileUrl = '' } = formData;

        // 1. Mapeamos las variantes al nuevo formato [{"Nombre": Precio}]
        const formattedVariants = variants
            .filter(v => v.name && v.price !== undefined && v.price !== '')
            .map(v => ({
                [v.name.trim()]: v.price
            }));

        // 2. Construimos el objeto de datos
        const jsonData = {
            variantes: formattedVariants,
            extra: btoa(fileUrl || '')
        };

        // 3. Convertimos el objeto a un string JSON bien formateado (con 2 espacios de sangría)
        const jsonBlock = JSON.stringify(jsonData, null, 2);

        // 4. Armamos el Markdown final
        let fullMarkdown = '';

        if (title.trim()) {
            fullMarkdown += `# ${title.trim()}\n\n`;
        }

        if (description.trim()) {
            fullMarkdown += `${description.trim()}\n\n`;
        }

        fullMarkdown += `\`\`\`JSON\n${jsonBlock}\n\`\`\``;

        return fullMarkdown.trim();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.title || !formData.categoryId) {
            showMsg('error', 'Por favor llena los campos obligatorios');
            return;
        }

        setActionLoading(true);
        try {
            const fullDesc = buildFullDescription();
            await uploadFileToDrive(user.access_token, formData.categoryId, formData.file, {
                name: formData.title,
                description: fullDesc
            });
            showMsg('success', 'Producto subido correctamente');
            const targetFolder = folders.find(f => f.id === formData.categoryId);
            if (targetFolder) {
                setSelectedFolder(targetFolder);
            }
            setMode('list');
            resetForm();
        } catch (err) {
            showMsg('error', 'Error al subir el producto');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const fullDesc = buildFullDescription();
            const hasFolderChanged = formData.categoryId && formData.categoryId !== selectedFolder.id;
            await updateFileMetadata(
                user.access_token,
                editingProduct.id,
                {
                    name: formData.title,
                    description: fullDesc
                },
                hasFolderChanged ? formData.categoryId : null,
                hasFolderChanged ? selectedFolder.id : null
            );
            showMsg('success', 'Producto actualizado');
            if (hasFolderChanged) {
                const targetFolder = folders.find(f => f.id === formData.categoryId);
                if (targetFolder) {
                    setSelectedFolder(targetFolder);
                }
            } else {
                loadFolderProducts();
            }
            setMode('list');
            resetForm();
        } catch (err) {
            console.error(err);
            showMsg('error', 'Error al actualizar');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

        setActionLoading(true);
        try {
            await deleteFileFromDrive(user.access_token, id);
            showMsg('success', 'Producto eliminado');
            loadFolderProducts();
        } catch (err) {
            showMsg('error', 'Error al eliminar');
        } finally {
            setActionLoading(false);
        }
    };

    const startEditing = (product) => {
        const parsed = parseDescription(product.description);
        setEditingProduct(product);
        
        let targetCategoryId = selectedFolder?.id || '';
        const parentId = product.parents?.[0];
        if (parentId) {
            const cleanId = (id) => id.includes('folders/') ? id.split('folders/')[1].split('?')[0].split('/')[0] : id;
            const matchingFolder = folders.find(f => cleanId(f.id) === parentId);
            if (matchingFolder) {
                targetCategoryId = matchingFolder.id;
                setSelectedFolder(matchingFolder);
            }
        }

        setFormData({
            title: parsed.title || product.name,
            description: parsed.description || '',
            variants: parsed.variants.length > 0 ? parsed.variants : [{ name: '', price: '' }],
            file: null,
            fileUrl: parsed.fileUrl || '',
            categoryId: targetCategoryId
        });
        setMode('edit');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            variants: [{ name: '', price: '' }],
            file: null,
            fileUrl: '',
            categoryId: selectedFolder?.id || folders[0]?.id || ''
        });
        setEditingProduct(null);
    };

    useEffect(() => {
        if (initialProductToEdit) {
            startEditing(initialProductToEdit);
        }
    }, [initialProductToEdit]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[200] bg-cat-dark overflow-y-auto flex flex-col"
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
                    <h2 className="text-xl font-black text-cat-contrast uppercase tracking-tight">Admin Catálogo</h2>
                </div>

                {mode === 'list' && (
                    <button
                        onClick={() => { setMode('upload'); resetForm(); }}
                        className="bg-cat-contrast text-white hover:bg-cat-contrast/90 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        <Plus size={16} />
                        Nuevo Producto
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-12">
                <div className="max-w-4xl mx-auto pb-20">

                    {/* Message Notification */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg ${message.type === 'success'
                                    ? 'bg-green-950/40 text-green-400 border-green-500/20'
                                    : 'bg-red-950/40 text-red-400 border-red-500/20'
                                    } border`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                <span className="text-sm font-bold">{message.text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Folder Selector */}
                    {mode === 'list' && (
                        <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
                            <div className="flex gap-3">
                                {folders.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setSelectedFolder(f)}
                                        className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${selectedFolder.id === f.id
                                            ? 'bg-cat-contrast text-white border-cat-contrast shadow-lg'
                                            : 'bg-cat-darkest/50 text-cat-light/70 border-cat-light/10 hover:border-cat-contrast hover:text-cat-contrast'
                                            }`}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'list' ? (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
                                    <Loader2 className="animate-spin text-cat-teal-light" size={40} />
                                    <p className="font-bold text-cat-light/70">Cargando productos...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-cat-darkest/50 rounded-[2.5rem] border border-dashed border-cat-light/20">
                                    <ImageIcon className="mx-auto text-cat-light/20 mb-4" size={48} />
                                    <p className="font-bold text-cat-light/40 uppercase tracking-widest text-sm">No hay productos en esta carpeta</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div key={p.id} className="bg-cat-darkest/50 p-4 rounded-3xl border border-cat-light/10 shadow-sm flex gap-4 group">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cat-dark flex-shrink-0">
                                                <img
                                                    src={p.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-cat-light truncate mb-1">{p.name}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditing(p)}
                                                        className="p-2 bg-cat-dark text-cat-light/50 rounded-lg hover:text-cat-teal-light hover:bg-cat-teal-light/20 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 bg-cat-dark text-cat-light/50 rounded-lg hover:text-red-400 hover:bg-red-950/20 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onSubmit={mode === 'upload' ? handleUpload : handleUpdate}
                            className="bg-cat-darkest/50 rounded-[2.5rem] p-8 border border-cat-light/10 space-y-6"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-black text-cat-contrast uppercase tracking-tight">
                                    {mode === 'upload' ? 'Nuevo Producto' : 'Editar Producto'}
                                </h3>
                                <button type="button" onClick={() => setMode('list')} className="text-cat-light/50 hover:text-cat-contrast">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Image Upload Area (Only for Upload Mode) */}
                            {mode === 'upload' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Imagen del Producto</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            required
                                        />
                                        <div className={`h-40 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${formData.file ? 'border-cat-teal-light bg-cat-teal-light/10 text-cat-teal-light' : 'border-cat-light/25 group-hover:border-cat-contrast bg-cat-dark'
                                            }`}>
                                            {formData.file ? (
                                                <>
                                                    <CheckCircle2 className="text-cat-teal-light" size={32} />
                                                    <p className="text-sm font-bold text-cat-teal-light">{formData.file.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-cat-light/20 group-hover:text-cat-contrast" size={32} />
                                                    <p className="text-xs font-bold text-cat-light/40">Click o arrastra la imagen aquí</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Current Image Preview (Only for Edit Mode) */}
                            {mode === 'edit' && editingProduct && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Imagen del Producto</label>
                                    <div className="relative rounded-[2rem] overflow-hidden border border-cat-light/10 bg-cat-dark p-4 flex justify-center items-center h-44">
                                        <img
                                            src={editingProduct.image}
                                            alt={formData.title}
                                            className="max-h-40 object-contain rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Text Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Categoría</label>
                                    <div className="relative">
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full bg-cat-dark text-cat-light rounded-2xl p-4 pr-10 border border-cat-light/10 focus:outline-none focus:ring-2 focus:ring-cat-contrast/20 font-bold appearance-none cursor-pointer"
                                            required
                                        >
                                            {folders.map(f => (
                                                <option key={f.id} value={f.id} className="bg-cat-darkest text-cat-light">
                                                    {f.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-cat-light/50">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Título</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Miniatura Caballero Oscuro"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-cat-dark text-cat-light placeholder-cat-light/30 rounded-2xl p-4 border border-cat-light/10 focus:outline-none focus:ring-2 focus:ring-cat-contrast/20 font-bold"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Descripción</label>
                                    <textarea
                                        placeholder="Características del producto..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-cat-dark text-cat-light placeholder-cat-light/30 rounded-2xl p-4 border border-cat-light/10 focus:outline-none focus:ring-2 focus:ring-cat-contrast/20 font-medium text-sm leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Variants Editor */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Variantes y Precios</label>
                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        className="bg-cat-contrast/10 border border-cat-contrast/40 rounded-xl p-2 text-cat-contrast flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:bg-cat-contrast/20 transition-all hover:scale-105"
                                    >
                                        <Plus size={14} /> Añadir Precio
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.variants.map((v, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nombre (ej: Normal)"
                                                value={v.name}
                                                onChange={(e) => updateVariant(i, 'name', e.target.value)}
                                                className="flex-1 bg-cat-dark text-cat-light placeholder-cat-light/30 rounded-xl p-3 border border-cat-light/10 text-sm font-bold"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Precio (ej: 150)"
                                                value={v.price}
                                                onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                                className="w-24 bg-cat-dark text-cat-contrast placeholder-cat-light/30 rounded-xl p-3 border border-cat-light/10 text-sm font-black"
                                            />
                                            {formData.variants.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveVariant(i)} className="text-cat-light/30 hover:text-red-500 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-cat-light/50 ml-1">Link a Recursos (Este enlace solo será visto por el administrador)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: https://t.me/c/ejemplo_channel/1"
                                    value={formData.fileUrl}
                                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                                    className="w-full bg-cat-dark text-cat-light placeholder-cat-light/30 rounded-2xl p-4 border border-cat-light/10 focus:outline-none focus:ring-2 focus:ring-cat-contrast/20 font-bold"

                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-cat-contrast/30 text-cat-light p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-cat-contrast/90 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Save size={24} />
                                        {mode === 'upload' ? 'Subir a Drive' : 'Guardar Cambios'}
                                    </>
                                )}
                            </button>
                        </motion.form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminPanel;
