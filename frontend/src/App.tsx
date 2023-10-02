import React from 'react';
import FileUploader from './FileUploader';
import VideoPlayer from './VideoPlayer';
import Login from './Login'
import Home from './Home'
import { BrowserRouter,Routes,Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/fileUpload" element={<FileUploader/>}></Route>
        <Route path="/play" element={<VideoPlayer/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
