# GST Billing App 📊

A mobile-friendly GST billing application for small businesses to create invoices, track sales, and manage GST filings.

![Dashboard Preview](C:/Users/manoj kumar gupta/.gemini/antigravity/brain/4862abe7-99a5-4d7f-bf9d-e384f03c4180/dashboard_view_2_1763886512457.png)

## ✨ Features

### 🏢 Company Setup
- First-time onboarding with company details
- GSTIN validation (15-character format)
- Persistent data storage
- Editable company profile via settings

### 📈 Dashboard Analytics
- **Total Sales**: Aggregated sales for selected period
- **GST Payable**: Total CGST + SGST to be paid
- **Date Filters**: Today, Last 7 Days, Last 30 Days, Custom Range
- **Recent Invoices**: Quick view of last 5 invoices
- **Quick Actions**: Floating button for instant invoice creation

### 📄 Invoice Generator
- Auto-incrementing invoice numbers (#00001, #00002...)
- Customer details with optional GSTIN and address
- Dynamic item management (add/remove items)
- **Automatic GST Calculations**:
  - Subtotal calculation
  - CGST @ 9%
  - SGST @ 9%
  - Grand Total
- Save draft functionality
- Form validation
- **Professional invoice preview**
- **PDF Invoice Generation** ⭐ NEW
  - Professional PDF invoices matching industry standards
  - Company logo integration
  - Items table with HSN/SAC codes
  - Complete GST breakdown
  - Auto-download to Downloads folder
  - Filename: `Invoice_00001_Customer_Name.pdf`

## 🚀 Getting Started

1. **Open the App**: Simply open `index.html` in any modern web browser
2. **First Launch**: Complete the company setup form
3. **Create Invoices**: Click the + button to start creating invoices
4. **Track Sales**: Use dashboard filters to view sales by period

## 📸 Screenshots

### Company Setup
![Company Setup](C:/Users/manoj kumar gupta/.gemini/antigravity/brain/4862abe7-99a5-4d7f-bf9d-e384f03c4180/company_setup_modal_1763886427262.png)

### Invoice Creation
![Invoice Form](C:/Users/manoj kumar gupta/.gemini/antigravity/brain/4862abe7-99a5-4d7f-bf9d-e384f03c4180/invoice_form_view_2_1763886527582.png)

### Completed Invoice with Calculations
![Filled Invoice](C:/Users/manoj kumar gupta/.gemini/antigravity/brain/4862abe7-99a5-4d7f-bf9d-e384f03c4180/filled_invoice_form_2_1763887145439.png)

## 🧮 GST Calculation Example

| Item | Description | Qty | Rate | Amount |
|------|-------------|-----|------|--------|
| 1 | Web Development Services | 2 | ₹50,000 | ₹100,000 |
| 2 | SEO Optimization | 1 | ₹25,000 | ₹25,000 |

- **Subtotal**: ₹125,000.00
- **CGST (9%)**: ₹11,250.00
- **SGST (9%)**: ₹11,250.00
- **Grand Total**: ₹147,500.00

## 💻 Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No dependencies for core functionality
- **jsPDF 2.5.1**: Professional PDF generation library
- **localStorage**: Client-side data persistence

## 🎨 Design Features

- Modern dark theme with vibrant gradients
- Smooth animations and transitions
- Mobile-first responsive design
- Glassmorphism effects
- Inter font family for clean typography
- Touch-friendly interface

## 📁 Project Structure

```
New folder/
├── index.html      # Main HTML structure with jsPDF library
├── styles.css      # Complete styling with animations
├── app.js          # Application logic + PDF generation
└── README.md       # This file
```

## 💾 Data Storage

All data is stored locally in your browser using localStorage:
- `gst_company`: Company profile information
- `gst_invoices`: Array of all generated invoices
- `gst_invoice_number`: Auto-increment counter

**Note**: Data persists across browser sessions but is specific to the browser and device.

## 📱 Mobile Responsive

The app is fully responsive and works seamlessly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🔒 Privacy

- All data is stored locally on your device
- No data is sent to external servers
- Complete privacy and data control

## 🎯 Use Cases

Perfect for:
- Small businesses
- Freelancers
- Consultants
- Service providers
- Anyone needing GST-compliant invoices

## 📝 How to Use

### Creating Your First Invoice

1. **Fill Company Details**: On first launch, complete the setup form
2. **Access Dashboard**: View your sales metrics and invoices
3. **Create Invoice**: Click the floating + button
4. **Enter Details**:
   - Invoice date (defaults to today)
   - Customer name and GSTIN
   - Add items with description, quantity, and rate
5. **Review Totals**: GST calculations update automatically
6. **Generate**: Click "Generate Invoice" to save

### Using Date Filters

- **Today**: View today's sales and invoices
- **Last 7 Days**: Week-to-date overview
- **Last 30 Days**: Monthly summary (default)
- **Custom**: Select specific date range

### Managing Invoices

- View recent invoices on the dashboard
- Click on any invoice to view details
- All invoices are saved automatically
- Draft invoices can be saved for later completion

## 📄 PDF Invoice Generation

### How It Works

When you click "Generate Invoice & Download PDF":

1. **Invoice is saved** to your local database
2. **PDF is created** with professional formatting
3. **File is downloaded** automatically to your Downloads folder
4. **Dashboard updates** with the new invoice

### PDF Features

The generated PDF includes:

- ✅ **Company Header** - Logo, name, address, GSTIN
- ✅ **Invoice Details** - Number and date
- ✅ **Bill To Section** - Customer name, address, GSTIN
- ✅ **Items Table** - Description, HSN/SAC, Qty, Rate, GST%, Amount
- ✅ **GST Breakdown** - Subtotal, CGST (9%), SGST (9%), Grand Total
- ✅ **Footer** - Terms & Conditions

### PDF File Details

**Filename Format:**
```
GST_Invoice_[Number]_[CustomerName]_[Date].pdf
```

**Example:**
```
GST_Invoice_00001_ABC_Corporation_2025-11-23.pdf
```

**Location:**
- Automatically saved to your Downloads folder
- Path: `C:\Users\YourName\Downloads\`
- Check browser downloads bar (Ctrl+J in Chrome/Edge)

### Sample PDF Layout

```
┌────────────────────────────────────────────┐
│  [Logo]    Your Company Name               │
│            Address, Email, Phone           │
│            GSTIN: XXXXXXXXXXXX             │
├────────────────────────────────────────────┤
│  TAX INVOICE (GST)    Invoice #: #00001    │
│                       Date: 23-Nov-2025    │
│                                            │
│  Bill To:                                  │
│  Customer Name                             │
│  Customer Address                          │
│  GSTIN: XXXXXXXXXXXX                       │
│                                            │
│  ┌──┬───────┬───┬───┬────┬───┬────────┐  │
│  │No│Desc   │HSN│Qty│Rate│GST│Amount  │  │
│  ├──┼───────┼───┼───┼────┼───┼────────┤  │
│  │1 │Item..│---│ 1 │1000│18%│₹1,000  │  │
│  └──┴───────┴───┴───┴────┴───┴────────┘  │
│                                            │
│                    Subtotal:   ₹1,000.00  │
│                    CGST (9%):     ₹90.00  │
│                    SGST (9%):     ₹90.00  │
│                    Grand Total: ₹1,180.00 │
│                                            │
│  Terms & Conditions: ...                  │
└────────────────────────────────────────────┘
```

## 🛠️ Customization

You can easily customize:
- GST rates (currently CGST 9% + SGST 9%)
- Color scheme in `styles.css`
- Invoice number format in `app.js`
- Company fields in the setup form

## 🐛 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📄 License

Free to use for personal and commercial purposes.

## 🤝 Support

For issues or questions, refer to the code comments in:
- `app.js` - Application logic
- `styles.css` - Styling details
- `index.html` - Structure

---

**Made with ❤️ for small businesses in India**
