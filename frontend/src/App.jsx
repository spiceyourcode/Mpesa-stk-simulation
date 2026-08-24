import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkStatus = async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await axios.get('http://localhost:5000/')
      setResponse(data.message)
    } catch (error) {
      console.error('Error checking server:', error)
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>M-Pesa STK Server</h1>

      <button onClick={checkStatus} disabled={loading}>
        {loading ? 'Checking...' : 'Check Status'}
      </button>

      {response && <p className="success">{response}</p>}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default App