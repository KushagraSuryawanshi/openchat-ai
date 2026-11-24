import Image from "next/image";

import scene from "./assets/openchat-welcome-scene.webp";

export function WelcomeScene() {
  return (
    <div className="relative mb-7 flex h-40 w-56 shrink-0 items-center justify-center" aria-hidden="true">
      <Image
        src={scene}
        alt=""
        width={224}
        height={160}
        sizes="224px"
        loading="eager"
        draggable={false}
        className="pointer-events-none h-full w-full object-contain select-none"
      />
    </div>
  );
}
