import React from 'react';
import FileUploader from './FileUploader';
import VideoPlayer from './VideoPlayer';
import Login from './Login'

function App() {
  return (
    <div className="App">
      
      <h1>File Uploader</h1>
      <Login></Login>
      <FileUploader></FileUploader>
      <VideoPlayer></VideoPlayer>
    </div>
  );
}

export default App;
