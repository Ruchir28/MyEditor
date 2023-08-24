import React, { useState } from "react";

const CHUNK_SIZE = 500 * 1024 * 1024; // 5MB chunks

const BACKEND_URL = "http://localhost:8000";

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [singleChunk, setSingleChunk] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setFile(files[0]);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (file) {
      if (singleChunk) {
        const formData = new FormData();
        formData.append("chunkNumber", "1");
        formData.append("totalChunks", "1");
        formData.append("filename", file.name);
        formData.append("fileChunk", file, file.name);


        // Send to backend
        fetch(`${BACKEND_URL}/upload`, {
          method: "POST",
          body: formData,
        }).then((response) => {
          if (response.ok) {
            setUploadProgress(100);
          } else {
            console.error(`Failed to upload chunk}`);
            // Additional error handling might be needed here
          }
          return response;
        });
      } else {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadPromises: Promise<Response>[] = [];

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append("filename", file.name);
          formData.append("chunkNumber", (i + 1).toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("fileChunk", chunk);

          // Start all uploads in parallel
          const uploadPromise = fetch(`${BACKEND_URL}/upload`, {
            method: "POST",
            body: formData,
          }).then((response) => {
            if (response.ok) {
              console.log(`Uploaded chunk ${i + 1} of ${totalChunks}`);
              setUploadProgress(
                (prevProgress) => prevProgress + (1 / totalChunks) * 100
              );
            } else {
              console.error(`Failed to upload chunk ${i + 1}`);
              // Additional error handling might be needed here
            }
            return response;
          });

          uploadPromises.push(uploadPromise);
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }
    }
  };

  function handleSingleChunkToggle() {
    setSingleChunk((prev) => !prev);
  }

  return (
    <div>
      <input
        type="checkbox"
        id="singleChunk"
        name="singleChunk"
        onChange={handleSingleChunkToggle}
      />
      <label htmlFor="singleChunk">Upload as Single Chunk</label>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>Progress: {uploadProgress}%</div>
    </div>
  );
};

export default FileUploader;
