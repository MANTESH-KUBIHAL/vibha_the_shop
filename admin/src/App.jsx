import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import placeholder from "./assets/placeholder.png"

const API_BASE = 'http://localhost:8080/api'

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Admin</h2>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/users">Users</Link>
      </nav>
    </aside>
  )
}

function AdminLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, form)
      if (res.data.role !== 'ADMIN') return alert('Admin only')
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error'
      alert(`Login failed: ${msg}`)
    }
  }
  return (
    <div className="auth">
      <form onSubmit={submit}>
        <input placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, orders: 0 })
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  useEffect(() => {
    const load = async () => {
      try {
        const [p, c, u, o] = await Promise.all([
          axios.get(`${API_BASE}/admin/products/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/categories/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/users/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/orders/count`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setStats({ products: p.data || 0, categories: c.data || 0, users: u.data || 0, orders: o.data || 0 })
      } catch {
        navigate('/login')
      }
    }
    load()
  }, [])
  useEffect(() => {
    const id = setInterval(async () => {
      if (!token) return
      try {
        const [p, c, u, o] = await Promise.all([
          axios.get(`${API_BASE}/admin/products/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/categories/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/users/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/orders/count`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setStats({ products: p.data || 0, categories: c.data || 0, users: u.data || 0, orders: o.data || 0 })
      } catch { }
    }, 10000)
    return () => clearInterval(id)
  }, [])
  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="stat">Products: {stats.products}</div>
        <div className="stat">Categories: {stats.categories}</div>
        <div className="stat">Users: {stats.users}</div>
        <div className="stat">Orders: {stats.orders}</div>
      </div>
    </AdminLayout>
  )
}

function Products() {
  const token = localStorage.getItem('token')
  const [cats, setCats] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    ratings: '5',
    description: '',
    stockAvailable: '1',
    categoryId: ''
  })
  const [image, setImage] = useState(null)
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/public/categories`)
        setCats(res.data)
        if (res.data.length) {
          setForm(f => ({ ...f, categoryId: res.data[0].id }))
        }
      } catch (err) {
        console.error("Category load failed", err)
      }
    }

    const loadProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/public/products`)
        setProducts(res.data)
      } catch (err) {
        console.error("Product load failed", err)
      }
    }
    loadCats()
    loadProducts()
  }, [])
  const submit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('price', parseFloat(form.price))
    fd.append('ratings', parseInt(form.ratings))
    fd.append('description', form.description)
    fd.append('stockAvailable', parseInt(form.stockAvailable))
    fd.append('categoryId', form.categoryId)
    if (image) fd.append('image', image)
    await axios.post(`${API_BASE}/admin/products`, fd, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Product created')
    const res = await axios.get(`${API_BASE}/public/products`)
    setProducts(res.data)
    setForm({ name: '', price: '', ratings: '5', description: '', stockAvailable: '1', categoryId: cats[0]?.id || '' })
    setImage(null)
  }
  return (
    <AdminLayout>
      <h3>Add Product</h3>
      <form className="auth" onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <input type="number" min="1" max="5" placeholder="Ratings" value={form.ratings} onChange={e => setForm({ ...form, ratings: e.target.value })} />
        <input type="number" min="0" placeholder="Stock Available" value={form.stockAvailable} onChange={e => setForm({ ...form, stockAvailable: e.target.value })} />
        <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Create</button>
      </form>
      <h3>All Products</h3>
      <div className="grid">
        {products.map(p => (
          <div key={p.id} className="card">
            <img src={{ placeholder }} alt={p.name} />
            <h4>{p.name}</h4>
            <div>${p.price?.toFixed(2)}</div>
            <div>{p.category?.name}</div>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              <button onClick={async () => {
                const token = localStorage.getItem('token')
                await axios.delete(`${API_BASE}/admin/products/${p.id}`, { headers: { Authorization: `Bearer ${token}` } })
                const res = await axios.get(`${API_BASE}/public/products`)
                setProducts(res.data)
              }}>Delete</button>
            </div>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              <input placeholder="Name" value={p.name} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))} />
              <input type="number" step="0.01" placeholder="Price" value={p.price} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, price: parseFloat(e.target.value) } : x))} />
              <input type="number" min="1" max="5" placeholder="Ratings" value={p.ratings} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, ratings: parseInt(e.target.value) } : x))} />
              <input type="number" min="0" placeholder="Stock" value={p.stockAvailable} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stockAvailable: parseInt(e.target.value) } : x))} />
              <select value={p.category?.id || ''} onChange={e => {
                const cid = parseInt(e.target.value)
                const cat = cats.find(c => c.id === cid)
                setProducts(prev => prev.map(x => x.id === p.id ? { ...x, category: cat } : x))
              }}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0] || null
                setProducts(prev => prev.map(x => x.id === p.id ? { ...x, _newImage: file } : x))
              }} />
              <textarea placeholder="Description" value={p.description} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, description: e.target.value } : x))} />
              <button onClick={async () => {
                const token = localStorage.getItem('token')
                const fd = new FormData()
                fd.append('name', p.name)
                fd.append('price', p.price)
                fd.append('ratings', p.ratings)
                fd.append('description', p.description || '')
                fd.append('stockAvailable', p.stockAvailable)
                fd.append('categoryId', p.category?.id)
                if (p._newImage) fd.append('image', p._newImage)
                await axios.put(`${API_BASE}/admin/products/${p.id}`, fd, { headers: { Authorization: `Bearer ${token}` } })
                const res = await axios.get(`${API_BASE}/public/products`)
                setProducts(res.data)
              }}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

function Categories() {
  const [cats, setCats] = useState([])
  const [newName, setNewName] = useState('')
  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_BASE}/public/categories`)
      setCats(res.data)
    }
    load()
  }, [])
  const create = async () => {
    const token = localStorage.getItem('token')
    await axios.post(`${API_BASE}/admin/categories`, null, {
      params: { name: newName },
      headers: { Authorization: `Bearer ${token}` }
    })
    const res = await axios.get(`${API_BASE}/public/categories`)
    setCats(res.data)
    setNewName('')
  }
  const update = async (id, name) => {
    const token = localStorage.getItem('token')
    await axios.put(`${API_BASE}/admin/categories/${id}`, null, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` }
    })
    const res = await axios.get(`${API_BASE}/public/categories`)
    setCats(res.data)
  }
  const remove = async (id) => {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_BASE}/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const res = await axios.get(`${API_BASE}/public/categories`)
    setCats(res.data)
  }
  return (
    <AdminLayout>
      <h3>Categories</h3>
      <div className="auth">
        <input placeholder="New category name" value={newName} onChange={e => setNewName(e.target.value)} />
        <button onClick={create}>Add Category</button>
      </div>
      <div className="grid">
        {cats.map(c => (
          <div key={c.id} className="card">
            <input value={c.name} onChange={e => setCats(prev => prev.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => update(c.id, c.name)}>Save</button>
              <button onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

function Users() {
  const token = localStorage.getItem('token')
  const [users, setUsers] = useState([])
  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data)
    }
    load()
  }, [])
  return (
    <AdminLayout>
      <h3>Users</h3>
      <div className="orders">
        {users.map(u => (
          <div key={u.id} className="order-card">
            <div>{u.fullName}</div>
            <div>{u.email}</div>
            <div>{u.address}</div>
            <div>{u.role}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

function Orders() {
  const token = localStorage.getItem('token')
  const [orders, setOrders] = useState([])
  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      setOrders(res.data)
    }
    load()
  }, [])
  return (
    <AdminLayout>
      <h3>Orders</h3>
      <div className="orders">
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <div>Order #{o.id}</div>
            <div>{o.customerName} ({o.customerEmail})</div>
            <div>Payment: {o.paymentType}</div>
            <div>Status: {o.status}</div>
            <div>Total: ${o.totalAmount?.toFixed(2)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <select onChange={e => o._newStatus = e.target.value} defaultValue={o.status}>
                {['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={async () => {
                const token = localStorage.getItem('token')
                const s = o._newStatus || o.status
                await axios.put(`${API_BASE}/admin/orders/${o.id}/status`, null, {
                  params: { status: s },
                  headers: { Authorization: `Bearer ${token}` }
                })
                const res = await axios.get(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
                setOrders(res.data)
              }}>Update</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/users" element={<Users />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  )
}
