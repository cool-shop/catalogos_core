import { remark } from 'remark';

export const parseDescription = (desc) => {
    const result = {
        title: '',
        description: '',
        variants: [],
        fileUrl: ''
    };

    if (!desc) return result;

    // 1. Convertimos el Markdown en un AST (Árbol de sintaxis)
    const tree = remark().parse(desc);

    const descriptionParts = [];

    // 2. Recorremos cada nodo del documento
    tree.children.forEach((node) => {

        // Extraer Título (Header #)
        if (node.type === 'heading' && !result.title) {
            result.title = extractText(node);
        }

        // Extraer Bloque de Código JSON
        else if (node.type === 'code' && node.lang?.toLowerCase() === 'json') {
            try {
                const jsonData = JSON.parse(node.value);

                result.fileUrl = atob(jsonData.extra);

                // Parsear las variantes {"Nombre": Precio}
                if (Array.isArray(jsonData.variantes)) {
                    result.variants = jsonData.variantes.map((v) => {
                        // Si viene en formato {"Paquete completo": 599.00}
                        const key = Object.keys(v)[0];
                        return {
                            name: key,
                            price: v[key]
                        };
                    });
                }
            } catch (error) {
                console.error('Error al parsear el bloque JSON:', error);
            }
        }

        // Agrupar todo lo demás como parte de la descripción (Listas, Párrafos, etc.)
        else {
            // Reconstruimos el fragmento a texto Markdown básico
            const nodeText = desc.slice(node.position.start.offset, node.position.end.offset);
            descriptionParts.push(nodeText);
        }
    });

    result.description = descriptionParts.join('\n\n').trim();

    return result;
};

// Función auxiliar para extraer solo el texto plano dentro de un nodo
function extractText(node) {
    if (node.value) return node.value;
    if (node.children) return node.children.map(extractText).join('');
    return '';
}