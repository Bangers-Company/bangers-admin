import { Routes, Route } from 'react-router'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Events from './pages/events/Events'
import EditEvent from './pages/events/EditEvent'
import CreateEvent from './pages/events/CreateEvent'
import EventLineupPage from './pages/events/EventLineupPage'
import EventLineupEditPage from './pages/events/EventLineupEditPage'
import Artists from './pages/artists/Artists'
import EditArtist from './pages/artists/EditArtist'
import Stages from './pages/stages/Stages'
import Acts from './pages/acts/Acts'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        
        <Route path="events" element={<Events />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/:id/edit" element={<EditEvent />} />
        <Route path="events/:id/lineup" element={<EventLineupPage />} />
        <Route path="events/:id/lineup/edit" element={<EventLineupEditPage />} />
        
        <Route path="artists" element={<Artists />} />
        <Route path="artists/:id/edit" element={<EditArtist />} />
        
        <Route path="stages" element={<Stages />} />
        
        <Route path="acts" element={<Acts />} />
      </Route>
    </Routes>
  )
}

export default App
