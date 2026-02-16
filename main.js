// ===== GLOBAL VARIABLES =====
const themeToggle = document.getElementById('themeToggle');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const faqQuestions = document.querySelectorAll('.faq-question');
const newsletterForm = document.getElementById('newsletterForm');

// ===== THEME TOGGLE =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add animation class
    document.body.classList.add('theme-transition');
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
}

// ===== MOBILE MENU TOGGLE =====
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Toggle icon
    const icon = navToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    const icon = navToggle.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
}

// ===== FAQ TOGGLE =====
function initFAQ() {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
            
            // Close other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.parentElement.classList.remove('active');
                }
            });
        });
    });
}

// ===== NEWSLETTER FORM =====
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // In a real app, you would send this to a server
    // For demo purposes, we'll just show a success message
    showNotification('Thank you for subscribing!', 'success');
    emailInput.value = '';
    
    // Save to localStorage
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    subscribers.push({ email, date: new Date().toISOString() });
    localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        z-index: 9999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
    
    // Add keyframes for animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== ENHANCED FILE UPLOADER =====
class FileUploader {
    constructor(dropZone, fileInput, onFilesSelected) {
        this.dropZone = dropZone;
        this.fileInput = fileInput;
        this.onFilesSelected = onFilesSelected;
        this.files = [];
        
        this.init();
    }
    
    init() {
        // Create enhanced drop zone HTML
        this.createEnhancedDropZone();
        
        // Click on drop zone to trigger file input
        this.dropZone.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-select-files')) {
                this.fileInput.click();
            }
        });
        
        // Handle file input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Enhanced drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
            this.showDropHint();
        });
        
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
            this.hideDropHint();
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.hideDropHint();
            
            if (e.dataTransfer.files.length) {
                this.handleFiles(e.dataTransfer.files);
            }
        });
        
        // Initialize empty state
        this.showEmptyState();
    }
    
    createEnhancedDropZone() {
        this.dropZone.innerHTML = `
            <div class="upload-content">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h3>Drop your files here</h3>
                <p>or click to browse files</p>
                <div class="upload-hint">
                    <span><i class="fas fa-lock"></i> 100% Secure</span>
                    <span><i class="fas fa-bolt"></i> Instant Processing</span>
                    <span><i class="fas fa-infinity"></i> No Limits</span>
                </div>
                <button class="btn btn-primary btn-select-files" style="margin-top: 20px;">
                    <i class="fas fa-folder-open"></i> Select Files
                </button>
            </div>
        `;
        
        // Add click event to select button
        const selectBtn = this.dropZone.querySelector('.btn-select-files');
        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
    }
    
    showDropHint() {
        const hint = document.createElement('div');
        hint.className = 'drop-hint';
        hint.innerHTML = '<i class="fas fa-hand-pointer"></i> Drop files to upload';
        hint.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: 600;
            z-index: 10;
            animation: pulse 1.5s infinite;
        `;
        this.dropZone.appendChild(hint);
        this.dropHint = hint;
    }
    
    hideDropHint() {
        if (this.dropHint) {
            this.dropHint.remove();
        }
    }
    
    showEmptyState() {
        const fileList = document.querySelector('.file-list');
        if (fileList) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-import"></i>
                    <h3>No files selected</h3>
                    <p>Drag and drop files here or click the upload area</p>
                </div>
            `;
        }
    }
    
    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            // Validate file type
            const validTypes = [
                'application/pdf',
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];
            
            if (!validTypes.includes(file.type)) {
                showNotification(`File ${file.name} is not supported`, 'error');
                return false;
            }
            
            // Validate file size (50MB limit)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                showNotification(`File ${file.name} is too large (max 50MB)`, 'error');
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length > 0) {
            this.files = [...this.files, ...validFiles];
            this.updateFileListUI();
            
            if (this.onFilesSelected) {
                this.onFilesSelected(this.files);
            }
            
            showNotification(`Added ${validFiles.length} file(s)`, 'success');
        }
    }
    
    updateFileListUI() {
        const fileList = document.querySelector('.file-list');
        const statsContainer = document.querySelector('.upload-stats');
        
        if (!fileList) return;
        
        if (this.files.length === 0) {
            this.showEmptyState();
            if (statsContainer) statsContainer.style.display = 'none';
            return;
        }
        
        // Create stats
        if (statsContainer) {
            const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
            const pdfCount = this.files.filter(f => f.type === 'application/pdf').length;
            
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${this.files.length}</span>
                    <span class="stat-label">Files</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.formatFileSize(totalSize)}</span>
                    <span class="stat-label">Total Size</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${pdfCount}</span>
                    <span class="stat-label">PDF Files</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.files.length - pdfCount}</span>
                    <span class="stat-label">Other Files</span>
                </div>
            `;
            statsContainer.style.display = 'flex';
        }
        
        // Create file list
        fileList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.index = index;
            
            // Calculate page count (estimated for PDFs)
            const pageCount = file.type === 'application/pdf' ? 
                Math.max(1, Math.round(file.size / 50000)) : 'N/A';
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${this.getFileIcon(file.type)}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-meta">
                            <span class="file-size">
                                <i class="fas fa-weight-hanging"></i>
                                ${this.formatFileSize(file.size)}
                            </span>
                            <span class="file-pages">
                                <i class="fas fa-copy"></i>
                                ${pageCount} ${pageCount === 'N/A' ? '' : 'pages'}
                            </span>
                            <span class="file-type">
                                <i class="fas fa-file"></i>
                                ${this.getFileType(file.type)}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-icon btn-preview" data-index="${index}" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-remove" data-index="${index}" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            fileList.appendChild(fileItem);
        });
        
        // Add event listeners
        this.addFileEventListeners();
    }
    
    addFileEventListeners() {
        // Remove buttons
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeFile(index);
            });
        });
        
        // Preview buttons
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.previewFile(index);
            });
        });
    }
    
    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileListUI();
        
        if (this.onFilesSelected) {
            this.onFilesSelected(this.files);
        }
        
        showNotification('File removed', 'info');
    }
    
    previewFile(index) {
        const file = this.files[index];
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'file-preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="preview-content" style="
                background: var(--bg-primary);
                border-radius: var(--radius-lg);
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                position: relative;
            ">
                <button class="close-preview" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: var(--danger-color);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                ">
                    <i class="fas fa-times"></i>
                </button>
                
                <h3 style="margin-bottom: 20px;">${file.name}</h3>
                
                <div class="preview-info" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                ">
                    <div>
                        <strong>Type:</strong> ${file.type}
                    </div>
                    <div>
                        <strong>Size:</strong> ${this.formatFileSize(file.size)}
                    </div>
                    <div>
                        <strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="preview-message" style="
                    text-align: center;
                    padding: 40px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                ">
                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 20px;"></i>
                    <p>File preview would be displayed here</p>
                    <p class="text-muted" style="margin-top: 10px; font-size: 0.9rem;">
                        In a full implementation, PDF.js or other library would render the file here
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        const closeBtn = modal.querySelector('.close-preview');
        closeBtn.addEventListener('click', () => modal.remove());
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Close on escape key
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
    
    getFileIcon(fileType) {
        const icons = {
            'application/pdf': 'fas fa-file-pdf',
            'image/jpeg': 'fas fa-file-image',
            'image/png': 'fas fa-file-image',
            'image/gif': 'fas fa-file-image',
            'image/webp': 'fas fa-file-image',
            'application/msword': 'fas fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
            'application/vnd.ms-excel': 'fas fa-file-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint'
        };
        
        return icons[fileType] || 'fas fa-file';
    }
    
    getFileType(fileType) {
        const types = {
            'application/pdf': 'PDF',
            'image/jpeg': 'JPEG Image',
            'image/png': 'PNG Image',
            'image/gif': 'GIF Image',
            'image/webp': 'WebP Image',
            'application/msword': 'Word Document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
            'application/vnd.ms-excel': 'Excel Spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
            'application/vnd.ms-powerpoint': 'PowerPoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint'
        };
        
        return types[fileType] || 'Document';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    clearFiles() {
        this.files = [];
        this.updateFileListUI();
        
        if (this.onFilesSelected) {
            this.onFilesSelected(this.files);
        }
        
        showNotification('All files cleared', 'info');
    }
    
    getFiles() {
        return this.files;
    }
}        

// ===== ENHANCED PROGRESS INDICATOR =====
class EnhancedProgressIndicator {
    constructor(container) {
        this.container = container;
        this.progressBar = container.querySelector('.progress-fill-modern');
        this.progressPercentage = container.querySelector('.progress-percentage');
        this.currentFile = container.querySelector('.current-file');
        this.timeRemaining = container.querySelector('.time-remaining');
        this.fileSize = container.querySelector('.file-size');
        
        if (!this.progressBar) {
            // Fallback to old progress bar
            this.progressBar = container.querySelector('.progress-fill');
            this.progressPercentage = container.querySelector('.progress-text');
        }
        
        this.reset();
    }
    
    reset() {
        if (this.progressBar) this.progressBar.style.width = '0%';
        if (this.progressPercentage) this.progressPercentage.textContent = '0%';
        if (this.currentFile) this.currentFile.textContent = 'Waiting for files...';
        if (this.timeRemaining) this.timeRemaining.textContent = 'Estimating...';
        if (this.fileSize) this.fileSize.textContent = '0 MB';
        
        this.container.classList.remove('active');
    }
    
    start(fileName, fileSize) {
        this.container.classList.add('active');
        if (this.currentFile) this.currentFile.textContent = fileName;
        if (this.fileSize) this.fileSize.textContent = this.formatFileSize(fileSize);
        this.update(0);
    }
    
    update(percentage) {
        const percent = Math.min(100, Math.max(0, percentage));
        if (this.progressBar) this.progressBar.style.width = `${percent}%`;
        if (this.progressPercentage) this.progressPercentage.textContent = `${Math.round(percent)}%`;
        
        if (this.timeRemaining) {
            if (percent > 0 && percent < 100) {
                const remaining = Math.round((100 - percent) * 0.3);
                this.timeRemaining.textContent = `${remaining}s remaining`;
            } else if (percent === 100) {
                this.timeRemaining.textContent = 'Almost done!';
            }
        }
    }
    
    complete() {
        this.update(100);
        setTimeout(() => {
            this.container.classList.remove('active');
        }, 1500);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// ===== TOOL BASE CLASS =====
class ToolBase {
    constructor(toolId) {
        this.toolId = toolId;
        this.fileUploader = null;
        this.progressIndicator = null;
        this.resultContainer = null;
        
        this.init();
    }
    
    init() {
        // Initialize file uploader
        const dropZone = document.querySelector('.file-upload-area');
        const fileInput = document.getElementById('fileInput');
        
        if (dropZone && fileInput) {
            this.fileUploader = new FileUploader(dropZone, fileInput, (files) => {
                this.updateFileList(files);
            });
        }
        
        // Initialize progress indicator
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            this.progressIndicator = new ProgressIndicator(progressContainer);
        }
        
        // Initialize result container
        this.resultContainer = document.querySelector('.result-container');
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Process button
        const processBtn = document.querySelector('.process-btn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processFiles());
        }
        
        // Reset button
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTool());
        }
        
        // Download button
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResult());
        }
    }
    
updateFileList(files) {
    const fileList = document.querySelector('.file-list');
    if (!fileList) return;
    
    if (files.length === 0) {
        fileList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-import"></i>
                <h3>No files selected</h3>
                <p>Drag and drop files here or click the upload area</p>
            </div>
        `;
        return;
    }
    
    fileList.innerHTML = '';
    
    files.forEach((file, index) => {
        const pageCount = file.type === 'application/pdf' ? 
            Math.max(1, Math.round(file.size / 50000)) : 'N/A';
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <div class="file-meta">
                        <span class="file-size">
                            <i class="fas fa-weight-hanging"></i>
                            ${this.formatFileSize(file.size)}
                        </span>
                        <span class="file-pages">
                            <i class="fas fa-copy"></i>
                            ${pageCount} ${pageCount === 'N/A' ? '' : 'pages'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-icon btn-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileList.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    fileList.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            this.fileUploader.removeFile(index);
        });
    });
}
    
    getFileIcon(fileType) {
        if (fileType === 'application/pdf') return 'fas fa-file-pdf';
        if (fileType.startsWith('image/')) return 'fas fa-file-image';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async processFiles() {
        const files = this.fileUploader?.getFiles() || [];
        
        if (files.length === 0) {
            showNotification('Please select at least one file', 'error');
            return;
        }
        
        // Show progress
        this.progressIndicator?.start(files[0].name, files[0].size);
        
        // Simulate processing (in real implementation, this would do actual processing)
        for (let i = 0; i <= 100; i += 10) {
            await this.delay(200);
            this.progressIndicator?.update(i);
        }
        
        this.progressIndicator?.complete();
        
        // Show result
        this.showResult();
    }
    
    showResult() {
        if (this.resultContainer) {
            this.resultContainer.classList.add('active');
            
            // Scroll to result
            this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            showNotification('Processing complete!', 'success');
        }
    }
    
    resetTool() {
        this.fileUploader?.clearFiles();
        this.progressIndicator?.reset();
        
        if (this.resultContainer) {
            this.resultContainer.classList.remove('active');
        }
        
        // Reset form controls
        const form = document.querySelector('.tool-controls');
        if (form) form.reset();
        
        showNotification('Tool has been reset', 'info');
    }
    
    downloadResult() {
        // In a real implementation, this would create and download the actual file
        // For demo, we'll create a placeholder download
        showNotification('Download started', 'success');
        
        // Simulate download
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('This is a demo file. In a real implementation, this would be your processed file.');
        link.download = `processed_${Date.now()}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== INITIALIZE TOOLS =====
function initToolPage() {
    // Get current page to determine which tool to initialize
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    
    const toolMap = {
        'merge': 'pdf-merge.js',
        'edit-sign': 'edit-sign.js',
        'convert-from-pdf': 'convert-from-pdf.js',
        'other-tools': 'other-tools.js',
        'scans': 'scans.js',
        'compress': 'compress.js',
        'split': 'split.js',
        'security': 'security.js',
        'convert-to-pdf': 'convert-to-pdf.js',
        'rotate': 'rotate.js',
        'add-remove': 'add-remove.js'
    };
    
    if (toolMap[page]) {
        // Initialize base tool functionality
        new ToolBase(page);
        
        // Load specific tool script if it exists
        const script = document.createElement('script');
        script.src = `assets/js/${toolMap[page]}`;
        script.async = true;
        document.body.appendChild(script);
    }
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Theme toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Initialize FAQ
    initFAQ();
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Initialize tool page if on a tool page
    if (document.querySelector('.tool-page')) {
        initToolPage();
    }
    
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.tool-card, .feature-card').forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeUp 0.6s ease forwards;
        }
        
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .theme-transition {
            transition: background-color 0.3s ease, color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// ===== WINDOW LOAD EVENT =====
window.addEventListener('load', () => {
    // Remove preloader if exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
    
    // Update copyright year
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});