import ImageAltGenerator from "@/components/ImageAltGenerator";

export default function ImageAltGeneratorPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🖼️ AI Image ALT Generator</h1>
      <p className="text-gray-600 mb-4">Upload or paste URLs to generate AI-powered ALT text descriptions.</p>
      <ImageAltGenerator />
    </div>
  );
}
