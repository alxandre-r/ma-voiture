import { motion } from "framer-motion";
import { useFills, PeriodType } from "@/contexts/FillContext";

const periodOptions: { label: string; value: PeriodType }[] = [
  { label: "3 mois", value: "3m" },
  { label: "6 mois", value: "6m" },
  { label: "12 mois", value: "12m" },
];

export default function PeriodSelector() {
  const { selectedPeriod, setSelectedPeriod } = useFills();

  return (
    <div className="w-full sm:w-auto">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="
          relative
          flex w-full sm:w-auto
          py-2 px-4
          rounded-xl sm:rounded-full
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-sm dark:shadow-xl
          transition-all
        "
      >
        {periodOptions.map((opt) => {
          const isActive = selectedPeriod === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => setSelectedPeriod(opt.value)}
              className="
                relative
                flex-1 sm:flex-none
                px-2 sm:px-4
                py-2
                text-xs font-medium
                rounded-lg sm:rounded-full 
                hover:cursor-pointer
              "
            >
              {isActive && (
                <motion.div
                  layoutId="period-highlight"
                  initial={false}
                  className="
                    absolute inset-0
                    rounded-lg sm:rounded-full
                    bg-gradient-to-tl from-custom-1 to-violet-400
                    shadow-md
                  "
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
              )}

              <span
                className={`relative z-10 transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}