import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ScoreBar({ score }) {
  // Determine color and icon based on score
  const getScoreAttributes = (score) => {
    if (score >= 71) {
      return { color: "bg-green-500", icon: <CheckCircle className="w-6 h-6 text-white" /> };
    } else if (score >= 41) {
      return { color: "bg-yellow-500", icon: <AlertTriangle className="w-6 h-6 text-white" /> };
    } else {
      return { color: "bg-red-500", icon: <XCircle className="w-6 h-6 text-white" /> };
    }
  };

  const { color, icon } = getScoreAttributes(score);

  return (
    <div className="relative w-full mt-4 bg-gray-200 rounded-full h-10">
      {/* ✅ Score Bar Fills According to Score */}
      <div
        className={`h-10 rounded-full transition-all duration-700 ease-in-out ${color}`}
        style={{ width: `${score}%` }}
      />

      {/* ✅ Score Text & Icon Centered */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 text-white font-bold text-lg">
        {icon} {score}/100
      </div>
    </div>
  );
}
