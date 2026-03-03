import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import placeholder from './assets/placeholder.png'

const API_BASE = 'http://localhost:8080/api'

// ================= NAVBAR ================= 
function Navbar({ onSearch }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const fullName = localStorage.getItem('fullName')
  const [query, setQuery] = useState('')

  const logout = () => {
    localStorage.clear()
    navigate('/')
    window.location.reload()
  }

  return (
    <nav className="navbar">
      <div className="left">
        <Link to="/" className="logo">Vibha</Link>
      </div>

      <div className="center">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={() => onSearch?.(query)}>Search</button>
      </div>

      <div className="right">
        {token ? (
          <>
            <button onClick={() => navigate('/account')}>Account</button>
            <button onClick={() => navigate('/cart')}>Cart</button>
            <button onClick={logout}>Logout</button>
            <button className='accountname-btn1'>{fullName.at(0)}</button>
            {/* <span className="user-name">Hi, {fullName}</span> */}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/cart')}>Cart</button>
          </>
        )}
      </div>
    </nav>
  )
}

// ================= HOME =================//
function Home() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')

  const fetchProducts = async (searchArg = '', categoryId = null) => {
    const params = {}
    if (searchArg?.trim()) params.search = searchArg
    if (categoryId) params.categoryId = categoryId
    const res = await axios.get(`${API_BASE}/public/products`, { params })
    setProducts(res.data)
  }

  const fetchCategories = async () => {
    const res = await axios.get(`${API_BASE}/public/categories`)
    setCategories([{ id: 0, name: 'All' }, ...res.data])
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  return (
    <div>
      <Navbar onSearch={(q) => {
        setSearch(q)
        fetchProducts(q, selectedCategory?.id || null)
      }} />

      <div className="categories">
        {categories.map(c => (
          <button
            key={c.id}
            className={
              (selectedCategory === null && c.name === 'All') ||
                (selectedCategory?.id === c.id)
                ? 'active' : ''
            }
            onClick={() => {
              const isAll = c.name === 'All'
              const cid = isAll ? null : c.id
              setSelectedCategory(isAll ? null : c)
              fetchProducts(search, cid)
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid">
        {products.map(p => (
          <div key={p.id} className="card">
            <img src={p.imageUrl || placeholder} alt={p.name} />
            <h3>{p.name}</h3>
            <p>₹{p.price?.toFixed(2)}</p>
            <p>{'★'.repeat(p.ratings || 0)}</p>
            <p className="desc">{p.description}</p>
            <p>Stock: {p.stockAvailable}</p>
            <AddToCartButton product={p} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ================= ADD TO CART =================
function AddToCartButton({ product }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const out = (product.stockAvailable ?? 0) === 0

  const addToCart = async () => {
    if (!token) return navigate('/login')
    await axios.post(`${API_BASE}/cart`, null, {
      params: { productId: product.id, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Added to cart')
  }

  return (
    <button disabled={out} onClick={addToCart}>
      {out ? 'Out of Stock' : 'Add to Cart'}
    </button>
  )
}

// ================= CART =================
function Cart() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!token) return navigate('/login')
      const res = await axios.get(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(res.data)
    }
    load()
  }, [])

  const removeItem = async (id) => {
    await axios.delete(`${API_BASE}/cart/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setItems(items.filter(item => item.id !== id))
  }

  const total = items.reduce((sum, i) =>
    sum + (i.product.price * i.quantity), 0)

  return (
    <div>
      <Navbar onSearch={() => { }} />
      <div className="cart">
        {items.map(i => (
          <div key={i.id} className="cart-row">
            <span>{i.product.name}</span>
            <span>${(i.product.price * i.quantity).toFixed(2)}</span>
            <span>Qty: {i.quantity}</span>
            <button onClick={() => removeItem(i.id)}>Delete</button>
            <button onClick={() => navigate('/checkout')}>Buy Now</button>
          </div>
        ))}
        <div className="total">Total: ${total.toFixed(2)}</div>
      </div>
      <button className="continue-btn" onClick={() => navigate('/')}>
        Continue Shopping
      </button>
    </div>
  )
}

// ================= LOGIN =================
function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: ''
  })

  const submit = async (e) => {
    e.preventDefault()

    if (isRegister) {
      await axios.post(`${API_BASE}/auth/register`, form)
      alert('Registered! Please login.')
      setIsRegister(false)
    } else {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: form.email,
        password: form.password
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('fullName', res.data.fullName)

      navigate('/')
      window.location.reload()
    }
  }

  return (
    <div>
      <Navbar onSearch={() => { }} />
      <div className="auth">
        <form onSubmit={submit}>
          {isRegister && (
            <>
              <input placeholder="Full Name"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required />
              <input placeholder="Address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required />

              <input
                placeholder="Phone Number"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </>
          )}

          <input placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required />

          <input type="password" placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required />

          {isRegister && (
            <input type="password" placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required />
          )}

          <button type="submit">
            {isRegister ? 'Register' : 'Login'}
          </button>

          <button type="button"
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ================= ACCOUNT =================
function Account() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ fullName: '', address: '', phone: '' })

  useEffect(() => {
    const load = async () => {
      if (!token) return navigate('/login')
      const res = await axios.get(`${API_BASE}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data)
      setForm({
        fullName: res.data.fullName,
        address: res.data.address,
        phone: res.data.phone
      })
    }
    load()
  }, [])

  const updateProfile = async () => {
    const res = await axios.put(`${API_BASE}/user/me`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setUser(res.data)
    localStorage.setItem('fullName', res.data.fullName)
    setEditMode(false)
    alert('Profile updated!')
  }

  if (!user) return <div><Navbar onSearch={() => { }} /><p>Loading...</p></div>

  return (
    <div>
      <Navbar onSearch={() => { }} />
      <div className="auth">
        <h2>My Account</h2>

        {editMode ? (
          <>
            <input value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <input value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
            <input value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
            <button onClick={updateProfile}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>

            <button className="continue-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>

            <button className="continue-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ================= CHECKOUT =================
function Checkout() {
  const navigate = useNavigate()

  return (
    <div>
      <Navbar onSearch={() => { }} />
      <div className="checkout">
        <h2>You cannot afford this 😅</h2>
        <p>Apne aukaat ke hisaab se khareed na be.</p>
        <button
          className="continue-btn"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

// ================= APP =================
function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<Account />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  )
}

export default App