// accessibility-checker/src/components/TranscriptUploadBox.js

export default function TranscriptUploadBox({
  selectedFile,
  setSelectedFile,
  jobStatus,
  setJobStatus,
  setResult,
  setErrorMessage,
}) {
  const isProcessing = jobStatus === "pending" || jobStatus === "processing";

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const pollJobStatus = async (jobId) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/transcribe/${jobId}`);
        const data = await response.json();

        setJobStatus(data.status);

        if (data.status === "done") {
          clearInterval(intervalId);
          setResult(data);
        }

        if (data.status === "error") {
          clearInterval(intervalId);
          setErrorMessage(data.error || "Failed to process transcription.");
        }
      } catch (error) {
        clearInterval(intervalId);
        setJobStatus("error");
        setErrorMessage("Failed to check transcription status.");
      }
    }, 2000);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setJobStatus("pending");
    setResult(null);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start transcription.");
      }

      pollJobStatus(data.jobId);
    } catch (error) {
      setJobStatus("error");
      setErrorMessage(error.message || "Failed to upload file.");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
      <label className="block cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
        <span className="block text-lg font-semibold text-gray-800">
          Upload video or audio
        </span>

        <span className="mt-2 block text-sm text-gray-500">
          Supported files: MP4, MOV, WEBM, MP3, WAV, M4A
        </span>

        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/m4a"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            setSelectedFile(file || null);
            setResult(null);
            setErrorMessage("");
            setJobStatus("idle");
          }}
        />
      </label>

      {selectedFile && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Selected file:{" "}
          <span className="font-semibold text-gray-900">
            {selectedFile.name}
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={!selectedFile || isProcessing}
        onClick={handleUpload}
        className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isProcessing ? "Processing..." : "Extract Transcript"}
      </button>
    </div>
  );
}