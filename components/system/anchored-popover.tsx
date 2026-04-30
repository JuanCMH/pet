import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  View,
  type View as RNView,
} from "react-native";

import { cn } from "@/lib/utils";

type PopoverLayout = { left: number; top: number; width: number };

type RenderTriggerProps = {
  ref: RefObject<RNView | null>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

type RenderContentProps = {
  close: () => void;
};

export type AnchoredPopoverProps = {
  renderTrigger: (props: RenderTriggerProps) => ReactNode;
  children: ReactNode | ((props: RenderContentProps) => ReactNode);
  contentClassName?: string;
  offset?: number;
  edgePadding?: number;
};

export function AnchoredPopover({
  renderTrigger,
  children,
  contentClassName,
  offset = 6,
  edgePadding = 8,
}: AnchoredPopoverProps) {
  const triggerRef = useRef<RNView>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [layout, setLayout] = useState<PopoverLayout>({
    left: 0,
    top: 0,
    width: 0,
  });

  const close = useCallback(() => setIsOpen(false), []);

  const open = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth } = Dimensions.get("window");
      const clampedLeft = Math.max(
        edgePadding,
        Math.min(x, screenWidth - width - edgePadding),
      );

      setLayout({
        left: clampedLeft,
        top: y + height + offset,
        width,
      });
      setIsOpen(true);
    });
  }, [edgePadding, offset]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }
    open();
  }, [close, isOpen, open]);

  return (
    <>
      {renderTrigger({ ref: triggerRef, toggle, open, close, isOpen })}

      <Modal
        animationType="fade"
        onRequestClose={close}
        transparent
        visible={isOpen}
      >
        <Pressable className="flex-1" onPress={close}>
          <View
            className={cn(
              "absolute rounded-component border border-gris bg-blanco shadow-sm",
              contentClassName,
            )}
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.width,
            }}
          >
            {typeof children === "function" ? children({ close }) : children}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
