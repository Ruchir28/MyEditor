import React from 'react';
import ReactPlayer from 'react-player'


const VideoPlayer: React.FC = () => {

    const BACKEND_URL = "http://localhost:8000";

    const playerRef = React.useRef<ReactPlayer>(null);
  

    return (
        <div>
           <ReactPlayer 
           url={`${BACKEND_URL}/video`}
           controls={true}
           onPause={() => {
            console.log("here");
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

export default VideoPlayer;
