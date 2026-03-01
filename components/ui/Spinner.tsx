type SpinnerProps = {
  color?: 'custom-1' | 'custom-2' | 'gray-300' | 'white' | 'black';
};

export default function Spinner({ color = 'gray-300' }: SpinnerProps) {
  const colorVariants = {
    'custom-1': 'custom-1',
    'custom-2': 'custom-2',
    white: 'gray-100',
    black: 'gray-900',
    'gray-300': 'gray-300',
  } as const;

  return (
    <div
      className={`
          h-5 w-5 rounded-full border-2
          border-${colorVariants[color]}
          border-t-gray-300/40
          animate-spin
        `}
    />
  );
}
