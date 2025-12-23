// ===== Application State =====
let appState = {
    company: null,
    invoices: [],
    currentInvoiceNumber: 1,
    currentFilter: '30days',
    customDateRange: { start: null, end: null }
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    loadAppData();
    initializeApp();
});

function loadAppData() {
    // Load company data
    const companyData = localStorage.getItem('gst_company');
    if (companyData) {
        appState.company = JSON.parse(companyData);
    }

    // Load invoices
    const invoicesData = localStorage.getItem('gst_invoices');
    if (invoicesData) {
        appState.invoices = JSON.parse(invoicesData);
    }

    // Load invoice number
    const invoiceNumber = localStorage.getItem('gst_invoice_number');
    if (invoiceNumber) {
        appState.currentInvoiceNumber = parseInt(invoiceNumber);
    }
}

function saveAppData() {
    localStorage.setItem('gst_company', JSON.stringify(appState.company));
    localStorage.setItem('gst_invoices', JSON.stringify(appState.invoices));
    localStorage.setItem('gst_invoice_number', appState.currentInvoiceNumber.toString());
}

function initializeApp() {
    if (!appState.company) {
        // Show setup view
        document.getElementById('setupView').style.display = 'flex';
        setupCompanyForm();
    } else {
        // Show main app
        document.getElementById('setupView').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        initializeDashboard();
        initializeInvoiceForm();
    }
}

// ===== Company Setup =====
function setupCompanyForm() {
    const form = document.getElementById('companySetupForm');
    const logoInput = document.getElementById('companyLogo');

    // Handle logo upload
    logoInput.addEventListener('change', handleLogoUpload);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        appState.company = {
            name: document.getElementById('companyName').value,
            gstin: document.getElementById('companyGSTIN').value.toUpperCase(),
            address: document.getElementById('companyAddress').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value,
            logo: appState.company?.logo || null
        };

        saveAppData();

        // Hide setup view and show app
        document.getElementById('setupView').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        initializeDashboard();
        initializeInvoiceForm();
    });
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const logoData = event.target.result;

            // Store in app state
            if (!appState.company) appState.company = {};
            appState.company.logo = logoData;

            // Show preview
            document.getElementById('logoPreviewImg').src = logoData;
            document.getElementById('logoPreview').style.display = 'block';
            document.getElementById('logoUploadText').textContent = '✓ Logo Uploaded';
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    if (appState.company) {
        appState.company.logo = null;
    }
    document.getElementById('logoPreview').style.display = 'none';
    document.getElementById('logoUploadText').textContent = '📷 Upload Logo';
    document.getElementById('companyLogo').value = '';
}

// ===== Dashboard =====
function initializeDashboard() {
    setupFilterButtons();
    setupNavigationButtons();
    updateDashboard();
}

function setupFilterButtons() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filter = chip.dataset.filter;
            appState.currentFilter = filter;

            if (filter === 'custom') {
                document.getElementById('customDateRange').style.display = 'flex';
            } else {
                document.getElementById('customDateRange').style.display = 'none';
                updateDashboard();
            }
        });
    });

    document.getElementById('applyCustomFilter').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (startDate && endDate) {
            appState.customDateRange = { start: startDate, end: endDate };
            updateDashboard();
        }
    });
}

function setupNavigationButtons() {
    document.getElementById('createInvoiceBtn').addEventListener('click', () => {
        showView('invoiceView');
        resetInvoiceForm();
    });

    document.getElementById('backToDashboard').addEventListener('click', () => {
        showView('dashboardView');
        updateDashboard();
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        showSettings();
    });

    document.getElementById('viewAllInvoices').addEventListener('click', () => {
        showInvoicesView();
    });
}

function populateCompanyForm() {
    if (appState.company) {
        document.getElementById('companyName').value = appState.company.name;
        document.getElementById('companyGSTIN').value = appState.company.gstin;
        document.getElementById('companyAddress').value = appState.company.address;
        document.getElementById('companyPhone').value = appState.company.phone;
        document.getElementById('companyEmail').value = appState.company.email;

        // Show logo if exists
        if (appState.company.logo) {
            document.getElementById('logoPreviewImg').src = appState.company.logo;
            document.getElementById('logoPreview').style.display = 'block';
            document.getElementById('logoUploadText').textContent = '✓ Logo Uploaded';
        }
    }
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function updateDashboard() {
    const filteredInvoices = getFilteredInvoices();

    // Update stats
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalGST = filteredInvoices.reduce((sum, inv) => sum + inv.cgst + inv.sgst, 0);

    document.getElementById('totalSales').textContent = formatCurrency(totalSales);
    document.getElementById('gstPayable').textContent = formatCurrency(totalGST);

    // Update period label
    const periodLabel = getPeriodLabel();
    document.getElementById('salesPeriod').textContent = periodLabel;

    // Update recent invoices
    displayRecentInvoices(filteredInvoices);
}

function getFilteredInvoices() {
    const now = new Date();
    let startDate;

    switch (appState.currentFilter) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'custom':
            if (appState.customDateRange.start && appState.customDateRange.end) {
                return appState.invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= new Date(appState.customDateRange.start) &&
                        invDate <= new Date(appState.customDateRange.end);
                });
            }
            return appState.invoices;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return appState.invoices.filter(inv => new Date(inv.date) >= startDate);
}

function getPeriodLabel() {
    switch (appState.currentFilter) {
        case 'today':
            return 'Today';
        case '7days':
            return 'Last 7 Days';
        case '30days':
            return 'Last 30 Days';
        case 'custom':
            if (appState.customDateRange.start && appState.customDateRange.end) {
                return `${appState.customDateRange.start} to ${appState.customDateRange.end}`;
            }
            return 'Custom Period';
        default:
            return 'Last 30 Days';
    }
}

function displayRecentInvoices(invoices) {
    const container = document.getElementById('recentInvoicesList');

    if (invoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <p>No invoices yet</p>
                <p class="empty-subtitle">Create your first invoice to get started</p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first) and take top 5
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    container.innerHTML = recentInvoices.map(invoice => `
        <div class="invoice-item" onclick="viewInvoice('${invoice.invoiceNo}')">
            <div class="invoice-info">
                <h4>${invoice.invoiceNo} - ${invoice.customerName}</h4>
                <p>${formatDate(invoice.date)}</p>
            </div>
            <div class="invoice-amount">${formatCurrency(invoice.grandTotal)}</div>
        </div>
    `).join('');
}

function viewInvoice(invoiceNo) {
    const invoice = appState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (invoice) {
        alert(`Invoice Details:\n\nInvoice No: ${invoice.invoiceNo}\nCustomer: ${invoice.customerName}\nDate: ${formatDate(invoice.date)}\nGrand Total: ${formatCurrency(invoice.grandTotal)}\n\nFull invoice view coming soon!`);
    }
}

// ===== Invoice Form =====
function initializeInvoiceForm() {
    setupCollapsibleCards();
    setupItemManagement();
    setupInvoiceFormHandlers();
}

function setupCollapsibleCards() {
    document.querySelectorAll('.card-header[data-toggle]').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.card');
            card.classList.toggle('collapsed');
        });
    });
}

function setupItemManagement() {
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    addItem(); // Add first item by default
}

let itemCounter = 0;

function addItem() {
    itemCounter++;
    const itemsList = document.getElementById('itemsList');

    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.dataset.itemId = itemCounter;

    itemRow.innerHTML = `
        <div class="item-header">
            <span class="item-label">Item ${itemCounter}</span>
            <button type="button" class="remove-item-btn" onclick="removeItem(${itemCounter})">×</button>
        </div>
        <div class="item-fields">
            <div class="form-group">
                <label>Item Description</label>
                <input type="text" class="item-description" placeholder="E.g., Product/Service name" required>
            </div>
            <div class="field-row">
                <div class="form-group">
                    <label>HSN/SAC</label>
                    <input type="text" class="item-hsn" placeholder="HSN/SAC Code" maxlength="8">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Rate</label>
                    <input type="number" class="item-rate" min="0" step="0.01" placeholder="0.00" required>
                </div>
                <div class="form-group">
                    <label>GST %</label>
                    <input type="number" class="item-gst" min="0" max="100" step="0.01" value="18" placeholder="18" required>
                </div>
            </div>
        </div>
    `;

    itemsList.appendChild(itemRow);

    // Add event listeners for calculation
    const quantityInput = itemRow.querySelector('.item-quantity');
    const rateInput = itemRow.querySelector('.item-rate');
    const gstInput = itemRow.querySelector('.item-gst');

    quantityInput.addEventListener('input', calculateTotals);
    rateInput.addEventListener('input', calculateTotals);
    gstInput.addEventListener('input', calculateTotals);
}

function removeItem(itemId) {
    const itemRow = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemRow) {
        itemRow.remove();
        calculateTotals();

        // Renumber remaining items
        const items = document.querySelectorAll('.item-row');
        items.forEach((item, index) => {
            item.querySelector('.item-label').textContent = `Item ${index + 1}`;
        });
    }
}

function setupInvoiceFormHandlers() {
    const form = document.getElementById('invoiceForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showInvoicePreview();
    });

    document.getElementById('saveDraftBtn').addEventListener('click', () => {
        saveDraft();
    });

    // Preview screen handlers
    document.getElementById('backToInvoiceForm').addEventListener('click', () => {
        showView('invoiceView');
    });

    document.getElementById('editInvoiceBtn').addEventListener('click', () => {
        showView('invoiceView');
    });

    document.getElementById('previewSaveDraftBtn').addEventListener('click', () => {
        saveDraft();
    });

    document.getElementById('previewGenerateBtn').addEventListener('click', () => {
        generateInvoice();
    });

    // Set default invoice date to today
    resetInvoiceForm();
}

function resetInvoiceForm() {
    // Set invoice number
    document.getElementById('invoiceNo').value = `#${String(appState.currentInvoiceNumber).padStart(5, '0')}`;

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    // Clear customer details
    document.getElementById('customerName').value = '';
    document.getElementById('customerGSTIN').value = '';
    if (document.getElementById('customerAddress')) {
        document.getElementById('customerAddress').value = '';
    }

    // Clear items
    document.getElementById('itemsList').innerHTML = '';
    itemCounter = 0;
    addItem();

    calculateTotals();
}

function calculateTotals() {
    const items = document.querySelectorAll('.item-row');
    let subtotal = 0;
    let totalGST = 0;

    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const gstPercent = parseFloat(item.querySelector('.item-gst').value) || 0;

        const itemAmount = quantity * rate;
        const itemGST = itemAmount * (gstPercent / 100);

        subtotal += itemAmount;
        totalGST += itemGST;
    });

    const grandTotal = subtotal + totalGST;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('totalGST').textContent = formatCurrency(totalGST);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

function getInvoiceData() {
    const items = [];
    let totalGST = 0;

    document.querySelectorAll('.item-row').forEach(itemRow => {
        const description = itemRow.querySelector('.item-description').value;
        const hsn = itemRow.querySelector('.item-hsn').value || '';
        const quantity = parseFloat(itemRow.querySelector('.item-quantity').value);
        const rate = parseFloat(itemRow.querySelector('.item-rate').value);
        const gstPercent = parseFloat(itemRow.querySelector('.item-gst').value) || 0;

        if (description && quantity && rate) {
            const amount = quantity * rate;
            const gstAmount = amount * (gstPercent / 100);
            totalGST += gstAmount;
            items.push({ description, hsn, quantity, rate, gstPercent, amount, gstAmount });
        }
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const grandTotal = subtotal + totalGST;

    return {
        invoiceNo: document.getElementById('invoiceNo').value,
        date: document.getElementById('invoiceDate').value,
        customerName: document.getElementById('customerName').value,
        customerGSTIN: document.getElementById('customerGSTIN').value.toUpperCase(),
        customerAddress: document.getElementById('customerAddress') ? document.getElementById('customerAddress').value : '',
        items,
        subtotal,
        totalGST,
        grandTotal,
        createdAt: new Date().toISOString()
    };
}

function showInvoicePreview() {
    const invoiceData = getInvoiceData();

    if (!invoiceData.customerName) {
        alert('Please enter customer name');
        return;
    }

    if (invoiceData.items.length === 0) {
        alert('Please add at least one item');
        return;
    }

    // Populate preview
    document.getElementById('previewCompanyName').textContent = appState.company.name;
    document.getElementById('previewCompanyAddress').textContent = appState.company.address;
    if (appState.company.gstin) {
        document.getElementById('previewCompanyGSTIN').textContent = `GSTIN: ${appState.company.gstin}`;
        document.getElementById('previewCompanyGSTIN').style.display = 'block';
    } else {
        document.getElementById('previewCompanyGSTIN').style.display = 'none';
    }

    // Show logo or placeholder
    if (appState.company.logo) {
        document.getElementById('previewCompanyLogo').src = appState.company.logo;
        document.getElementById('previewCompanyLogo').style.display = 'block';
        document.getElementById('previewLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('previewCompanyLogo').style.display = 'none';
        document.getElementById('previewLogoPlaceholder').style.display = 'flex';
    }

    // Customer details
    document.getElementById('previewCustomerName').textContent = invoiceData.customerName;
    if (invoiceData.customerGSTIN) {
        document.getElementById('previewCustomerGSTIN').textContent = `GSTIN: ${invoiceData.customerGSTIN}`;
        document.getElementById('previewCustomerGSTIN').style.display = 'block';
    } else {
        document.getElementById('previewCustomerGSTIN').style.display = 'none';
    }

    // Invoice meta
    document.getElementById('previewInvoiceNo').textContent = invoiceData.invoiceNo;
    document.getElementById('previewInvoiceDate').textContent = formatDate(invoiceData.date);

    // Items table
    const itemsBody = document.getElementById('previewItemsBody');
    itemsBody.innerHTML = invoiceData.items.map(item => `
        <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.rate)}</td>
            <td>${item.gstPercent}%</td>
            <td>${formatCurrency(item.amount + item.gstAmount)}</td>
        </tr>
    `).join('');

    // Totals
    document.getElementById('previewSubtotal').textContent = formatCurrency(invoiceData.subtotal);
    document.getElementById('previewTotalGST').textContent = formatCurrency(invoiceData.totalGST);
    document.getElementById('previewGrandTotal').textContent = formatCurrency(invoiceData.grandTotal);

    // Show preview
    showView('previewView');
}

async function generateInvoice() {
    const invoiceData = getInvoiceData();

    // Save invoice
    appState.invoices.push(invoiceData);
    appState.currentInvoiceNumber++;
    saveAppData();

    // Generate PDF
    try {
        await generateInvoicePDF(invoiceData);

        // Create filename for display
        const dateStr = new Date().toISOString().split('T')[0];
        const customerNameClean = invoiceData.customerName.replace(/[^a-zA-Z0-9]/g, '_');
        const invoiceNoClean = invoiceData.invoiceNo.replace('#', '');
        const fileName = `GST_Invoice_${invoiceNoClean}_${customerNameClean}_${dateStr}.pdf`;

        // Show success message with filename
        alert(`✅ Invoice Generated Successfully!\n\nInvoice: ${invoiceData.invoiceNo}\nCustomer: ${invoiceData.customerName}\nAmount: ${formatCurrency(invoiceData.grandTotal)}\n\n📄 PDF Downloaded:\n${fileName}\n\n📁 Location: Check your Downloads folder\n(Usually C:\\Users\\YourName\\Downloads)`);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert(`Invoice ${invoiceData.invoiceNo} saved successfully!\n\n⚠️ PDF download failed. Please try again.\n\nError: ${error.message}`);
    }

    // Go back to dashboard
    showView('dashboardView');
    updateDashboard();
}

async function generateInvoicePDF(invoiceData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // === Company Header ===
    // Logo (if exists)
    if (appState.company.logo) {
        try {
            doc.addImage(appState.company.logo, 'PNG', margin, yPos, 25, 25);
        } catch (e) {
            console.log('Logo not added:', e);
        }
    } else {
        // Logo placeholder
        doc.setDrawColor(200);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos, 25, 25, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Logo', margin + 12.5, yPos + 14, { align: 'center' });
    }

    // Company Name and Details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(appState.company.name, margin + 30, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(appState.company.address, margin + 30, yPos + 14);
    doc.text(`Email: ${appState.company.email} | Phone: ${appState.company.phone}`, margin + 30, yPos + 19);
    if (appState.company.gstin) {
        doc.text(`GSTIN: ${appState.company.gstin}`, margin + 30, yPos + 24);
    }

    yPos += 35;

    // Horizontal line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // === Invoice Title ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('TAX INVOICE (GST)', margin, yPos);

    // Invoice Number and Date (right aligned)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoiceData.invoiceNo}`, pageWidth - margin, yPos, { align: 'right' });
    doc.text(`Date: ${formatDateForPDF(invoiceData.date)}`, pageWidth - margin, yPos + 5, { align: 'right' });

    yPos += 15;

    // === Bill To Section ===
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(invoiceData.customerName, margin, yPos);

    if (invoiceData.customerAddress) {
        yPos += 5;
        const addressLines = doc.splitTextToSize(invoiceData.customerAddress, 80);
        doc.text(addressLines, margin, yPos);
        yPos += addressLines.length * 5;
    }

    if (invoiceData.customerGSTIN) {
        yPos += 5;
        doc.text(`GSTIN: ${invoiceData.customerGSTIN}`, margin, yPos);
    }

    yPos += 10;

    // === Items Table ===
    const tableStartY = yPos;
    const colWidths = {
        sno: 12,
        description: 55,
        hsn: 22,
        qty: 15,
        rate: 28,
        gst: 18,
        amount: 35
    };

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);

    let xPos = margin + 2;
    doc.text('S.No', xPos, yPos + 5.5);
    xPos += colWidths.sno;
    doc.text('Description', xPos, yPos + 5.5);
    xPos += colWidths.description;
    doc.text('HSN/SAC', xPos, yPos + 5.5);
    xPos += colWidths.hsn;
    doc.text('Qty', xPos, yPos + 5.5);
    xPos += colWidths.qty;
    doc.text('Rate', xPos, yPos + 5.5);
    xPos += colWidths.rate;
    doc.text('GST%', xPos, yPos + 5.5);
    xPos += colWidths.gst;
    doc.text('Amount', xPos, yPos + 5.5);

    yPos += 8;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    invoiceData.items.forEach((item, index) => {
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = margin;
        }

        yPos += 6;
        xPos = margin + 2;

        doc.text(String(index + 1), xPos, yPos);
        xPos += colWidths.sno;

        const descLines = doc.splitTextToSize(item.description, colWidths.description - 4);
        doc.text(descLines, xPos, yPos);
        xPos += colWidths.description;

        doc.text(item.hsn || '-', xPos, yPos);
        xPos += colWidths.hsn;

        doc.text(String(item.quantity), xPos, yPos);
        xPos += colWidths.qty;

        doc.text(formatNumberForPDF(item.rate), xPos, yPos);
        xPos += colWidths.rate;

        doc.text(`${item.gstPercent}%`, xPos, yPos);
        xPos += colWidths.gst;

        doc.text(formatNumberForPDF(item.amount + item.gstAmount), xPos, yPos);

        yPos += Math.max(descLines.length * 5, 6);
    });

    yPos += 5;

    // Table border
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, yPos - tableStartY);

    // Vertical lines
    xPos = margin + colWidths.sno;
    doc.line(xPos, tableStartY, xPos, yPos);
    xPos += colWidths.description;
    doc.line(xPos, tableStartY, xPos, yPos);
    xPos += colWidths.hsn;
    doc.line(xPos, tableStartY, xPos, yPos);
    xPos += colWidths.qty;
    doc.line(xPos, tableStartY, xPos, yPos);
    xPos += colWidths.rate;
    doc.line(xPos, tableStartY, xPos, yPos);
    xPos += colWidths.gst;
    doc.line(xPos, tableStartY, xPos, yPos);

    yPos += 10;

    // === Totals Section ===
    const totalsX = pageWidth - margin - 80;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text('Subtotal:', totalsX, yPos);
    doc.text(formatNumberForPDF(invoiceData.subtotal), pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;

    doc.text('Total GST:', totalsX, yPos);
    doc.text(formatNumberForPDF(invoiceData.totalGST), pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grand Total:', totalsX, yPos);
    doc.text(formatNumberForPDF(invoiceData.grandTotal), pageWidth - margin, yPos, { align: 'right' });

    yPos += 15;

    // === Footer ===
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    // Terms & Conditions on left
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('Terms & Conditions:', margin, yPos);
    doc.setFontSize(7);
    doc.text('1. Goods once sold will not be taken back.', margin, yPos + 5);
    doc.text('2. Payment is due within 30 days.', margin, yPos + 10);

    // Authorized Signature on right
    const signatureX = pageWidth - margin - 50;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    // Draw signature line
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(signatureX, yPos + 15, pageWidth - margin, yPos + 15);

    // Signature label
    doc.setFontSize(8);
    doc.text('Authorized Signature', signatureX + 10, yPos + 20);

    // Company name under signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`For ${appState.company.name}`, signatureX, yPos + 5);

    // Save PDF with date in filename
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const customerNameClean = invoiceData.customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const invoiceNoClean = invoiceData.invoiceNo.replace('#', '');
    const fileName = `GST_Invoice_${invoiceNoClean}_${customerNameClean}_${dateStr}.pdf`;

    // Create blob and download with proper filename
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show user where file is saved
    console.log(`PDF saved as: ${fileName}`);
    console.log('Location: Your browser Downloads folder');
}

function formatNumberForPDF(number) {
    return 'Rs. ' + number.toFixed(2);
}

function formatDateForPDF(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function saveDraft() {
    const invoiceData = getInvoiceData();

    if (!invoiceData.customerName && invoiceData.items.length === 0) {
        alert('Please add some invoice details before saving draft');
        return;
    }

    // Save as draft (you could add a draft flag)
    invoiceData.isDraft = true;
    appState.invoices.push(invoiceData);
    appState.currentInvoiceNumber++;
    saveAppData();

    alert('Draft saved successfully!');
    showView('dashboardView');
    updateDashboard();
}

// ===== Settings Functions =====
function showSettings() {
    if (!appState.company) {
        alert('Please complete company setup first');
        return;
    }

    // Populate settings with company data
    document.getElementById('settingsCompanyName').textContent = appState.company.name;
    document.getElementById('settingsGSTIN').textContent = appState.company.gstin;
    document.getElementById('settingsAddress').textContent = appState.company.address;
    document.getElementById('settingsPhone').textContent = appState.company.phone;
    document.getElementById('settingsEmail').textContent = appState.company.email;

    // Show logo if exists
    if (appState.company.logo) {
        document.getElementById('settingsLogo').src = appState.company.logo;
        document.getElementById('settingsLogo').style.display = 'block';
        document.getElementById('settingsLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('settingsLogo').style.display = 'none';
        document.getElementById('settingsLogoPlaceholder').style.display = 'flex';
    }

    // Setup event listeners
    document.getElementById('editCompanyBtn').onclick = () => {
        document.getElementById('setupModal').style.display = 'flex';
        populateCompanyForm();
    };

    document.getElementById('clearAllDataBtn').onclick = clearAllData;

    document.getElementById('backToSettingsDashboard').onclick = () => {
        showView('dashboardView');
        updateDashboard();
    };

    showView('settingsView');
}

function clearAllData() {
    const confirmation = confirm('⚠️ WARNING: This will delete ALL invoices and company data!\n\nThis action cannot be undone. Are you sure you want to continue?');

    if (confirmation) {
        const doubleCheck = confirm('Are you absolutely sure? This will permanently delete:\n\n• All invoices\n• Company information\n• All saved data\n\nType OK to confirm.');

        if (doubleCheck) {
            // Clear all localStorage
            localStorage.removeItem('gst_company');
            localStorage.removeItem('gst_invoices');
            localStorage.removeItem('gst_invoice_number');

            // Reset app state
            appState = {
                company: null,
                invoices: [],
                currentInvoiceNumber: 1,
                currentFilter: '30days',
                customDateRange: { start: null, end: null }
            };

            alert('✅ All data has been cleared successfully!\n\nThe app will now reload.');

            // Reload the page
            window.location.reload();
        }
    }
}

// ===== Invoice Management Functions =====
function showInvoicesView() {
    showView('invoicesView');
    displayAllInvoices('all');
    setupInvoiceManagementHandlers();
}

function setupInvoiceManagementHandlers() {
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const status = tab.dataset.status;
            displayAllInvoices(status);
        });
    });

    // Search toggle
    const searchToggle = document.getElementById('searchToggleBtn');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('invoiceSearchInput');

    searchToggle.addEventListener('click', () => {
        if (searchBar.style.display === 'none') {
            searchBar.style.display = 'block';
            searchInput.focus();
        } else {
            searchBar.style.display = 'none';
            searchInput.value = '';
            const activeTab = document.querySelector('.filter-tab.active');
            displayAllInvoices(activeTab ? activeTab.dataset.status : 'all');
        }
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const activeTab = document.querySelector('.filter-tab.active');
        const status = activeTab ? activeTab.dataset.status : 'all';
        displayAllInvoices(status, query);
    });

    // Back button
    document.getElementById('backToInvoicesDashboard').addEventListener('click', () => {
        showView('dashboardView');
        updateDashboard();
    });

    // Create invoice FAB
    document.getElementById('createInvoiceFab').addEventListener('click', () => {
        showView('invoiceView');
        resetInvoiceForm();
    });
}

function displayAllInvoices(status = 'all', searchQuery = '') {
    const container = document.getElementById('allInvoicesList');

    let filteredInvoices = [...appState.invoices];

    // Filter by status
    if (status !== 'all') {
        filteredInvoices = filteredInvoices.filter(inv => getInvoiceStatus(inv) === status);
    }

    // Filter by search query
    if (searchQuery) {
        filteredInvoices = filteredInvoices.filter(inv =>
            inv.customerName.toLowerCase().includes(searchQuery) ||
            inv.invoiceNo.toLowerCase().includes(searchQuery)
        );
    }

    if (filteredInvoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <p>No invoices found</p>
                <p class="empty-subtitle">${searchQuery ? 'Try a different search term' : 'Create your first invoice to get started'}</p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = filteredInvoices.map(invoice => {
        const status = getInvoiceStatus(invoice);
        const statusClass = `status-${status}`;
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

        return `
            <div class="invoice-card" data-invoice-id="${invoice.invoiceNo}">
                <div class="invoice-card-header">
                    <div class="invoice-card-info">
                        <h4>${invoice.customerName}</h4>
                        <div class="invoice-card-meta">
                            <span>${invoice.invoiceNo}</span>
                            <span>•</span>
                            <span>Due: ${formatDate(invoice.date)}</span>
                        </div>
                    </div>
                    <div class="invoice-card-amount">
                        <div class="invoice-amount-value">${formatCurrency(invoice.grandTotal)}</div>
                        <span class="invoice-status-badge ${statusClass}">
                            <span class="status-dot"></span>
                            ${statusLabel}
                        </span>
                    </div>
                </div>
                <div class="invoice-card-actions">
                    <button class="action-btn" onclick="shareInvoice('${invoice.invoiceNo}')">
                        📤 Share
                    </button>
                    <button class="action-btn" onclick="editInvoice('${invoice.invoiceNo}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn" onclick="downloadInvoicePDF('${invoice.invoiceNo}')">
                        📄 PDF
                    </button>
                    <button class="action-btn btn-more" onclick="showInvoiceMenu('${invoice.invoiceNo}')">
                        ⋮
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getInvoiceStatus(invoice) {
    if (invoice.isDraft) return 'draft';
    if (invoice.isPaid) return 'paid';

    // Check if overdue (past due date)
    const dueDate = new Date(invoice.date);
    const today = new Date();
    if (dueDate < today && !invoice.isPaid) return 'overdue';

    return 'unpaid';
}

async function shareInvoice(invoiceNo) {
    const invoice = appState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (!invoice) return;

    const shareText = `Invoice ${invoice.invoiceNo}\nCustomer: ${invoice.customerName}\nAmount: ${formatCurrency(invoice.grandTotal)}\nDate: ${formatDate(invoice.date)}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Invoice ${invoice.invoiceNo}`,
                text: shareText
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        }
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Invoice details copied to clipboard!');
    }).catch(() => {
        alert('Invoice details:\n\n' + text);
    });
}

function editInvoice(invoiceNo) {
    alert(`Edit functionality for ${invoiceNo} coming soon!\n\nThis will allow you to modify invoice details.`);
}

async function downloadInvoicePDF(invoiceNo) {
    const invoice = appState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (!invoice) {
        alert('Invoice not found');
        return;
    }

    try {
        await generateInvoicePDF(invoice);
        alert(`✅ PDF downloaded successfully!\n\nInvoice: ${invoice.invoiceNo}`);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert(`⚠️ PDF download failed.\n\nError: ${error.message}`);
    }
}

function showInvoiceMenu(invoiceNo) {
    const invoice = appState.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (!invoice) return;

    const options = [
        '1. Mark as Paid',
        '2. Mark as Unpaid',
        '3. Delete Invoice',
        '4. Cancel'
    ];

    const choice = prompt(`Invoice ${invoiceNo} - Options:\n\n${options.join('\n')}\n\nEnter option number:`);

    switch (choice) {
        case '1':
            invoice.isPaid = true;
            saveAppData();
            displayAllInvoices(document.querySelector('.filter-tab.active')?.dataset.status || 'all');
            alert('✅ Invoice marked as Paid');
            break;
        case '2':
            invoice.isPaid = false;
            saveAppData();
            displayAllInvoices(document.querySelector('.filter-tab.active')?.dataset.status || 'all');
            alert('✅ Invoice marked as Unpaid');
            break;
        case '3':
            if (confirm(`Delete invoice ${invoiceNo}?\n\nThis action cannot be undone.`)) {
                appState.invoices = appState.invoices.filter(inv => inv.invoiceNo !== invoiceNo);
                saveAppData();
                displayAllInvoices(document.querySelector('.filter-tab.active')?.dataset.status || 'all');
                alert('✅ Invoice deleted');
            }
            break;
    }
}

// ===== Utility Functions =====
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Make functions available globally
window.removeItem = removeItem;
window.viewInvoice = viewInvoice;
window.removeLogo = removeLogo;
window.shareInvoice = shareInvoice;
window.editInvoice = editInvoice;
window.downloadInvoicePDF = downloadInvoicePDF;
window.showInvoiceMenu = showInvoiceMenu;
