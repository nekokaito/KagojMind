import Image from "next/image";

type KagojMindLogoProps = {
  size?: number;
  className?: string;
};

export function KagojMindLogo({
  size = 24,
  className = "",
}: KagojMindLogoProps) {
  return (
    <>
      {/* Light mode */}
      <Image
        src="/brand/kagojmind-light.png"
        alt="KagojMind"
        width={size}
        height={size}
        priority
        className={`block shrink-0 object-contain dark:hidden ${className}`}
      />

      {/* Dark mode */}
      <Image
        src="/brand/kagojmind-dark.png"
        alt="KagojMind"
        width={size}
        height={size}
        priority
        className={`hidden shrink-0 object-contain dark:block ${className}`}
      />
    </>
  );
}
