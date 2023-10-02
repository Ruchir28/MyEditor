import React from 'react';
import ReactPlayer from 'react-player'
import withAuth from './Utils/withAuth';

const VideoPlayer: React.FC = () => {

    const BACKEND_URL = "http://localhost:8000/video";

    const playerRef = React.useRef<ReactPlayer>(null);
  

    return (
        <div>
           <ReactPlayer 
           url={`${BACKEND_URL}/1`}
           controls={true}
           onPause={() => {
            console.log(playerRef.current?.getCurrentTime());
           }}
           ref={playerRef}
           >
           </ReactPlayer>

           <button onClick = {() => {
            playerRef.current?.seekTo(15.150156, "seconds");   
           }}>
            Click me to go to 10 seconds mark
           </button>
        </div>
    );
}

export default withAuth(VideoPlayer);
