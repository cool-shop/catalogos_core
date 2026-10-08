import axios from 'axios';
import { GOOGLE_DRIVE_CONFIG } from '../../../config';

const API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;

// Helper to extract clean ID from different URL formats
export const cleanFolderId = (folderId) => {
    let cleanId = folderId;
    if (folderId.includes('folders/')) {
        cleanId = folderId.split('folders/')[1].split('?')[0].split('/')[0];
    } else if (folderId.includes('id=')) {
        cleanId = folderId.split('id=')[1].split('&')[0];
    }
    return cleanId;
};

// Helper to generate a permanent non-expiring image URL from a Google Drive file ID
export const getPermanentImageUrl = (fileId, size = 1000) => {
    if (!fileId) return null;
    return `https://lh3.googleusercontent.com/d/${fileId}=s${size}`;
};

export const fetchFolderFiles = async (folderId, pageToken = null, pageSize = 12, orderBy = 'recency') => {
    if (folderId === 'all' || folderId === 'latest') {
        const isLatest = folderId === 'latest';
        const seenFolderIds = new Set();
        const validFolders = GOOGLE_DRIVE_CONFIG.FOLDERS.filter(f => {
            const cleanId = cleanFolderId(f.id);
            if (!f.id || f.id === 'all' || f.id === 'latest' || cleanId.startsWith('FOLDER_ID_') || seenFolderIds.has(cleanId)) {
                return false;
            }
            seenFolderIds.add(cleanId);
            return true;
        });

        let tokens = {};
        try {
            if (pageToken) tokens = JSON.parse(pageToken);
        } catch (e) {
            console.error("Error parsing pageToken for 'all' category:", e);
        }

        try {
            // Fetch next page for each folder that still has results
            const folderResults = await Promise.all(
                validFolders.map(f => {
                    const folderToken = tokens[f.id] || null;
                    if (pageToken && !folderToken) return Promise.resolve({ files: [], nextPageToken: null });
                    return fetchFolderFiles(f.id, folderToken, isLatest ? 6 : pageSize, isLatest ? 'createdTime desc' : 'recency');
                })
            );

            let allFiles = folderResults.flatMap(r => r.files);

            // Deduplicate files by ID to avoid React duplicate key errors
            const uniqueFilesMap = new Map();
            allFiles.forEach(file => {
                if (file && file.id && !uniqueFilesMap.has(file.id)) {
                    uniqueFilesMap.set(file.id, file);
                }
            });
            allFiles = Array.from(uniqueFilesMap.values());

            // If fetching latest, sort the combined results again
            if (isLatest) {
                allFiles = allFiles.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime)).slice(0, pageSize);
            }

            // Build the next combined token
            const nextTokens = {};
            let hasMore = false;

            folderResults.forEach((res, idx) => {
                const fId = validFolders[idx].id;
                if (res.nextPageToken) {
                    nextTokens[fId] = res.nextPageToken;
                    hasMore = true;
                }
            });
            return {
                files: allFiles,
                nextPageToken: hasMore ? JSON.stringify(nextTokens) : null
            };
        } catch (error) {
            console.error("Error merging folders:", error);
            return { files: [], nextPageToken: null };
        }
    }

    const cleanId = cleanFolderId(folderId);

    if (cleanId.startsWith('FOLDER_ID_')) {
        return { files: [], nextPageToken: null };
    }

    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_DRIVE_API_KEY') {
        return { files: [], nextPageToken: null };
    }

    try {
        // Include both images and shortcuts so Drive shortcuts resolve correctly
        const query = `'${cleanId}' in parents AND (mimeType contains 'image/' OR mimeType = 'application/vnd.google-apps.shortcut') AND trashed = false`;
        const response = await axios.get(
            `https://www.googleapis.com/drive/v3/files`,
            {
                params: {
                    q: query,
                    fields: 'nextPageToken, files(id, name, thumbnailLink, description, createdTime, mimeType, shortcutDetails)',
                    pageSize: pageSize,
                    pageToken: pageToken,
                    orderBy: orderBy,
                    key: API_KEY,
                },
            }
        );

        // Resolve shortcuts: use the target file ID for images
        const files = await Promise.all(
            response.data.files.map(async (file) => {
                let fileId = file.id;
                let fileName = file.name;
                let fileDescription = file.description || '';
                let fileCreatedTime = file.createdTime;

                if (file.mimeType === 'application/vnd.google-apps.shortcut' && file.shortcutDetails) {
                    // Only resolve shortcuts that point to image files
                    const targetMime = file.shortcutDetails.targetMimeType || '';
                    if (!targetMime.startsWith('image/')) return null;

                    const targetId = file.shortcutDetails.targetId;
                    try {
                        // Fetch the target file's metadata for name/description
                        const targetResponse = await axios.get(
                            `https://www.googleapis.com/drive/v3/files/${targetId}`,
                            {
                                params: {
                                    fields: 'id, name, description, createdTime',
                                    key: API_KEY,
                                },
                            }
                        );
                        fileId = targetResponse.data.id;
                        fileName = targetResponse.data.name;
                        fileDescription = targetResponse.data.description || fileDescription;
                        fileCreatedTime = targetResponse.data.createdTime || fileCreatedTime;
                    } catch (e) {
                        // If we can't fetch target metadata, use the target ID directly
                        fileId = targetId;
                    }
                }

                return {
                    id: fileId,
                    name: fileName.split('.')[0],
                    description: fileDescription,
                    createdTime: fileCreatedTime,
                    // Use permanent Google Drive URL format based on file ID
                    image: getPermanentImageUrl(fileId, 1000),
                    thumbnail: getPermanentImageUrl(fileId, 400),
                    driveUrl: `https://drive.google.com/open?id=${fileId}`
                };
            })
        );

        // Filter out null entries (non-image shortcuts)
        const validFiles = files.filter(Boolean);

        return {
            files: validFiles,
            nextPageToken: response.data.nextPageToken || null
        };
    } catch (error) {
        console.error('Error fetching files from Google Drive:', error);
        return { files: [], nextPageToken: null };
    }
};

export const uploadFileToDrive = async (accessToken, folderId, file, metadata) => {
    const cleanId = cleanFolderId(folderId);

    // 1. Metadata part
    const fileMetadata = {
        name: metadata.name,
        description: metadata.description,
        parents: [cleanId]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    formData.append('file', file);

    try {
        const response = await axios.post(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/related'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error.response?.data || error.message);
        throw error;
    }
};

export const updateFileMetadata = async (accessToken, fileId, metadata, addParents = null, removeParents = null) => {
    try {
        const params = {};
        if (addParents) params.addParents = cleanFolderId(addParents);
        if (removeParents) params.removeParents = cleanFolderId(removeParents);

        const response = await axios.patch(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                name: metadata.name,
                description: metadata.description
            },
            {
                params,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating metadata:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteFileFromDrive = async (accessToken, fileId) => {
    try {
        await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return true;
    } catch (error) {
        console.error('Error deleting file:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchFileById = async (fileId) => {
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_DRIVE_API_KEY' || !fileId) {
        return null;
    }
    try {
        const response = await axios.get(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                params: {
                    fields: 'id, name, thumbnailLink, description, createdTime, parents',
                    key: API_KEY,
                },
            }
        );
        const file = response.data;
        return {
            id: file.id,
            name: file.name.split('.')[0],
            description: file.description || '',
            createdTime: file.createdTime,
            image: getPermanentImageUrl(file.id, 1000),
            thumbnail: getPermanentImageUrl(file.id, 400),
            driveUrl: `https://drive.google.com/open?id=${file.id}`,
            parents: file.parents || []
        };
    } catch (error) {
        console.error('Error fetching file by ID from Google Drive:', error);
        return null;
    }
};

