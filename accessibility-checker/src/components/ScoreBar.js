export default function ScoreBar({ score }) {
    return (
      <div className="mb-4">
        <p className="font-bold">Score: {score}/100</p>
        <div className="w-full bg-gray-300 rounded-full h-6">
          <div
            className={`h-6 rounded-full ${
              score >= 71 ? "bg-green-500" : score >= 41 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  }
  