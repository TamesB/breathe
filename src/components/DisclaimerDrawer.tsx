import { Drawer } from "vaul";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DisclaimerDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="text-[10px] text-white/30 underline decoration-white/20 underline-offset-2 transition hover:text-white/45"
        >
          Medical disclaimer
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-3xl border-t border-white/10 bg-neutral-950/95 pb-safe outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25" />
          <div className="px-6 pt-4">
            <Drawer.Title className="text-xl font-semibold text-white">
              Medical disclaimer
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-sm text-white/50">
              Please read before practicing
            </Drawer.Description>
          </div>
          <div className="space-y-3 px-6 pb-8 pt-4 text-sm leading-relaxed text-white/70">
            <p>
              This app is not medical advice and does not replace guidance from
              a qualified healthcare professional.
            </p>
            <p>
              Wim Hof-style breathwork can cause lightheadedness, tingling, or
              fainting. Always practice seated or lying down in a safe place.
            </p>
            <p>
              Never practice in or near water, while driving, or while operating
              machinery.
            </p>
            <p>
              If you are pregnant, or have a cardiovascular condition, epilepsy,
              or any serious health concern, consult a doctor before using this
              app.
            </p>
            <p className="text-white/45">
              Stop immediately if you feel unwell. You are responsible for your
              own safety.
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
