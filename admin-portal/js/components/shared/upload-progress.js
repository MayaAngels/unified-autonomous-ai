// Upload Progress Component
// Shows progress for file uploads

class UploadProgress {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('UploadProgress: Container not found:', containerId);
            return;
        }
        this.options = {
            showPercentage: options.showPercentage !== false,
            showSpeed: options.showSpeed !== false,
            autoRemove: options.autoRemove !== false,
            removeDelay: options.removeDelay || 3000
        };
        this.activeUploads = new Map();
        this.createStyles();
    }

    // Create styles
    createStyles() {
        const styleId = 'upload-progress-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            .upload-progress-item {
                background: #fff;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                border: 1px solid #e8e8e8;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .upload-progress-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .upload-progress-filename {
                font-weight: 500;
                color: #333;
            }
            .upload-progress-status {
                color: #666;
            }
            .upload-progress-bar-container {
                background: #f0f0f0;
                border-radius: 20px;
                overflow: hidden;
                height: 8px;
            }
            .upload-progress-bar {
                background: #111;
                height: 100%;
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 20px;
            }
            .upload-progress-details {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 12px;
                color: #888;
            }
            .upload-progress-success {
                border-left: 4px solid #22c55e;
            }
            .upload-progress-error {
                border-left: 4px solid #ef4444;
            }
            .upload-progress-complete {
                border-left: 4px solid #22c55e;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Create a new upload progress item
    create(uploadId, filename, fileSize = null) {
        const item = document.createElement('div');
        item.className = 'upload-progress-item';
        item.id = `upload-${uploadId}`;
        
        const sizeText = fileSize ? this.formatFileSize(fileSize) : 'Unknown size';
        
        item.innerHTML = `
            <div class="upload-progress-header">
                <span class="upload-progress-filename">${this.escapeHtml(filename)}</span>
                <span class="upload-progress-status">Preparing...</span>
            </div>
            <div class="upload-progress-bar-container">
                <div class="upload-progress-bar" style="width: 0%;"></div>
            </div>
            <div class="upload-progress-details">
                <span>${sizeText}</span>
                <span class="upload-progress-speed">0 KB/s</span>
            </div>
        `;
        
        this.container.appendChild(item);
        
        this.activeUploads.set(uploadId, {
            element: item,
            filename: filename,
            startTime: Date.now(),
            lastLoaded: 0,
            lastTime: Date.now()
        });
        
        return item;
    }

    // Update upload progress
    update(uploadId, loaded, total) {
        const upload = this.activeUploads.get(uploadId);
        if (!upload) return;
        
        const percent = (loaded / total) * 100;
        const bar = upload.element.querySelector('.upload-progress-bar');
        const statusSpan = upload.element.querySelector('.upload-progress-status');
        const speedSpan = upload.element.querySelector('.upload-progress-speed');
        
        if (bar) bar.style.width = `${percent}%`;
        if (statusSpan) statusSpan.innerText = `${Math.round(percent)}%`;
        
        // Calculate speed
        const now = Date.now();
        const timeDiff = (now - upload.lastTime) / 1000;
        const loadedDiff = loaded - upload.lastLoaded;
        
        if (timeDiff > 0 && loadedDiff > 0) {
            const speed = loadedDiff / timeDiff;
            if (speedSpan) speedSpan.innerText = `${this.formatFileSize(speed)}/s`;
        }
        
        upload.lastLoaded = loaded;
        upload.lastTime = now;
        
        if (percent >= 100) {
            this.complete(uploadId);
        }
    }

    // Mark upload as complete
    complete(uploadId) {
        const upload = this.activeUploads.get(uploadId);
        if (!upload) return;
        
        upload.element.classList.add('upload-progress-complete');
        const statusSpan = upload.element.querySelector('.upload-progress-status');
        if (statusSpan) {
            statusSpan.innerHTML = '✅ Complete';
            statusSpan.style.color = '#22c55e';
        }
        
        if (this.options.autoRemove) {
            setTimeout(() => {
                this.remove(uploadId);
            }, this.options.removeDelay);
        }
    }

    // Mark upload as failed
    fail(uploadId, errorMessage) {
        const upload = this.activeUploads.get(uploadId);
        if (!upload) return;
        
        upload.element.classList.add('upload-progress-error');
        const statusSpan = upload.element.querySelector('.upload-progress-status');
        if (statusSpan) {
            statusSpan.innerHTML = `❌ Failed: ${errorMessage}`;
            statusSpan.style.color = '#ef4444';
        }
        
        if (this.options.autoRemove) {
            setTimeout(() => {
                this.remove(uploadId);
            }, 5000);
        }
    }

    // Remove upload progress item
    remove(uploadId) {
        const upload = this.activeUploads.get(uploadId);
        if (upload && upload.element && upload.element.parentNode) {
            upload.element.remove();
        }
        this.activeUploads.delete(uploadId);
    }

    // Clear all uploads
    clearAll() {
        this.activeUploads.forEach((upload, uploadId) => {
            if (upload.element && upload.element.parentNode) {
                upload.element.remove();
            }
        });
        this.activeUploads.clear();
        this.container.innerHTML = '';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Helper function to create upload progress
window.createUploadProgress = function(containerId, options = {}) {
    return new UploadProgress(containerId, options);
};
