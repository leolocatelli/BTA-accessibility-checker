import React from "react";

export default function InputField({ url, setUrl }) {
  return (
    <input
      type="text"
      placeholder="Enter URL"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
