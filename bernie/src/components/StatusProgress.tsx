import { Status } from "../types/video";
import { STATUS_STEPS } from "../constants/videoConstants";

interface StatusProgressProps {
  currentStatus: Status;
  onStatusChange: (newStatus: Status) => void;
  isDisabled?: boolean;
}

export function StatusProgress({
  currentStatus,
  onStatusChange,
  isDisabled = false,
}: StatusProgressProps) {
  const getStepStatus = (stepValue: Status): "completed" | "current" | "upcoming" => {
    const stepIndex = STATUS_STEPS.findIndex((step) => step.value === stepValue);
    const currentIndex = STATUS_STEPS.findIndex((step) => step.value === currentStatus);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {STATUS_STEPS.map((step, index) => (
        <button
          key={step.value}
          onClick={() => onStatusChange(step.value)}
          disabled={isDisabled}
          className={`
            w-full p-3 rounded-lg transition-all duration-200 
            flex flex-col justify-between
            ${
              getStepStatus(step.value) === "completed"
                ? "bg-green-600/20 border-green-600 text-green-500"
                : getStepStatus(step.value) === "current"
                ? "bg-blue-600/20 border-blue-600 text-blue-500"
                : "bg-[#424242]/20 border-[#424242] text-gray-400"
            }
            border hover:border-white/50
            min-h-[80px] md:min-h-[100px]
            focus:outline-none focus:ring-2 focus:ring-white/30
          `}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm md:text-base">{step.label}</span>
            <span className="flex items-center justify-center h-6 w-6 rounded-full border text-xs">
              {getStepStatus(step.value) === "completed" ? "✓" : index + 1}
            </span>
          </div>
          <p className="text-xs md:text-sm opacity-80 mt-1">{step.description}</p>
        </button>
      ))}
    </div>
  );
}
