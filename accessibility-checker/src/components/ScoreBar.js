export default function ScoreBar({ score }) {
  return (
    <div className="relative w-full mt-4 bg-gray-200 rounded-full h-8">
      {/* ✅ Score Bar Fills According to Score */}
      <div
        className={`h-8 rounded-full transition-all duration-500 ${
          score >= 71 ? "bg-green-500" : score >= 41 ? "bg-yellow-500" : "bg-red-500"
        }`}
        style={{ width: `${score}%` }}
      />
      
      {/* ✅ Score Text Centered Inside */}
      <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
        {score}/100
      </p>
    </div>
  );
}
