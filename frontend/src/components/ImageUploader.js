import React, { useState } from 'react';
import { Upload, Eye, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onFileSelect, labelText = 'Upload Image File' }) => {
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {labelText}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--glass-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(15, 23, 42, 0.4)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />

        {preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '120px',
                maxHeight: '120px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid var(--primary)'
              }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Eye size={14} /> Image Selected
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Upload size={32} color="var(--text-muted)" />
            <p style={{ fontSize: '0.85rem' }}>
              Drag & Drop file here or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Browse files</span>
            </p>
            <p style={{ fontSize: '0.75rem' }}>Supports JPG, PNG, WEBP files up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
