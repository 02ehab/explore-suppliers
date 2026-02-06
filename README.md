# 📋 Supplier Directory System

A modern admin dashboard for managing suppliers with **Supabase** authentication, built with **HTML5**, **Tailwind CSS**, and **Vanilla JavaScript**.

## 🌟 Features

- ✅ **Admin Authentication** - Email/password login with Supabase Auth
- ✅ **Supplier Management** - Full CRUD operations
- ✅ **Real-time Database** - PostgreSQL via Supabase
- ✅ **Arabic/RTL Support** - Complete RTL interface
- ✅ **Responsive Design** - Works on all devices
- ✅ **Row-level Security** - Data protection with RLS
- ✅ **Dashboard Statistics** - Real-time supplier metrics

## 📁 Project Structure

```
Supplies/
├── public/              # HTML pages & page-specific scripts
│   ├── index.html       # Landing page
│   ├── landing.js
│   ├── login.html       # Admin login
│   ├── login.js
│   ├── dashboard.html   # Supplier management
│   ├── dashboard.js
│   ├── supplier-form.html
│   └── supplier-form.js
├── js/                  # Shared modules
│   ├── supabase.js      # Supabase client config
│   ├── auth.js          # Authentication functions
│   ├── suppliers.js     # Supplier CRUD operations
│   └── ui.js            # UI utilities & toast notifications
├── css/
│   └── styles.css       # Custom styles
└── README.md
```

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Project URL and Anon Public Key
3. Update `js/supabase.js`:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_KEY = 'your-anon-key';
   ```

### Database Schema

Create these tables in Supabase:

```sql
-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  mobile_1 VARCHAR(20) NOT NULL,
  mobile_2 VARCHAR(20),
  email VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own suppliers
CREATE POLICY "Users can manage their suppliers"
  ON suppliers
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
```

## 🌐 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/supplier-directory.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/import](https://vercel.com/import)
   - Select your GitHub repository
   - Click "Import"
   - **No build configuration needed** (static site)
   - Click "Deploy"

3. **Set Environment Variables** (if needed)
   - Go to Project Settings → Environment Variables
   - Add `SUPABASE_URL` and `SUPABASE_KEY` (optional - already in js/supabase.js)

4. **Custom Domain** (optional)
   - In Vercel dashboard → Settings → Domains
   - Add your custom domain

## 📱 Usage

### Admin Login
1. Go to `/public/login.html`
2. Enter admin email and password
3. Dashboard opens in new tab
4. Manage suppliers with full CRUD operations

### Mobile Phone Format
- Accept only Egyptian numbers: **01xxxxxxxxx** (11 digits)
- Examples: `01024455315`, `01001234567`

### Features
- Add new suppliers
- Edit supplier details
- Delete suppliers
- Search & filter
- Export data (if implemented)
- Real-time statistics

## 🔐 Security Features

- ✅ Client-side session verification
- ✅ Protected routes (prevent unauthorized access)
- ✅ Row-level security (RLS) on database
- ✅ Loading overlay during auth verification
- ✅ Secure password storage (Supabase managed)

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Database**: PostgreSQL with RLS

## 📝 License

MIT License - feel free to use this project as a template

## 👨‍💻 Developer Notes

- No build process required (pure vanilla JS)
- All dependencies loaded from CDN (Tailwind, Supabase SDK)
- Fully responsive with mobile-first design
- RTL support for Arabic interface
- Production-ready code

## 📞 Support

For issues or questions, contact the development team.

---

**Happy coding! 🚀**
