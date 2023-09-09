import React, { useState } from "react";
import { UploadChunkResponse } from "../../common/Common";

const CHUNK_SIZE = 200 * 1024 * 1024; // 5MB chunks

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
        const uploadPromises: Promise<UploadChunkResponse>[] = [];

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunk = file.slice(start, end);
          const formData = new FormData();
          formData.append("filename", file.name);
          formData.append("chunkNumber", (i + 1).toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("fileChunk", chunk);
          await delay(1);
          const uploadPromise = uploadChunkPromise(formData, i + 1, totalChunks, file.name);
       
          uploadPromises.push(uploadPromise);
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }
    }
  };
  
  function uploadChunkPromise(
    formData: FormData,
    chunkNumber: number,
    totalChunks: number,
    filename: string,
    retryCount = 0,
    retryLimit = 5
  ): Promise<UploadChunkResponse> {
    function sendRequest(): Promise<UploadChunkResponse> {
      return fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      }).then((response) => {
        if (response.ok) {
          console.log(`Uploaded chunk ${chunkNumber} of ${totalChunks}`);
          setUploadProgress(
            (prevProgress) => prevProgress + (1 / totalChunks) * 100
          );
          return response.json();
        } else {
          console.error(`Failed to upload chunk ${chunkNumber}, Retrying...`);
          // retry the request
          if (retryCount < retryLimit) {
            return uploadChunkPromise(
              formData,
              chunkNumber,
              totalChunks,
              filename,
              retryCount + 1
            );
          } else {
            return response.json();
          }
        }
      }).then((response) => {
        console.log("[DEBUG] response", response);
        return response;
      });
    }

    return sendRequest();
  }
  function handleSingleChunkToggle() {
    setSingleChunk((prev) => !prev);
  }

  function delay(seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
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


