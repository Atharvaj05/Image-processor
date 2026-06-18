import { useState } from 'react';

const API_URL = 'https://image-processor-backend-4yvm.onrender.com';

function App() {
  const [token,       setToken]       = useState(localStorage.getItem('token'));
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Auth form state
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Editor state
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [activeImageId,  setActiveImageId]  = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [message,   setMessage]   = useState('');

  // ── AUTH ──────────────────────────────────────────────────────────────────

  async function handleAuth(e) {
    e.preventDefault();
    setMessage('');

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const payload  = isLoginMode
      ? { email, password }
      : { username, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setMessage(`${isLoginMode ? 'Login' : 'Register'} successful!`);
      } else {
        setMessage('Registered! Please switch to Login.');
        setIsLoginMode(true);
      }
    } catch (err) {
      setMessage(err.message || 'An error occurred');
    }
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem('token');
    resetEditor();
    setMessage('Logged out successfully.');
  }

  // ── EDITOR WORKFLOW ───────────────────────────────────────────────────────

  // 1. Instant local preview — no upload yet
  function handleFileSelect(e) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setActiveImageId(null);
    }
  }

  // 2. Upload original image to the server
  async function handleUpload() {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile); // must match upload.single('image')

    try {
      setIsLoading(true);
      setMessage('Uploading to server...');

      // NOTE: do NOT set Content-Type manually — browser sets the multipart boundary
      const response = await fetch(`${API_URL}/api/images`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      const imageId = data.id || (data.image && data.image.id);
      setActiveImageId(imageId);
      setMessage('Upload complete! Select a filter.');
    } catch (err) {
      setMessage(err.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Apply a transformation and update the preview
  async function applyFilter(filterType) {
    if (!activeImageId) return;
    try {
      setIsLoading(true);
      setMessage(`Applying ${filterType} filter...`);

      const response = await fetch(`${API_URL}/api/images/${activeImageId}/transform`, {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transformationType: filterType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Transformation failed');

      // Append cache-busting timestamp so the browser fetches the new file
      const newImageUrl = `${API_URL}${data.transformedUrl || data.url}?t=${Date.now()}`;
      setPreviewUrl(newImageUrl);
      setMessage(`Success! ${filterType} applied.`);
    } catch (err) {
      setMessage(err.message || 'Processing failed');
    } finally {
      setIsLoading(false);
    }
  }

  // 4. Force-download the current preview image
  async function handleDownload() {
    if (!previewUrl) return;
    try {
      const response    = await fetch(previewUrl);
      const blob        = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link        = document.createElement('a');
      link.href         = downloadUrl;
      link.download     = `transformed-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setMessage('Failed to download image.');
    }
  }

  function resetEditor() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setActiveImageId(null);
    setMessage('');
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  // Auth screen
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
        <h2>{isLoginMode ? 'Login to Image Processor' : 'Register Account'}</h2>
        {message && <p style={{ color: 'blue' }}>{message}</p>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLoginMode && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
            {isLoginMode ? 'Login' : 'Register'}
          </button>
        </form>
        <p
          style={{ marginTop: '20px', cursor: 'pointer', color: 'gray', textDecoration: 'underline' }}
          onClick={() => setIsLoginMode(!isLoginMode)}
        >
          {isLoginMode ? "Don't have an account? Register here" : 'Already have an account? Login here'}
        </p>
      </div>
    );
  }

  // Studio dashboard
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Studio Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {message && (
        <p style={{ color: 'green', fontWeight: 'bold', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '5px' }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', gap: '20px' }}>
        {/* Left column — controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>1. Choose Image</h3>
          <input type="file" accept="image/*" onChange={handleFileSelect} />

          {selectedFile && !activeImageId && (
            <button
              onClick={handleUpload}
              disabled={isLoading}
              style={{ padding: '10px', backgroundColor: 'blue', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}
            >
              {isLoading ? 'Uploading...' : 'Upload to Server'}
            </button>
          )}

          {activeImageId && (
            <>
              <h3>2. Apply Filters</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => applyFilter('grayscale')} disabled={isLoading} style={{ padding: '8px 15px', cursor: 'pointer' }}>Grayscale</button>
                <button onClick={() => applyFilter('blur')}      disabled={isLoading} style={{ padding: '8px 15px', cursor: 'pointer' }}>Blur</button>
                <button onClick={() => applyFilter('sepia')}     disabled={isLoading} style={{ padding: '8px 15px', cursor: 'pointer' }}>Sepia</button>
              </div>

              <h3>3. Export</h3>
              <button
                onClick={handleDownload}
                style={{ padding: '10px', backgroundColor: 'green', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}
              >
                Download Result
              </button>
              <button
                onClick={resetEditor}
                style={{ padding: '10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: 'transparent' }}
              >
                Start Over
              </button>
            </>
          )}
        </div>

        {/* Right column — live preview */}
        <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa', minHeight: '300px' }}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
          ) : (
            <p style={{ color: '#aaa' }}>Image preview will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
