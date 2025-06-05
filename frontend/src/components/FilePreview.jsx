import { AlertCircle, Code, Download, ExternalLink, Eye, FileText, Loader2, Monitor, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const FilePreview = ({ attachment, isOpen, onClose, onDownload }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewType, setPreviewType] = useState('');

  useEffect(() => {
    if (isOpen && attachment) {
      loadFileContent();
    } else {
      // Reset state when modal closes
      setContent('');
      setError('');
      setPreviewType('');
    }
  }, [isOpen, attachment]);

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const getFileName = () => {
    return attachment?.file?.split('/').pop() || 'Unknown File';
  };

  // Check if we're in development mode
  const isDevelopment = () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost') ||
           attachment?.file?.includes('localhost') ||
           attachment?.file?.includes('127.0.0.1');
  };

  // Check if URL is from Cloudinary or other CDN
  const isCloudinaryUrl = () => {
    return attachment?.file?.includes('cloudinary.com') ||
           attachment?.file?.includes('res.cloudinary.com') ||
           attachment?.file?.startsWith('https://');
  };

  const loadFileContent = async () => {
    if (!attachment?.file) return;
    
    const extension = getFileExtension(attachment.file);
    setLoading(true);
    setError('');
    setContent('');
    setPreviewType(extension);

    try {
      switch (extension) {
        case 'txt':
          await loadTextFile();
          break;
        case 'pdf':
          await loadPdfFile();
          break;
        case 'docx':
        case 'pptx':
          // For Office files, check if external viewers will work
          if (isDevelopment() && !isCloudinaryUrl()) {
            setError(`${extension.toUpperCase()} preview requires production URLs. External viewers cannot access localhost files.`);
          } else {
            setContent(attachment.file);
          }
          break;
        default:
          setError(`Preview not supported for ${extension.toUpperCase()} files`);
      }
    } catch (err) {
      console.error('Error loading file:', err);
      setError(`Failed to load ${extension.toUpperCase()} file preview`);
    } finally {
      setLoading(false);
    }
  };

  const loadTextFile = async () => {
    try {
      const response = await fetch(attachment.file);
      if (!response.ok) throw new Error('Failed to fetch file');
      const text = await response.text();
      setContent(text);
    } catch (err) {
      if (isDevelopment()) {
        setError('Text file preview may not work in development due to CORS. File will work in production.');
      } else {
        throw new Error('Unable to load text file');
      }
    }
  };

  const loadPdfFile = async () => {
    // PDFs usually work fine in development via iframe
    setContent(attachment.file);
  };

  const openInExternalViewer = (service) => {
    if (isDevelopment() && !isCloudinaryUrl()) {
      alert('External viewers cannot access localhost files. This feature works in production with Cloudinary URLs.');
      return;
    }
    
    const encodedUrl = encodeURIComponent(attachment.file);
    let viewerUrl = '';
    
    switch (service) {
      case 'google':
        viewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}`;
        break;
      case 'office':
        viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
  };

  const renderDevelopmentWarning = () => {
    if (!isDevelopment()) return null;
    
    return (
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 text-amber-800 label-text">
          <Code size={16} />
          <span className="text-sm font-medium label-text">Development Mode</span>
        </div>
        <p className="text-xs text-amber-700 mt-1 label-text">
          Some preview features are limited in development. All previews will work perfectly in production with Cloudinary.
        </p>
      </div>
    );
  };

  const renderProductionInfo = () => {
    if (isDevelopment() || !isCloudinaryUrl()) return null;
    
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-800 label-text">
          <Monitor size={16} />
          <span className="text-sm font-medium label-text">Production Ready</span>
        </div>
        <p className="text-xs text-green-700 mt-1 label-text">
          File hosted on CDN - all preview features available.
        </p>
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] py-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600 label-text">Loading {previewType.toUpperCase()} preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center max-w-md px-4">
            <AlertCircle className="h-10 w-10 text-yellow-500" />
            <div className="flex flex-col items-center justify-center gap-3">
              <h3 className="font-medium text-gray-900 label-text">Preview Not Available</h3>
              <p className="text-gray-600 text-sm label-text">{error}</p>
              
              {isDevelopment() && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg w-full">
                  <p className="text-xs text-blue-800 label-text">
                    💡 <strong>Development Tip:</strong> This will work in production when files are served from Cloudinary or other CDNs.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => onDownload && onDownload(attachment)}
                className="exam-button-mini flex items-center justify-center gap-2 px-3 py-2 label-text"
                data-hover="Download"
              >
                <Download size={16} />
                Download File
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (previewType) {
      case 'txt':
        return (
          <div className="h-full min-h-[400px] overflow-auto bg-gray-50 rounded-lg p-4 border">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed label-text">
              {content}
            </pre>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="h-full min-h-[400px] rounded-lg overflow-hidden border shadow-inner">
            <iframe
              src={`${content}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title="PDF Preview"
              frameBorder="0"
              onError={() => setError('PDF preview failed. Please download the file.')}
            />
          </div>
        );
      
      case 'docx':
        return (
          <div className="h-full min-h-[400px] flex flex-col">
            {/* Show embedded viewer only if not in development or if Cloudinary */}
            {!isDevelopment() || isCloudinaryUrl() ? (
              <>
                <div className="flex-1 rounded-lg overflow-hidden border shadow-inner bg-gray-50">
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(content)}&embedded=true`}
                    className="w-full h-full"
                    title="Word Document Preview"
                    frameBorder="0"
                    onError={() => setError('Document preview failed. Please try external viewers or download.')}
                  />
                </div>
                
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2 font-medium text-center label-text">
                    📄 Word Document Options:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => openInExternalViewer('google')}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors label-text"
                    >
                      <ExternalLink size={12} />
                      Open in Google Docs
                    </button>
                    <button
                      onClick={() => openInExternalViewer('office')}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors label-text"
                    >
                      <ExternalLink size={12} />
                      Open in Office Online
                    </button>
                    <button
                      onClick={() => onDownload && onDownload(attachment)}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors label-text"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2 label-text">Development Mode</h3>
                  <p className="text-sm text-gray-600 mb-4 label-text">DOCX preview requires production URLs</p>
                  <button
                    onClick={() => onDownload && onDownload(attachment)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors label-text"
                  >
                    <Download size={16} />
                    Download File
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'pptx':
        return (
          <div className="h-full min-h-[400px] flex flex-col">
            {!isDevelopment() || isCloudinaryUrl() ? (
              <>
                <div className="flex-1 rounded-lg overflow-hidden border shadow-inner bg-gray-50">
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(content)}&embedded=true`}
                    className="w-full h-full"
                    title="PowerPoint Preview"
                    frameBorder="0"
                    onError={() => setError('PowerPoint preview failed. Please try external viewers or download.')}
                  />
                </div>
                
                <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 mb-2 font-medium label-text">
                    📊 PowerPoint Options:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => openInExternalViewer('google')}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors label-text"
                    >
                      <ExternalLink size={12} />
                      Open in Google Docs
                    </button>
                    <button
                      onClick={() => openInExternalViewer('office')}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors label-text"
                    >
                      <ExternalLink size={12} />
                      Open in Office Online
                    </button>
                    <button
                      onClick={() => onDownload && onDownload(attachment)}
                      className="inline-flex items-center justify-center gap-1 text-xs px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors label-text"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2 label-text">Development Mode</h3>
                  <p className="text-sm text-gray-600 mb-4 label-text">PPTX preview requires production URLs</p>
                  <button
                    onClick={() => onDownload && onDownload(attachment)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors label-text"
                  >
                    <Download size={16} />
                    Download File
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full min-h-[400px] py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2 label-text">Preview not available</h3>
              <p className="text-sm text-gray-600 label-text">This file type cannot be previewed directly.</p>
              <button
                onClick={() => onDownload && onDownload(attachment)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors label-text"
              >
                <Download size={16} />
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  const fileName = getFileName();
  const fileExtension = getFileExtension(attachment?.file).toUpperCase();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg text-blue-600">
               <Eye size={20} />
            </div>
            <div className="flex flex-col">
               <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate max-w-sm label-text">{fileName}</h3>
               <span className="text-xs text-gray-500 label-text">{fileExtension} File Preview</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content Area with Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderDevelopmentWarning()}
          {renderProductionInfo()}
          {renderPreviewContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t text-xs text-gray-500 label-text">
           <span>File: {fileName}</span>
           <div className="flex items-center gap-4">
              <span>Type: {fileExtension}</span>
              {isDevelopment() && <span className="text-amber-600 font-medium label-text">Development Mode</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;