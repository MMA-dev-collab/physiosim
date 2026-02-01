import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Upload, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

import { API_BASE_URL } from '../../config'

const ImageUpload = ({
    initialUrl,
    onUpload,
    folderType,
    label = "Upload Image",
    className = ""
}) => {
    const [preview, setPreview] = useState(initialUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);

    // Constants
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        }
        if (file.size > MAX_SIZE) {
            throw new Error('File size exceeds 5MB limit.');
        }
    };

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);

        try {
            validateFile(file);

            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', folderType);

            // Fix: Parse auth object from localStorage
            const authStorage = localStorage.getItem('auth');
            const token = authStorage ? JSON.parse(authStorage).token : null;

            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }

            const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            const { url } = response.data;
            setPreview(url);
            if (onUpload) {
                onUpload(url);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.response?.data?.message || err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (onUpload) onUpload('');
    };

    return (
        <div className={`w - full ${className} `}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <div
                className={`relative border - 2 border - dashed rounded - lg p - 4 transition - colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    } ${error ? 'border-red-500 bg-red-50' : ''} `}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={onFileChange}
                    disabled={loading}
                />

                <div className="flex flex-col items-center justify-center space-y-2 text-center min-h-[160px]">
                    {loading ? (
                        <div className="flex flex-col items-center text-blue-600">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    ) : preview ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-h-64 rounded-md shadow-sm object-contain"
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <div className="p-3 bg-gray-100 rounded-full mb-2">
                                <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
